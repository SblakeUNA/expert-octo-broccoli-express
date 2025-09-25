import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(express.static(join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const uri =
  "mongodb+srv://sblake_db_user:5sWwcmkhDG2HRRxT@expert-octo-broccoli-ex.ytj0v6q.mongodb.net/?retryWrites=true&w=majority&appName=expert-octo-broccoli-express";

const mongoClient = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let studentsCollection;
let ordersCollection;

async function initMongo() {
  try {
    await mongoClient.connect();
    const db = mongoClient.db("studentDB");
    studentsCollection = db.collection("students");
    ordersCollection = db.collection("orders"); // Added orders collection
    console.log("✅ Connected to MongoDB and ready.");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
  }
}
initMongo();

// ---------------- ROUTES ----------------

// Home route - Dunder Mifflin Infinity style
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Dunder Mifflin Infinity</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      <style>
        body {
          background: #f4f6f9;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .navbar-brand {
          font-weight: bold;
          font-size: 1.5rem;
          color: #00529b !important;
        }
        .hero {
          text-align: center;
          padding: 80px 20px;
          background: linear-gradient(135deg, #00529b, #0073e6);
          color: white;
        }
        .hero h1 {
          font-size: 3rem;
          font-weight: bold;
        }
        .hero p {
          font-size: 1.25rem;
        }
        footer {
          margin-top: 60px;
          padding: 20px;
          background: #00529b;
          color: white;
          text-align: center;
        }
        .logo {
          height: 40px;
          margin-right: 10px;
        }
      </style>
    </head>
    <body>
      <!-- Navbar -->
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container">
          <a class="navbar-brand d-flex align-items-center" href="/">
            <img src="images/DunderMifflin.png" alt="Dunder Mifflin" class="logo">
            Dunder Mifflin Infinity
          </a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto">
              <li class="nav-item"><a class="nav-link" href="spencer.html">Spencer</a></li>
              <li class="nav-item"><a class="nav-link" href="student-crud.html">Student CRUD</a></li>
              <li class="nav-item"><a class="nav-link" href="advanced-student-manager.html">Advanced Manager</a></li>
              <li class="nav-item"><a class="nav-link" href="traditional-forms.html">Traditional Forms</a></li>
            </ul>
          </div>
        </div>
      </nav>

      <!-- Hero Section -->
      <section class="hero">
        <h1>Welcome to Dunder Mifflin Infinity</h1>
        <p>“Limitless paper in a paperless world.”</p>
        <a href="student-crud.html" class="btn btn-light btn-lg mt-3">📚 Buy Paper</a>
      </section>

      <!-- Footer -->
      <footer>
        &copy; ${new Date().getFullYear()} Dunder Mifflin, Inc. | Infinity Portal
      </footer>

      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    </body>
    </html>
  `);
});

// Serve spencer.html directly
app.get("/spencer", (req, res) => {
  res.sendFile(join(__dirname, "public", "spencer.html"));
});

// ---------------- STUDENT API ----------------

// CREATE
app.post("/api/students", async (req, res) => {
  const { name, age, grade } = req.body;
  if (!name || !age || !grade) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const result = await studentsCollection.insertOne({
      name,
      age: Number(age),
      grade,
      createdAt: new Date(),
    });
    res.json({ _id: result.insertedId, name, age, grade });
  } catch (err) {
    res.status(500).json({ error: "Database insert failed" });
  }
});

// READ
app.get("/api/students", async (req, res) => {
  try {
    const students = await studentsCollection.find().toArray();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: "Database read failed" });
  }
});

// UPDATE (PUT)
app.put("/api/students/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, age, grade } = req.body;
    const result = await studentsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { name, age: Number(age), grade } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json({ message: "Student updated" });
  } catch {
    res.status(500).json({ error: "Update failed" });
  }
});

// UPDATE (PATCH)
app.patch("/api/students/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    if (updateData.age) updateData.age = Number(updateData.age);
    const result = await studentsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json({ message: "Student updated" });
  } catch {
    res.status(500).json({ error: "Patch update failed" });
  }
});

// DELETE
app.delete("/api/students/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await studentsCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json({ message: "Student deleted" });
  } catch {
    res.status(500).json({ error: "Delete failed" });
  }
});

// SEED
app.post("/api/students/seed", async (req, res) => {
  try {
    await studentsCollection.deleteMany({});
    const sample = [
      { name: "Alice", age: 20, grade: "A" },
      { name: "Bob", age: 22, grade: "B+" },
      { name: "Charlie", age: 19, grade: "C" },
    ];
    await studentsCollection.insertMany(sample);
    res.json({ message: "Database seeded" });
  } catch {
    res.status(500).json({ error: "Seeding failed" });
  }
});

// CLEANUP
app.delete("/api/students/cleanup", async (req, res) => {
  try {
    await studentsCollection.deleteMany({});
    res.json({ message: "All students deleted" });
  } catch {
    res.status(500).json({ error: "Cleanup failed" });
  }
});

// FORM submission
app.post("/api/students/form", async (req, res) => {
  const { name, age, grade } = req.body;
  if (!name || !age || !grade) {
    return res.redirect("/traditional-forms.html?error=missing-fields");
  }
  try {
    await studentsCollection.insertOne({
      name,
      age: Number(age),
      grade,
      createdAt: new Date(),
    });
    res.redirect("/traditional-forms.html?success=student-added");
  } catch {
    res.redirect("/traditional-forms.html?error=database-error");
  }
});

// ---------------- ORDERS API ----------------

// CREATE order
app.post("/api/orders", async (req, res) => {
  const { paperType, quantity, salesperson } = req.body;
  if (!paperType || !quantity || !salesperson) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const result = await ordersCollection.insertOne({
      paperType,
      quantity: Number(quantity),
      salesperson,
      createdAt: new Date(),
    });
    res.status(201).json({ _id: result.insertedId, paperType, quantity, salesperson });
  } catch (err) {
    res.status(500).json({ error: "Database insert failed" });
  }
});

// READ all orders
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await ordersCollection.find().toArray();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Database read failed" });
  }
});

// READ order by id
app.get("/api/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const order = await ordersCollection.findOne({ _id: new ObjectId(id) });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Database read failed" });
  }
});

// UPDATE order (PUT)
app.put("/api/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { paperType, quantity, salesperson } = req.body;
    const result = await ordersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { paperType, quantity: Number(quantity), salesperson } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json({ message: "Order updated" });
  } catch {
    res.status(500).json({ error: "Update failed" });
  }
});

// DELETE order
app.delete("/api/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await ordersCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json({ message: "Order deleted" });
  } catch {
    res.status(500).json({ error: "Delete failed" });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

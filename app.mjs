import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(express.static(join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection URI from environment variable
const uri = process.env.MONGO_URI;

if (!uri) {
 console.error("❌ MONGO_URI not set in environment variables");
 process.exit(1); // Exit the app if no URI
}

console.log("Using Mongo URI:", JSON.stringify(uri));

const mongoClient = new MongoClient(uri, {
 serverApi: {
 version: ServerApiVersion.v1,
 strict: true,
 deprecationErrors: true,
 },
 serverSelectionTimeoutMS: 30000, // 30 seconds timeout
});

let studentsCollection;
let ordersCollection;
let postsCollection;

async function initMongo() {
 try {
 await mongoClient.connect();
 const db = mongoClient.db("studentDB");
 studentsCollection = db.collection("students");
 ordersCollection = db.collection("orders");
 postsCollection = db.collection("posts"); // Ensure postsCollection is always initialized
 console.log("✅ Connected to MongoDB and ready.");
 } catch (err) {
 console.error("❌ MongoDB connection failed:", err);
 process.exit(1); // Exit if connection fails
 }
}

// ---------------- ROUTES ----------------

// Home route
app.get("/", (req, res) => {
 res.send(`
 <!DOCTYPE html>
 <html lang="en">
 <head>
 <meta charset="UTF-8" />
 <meta name="viewport" content="width=device-width, initial-scale=1" />
 <title>Dunder Mifflin Infinity</title>
 <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
 <style>
 body { background: #f4f6f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
 .navbar-brand { font-weight: bold; font-size: 1.5rem; color: #00529b !important; }
 .hero { text-align: center; padding: 80px 20px; background: linear-gradient(135deg, #00529b, #0073e6); color: white; }
 .hero h1 { font-size: 3rem; font-weight: bold; }
 .hero p { font-size: 1.25rem; }
 footer { margin-top: 60px; padding: 20px; background: #00529b; color: white; text-align: center; }
 .logo { height: 40px; margin-right: 10px; }
 </style>
 </head>
 <body>
 <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
 <div class="container">
 <a class="navbar-brand d-flex align-items-center" href="/">
 <img src="images/DunderMifflin.png" alt="Dunder Mifflin" class="logo" />
 Dunder Mifflin Infinity
 </a>
 <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
 <span class="navbar-toggler-icon"></span>
 </button>
 <div class="collapse navbar-collapse" id="navbarNav">
 <ul class="navbar-nav ms-auto">
 <li class="nav-item"><a class="nav-link" href="student-crud.html">Order Paper</a></li>
 <li class="nav-item"><a class="nav-link" href="traditional-forms.html">Social Media</a></li>
 <li class="nav-item"><a class="nav-link" href="spencer.html">Contact Us</a></li>
 </ul>
 </div>
 </div>
 </nav>

 <section class="hero">
 <h1>Welcome to Dunder Mifflin Infinity</h1>
 <p>“Limitless paper in a paperless world.”</p>
 <a href="student-crud.html" class="btn btn-light btn-lg mt-3">📄 Order Paper</a>
 </section>

 <footer>
 &copy; ${new Date().getFullYear()} Dunder Mifflin, Inc. | Infinity Portal
 </footer>

 <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
 </body>
 </html>
 `);
});

// Serve spencer.html directly (corrected to match file name)
app.get("/spencer", (req, res) => {
 res.sendFile(join(__dirname, "public", "spencer.html"));
});

// ---------------- STUDENT (Paper) API ----------------

// CREATE student
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

// READ students
app.get("/api/students", async (req, res) => {
 try {
 const students = await studentsCollection.find().toArray();
 res.json(students);
 } catch (err) {
 res.status(500).json({ error: "Database read failed" });
 }
});

// UPDATE (PUT) student
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
 } catch (err) {
 res.status(500).json({ error: "Update failed" });
 }
});

// UPDATE (PATCH) student
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
 } catch (err) {
 res.status(500).json({ error: "Patch update failed" });
 }
});

// DELETE student
app.delete("/api/students/:id", async (req, res) => {
 try {
 const { id } = req.params;
 const result = await studentsCollection.deleteOne({ _id: new ObjectId(id) });
 if (result.deletedCount === 0) {
 return res.status(404).json({ error: "Student not found" });
 }
 res.json({ message: "Student deleted" });
 } catch (err) {
 res.status(500).json({ error: "Delete failed" });
 }
});

// SEED students
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
 } catch (err) {
 res.status(500).json({ error: "Seeding failed" });
 }
});

// CLEANUP students
app.delete("/api/students/cleanup", async (req, res) => {
 try {
 await studentsCollection.deleteMany({});
 res.json({ message: "All students deleted" });
 } catch (err) {
 res.status(500).json({ error: "Cleanup failed" });
 }
});

// FORM submission for students
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
 } catch (err) {
 res.redirect("/traditional-forms.html?error=database-error");
 }
});

// ---------------- ORDERS API ----------------

// CREATE order
app.post("/api/orders", async (req, res) => {
 const { paperType, quantity, deliveryDate, salesperson } = req.body;
 if (!paperType || !quantity || !salesperson) {
 return res.status(400).json({ error: "Missing order fields" });
 }
 try {
 const order = {
 paperType,
 quantity: Number(quantity),
 salesperson,
 createdAt: new Date(),
 // deliveryDate is optional; if provided, parse it
 deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
 };
 const result = await ordersCollection.insertOne(order);
 res.json({ _id: result.insertedId, ...order });
 } catch (err) {
 res.status(500).json({ error: "Order creation failed" });
 }
});

// READ orders
app.get("/api/orders", async (req, res) => {
 try {
 const orders = await ordersCollection.find().toArray();
 res.json(orders);
 } catch (err) {
 res.status(500).json({ error: "Fetching orders failed" });
 }
});

// DELETE order by ID
app.delete("/api/orders/:id", async (req, res) => {
 try {
 const { id } = req.params;
 const result = await ordersCollection.deleteOne({ _id: new ObjectId(id) });
 if (result.deletedCount === 0) {
 return res.status(404).json({ error: "Order not found" });
 }
 res.json({ message: "Order deleted" });
 } catch (err) {
 res.status(500).json({ error: "Delete order failed" });
 }
});

// UPDATE (PUT) order
app.put("/api/orders/:id", async (req, res) => {
 try {
 const { id } = req.params;
 const { paperType, quantity, salesperson } = req.body;
 if (!paperType || !quantity || !salesperson) {
 return res.status(400).json({ error: "Missing required fields" });
 }
 const result = await ordersCollection.updateOne(
 { _id: new ObjectId(id) },
 { $set: { paperType, quantity: Number(quantity), salesperson } }
 );
 if (result.matchedCount === 0) {
 return res.status(404).json({ error: "Order not found" });
 }
 res.json({ message: "Order updated" });
 } catch (err) {
 res.status(500).json({ error: "Update failed" });
 }
});

// ---------------- POSTS API ----------------

// CREATE post
app.post("/api/posts", async (req, res) => {
 const { username, content } = req.body;
 if (!username || !content) {
 return res.status(400).json({ error: "Missing username or content" });
 }
 try {
 const post = {
 username,
 content,
 createdAt: new Date(),
 };
 const result = await postsCollection.insertOne(post);
 res.json({ _id: result.insertedId, ...post });
 } catch (err) {
 res.status(500).json({ error: "Create post failed" });
 }
});

// READ posts
app.get("/api/posts", async (req, res) => {
 try {
 const posts = await postsCollection.find().to Array();
 res.json(posts);
 } catch (err) {
 res.status(500).json({ error: "Fetching posts failed" });
 }
});

// DELETE post
app.delete("/api/posts/:id", async (req, res) => {
 try {
 const { id } = req.params;
 const result = await postsCollection.deleteOne({ _id: new ObjectId(id) });
 if (result.deletedCount === 0) {
 return res.status(404).json({ error: "Post not found" });
 }
 res.json({ message: "Post deleted" });
 } catch (err) {
 res.status(500).json({ error: "Delete post failed" });
 }
});

// ---------------- CONTACT API ----------------
app.post("/api/contact", async (req, res) => {
 const { name, email, message } = req.body;
 console.log("Received contact request:", { name, email, message }); // Log incoming data
 if (!name || !email || !message) {
 return res.status(400).json({ error: "Missing required fields" });
 }
 // Basic email validation
 if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
 return res.status(400).json({ error: "Invalid email format" });
 }
 try {
 if (!postsCollection) {
 const db = mongoClient.db("studentDB");
 postsCollection = db.collection("posts");
 console.log("Initialized postsCollection for contact");
 }
 const contact = {
 name,
 email,
 message,
 createdAt: new Date(),
 status: "pending",
 };
 console.log("Inserting contact:", contact); // Log before insert
 const result = await postsCollection.insertOne(contact);
 console.log("Insert result:", result); // Log insert outcome
 res.json({ message: "Thanks for contacting us! Kelly will get back to you soon.", _id: result.insertedId });
 } catch (err) {
 console.error("Contact save error:", err); // Log the error
 res.status(500).json({ error: "Failed to save contact message" });
 }
});

// ---------------- START SERVER ----------------

async function startServer() {
 try {
 await initMongo();
 app.listen(PORT, () => {
 console.log(`🚀 Server is running on http://localhost:${PORT}`);
 });
 } catch (err) {
 console.error("Failed to start server:", err);
 process.exit(1);
 }
}

process.on("SIGTERM", async () => {
 await mongoClient.close();
 process.exit(0);
});

startServer().catch(console.error);

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { MongoClient, ServerApiVersion } from 'mongodb';

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(express.static(join(__dirname, 'public')));
app.use(express.json());

// ROUTES

app.get('/', (req, res) => {
  res.send('Hello Express from Render 😍😍😍. <a href="spencer">spencer</a>');
});

// Serve HTML
app.get('/spencer', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'spencer.html'));
});

// JSON API
app.get('/api/spencer', (req, res) => {
  const myVar = 'Hello from server!';
  res.json({ myVar });
});

// Query param
app.get('/api/query', (req, res) => {
  const name = req.query.name;
  res.json({ message: `Hi, ${name}. How are you?` });
});

// URL param
app.get('/api/url/:iaddasfsd', (req, res) => {
  console.log("client request with URL param:", req.params.iaddasfsd);
  res.json({ message: `Received URL param: ${req.params.iaddasfsd}` });
});

// GET "POST-like" endpoint (form)
app.get('/api/body', (req, res) => {
  console.log("client request with POST body (simulated with GET):", req.query);
  const name = req.query.name || "Anonymous";
  res.json({ message: `Received body with name: ${name}` });
});

// Real POST
app.post('/api/body', (req, res) => {
  console.log("client request with real POST body:", req.body);
  const name = req.body.name || "Anonymous";
  res.json({ message: `Hi, ${name} (POST body)` });
});


// ✅ MONGODB CONNECTION LOGIC
const uri = "mongodb+srv://sblake_db_user:5sWwcmkhDG2HRRxT@expert-octo-broccoli-ex.ytj0v6q.mongodb.net/?retryWrites=true&w=majority&appName=expert-octo-broccoli-express";

// Replace <db_password> with your actual password or use environment variable
const mongoClient = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Test MongoDB connection
async function runMongoConnection() {
  try {
    await mongoClient.connect();
    await mongoClient.db("admin").command({ ping: 1 });
    console.log("✅ Successfully connected to MongoDB!");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
  } finally {
    await mongoClient.close(); // Optional: Keep open if you plan to use DB
  }
}

runMongoConnection().catch(console.dir);


app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
  });
});


// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});

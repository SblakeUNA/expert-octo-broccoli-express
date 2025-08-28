import express from 'express'
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve static files from "public" folder
app.use(express.static(join(__dirname, 'public')));

// Root route
app.get('/', (req, res) => {
  res.send('Hello Express from Render 😍😍😍. <a href="spencer">spencer</a>');
});

// /spencer route sends the spencer.html file
app.get('/spencer', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'spencer.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

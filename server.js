import http from 'http';
import sql from './db.js';

const requestHandler = async (req, res) => {
  try {
    const result = await sql`SELECT version()`;
    const { version } = result[0];
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`Connected to Neon!\nPostgreSQL version: ${version}`);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Failed to connect to Neon:\n' + err.message);
    console.error('DB ERROR:', err);
  }
};

http.createServer(requestHandler).listen(3000, () => {
  console.log('✅ Server running at http://localhost:3000');
});
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); // Allow all origins — adjust for production
app.use(express.json()); // Parse JSON bodies

// Simple in-memory user store (for demo only)
const users = [];

// Signup route
app.post('/signup', (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // Check if user already exists
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ message: 'User already exists' });
  }

  // Save user
  users.push({ firstName, lastName, email, password });
  console.log('New user registered:', email);
  res.json({ message: 'User registered successfully' });
});

// Login route
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  res.json({ message: 'Login successful' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


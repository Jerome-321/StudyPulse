// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const SECRET = process.env.JWT_SECRET || 'default_secret';

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Async handler wrapper to catch errors and forward to global error handler
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Simple auth middleware example (replace with real JWT validation if needed)
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Malformed token' });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Signup route
app.post('/api/auth/signup', asyncHandler(async (req, res) => {
  const { firstName, lastName, email, username, password } = req.body;
  if (!firstName || !lastName || !email || !username || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO users (first_name, last_name, email, username, password)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [firstName, lastName, email, username, hashedPassword]
  );
  res.status(201).json({ message: 'User registered', userId: result.rows[0].id });
}));

// Login route
app.post('/api/auth/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '1h' });
  res.json({ message: 'Login successful', token });
}));

// Protected example route: get user profile
app.get('/api/profile', authMiddleware, asyncHandler(async (req, res) => {
  const result = await pool.query(
    'SELECT first_name, last_name, email, username FROM users WHERE id = $1',
    [req.user.id]
  );
  if (!result.rows.length) return res.status(404).json({ message: 'User not found' });
  res.json(result.rows[0]);
}));

// Serve frontend static files (adjust 'frontend/build' to your frontend build folder)
app.use(express.static(path.join(__dirname, 'frontend', 'build')));

// Catch-all to serve React SPA (adjust if not React)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});

// Global error handler with detailed error messages (hide stack in production)
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({
    message: 'Server error',
    error: err.message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SECRET = process.env.JWT_SECRET || 'default_secret';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Dummy auth middleware for demo (replace with real auth)
const authMiddleware = (req, res, next) => {
  // In production, validate JWT or session here
  req.user = { id: 1 };
  next();
};

// DB query helper
const dbQuery = (text, params) => pool.query(text, params);

// --- Routes ---

// Health check
app.get('/', (req, res) => {
  res.send('StudyPulse backend is running!');
});

// Auth routes
app.post('/api/auth/signup', async (req, res) => {
  const { firstName, lastName, email, username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await dbQuery(
      'INSERT INTO users (first_name, last_name, email, username, password) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [firstName, lastName, email, username, hashedPassword]
    );
    res.status(201).json({ message: 'User registered', userId: result.rows[0].id });
  } catch (err) {
    console.error('Signup error:', err);
    if (err.code === '23505') {
      return res.status(400).json({ message: 'Email or username already exists' });
    }
    res.status(500).json({ message: 'Internal server error during signup' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await dbQuery('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error during login' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// Protected routes middleware
app.use(authMiddleware);

// Profile routes
app.get('/api/profile', async (req, res) => {
  try {
    const result = await dbQuery(
      'SELECT first_name AS name, email, profile_picture FROM users WHERE id = $1',
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Internal server error getting profile' });
  }
});

app.put('/api/profile', async (req, res) => {
  const { name, email, profile_picture } = req.body;
  try {
    await dbQuery(
      'UPDATE users SET first_name = $1, email = $2, profile_picture = $3 WHERE id = $4',
      [name, email, profile_picture, req.user.id]
    );
    res.json({ message: 'Profile updated' });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Internal server error updating profile' });
  }
});

// Grades routes
app.get('/api/grades', async (req, res) => {
  try {
    const result = await dbQuery('SELECT * FROM grades WHERE user_id = $1', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Get grades error:', err);
    res.status(500).json({ message: 'Internal server error getting grades' });
  }
});

app.post('/api/grades', async (req, res) => {
  const { course, prelim, midterm, final } = req.body;
  try {
    const result = await dbQuery(
      'INSERT INTO grades (user_id, course, prelim, midterm, final) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, course, prelim, midterm, final]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Add grade error:', err);
    res.status(500).json({ message: 'Internal server error adding grade' });
  }
});

app.put('/api/grades/:id', async (req, res) => {
  const { course, prelim, midterm, final } = req.body;
  const id = req.params.id;
  try {
    await dbQuery(
      'UPDATE grades SET course = $1, prelim = $2, midterm = $3, final = $4 WHERE id = $5 AND user_id = $6',
      [course, prelim, midterm, final, id, req.user.id]
    );
    res.json({ message: 'Grade updated' });
  } catch (err) {
    console.error('Update grade error:', err);
    res.status(500).json({ message: 'Internal server error updating grade' });
  }
});

app.delete('/api/grades/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await dbQuery('DELETE FROM grades WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    res.json({ message: 'Grade deleted' });
  } catch (err) {
    console.error('Delete grade error:', err);
    res.status(500).json({ message: 'Internal server error deleting grade' });
  }
});

// Timetable routes
app.get('/api/timetable', async (req, res) => {
  try {
    const result = await dbQuery('SELECT * FROM timetable WHERE user_id = $1', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Get timetable error:', err);
    res.status(500).json({ message: 'Internal server error getting timetable' });
  }
});

app.put('/api/timetable', async (req, res) => {
  const { monday, tuesday, wednesday, thursday, friday, saturday, sunday } = req.body;
  try {
    await dbQuery(
      'UPDATE timetable SET monday = $1, tuesday = $2, wednesday = $3, thursday = $4, friday = $5, saturday = $6, sunday = $7 WHERE user_id = $8',
      [monday, tuesday, wednesday, thursday, friday, saturday, sunday, req.user.id]
    );
    res.json({ message: 'Timetable updated' });
  } catch (err) {
    console.error('Update timetable error:', err);
    res.status(500).json({ message: 'Internal server error updating timetable' });
  }
});

// Courses routes
app.get('/api/courses', async (req, res) => {
  try {
    const result = await dbQuery('SELECT * FROM courses WHERE user_id = $1', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Get courses error:', err);
    res.status(500).json({ message: 'Internal server error getting courses' });
  }
});

app.post('/api/courses', async (req, res) => {
  const { course, description } = req.body;
  try {
    const result = await dbQuery(
      'INSERT INTO courses (user_id, course, description) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, course, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Add course error:', err);
    res.status(500).json({ message: 'Internal server error adding course' });
  }
});

app.put('/api/courses/:id', async (req, res) => {
  const { course, description } = req.body;
  const id = req.params.id;
  try {
    await dbQuery(
      'UPDATE courses SET course = $1, description = $2 WHERE id = $3 AND user_id = $4',
      [course, description, id, req.user.id]
    );
    res.json({ message: 'Course updated' });
  } catch (err) {
    console.error('Update course error:', err);
    res.status(500).json({ message: 'Internal server error updating course' });
  }
});

app.delete('/api/courses/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await dbQuery('DELETE FROM courses WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    res.json({ message: 'Course deleted' });
  } catch (err) {
    console.error('Delete course error:', err);
    res.status(500).json({ message: 'Internal server error deleting course' });
  }
});

// Generic error handler middleware (for uncaught errors)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

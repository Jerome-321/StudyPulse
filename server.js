// db.js
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
module.exports = {
  query: (text, params) => pool.query(text, params),
};


// middleware/authMiddleware.js
exports.authMiddleware = (req, res, next) => {
  // Dummy auth for example (replace with JWT or session validation)
  req.user = { id: 1 }; // mock user ID
  next();
};


// controllers/authController.js
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'default_secret';

// Signup controller
exports.signup = async (req, res) => {
  const { firstName, lastName, email, username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await db.query(
      'INSERT INTO users (first_name, last_name, email, username, password) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [firstName, lastName, email, username, hashedPassword]
    );
    res.status(201).json({ message: 'User registered', userId: result.rows[0].id });
  } catch (err) {
    res.status(400).json({ message: 'Email or username already exists' });
  }
};

// Login controller
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];

  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '1h' });
  res.json({ message: 'Login successful', token });
};

// Logout controller
exports.logout = (req, res) => {
  res.clearCookie('token');
  return res.json({ message: 'Logged out successfully' });
};


// controllers/profileController.js
const db = require('../db');

exports.getProfile = async (req, res) => {
  const userId = req.user.id;
  const result = await db.query('SELECT name, email, profile_picture FROM users WHERE id = $1', [userId]);
  res.json(result.rows[0]);
};

exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, email, profile_picture } = req.body;
  await db.query('UPDATE users SET name = $1, email = $2, profile_picture = $3 WHERE id = $4', [name, email, profile_picture, userId]);
  res.json({ message: 'Profile updated' });
};


// controllers/gradesController.js
const db = require('../db');

exports.getGrades = async (req, res) => {
  const result = await db.query('SELECT * FROM grades WHERE user_id = $1', [req.user.id]);
  res.json(result.rows);
};

exports.addGrade = async (req, res) => {
  const { course, prelim, midterm, final } = req.body;
  const result = await db.query(
    'INSERT INTO grades (user_id, course, prelim, midterm, final) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [req.user.id, course, prelim, midterm, final]
  );
  res.status(201).json(result.rows[0]);
};

exports.updateGrade = async (req, res) => {
  const { course, prelim, midterm, final } = req.body;
  const id = req.params.id;
  await db.query(
    'UPDATE grades SET course = $1, prelim = $2, midterm = $3, final = $4 WHERE id = $5 AND user_id = $6',
    [course, prelim, midterm, final, id, req.user.id]
  );
  res.json({ message: 'Grade updated' });
};

exports.deleteGrade = async (req, res) => {
  await db.query('DELETE FROM grades WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
  res.json({ message: 'Grade deleted' });
};


// controllers/timetableController.js
const db = require('../db');

exports.getTimetable = async (req, res) => {
  const result = await db.query('SELECT * FROM timetable WHERE user_id = $1', [req.user.id]);
  res.json(result.rows);
};

exports.updateTimetable = async (req, res) => {
  const { monday, tuesday, wednesday, thursday, friday, saturday, sunday } = req.body;
  await db.query(
    'UPDATE timetable SET monday = $1, tuesday = $2, wednesday = $3, thursday = $4, friday = $5, saturday = $6, sunday = $7 WHERE user_id = $8',
    [monday, tuesday, wednesday, thursday, friday, saturday, sunday, req.user.id]
  );
  res.json({ message: 'Timetable updated' });
};


// routes/auth.js
const express = require('express');
const router = express.Router();
const { signup, login, logout } = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

module.exports = router;


// routes/profile.js
const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/profileController');
router.get('/', getProfile);
router.put('/', updateProfile);
module.exports = router;


// routes/grades.js
const express = require('express');
const router = express.Router();
const { getGrades, addGrade, updateGrade, deleteGrade } = require('../controllers/gradesController');
router.get('/', getGrades);
router.post('/', addGrade);
router.put('/:id', updateGrade);
router.delete('/:id', deleteGrade);
module.exports = router;


// routes/timetable.js
const express = require('express');
const router = express.Router();
const { getTimetable, updateTimetable } = require('../controllers/timetableController');
router.get('/', getTimetable);
router.put('/', updateTimetable);
module.exports = router;


// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const db = require('./db'); 
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const gradesRoutes = require('./routes/grades');
const timetableRoutes = require('./routes/timetable');
const { authMiddleware } = require('./middleware/authMiddleware');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Health check or base route
app.get('/', (req, res) => {
  res.send('StudyPulse backend is running!');
});

// Auth routes (unprotected)
app.use('/api/auth', authRoutes);

// Protected routes
app.use(authMiddleware);
app.use('/api/profile', profileRoutes);
app.use('/api/grades', gradesRoutes);
app.use('/api/timetable', timetableRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

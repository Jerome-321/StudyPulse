import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes

app.get('/', (req, res) => {
  res.send('StudyPulse backend running!');
});

// Example signup route
app.post('/signup', (req, res) => {
  const { firstName, lastName, email, username, password } = req.body;
  console.log('Signup data:', req.body);

  // Here you would normally do validation, hashing password, save to DB, etc.
  // For demo, just respond success:
  res.status(201).json({ message: 'User registered successfully!' });
});

// Example login route
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log('Login data:', req.body);

  // Normally, check credentials against DB.
  // For demo, accept any login:
  if (email && password) {
    res.json({ message: 'Login successful!' });
  } else {
    res.status(400).json({ message: 'Invalid email or password' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

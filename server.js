const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Middleware
app.use(express.json());

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/grades', require('./routes/grades'));
// Add other API routes as needed

// Serve React frontend
const frontendBuildPath = path.join(__dirname, '../frontend/build');

if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
} else {
  app.get('*', (req, res) => {
    res.status(404).json({ message: 'Frontend build not found' });
  });
}

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

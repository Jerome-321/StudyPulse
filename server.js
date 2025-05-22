// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import pg from "pg";
import multer from "multer";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

const db = new pg.Client({
  connectionString: process.env.DATABASE_URL,
});
db.connect();

app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Dummy auth middleware (replace with real auth later)
const authMiddleware = (req, res, next) => {
  req.userId = 1; // Simulated user ID
  next();
};

// === PROFILE ROUTES ===
app.get("/api/profile", authMiddleware, async (req, res) => {
  const result = await db.query("SELECT name, email, profile_picture FROM users WHERE id = $1", [req.userId]);
  res.json(result.rows[0]);
});

app.put("/api/profile", authMiddleware, upload.single("profile_picture"), async (req, res) => {
  const { name, email } = req.body;
  const profilePicPath = req.file ? `/uploads/${req.file.filename}` : null;
  if (profilePicPath) {
    await db.query("UPDATE users SET name=$1, email=$2, profile_picture=$3 WHERE id=$4", [name, email, profilePicPath, req.userId]);
  } else {
    await db.query("UPDATE users SET name=$1, email=$2 WHERE id=$3", [name, email, req.userId]);
  }
  res.sendStatus(200);
});

// === GRADES ROUTES ===
app.get("/api/grades", authMiddleware, async (req, res) => {
  const result = await db.query("SELECT * FROM grades WHERE user_id = $1", [req.userId]);
  res.json(result.rows);
});

app.post("/api/grades", authMiddleware, async (req, res) => {
  const { course, prelim, midterm, final } = req.body;
  await db.query("INSERT INTO grades (user_id, course, prelim, midterm, final) VALUES ($1, $2, $3, $4, $5)", [req.userId, course, prelim, midterm, final]);
  res.sendStatus(201);
});

app.put("/api/grades/:id", authMiddleware, async (req, res) => {
  const { course, prelim, midterm, final } = req.body;
  await db.query("UPDATE grades SET course=$1, prelim=$2, midterm=$3, final=$4 WHERE id=$5 AND user_id=$6", [course, prelim, midterm, final, req.params.id, req.userId]);
  res.sendStatus(200);
});

app.delete("/api/grades/:id", authMiddleware, async (req, res) => {
  await db.query("DELETE FROM grades WHERE id = $1 AND user_id = $2", [req.params.id, req.userId]);
  res.sendStatus(200);
});

// === TIMETABLE ROUTES ===
app.get("/api/timetable", authMiddleware, async (req, res) => {
  const result = await db.query("SELECT * FROM timetable WHERE user_id = $1", [req.userId]);
  res.json(result.rows);
});

app.post("/api/timetable", authMiddleware, async (req, res) => {
  const { day, subject, time } = req.body;
  await db.query("INSERT INTO timetable (user_id, day, subject, time) VALUES ($1, $2, $3, $4)", [req.userId, day, subject, time]);
  res.sendStatus(201);
});

app.put("/api/timetable/:id", authMiddleware, async (req, res) => {
  const { day, subject, time } = req.body;
  await db.query("UPDATE timetable SET day=$1, subject=$2, time=$3 WHERE id=$4 AND user_id=$5", [day, subject, time, req.params.id, req.userId]);
  res.sendStatus(200);
});

app.delete("/api/timetable/:id", authMiddleware, async (req, res) => {
  await db.query("DELETE FROM timetable WHERE id = $1 AND user_id = $2", [req.params.id, req.userId]);
  res.sendStatus(200);
});

// === LOGOUT ===
app.post("/api/logout", authMiddleware, (req, res) => {
  res.clearCookie("token"); // Simulated logout
  res.sendStatus(200);
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));

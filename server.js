// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import pg from "pg";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// DB client connection
const db = new pg.Client({
  connectionString: process.env.DATABASE_URL,
});
await db.connect();

app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Multer setup for profile picture upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Dummy auth middleware (replace with real JWT or session)
const authMiddleware = (req, res, next) => {
  // For example, you might extract userId from a token in headers
  req.userId = 1; // mock userId for now
  next();
};

// === AUTH ROUTES ===
import authRoutes from "./routes/auth.js";
app.use("/api/auth", authRoutes);

// === PROFILE ROUTES ===
import profileRoutes from "./routes/profile.js";
// Inject multer upload and db in profile routes
// We'll create a small router wrapper here to handle upload inside profile routes
import { Router } from "express";
const profileRouter = Router();

profileRouter.use(authMiddleware);

profileRouter.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT name, email, profile_picture FROM users WHERE id = $1", [req.userId]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile" });
  }
});

profileRouter.put("/", upload.single("profile_picture"), async (req, res) => {
  try {
    const { name, email } = req.body;
    const profilePicPath = req.file ? `/uploads/${req.file.filename}` : null;

    if (profilePicPath) {
      await db.query(
        "UPDATE users SET name=$1, email=$2, profile_picture=$3 WHERE id=$4",
        [name, email, profilePicPath, req.userId]
      );
    } else {
      await db.query("UPDATE users SET name=$1, email=$2 WHERE id=$3", [name, email, req.userId]);
    }
    res.json({ message: "Profile updated" });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile" });
  }
});

app.use("/api/profile", profileRouter);

// === GRADES ROUTES ===
import gradesRoutes from "./routes/grades.js";
app.use("/api/grades", authMiddleware, gradesRoutes);

// === TIMETABLE ROUTES ===
import timetableRoutes from "./routes/timetable.js";
app.use("/api/timetable", authMiddleware, timetableRoutes);

// === LOGOUT ROUTE ===
app.post("/api/logout", authMiddleware, (req, res) => {
  // If you use cookies or JWT, clear token here
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));

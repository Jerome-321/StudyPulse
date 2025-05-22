// src/routes/grades.js
import { Router } from "express";
const router = Router();

// Dummy GET grades
router.get("/", (req, res) => {
  res.json([
    { id: 1, course: "Math", grade: 90 },
    { id: 2, course: "Science", grade: 85 },
  ]);
});

// Dummy POST grade
router.post("/", (req, res) => {
  res.json({ message: "Grade added" });
});

export default router;

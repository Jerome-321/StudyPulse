// src/routes/timetable.js
import { Router } from "express";
const router = Router();

router.get("/", (req, res) => {
  res.json({
    monday: ["Math", "Science"],
    tuesday: ["English", "History"],
    // etc.
  });
});

export default router;

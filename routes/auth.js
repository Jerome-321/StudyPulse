// src/routes/auth.js
import { Router } from "express";
const router = Router();

router.post("/login", (req, res) => {
  // Dummy login, replace with your logic
  res.json({ message: "Login route works" });
});

router.post("/register", (req, res) => {
  // Dummy register
  res.json({ message: "Register route works" });
});

export default router;

import express from "express";
import { auth } from "../middlewares/auth.js";
import { getUserProfile } from "../controllers/userController.js";

const router = express.Router();

// Rotta protetta: profilo utente
router.get("/profile", auth, getUserProfile);

export default router;
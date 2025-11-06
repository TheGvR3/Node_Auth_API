// routes/index.js
import express from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";

import { auth } from "../middlewares/auth.js";

const router = express.Router();

// Rotte pubbliche: autenticazione
router.use("/auth", authRoutes);

// Rotte protette: richiedono JWT valido
router.use(auth);
router.use("/users", userRoutes);

export default router;
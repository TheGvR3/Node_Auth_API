import express from "express";
import {
    register,
    login,
    refreshToken,
    logout
} from "../controllers/authController.js";

const router = express.Router(); // Crea un “mini server” per gestire le rotte

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);

// rotte protette
router.post("/logout", logout);

export default router;

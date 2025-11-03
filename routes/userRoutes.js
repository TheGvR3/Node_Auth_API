import express from "express";
import { auth } from "../middlewares/auth.js";
import { getUserProfile, updatePassword, updateProfile} from "../controllers//user/index.js";
import { validateProfileUpdate, validatePasswordUpdate } from "../middlewares/validators/userValidator.js";



const router = express.Router();

// Rotta protetta: profilo utente
router.get("/profile", auth, getUserProfile);
router.put("/profile/update", auth, validateProfileUpdate, updateProfile);
router.put("/profile/updatePassword", auth, validatePasswordUpdate, updatePassword);

export default router;
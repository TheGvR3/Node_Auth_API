import { validationResult } from "express-validator";


// 🔹 Middleware generico per gestire gli errori di validazione
export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}
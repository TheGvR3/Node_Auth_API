import { db } from "../../db.js";
import { errorLogger } from "../../middlewares/errorLogger.js";

export async function getUserProfile(req, res) {
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [req.user.userId]);
    
    if (rows.length === 0) {
      //await errorLogger(`Utente non trovato: ${req.user.userId}`).catch(console.error);
      return res.status(404).json({ error: "Utente non trovato" });
    }

    res.json(rows[0]);
  } catch (error) {
    await errorLogger(`[getUserProfile] - Errore nel recupero del profilo: ${error.message}`);
    res.status(500).json({ error: "Errore interno del server" });
  }
}

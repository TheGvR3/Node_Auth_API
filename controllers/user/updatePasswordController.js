import bcrypt from "bcryptjs";
import { db } from "../../db.js";
import { errorLogger } from "../../middlewares/errorLogger.js";

export async function updatePassword(req, res) {
    const userId = req.user.userId;
    const { oldPassword, newPassword } = req.body;

    try {
        // Recupera l'utente
        const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [userId]);
        if (rows.length === 0) {
            //await errorLogger(`Utente non trovato: ${userId}`).catch(console.error);
            return res.status(404).json({ error: "Utente non trovato" });
        }

        const user = rows[0];

        // Confronta la vecchia password
        const valid = await bcrypt.compare(oldPassword, user.password);
        if (!valid) {
            //await errorLogger(`Tentativo di aggiornamento password con vecchia password errata per utente ${userId}`).catch(console.error);
            return res.status(401).json({ error: "Vecchia password errata" });
        }

        // Cifra la nuova password
        const hashed = await bcrypt.hash(newPassword, 10);

        if (oldPassword === newPassword) {
           //await errorLogger(`Tentativo di aggiornamento password con la stessa password per utente ${userId}`).catch(console.error);
            return res.status(400).json({ error: "La nuova password deve essere diversa dalla vecchia password" });
        }


        // Aggiorna la password nel database
        await db.query("UPDATE users SET password = ? WHERE id = ?", [hashed, userId]);

        res.json({ message: "Password aggiornata con successo" });
    } catch (error) {
        await errorLogger(`[updatePassword] - Errore durante updatePassword per utente ${userId}: ${error.message}`);
        res.status(500).json({ error: "Errore durante l'aggiornamento della password" });
    }
}
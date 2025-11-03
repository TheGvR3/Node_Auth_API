import { db } from "../../db.js";
import { errorLogger } from "../../middlewares/errorLogger.js";

/**
 * 🔹 Aggiornamento profilo utente
 */
export async function updateProfile(req, res) {
    const userId = req.user.userId;
    const { email, nome, cognome, data_nascita, indirizzo, telefono } = req.body;

    try {
        // Controlla se l'utente esiste
        const [existing] = await db.query("SELECT * FROM users WHERE id = ?", [userId]);
        if (existing.length === 0) {
            await errorLogger(`Utente non trovato: ${userId}`).catch(console.error);
            return res.status(404).json({ error: "Utente non trovato" });
        }

        // Se l'email è cambiata, verifica che non esista già
        if (email) {
            const [emailExists] = await db.query("SELECT id FROM users WHERE email = ? AND id != ?", [email, userId]);
            if (emailExists.length > 0) {
                await errorLogger(`Tentativo di aggiornamento email già in uso per utente ${userId}`).catch(console.error);
                return res.status(400).json({ error: "Email già utilizzata da un altro utente" });
            }
        }

        // Aggiorna solo i campi forniti
        await db.query(
            `UPDATE users
                SET email = COALESCE(?, email),
                nome = COALESCE(?, nome),
                cognome = COALESCE(?, cognome),
                data_nascita = COALESCE(?, data_nascita),
                indirizzo = COALESCE(?, indirizzo),
                telefono = COALESCE(?, telefono)
                WHERE id = ?`,
            [email, nome, cognome, data_nascita, indirizzo, telefono, userId]
        );

        res.json({ message: "Profilo aggiornato con successo" });
    } catch (error) {
        await errorLogger(`Errore durante updateProfile per utente ${userId}: ${error.message}`);
        res.status(500).json({ error: "Errore durante l'aggiornamento del profilo" });
    }
}



import bcrypt from "bcryptjs";
import { db } from "../../db.js";
import { errorLogger } from "../../middlewares/errorLogger.js";

export async function register(req, res) {
    const { codice_fiscale, email, password, nome, cognome, data_nascita, indirizzo, telefono } = req.body;

    try {
        // Controllo se il codice fiscale esiste gia
        const [existsCf] = await db.query("SELECT id FROM users WHERE codice_fiscale = ?", [codice_fiscale]);
        if (existsCf.length > 0) {
            //await errorLogger(`Tentativo di registrazione con codice fiscale già esistente: ${codice_fiscale}`).catch(console.error);
            return res.status(400).json({ error: "Codice fiscale già registrato" });
        }

        // Controllo se l'email esiste gia
        const [existsMail] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
        if (existsMail.length > 0) {
            //await errorLogger(`Tentativo di registrazione con email già esistente: ${email}`).catch(console.error);
            return res.status(400).json({ error: "Email già registrata" });
        }

        // Cifro la password
        const hashed = await bcrypt.hash(password, 10);
        await db.query("INSERT INTO users (codice_fiscale, email, password, nome, cognome, data_nascita, indirizzo, telefono) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [codice_fiscale, email, hashed, nome, cognome, data_nascita, indirizzo, telefono]);

        res.json({ message: "Utente registrato con successo!" });
    } catch (error) {
        await errorLogger(`[register] - Errore durante la registrazione per email: ${email} - Errore: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: "Errore durante la registrazione" });

    }
}
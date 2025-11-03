import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../../db.js";
import { errorLogger } from "../../middlewares/errorLogger.js";


export async function login(req, res) {
    const { identifier, password } = req.body;

    try {
        // Regex per riconoscere email e codice fiscale
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const cfRegex = /^[A-Z0-9]{16}$/i;

        let query = "";
        let params = [];

        if (emailRegex.test(identifier)) {
            // È un’email
            query = "SELECT * FROM users WHERE email = ?";
            params = [identifier];
        } else if (cfRegex.test(identifier)) {
            // È un codice fiscale
            query = "SELECT * FROM users WHERE codice_fiscale = ?";
            params = [identifier.toUpperCase()]; // Normalizza in maiuscolo
        } else {
            await errorLogger(`Formato identificatore non valido: ${identifier}`).catch(console.error);
            return res.status(400).json({ error: "Formato identificatore non valido" });
        }


        // Cerco l’utente nel DB
        const [rows] = await db.query(query, params);
        if (rows.length === 0) {
            await errorLogger(`Utente non trovato per email o codice fiscale: ${identifier}`).catch(console.error);
            return res.status(401).json({ error: "Utente non trovato" });
        }

        const user = rows[0];
        // Confronto password
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            await errorLogger(`Errore durante il login per email o codice fiscale: ${identifier}`).catch(console.error);
            return res.status(401).json({ error: "Password errata" });
        }

        // Creo i token JWT
        const accessToken = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "30m" } // token breve
        );

        const refreshToken = jwt.sign(
            { userId: user.id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" } // token lungo
        );
        // Salva il refresh token nel DB
        await db.query("UPDATE users SET refresh_token = ? WHERE id = ?", [refreshToken, user.id]);

        //Risposta al client
        res.json({
            message: "Login effettuato con successo",
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                cf: user.codice_fiscale,
                email: user.email
            }
        });

    } catch (error) {
        // se il token è scaduto o falsificato
        if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
            await errorLogger(`Tentativo di refresh con token scaduto o invalido: ${error.message}`).catch(console.error);
            return res.status(403).json({ error: "Token di refresh non valido o scaduto" });
        }

        await errorLogger(`Errore generico durante il refresh: ${error.message}`).catch(console.error);
        res.status(500).json({ error: "Errore durante il refresh del token" });
    }
}
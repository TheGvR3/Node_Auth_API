import jwt from "jsonwebtoken";
import { db } from "../../db.js";
import { errorLogger } from "../../middlewares/errorLogger.js";

export async function refreshToken(req, res) {
    const refreshToken = req.cookies.refreshToken; // Ottieni il refresh token dal cookie

    if (!refreshToken) {
        return res.status(400).json({ error: "Token mancante" });
    }

    try {
        // Verifica che il refresh token sia valido
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // Verifico il token iscritto nel database
        const [rowsToken] = await db.query("SELECT * FROM users WHERE refresh_token = ?", [refreshToken]);
        if (rowsToken.length === 0) {
            return res.status(403).json({ error: "Token non valido" });
        }

        // Verifico se l'utente esiste nel database
        const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [decoded.userId]);
        if (rows.length === 0) {
            return res.status(403).json({ error: "Utente non trovato" });
        }

        
        // Crea un nuovo access token
        const newAccessToken = jwt.sign(
            { userId: decoded.userId, email: rows[0].email }, // Passiamo anche l'email per esempio
            process.env.JWT_SECRET,
            { expiresIn: "30m" } // Imposta la durata del nuovo access token
        );

        // Restituisci il nuovo access token
        res.json({ accessToken: newAccessToken });
    } catch (error) {
        await errorLogger(`[refreshToken] - Errore durante il refresh del token - Errore: ${error.message}`).catch(console.error);
        res.status(500).json({ error: "Errore durante il refresh del token" });
    }
}

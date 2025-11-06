import { db } from "../../db.js";
import { errorLogger } from "../../middlewares/errorLogger.js";

export async function logout(req, res) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(400).json({ error: "Refresh token mancante" });
    }

    try {
        // Invalidiamo il refresh token nel database
        await db.query("UPDATE users SET refresh_token = NULL WHERE refresh_token = ?", [refreshToken]);

        // Rimuoviamo il refresh token dal cookie
        res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        return res.json({ message: "Logout effettuato, token invalidato." });
    } catch (error) {
        console.error(error);
        await errorLogger(`[logout] - Errore durante il logout: ${error.message}`).catch(console.error);
        return res.status(500).json({ error: "Errore durante il logout." });
    }
}

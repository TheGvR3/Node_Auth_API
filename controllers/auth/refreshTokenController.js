import jwt from "jsonwebtoken";
import { db } from "../../db.js";
import { errorLogger } from "../../middlewares/errorLogger.js";

export async function refreshToken(req, res) {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        //await errorLogger("Token mancante durante il refresh").catch(console.error);
        return res.status(400).json({ error: "Token mancante" });
    }

    try {
        // Verifico il token
        const [rows] = await db.query("SELECT * FROM users WHERE refresh_token = ?", [refreshToken]);
        if (rows.length === 0) {
            //await errorLogger("Token di refresh non valido").catch(console.error);
            return res.status(403).json({ error: "Token non valido" });
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // Creo un nuovo access token
        const newAccessToken = jwt.sign(
            { userId: decoded.userId },
            process.env.JWT_SECRET,
            { expiresIn: "30m" } // token breve
        )
        res.json({ accessToken: newAccessToken });
    } catch (error) {
        await errorLogger(`[refreshToken] - Errore durante il refresh del token - Errore: ${error.message}`).catch(console.error);
        res.status(500).json({ error: "Errore durante il refresh del token" });
    }
}
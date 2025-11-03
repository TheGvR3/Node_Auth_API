
import { db } from "../../db.js";
import { errorLogger } from "../../middlewares/errorLogger.js";

export async function logout(req, res) {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        await errorLogger("Token mancante durante il logout").catch(console.error);
        return res.status(400).json({ error: "Token mancante" });
    }

    await db.query("UPDATE users SET refresh_token = NULL WHERE refresh_token = ?", [refreshToken]);
    res.json({ message: "Logout effettuato, token invalidato." });
}

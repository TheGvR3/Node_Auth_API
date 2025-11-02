import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db.js";
import { errorLogger } from "../middlewares/errorLogger.js";

export async function register(req, res) {
    const { cf, email, password } = req.body;

    if (!cf || !email || !password) {
        errorLogger("Tutti i campi sono obbligatori").catch(console.error);
        return res.status(400).json({ error: "Tutti i campi sono obbligatori" });
    }

    try {
        // Controllo se il codice fiscale esiste gia
        const [existsCf] = await db.query("SELECT id FROM users WHERE codice_fiscale = ?", [cf]);
        if (existsCf.length > 0) {
            errorLogger(`Tentativo di registrazione con codice fiscale già esistente: ${cf}`).catch(console.error);
            return res.status(400).json({ error: "Codice fiscale già registrato" });
        }

        // Controllo se l'email esiste gia
        const [existsMail] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
        if (existsMail.length > 0) {
            errorLogger(`Tentativo di registrazione con email già esistente: ${email}`).catch(console.error);
            return res.status(400).json({ error: "Email già registrata" });
        }

        // Cifro la password
        const hashed = await bcrypt.hash(password, 10);
        await db.query("INSERT INTO users (codice_fiscale, email, password) VALUES (?, ?, ?)", [cf, email, hashed]);

        res.json({ message: "Utente registrato con successo!" });
    } catch (error) {
        errorLogger(`Errore durante la registrazione per email: ${email} - Errore: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: "Errore durante la registrazione" });

    }
}

export async function login(req, res) {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
        return res.status(400).json({ error: "Campi mancanti" });
    }

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
        errorLogger(`Formato identificatore non valido: ${identifier}`).catch(console.error);
        return res.status(400).json({ error: "Formato identificatore non valido" });
    }

    try {
        // Cerco l’utente nel DB
        const [rows] = await db.query(query, params);
        if (rows.length === 0) {
            errorLogger(`Utente non trovato per email o codice fiscale: ${identifier}`).catch(console.error);
            return res.status(401).json({ error: "Utente non trovato" });
        }

        const user = rows[0];
        // Confronto password
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            errorLogger(`Errore durante il login per email o codice fiscale: ${identifier}`).catch(console.error);
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
            errorLogger(`Tentativo di refresh con token scaduto o invalido: ${error.message}`).catch(console.error);
            return res.status(403).json({ error: "Token di refresh non valido o scaduto" });
        }

        errorLogger(`Errore generico durante il refresh: ${error.message}`).catch(console.error);
        res.status(500).json({ error: "Errore durante il refresh del token" });
    }
}

export async function refreshToken(req, res) {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        errorLogger("Token mancante durante il refresh").catch(console.error);
        return res.status(400).json({ error: "Token mancante" });
    }

    try {
        // Verifico il token
        const [rows] = await db.query("SELECT * FROM users WHERE refresh_token = ?", [refreshToken]);
        if (rows.length === 0) {
            errorLogger("Token di refresh non valido").catch(console.error);
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
        errorLogger(`Errore durante il refresh del token - Errore: ${error.message}`).catch(console.error);
        res.status(500).json({ error: "Errore durante il refresh del token" });
    }
}

export async function logout(req, res) {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        errorLogger("Token mancante durante il logout").catch(console.error);
        return res.status(400).json({ error: "Token mancante" });
    }

    await db.query("UPDATE users SET refresh_token = NULL WHERE refresh_token = ?", [refreshToken]);
    res.json({ message: "Logout effettuato, token invalidato." });
}


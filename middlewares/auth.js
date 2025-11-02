import jwt from "jsonwebtoken";
import { errorLogger } from "../middlewares/errorLogger.js";

// Middleware per autenticazione
export function auth(req, res, next) {
    const header = req.headers["authorization"]; // recupera l'header "Authorization" dalla richiesta
    if (!header) return res.status(401).json({ error: "Token mancante" });

    const token = header.split(" ")[1]; // separa "Bearer" dal token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // verifica e decodifica il token
        req.user = decoded; // aggiunge i dati decodificati alla richiesta (perché si possa usarli nelle rotte)
        next(); 
    } catch {
        errorLogger("Token non valido");
        res.status(403).json({ error: "Token non valido" });
    }
}






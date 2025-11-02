import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

//console.log("ENV:", process.env.DB_USER, process.env.DB_PASS === "" ? "Variabili DB mancanti" : "Variabili DB caricate");

export const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});
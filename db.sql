CREATE DATABASE IF NOT EXISTS node_api;
USE node_api;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codice_fiscale VARCHAR(16) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nome VARCHAR(100) NULL,
    cognome VARCHAR(100) NULL,
    data_nascita DATE NULL,
    indirizzo VARCHAR(150) NULL,
    telefono VARCHAR(20) NULL,
    refresh_token VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

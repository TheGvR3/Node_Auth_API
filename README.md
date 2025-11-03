# Node_API

API Node.js minimale per gestione utenti con autenticazione JWT (access + refresh token), salvataggio refresh token in DB e logging degli errori.

## Panoramica progetto (aggiornata)

File principali
- index.js — avvia il server e registra le rotte.
- db.js — connessione MySQL (esporta `db`).
- db.sql — script per creare il DB e la tabella `users`.
- package.json — dipendenze e script.
- .env — variabili d'ambiente (PORT, DB_*, JWT_SECRET, JWT_REFRESH_SECRET).
- log/log.txt — file di log generato da `middlewares/errorLogger.js`.

Routes
- routes/authRoutes.js
  - POST /auth/register        -> controllers/auth/registerController.js
  - POST /auth/login           -> controllers/auth/loginController.js
  - POST /auth/refresh         -> controllers/auth/refreshTokenController.js
  - POST /auth/logout          -> controllers/auth/logoutController.js
- routes/userRoutes.js
  - GET  /users/profile                    -> controllers/user/getUserController.js (protetta)
  - PUT  /users/profile/update             -> controllers/user/updateUserController.js (protetta)
  - PUT  /users/profile/updatePassword     -> controllers/user/updatePasswordController.js (protetta)

Controllers (cartelle)
- controllers/auth/
  - registerController.js
  - loginController.js
  - refreshTokenController.js
  - logoutController.js
  - index.js (esporta i controller auth)
- controllers/user/
  - getUserController.js
  - updateUserController.js
  - updatePasswordController.js
  - index.js (esporta i controller user)

Middleware
- middlewares/auth.js — verifica e valida access token (JWT) per rotte protette.
- middlewares/errorLogger.js — log degli errori su log/log.txt.
- middlewares/validators/
  - authValidator.js
  - userValidator.js
  - handleValidators.js

## Flusso di autenticazione
- Login restituisce:
  - accessToken (scadenza breve, usato per autorizzare rotte protette)
  - refreshToken (salvato nel DB nella colonna `refresh_token` della tabella `users`)
- Rigenerazione token: POST /auth/refresh con il refreshToken.
- Logout: POST /auth/logout invalida il refresh token (salvato a NULL in DB).

## Variabili d'ambiente (.env)
Impostare almeno:
- PORT
- DB_HOST
- DB_USER
- DB_PASSWORD
- DB_NAME
- JWT_SECRET
- JWT_REFRESH_SECRET

## Installazione e avvio rapido
1. Installare dipendenze:
   ```sh
   npm install
   ```
2. Creare il DB e la tabella eseguendo lo script `db.sql`.
3. Avviare il server:
   ```sh
   node index.js
   ```
   oppure, se presente uno script in package.json:
   ```sh
   npm start
   ```

## Esempi di utilizzo (curl)

- Registrazione (esempio completo con tutti i campi disponibili)
  ```sh
  curl -X POST http://localhost:3000/auth/register \
    -H "Content-Type: application/json" \
    -d '{
      "codice_fiscale":"RSSMRA80A01H501U",
      "email":"user@example.com",
      "password":"Secret123!",
      "nome":"Mario",
      "cognome":"Rossi",
      "telefono":"+39 345 1234567",
      "indirizzo":"Via Roma 1, 00100 Roma RM",
      "data_nascita":"1980-01-01"
    }'
  ```

- Login (ottieni accessToken + refreshToken)
  ```sh
  curl -X POST http://localhost:3000/auth/login \
    -H "Content-Type: application/json" \
    -d '{"identifier":"user@example.com","password":"Secret123!"}'
  ```
  o
  ```sh
  curl -X POST http://localhost:3000/auth/login \
    -H "Content-Type: application/json" \
    -d '{"identifier":"RSSMRA80A01H501U","password":"Secret123!"}'
  ```
  Risposta esempio:
  ```json
  {
    "accessToken": "eyJhbGciOiJI...",
    "refreshToken": "eyJhbGciOiJI..."
  }
  ```

- Rigenera access token (usando refreshToken)
  ```sh
  curl -X POST http://localhost:3000/auth/refresh \
    -H "Content-Type: application/json" \
    -d '{"refreshToken":"<REFRESH_TOKEN>"}'
  ```

- Logout (invalida refresh token)
  ```sh
  curl -X POST http://localhost:3000/auth/logout \
    -H "Content-Type: application/json" \
    -d '{"refreshToken":"<REFRESH_TOKEN>"}'
  ```

- Richiedere profilo utente (rotta protetta)
  ```sh
  curl -X GET http://localhost:3000/users/profile \
    -H "Authorization: Bearer <ACCESS_TOKEN>"
  ```

- Aggiornare profilo (esempio completo: nome, cognome, email, telefono, indirizzo)
  ```sh
  curl -X PUT http://localhost:3000/users/profile/update \
    -H "Authorization: Bearer <ACCESS_TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{
      "nome":"Mario",
      "cognome":"Rossi",
      "email":"nuovo@example.com",
      "telefono":"+39 345 7654321",
      "indirizzo":"Via Milano 10, 20100 Milano MI"
    }'
  ```

- Cambiare password
  ```sh
  curl -X PUT http://localhost:3000/users/profile/updatePassword \
    -H "Authorization: Bearer <ACCESS_TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{"currentPassword":"Secret123!","newPassword":"NewSecret456!"}'
  ```

Note:
- Sostituire <ACCESS_TOKEN> e <REFRESH_TOKEN> con i token ottenuti al login.
- Le rotte protette richiedono l'header Authorization con schema "Bearer".
- I validator middleware controllano i campi richiesti per ogni endpoint.

## Database
La tabella principale è `users` (vedi `db.sql`) con colonne principali:
- id, codice_fiscale, email, password (hashed), refresh_token, created_at.

## Logging & sicurezza
- Gli errori vengono appendati in `log/log.txt` tramite `middlewares/errorLogger.js`.
- Password hashate con `bcryptjs`.
- Usare segreti JWT sicuri e non inserirli in repository pubblici.

## Nota
Per dettagli implementativi aprire i file nelle cartelle `controllers/`, `routes/` e `middlewares/`.
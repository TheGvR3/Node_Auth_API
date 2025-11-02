# Node_API

API Node.js minimale per gestione utenti con autenticazione JWT (access + refresh token), salvataggio refresh token in DB e logging degli errori.

## Panoramica dei file principali
- [index.js](index.js) — avvia il server e registra le rotte.
- [db.js](db.js) — connessione MySQL esporta la variabile [`db`](db.js).
- [db.sql](db.sql) — schema DB e tabella `users`.
- [package.json](package.json) — dipendenze e configurazione progetto.
- [.env](.env) — variabili d'ambiente (PORT, DB_*, JWT_SECRET, JWT_REFRESH_SECRET).
- [log/log.txt](log/log.txt) — file di log generato da [`errorLogger`](middlewares/errorLogger.js).

Controller e middleware:
- Controller autenticazione: [`authController.register`](controllers/authController.js), [`authController.login`](controllers/authController.js), [`authController.refreshToken`](controllers/authController.js), [`authController.logout`](controllers/authController.js) — file: [controllers/authController.js](controllers/authController.js)
- Controller utente: [`userController.getUserProfile`](controllers/userController.js) — file: [controllers/userController.js](controllers/userController.js)
- Middleware autenticazione JWT: [`auth`](middlewares/auth.js) — file: [middlewares/auth.js](middlewares/auth.js)
- Logger errori: [`errorLogger`](middlewares/errorLogger.js) — file: [middlewares/errorLogger.js](middlewares/errorLogger.js)

Rotte:
- [routes/authRoutes.js](routes/authRoutes.js)
  - POST /auth/register -> [`authController.register`](controllers/authController.js)
  - POST /auth/login -> [`authController.login`](controllers/authController.js)
  - POST /auth/refresh -> [`authController.refreshToken`](controllers/authController.js)
  - POST /auth/logout -> [`authController.logout`](controllers/authController.js)
- [routes/userRoutes.js](routes/userRoutes.js)
  - GET /users/profile -> protetta da middleware [`auth`](middlewares/auth.js) e gestita da [`userController.getUserProfile`](controllers/userController.js)

## Funzionamento rapido
1. Configurare le variabili in [.env](.env) (DB e segreti JWT).
2. Creare il DB e la tabella eseguendo lo script [db.sql](db.sql).
3. Installare dipendenze:
   ```sh
   npm install
   ```
4. Avviare:
   ```sh
   node index.js
   ```
   Il server si avvia su PORT definito in [.env](.env).

## Flusso di autenticazione
- Login ritorna:
  - accessToken (scadenza breve, usato per autorizzare rotte protette)
  - refreshToken (salvato nel DB nella colonna `refresh_token` della tabella `users`)
- Per rigenerare l'access token usare `/auth/refresh` passando il `refreshToken`.
- Logout invalida il refresh token impostandolo a NULL nel DB.

## Database
Schema principale: tabella `users` (vedi [db.sql](db.sql)) con colonne principali:
- `id`, `codice_fiscale`, `email`, `password` (hashed), `refresh_token`, `created_at`.

## Logging
Gli errori sono appendati in [log/log.txt](log/log.txt) tramite la funzione [`errorLogger`](middlewares/errorLogger.js).

## Sicurezza / note
- I segreti JWT sono presi da [.env](.env): `JWT_SECRET` e `JWT_REFRESH_SECRET`.
- Le password sono hashtate con `bcryptjs` (v. [controllers/authController.js](controllers/authController.js)).
- Assicurarsi di non usare segreti di produzione nel file `.env` visibile.

Per consultare il codice: aprire i file elencati sopra (es. [index.js](index.js), [db.js](db.js), [controllers/authController.js](controllers/authController.js), [middlewares/auth.js](middlewares/auth.js)).
import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

import os from "os";

dotenv.config();

const app = express();
app.use(express.json()); // per leggere JSON
const PORT = process.env.PORT || 3000;

// Rotta base di test
app.get("/", (req, res) => {
  res.json({ message: "API attiva" });
});

// Collega tutte le rotte
app.use("/auth", authRoutes);

app.use("/users", userRoutes);



//Informazioni sulla macchina
const machine = {
  nome: os.type(),
  version: os.version(),
  release: os.release(),
  arch: os.arch(),
  memory: os.totalmem(),
  dispMem: os.freemem(),
  onlineUptime: os.uptime()
}
let machineData = JSON.stringify(machine);

// Avvia il server
app.listen(PORT, () => console.log(`Server avviato su http://localhost:${PORT} su ${machineData}`));
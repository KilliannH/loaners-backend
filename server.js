const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { setupSocket } = require("./socket");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // ⚠️ à restreindre en prod
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingInterval: 10000,
  pingTimeout: 5000
});

setupSocket(io); // 🧠 branche les sockets

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use("/api", require("./routes/index.routes"));

app.get("/", (req, res) => {
  res.send("Loners API is running");
});

console.log("📦 Routes enregistrées :");
  routes.forEach((r) => {
    const methods = Object.keys(r.methods).join(", ").toUpperCase();
    console.log(`${methods} ${r.path}`);
  });

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur sur le port ${PORT}`);
});
require("./cron/cleanup");
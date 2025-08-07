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

const allowedOrigins = [
  "http://localhost:5173",
  "https://loners.net"
];

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingInterval: 10000,
  pingTimeout: 5000,
});

setupSocket(io); // 🧠 branche les sockets

app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(helmet());
app.use(morgan("dev"));

app.use("/api", require("./routes/index.routes"));

app.get("/", (req, res) => {
  res.send("Loners API is running");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur sur le port ${PORT}`);
});
require("./cron/cleanup");
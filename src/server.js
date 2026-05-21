import dotenv from "dotenv";
dotenv.config();

import http from "http";
import express from "express";
import cors from "cors";
import cookieparser from "cookie-parser";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import connectToMongoDb from "../db/connectToMongoDb.js";
import usersRoute from "./routes/user.route.js";
import { setupSocket } from "./socket/socket.js";
import { setSocketIO } from "./socket/socketEmitter.js";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

/* ✅ SIMPLE CORS FIX (THIS IS THE IMPORTANT PART) */
const corsOptions = {
  origin: [
    "https://kolchat.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000"
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());
app.use(cookieparser());

/* SOCKET.IO */
const io = new Server(server, {
  cors: corsOptions,
});
setSocketIO(io);
setupSocket(io);

/* HEALTH CHECK */
app.get("/api/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

/* ROUTES */
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", usersRoute);

/* START SERVER */
server.listen(PORT, () => {
  connectToMongoDb();
  console.log(`Server running on port ${PORT}`);
});
import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import express from 'express';
import cors from 'cors';
import cookieparser from 'cookie-parser';
import { Server } from 'socket.io';

import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import connectToMongoDb from '../db/connectToMongoDb.js';
import usersRoute from './routes/user.route.js';
import { setupSocket } from './socket/socket.js';
import { setSocketIO } from './socket/socketEmitter.js';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

const isProduction = process.env.NODE_ENV &&
                     process.env.NODE_ENV.toLowerCase() === "production" &&
                     process.env.FRONTEND_URL;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!isProduction || !origin) {
      return callback(null, true);
    }
    const isLocal = origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:');
    if (isLocal || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieparser());

const io = new Server(server, {
  cors: corsOptions,
});
setSocketIO(io);
setupSocket(io);

app.get('/api/health', (_req, res) => {
  res.status(200).json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', usersRoute);

server.listen(PORT, () => {
    connectToMongoDb();
    console.log(`Server listening on port ${PORT} (HTTP + Socket.IO)`);
});

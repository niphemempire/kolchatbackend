// const express = require('express');
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieparser from 'cookie-parser';


import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import connectToMongoDb from '../db/connectToMongoDb.js';
import usersRoute from './routes/user.route.js';

const app = express(); 
const PORT = process.env.PORT || 5000;


dotenv.config();

const isProduction = process.env.NODE_ENV && 
                     process.env.NODE_ENV.toLowerCase() === "production" && 
                     process.env.FRONTEND_URL;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
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
}));

app.use(express.json()); // Parse JSON request bodies
app.use(cookieparser()); // Parse cookies from incoming requests
 

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', usersRoute);


app.listen(PORT, () => {
    connectToMongoDb();
    console.log(`app is listening on port ${PORT}`);

})
// const express = require('express');
import express from 'express';

import dotenv from 'dotenv';
import cookieparser from 'cookie-parser';


import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import connectToMongoDb from '../db/connectToMongoDb.js';
import usersRoute from './routes/user.route.js';

const app = express(); 
const PORT = process.env.PORT || 5000;


dotenv.config();

app.use(express.json()); // Parse JSON request bodies
app.use(cookieparser()); // Parse cookies from incoming requests
 

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', usersRoute);


app.listen(PORT, () => {
    connectToMongoDb();
    console.log(`app is listening on port ${PORT}`);

})
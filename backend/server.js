// const express = require('express')
import express, { json } from "express";
import dotenv from "dotenv"

import authRoute from "./routes/auth.route.js"
import connectDB from "./db/connectionDB.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT;

app.use(json())
app.use("/api/auth", authRoute);

app.listen(PORT, () => {
    console.log(`server is running on port number ${PORT}`)
    connectDB();
})
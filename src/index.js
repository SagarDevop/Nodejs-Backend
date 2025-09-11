import connectDB from "./db/index.js";
import dotenv from "dotenv";

dotenv.config({
    path: './.env'
});

connectDB();













// import mongoose from "mongoose";
// import { DB_NAME } from "./constant";
// import express from "express";

// const app = express();

// (async() =>{
//     try {
//         await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
//         console.log('Connected to MongoDB');
//         app.on('error', (error) =>{
//             console.log('Failed to connect to MongoDB');
//         })
//         app.listen(process.env.PORT, () =>{
//             console.log(`Server is running on port ${process.env.PORT}`);
//         });
//     }
//     catch (error) {
//         console.error('Error connecting to MongoDB:', error);
//         throw error;

//     }
// })(); this is one approach to connect to mongodb



import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

// Middleware
app.use(cors(
    {
        origin: process.env.CLIENT_URL,
        credentials: true,
    }
));
app.use(express.json({limit: '50mb'})); // to handle json data
app.use(express.urlencoded({limit: '50mb', extended: true}));// to handle url 
app.use(express.static('public')); // to handle static files
app.use(cookieParser()); // to handle cookies


// routes import 

import userRouter from "../src/routes/user.route.js"

// routes declaration 

app.use("/api/users", userRouter)





export { app };
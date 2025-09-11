import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async() =>{
    try {
        const connenctionInstances = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        console.log('Connected to MongoDB');
    }
    catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
}

export default connectDB;
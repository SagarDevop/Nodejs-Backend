import mongoose from "mongoose";


const connectDB = async() =>{
    try {
        const connenctionInstances = await mongoose.connect(`${process.env.MONGO_URI}`);
        console.log('Connected to MongoDB');
    }
    catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
}

export default connectDB;
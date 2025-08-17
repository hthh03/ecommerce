import mongoose from "mongoose";

const connectDB = async () => {
    try {
        console.log("MONGODB_URI:", process.env.MONGODB_URI); 
        
        mongoose.connection.on('connected', () => {
            console.log("DB Connected");
        });

        mongoose.connection.on('error', (err) => {
            console.log("DB Connection Error:", err);
        });
        
        await mongoose.connect(`${process.env.MONGODB_URI}`);
        
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        process.exit(1);
    }
}

export default connectDB;
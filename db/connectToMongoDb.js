import mongoose from "mongoose";

const connectToMongoDb = async () => {
    try {
        const mongoUrl = process.env.MONGO_URL?.trim();
        if (!mongoUrl) {
            throw new Error("MONGO_URL is not defined in .env");
        }
        await mongoose.connect(mongoUrl, {});
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
};

export default connectToMongoDb;
import mongoose from "mongoose";
import config from "../config/config";

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(
     config.MONGO_URI,
    );
    console.log("MongoDB Connected");
  } catch (err: any) {
    if (err.name === "MongooseServerSelectionError") {
      console.error("\n❌ MongoDB Atlas Connection Error!");
      console.error("This is usually caused by your IP address not being whitelisted in your MongoDB Atlas dashboard.");
      console.error("To fix this, log in to MongoDB Atlas, navigate to 'Network Access' under the Security section, and whitelist your current IP address (or select 'Allow access from anywhere' for development).\n");
    } else {
      console.error("❌ MongoDB connection error:", err);
    }
    process.exit(1);
  }
};

export default connectDB;

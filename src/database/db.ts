import mongoose from "mongoose";
import config from "../config/config";

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(
     config.MONGO_URI,
    );
    console.log("MongoDB Connected");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

export default connectDB;

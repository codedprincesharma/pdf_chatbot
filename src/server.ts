import app from "./app";
import connectDB from "./database/db";
import dotenv from "dotenv";
dotenv.config();

connectDB();

const PORT = process.env.PORT || 5000;





app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});


import dotenv from "dotenv";

dotenv.config();

const config = {
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/pdfchatbot",
  PORT: process.env.PORT || 5000,
  QDRANT_URL: process.env.QDRANT_URL || "http://localhost:6333",
  QDRANT_API_KEY: process.env.QDRANT_API_KEY || "",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  CHUNK_SIZE: 1000,
  CHUNK_OVERLAP: 200,
  EMBEDDING_MODEL: "models/embedding-001",
  EMBEDDING_DIMENSION: 768,
};

export default config;

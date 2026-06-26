import dotenv from "dotenv";

dotenv.config();

const config = {
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://postgres:1234@localhost:5432/pdf_chatbot?schema=public",
  PORT: process.env.PORT || 5000,
  QDRANT_URL: process.env.QDRANT_URL || "http://localhost:6333",
  QDRANT_API_KEY: process.env.QDRANT_API_KEY || "",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  CHUNK_SIZE: 1000,
  CHUNK_OVERLAP: 200,
  EMBEDDING_MODEL: "models/gemini-embedding-001",
  EMBEDDING_DIMENSION: 3072,
  GEMINI_MODEL: "gemini-2.5-flash",
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "default_access_secret_12345!",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "default_refresh_secret_12345!",
  JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || "15m",
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || "7d",
};

export default config;

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
};

export default config;

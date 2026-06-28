import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";

import pdfRoutes from "./routes/pdf.route";
import chatRoutes from "./routes/chat.route";
import authRoutes from "./routes/auth.route";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: true,
  credentials: true, // Allow cookies to be sent from frontend
}));

// Serve static frontend files
app.use(express.static(path.join(__dirname, "../public")));

// Suppress Chrome DevTools CSP warning
app.get("/.well-known/appspecific/com.chrome.devtools.json", (_req, res) => {
  res.json({});
});

app.use("/pdf", pdfRoutes);
app.use("/chat", chatRoutes);
app.use("/auth", authRoutes);

app.get("/health", (req: Request, res: Response) => {
  res.send("API Running");
});

export default app;

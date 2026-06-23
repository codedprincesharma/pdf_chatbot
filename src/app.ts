import express, { Request, Response } from "express";

import cors from "cors";

import pdfRoutes from "./routes/pdf.route";
import chatRoutes from "./routes/chat.route";

const app = express();


app.use(express.json());
app.use(cors());

app.use("/pdf", pdfRoutes);
app.use("/chat", chatRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("API Running");
});

export default app;
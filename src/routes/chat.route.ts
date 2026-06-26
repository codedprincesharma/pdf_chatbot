import express from "express";
import { askQuestion, getHistory } from "../controller/chat.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/", authMiddleware as any, askQuestion);
router.get("/history/:pdfId", authMiddleware as any, getHistory);

export default router;

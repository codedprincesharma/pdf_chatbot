import express from "express";
import { askQuestion, getHistory } from "../controller/chat.controller";

const router = express.Router();

router.post("/", askQuestion);
router.get("/history/:pdfId", getHistory);

export default router;

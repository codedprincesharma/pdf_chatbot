import express from "express";
import { askQuestion } from "../controller/chat.controller";

const router = express.Router();

router.post("/", askQuestion);

export default router;
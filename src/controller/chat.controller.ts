import { Request, Response } from "express";
import * as chatService from "../service/chat.service";

export const askQuestion = async (
  req: Request,
  res: Response
) => {
  try {
    const { question, pdfId } = req.body;

    if (!question || !pdfId) {
      return res.status(400).json({
        success: false,
        message: "Question and PDF ID are required",
      });
    }

    const answer = await chatService.askQuestion(question, pdfId);

    res.status(200).json({
      success: true,
      data: answer,
    });
  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get answer",
    });
  }
};

export const getHistory = async (
  req: Request,
  res: Response
) => {
  try {
    const pdfId = req.params.pdfId as string;

    if (!pdfId) {
      return res.status(400).json({
        success: false,
        message: "PDF ID is required",
      });
    }

    const history = await chatService.getConversationHistory(pdfId);

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error: any) {
    console.error("History fetch error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch history",
    });
  }
};
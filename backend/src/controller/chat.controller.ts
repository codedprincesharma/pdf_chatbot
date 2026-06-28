import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import * as chatService from "../service/chat.service";

export const askQuestion = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User ID not found",
      });
    }

    const { question, pdfId } = req.body;

    if (!question || !pdfId) {
      return res.status(400).json({
        success: false,
        message: "Question and PDF ID are required",
      });
    }

    const answer = await chatService.askQuestion(question, pdfId, userId);

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
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User ID not found",
      });
    }

    const pdfId = req.params.pdfId as string;

    if (!pdfId) {
      return res.status(400).json({
        success: false,
        message: "PDF ID is required",
      });
    }

    const history = await chatService.getConversationHistory(pdfId, userId);

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
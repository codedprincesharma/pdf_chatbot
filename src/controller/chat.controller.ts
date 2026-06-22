import { Request, Response } from "express";
import * as chatService from "../service/chat.service";

export const askQuestion = async (
  req: Request,
  res: Response
) => {
  try {
    const { question, pdfId } = req.body;

    const answer = await chatService.askQuestion(
      question,
      pdfId
    );

    res.status(200).json({
      success: true,
      answer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get answer",
    });
  }
};
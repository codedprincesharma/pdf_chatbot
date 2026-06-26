import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import * as pdfService from "../service/pdf.service";

export const uploadPdf = async (
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

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const result = await pdfService.uploadPdf(req.file, userId);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("PDF upload error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "PDF upload failed",
    });
  }
};

export const getPdfs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User ID not found",
      });
    }

    const list = await pdfService.getPdfs(userId);
    res.status(200).json({
      success: true,
      data: list.map(pdf => ({
        id: pdf.id,
        fileName: pdf.fileName,
        originalName: pdf.originalName,
        vectorCollectionId: pdf.vectorCollectionId,
        chunkCount: pdf.chunkCount,
        createdAt: pdf.createdAt,
      })),
    });
  } catch (error: any) {
    console.error("PDF list error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve PDFs",
    });
  }
};

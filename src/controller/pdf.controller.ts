import { Request, Response } from "express";
import * as pdfService from "../service/pdf.service";
import { pdfs } from "../database/memoryDb";

export const uploadPdf = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const result = await pdfService.uploadPdf(req.file);

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

export const getPdfs = async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      success: true,
      data: pdfs.map(pdf => ({
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
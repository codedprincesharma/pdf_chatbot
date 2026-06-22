import { Request, Response } from "express";
import * as pdfService from "../service/pdf.service";

export const uploadPdf = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await pdfService.uploadPdf(req.file);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "PDF upload failed",
    });
  }
};


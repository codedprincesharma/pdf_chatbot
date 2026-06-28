import prisma from "../database/db";
import * as vectorService from "./vector.service";
import config from "../config/config";
import { PDFParse } from "pdf-parse";

export const uploadPdf = async (file: Express.Multer.File, userId: string) => {
  try {
    // 1. Extract Text from PDF
    const parser = new PDFParse({ data: file.buffer });
    const textResult = await parser.getText();
    const fullText = textResult.text;
    await parser.destroy();

    if (!fullText) {
      throw new Error("No text extracted from PDF");
    }

    console.log("Text extracted successfully");

    // 2. Chunk Text into smaller pieces
    const chunks = chunkText(fullText, config.CHUNK_SIZE, config.CHUNK_OVERLAP);
    console.log(`Text chunked into ${chunks.length} chunks`);

    // 3. Create unique collection name for this PDF
    const collectionName = `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 4. Create Qdrant collection
    await vectorService.createCollection(collectionName);

    // 5. Generate Embeddings and Store in Vector DB
    const chunkIds = await vectorService.storeVectors(collectionName, chunks);
    console.log(`Stored ${chunkIds.length} chunk embeddings`);

    // 6. Save Metadata to Database
    const pdf = await prisma.pdf.create({
      data: {
        userId,
        fileName: file.filename || `pdf_${Date.now()}`,
        originalName: file.originalname,
        vectorCollectionId: collectionName,
        textLength: fullText.length,
        chunkCount: chunks.length,
      },
    });

    return {
      id: pdf.id,
      fileName: pdf.fileName,
      originalName: pdf.originalName,
      vectorCollectionId: collectionName,
      chunkCount: chunks.length,
      message: "PDF uploaded and processed successfully",
    };
  } catch (error) {
    console.error("Error in uploadPdf:", error);
    throw error;
  }
};

const chunkText = (
  text: string,
  chunkSize: number,
  overlap: number
): string[] => {
  const chunks: string[] = [];
  let start = 0;

  if (chunkSize <= 0) return [];
  const actualOverlap = Math.min(overlap, chunkSize - 1);

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end).trim();

    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    if (end >= text.length) {
      break;
    }

    start = end - actualOverlap;
  }

  console.log(chunks.length);
  return chunks;
};

export const getPdfs = async (userId: string) => {
  try {
    return await prisma.pdf.findMany({
      where: { userId },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("Error in getPdfs service:", error);
    throw error;
  }
};

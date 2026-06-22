import PDF from "../models/pdf.model";

export const uploadPdf = async (file: Express.Multer.File) => {
 //  1. Extract Text

  // 2. Chunk Text

  // 3. Generate Embeddings

  // 4. Store in Vector DB

  // 5. Save Metadata

  const pdf = await PDF.create({
    fileName: file.filename,
    originalName: file.originalname,
    vectorCollectionId: "collection_123",
  });

  return pdf;
};
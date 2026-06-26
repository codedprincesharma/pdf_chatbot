import prisma from "../database/db";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as vectorService from "./vector.service";
import config from "../config/config";

const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: config.GEMINI_MODEL });

export const askQuestion = async (
  question: string,
  pdfId: string,
  userId: string
) => {
  try {
    // 1. Validate inputs
    if (!question || !pdfId) {
      throw new Error("Question and PDF ID are required");
    }

    // 2. Get PDF and vector collection info
    const pdf = await prisma.pdf.findFirst({
      where: { id: pdfId, userId },
    });
    if (!pdf) {
      throw new Error("PDF not found");
    }

    const collectionName = pdf.vectorCollectionId;

    // 3. Search for similar chunks in vector database
    const similarChunks = await vectorService.similaritySearch(
      collectionName,
      question,
      5 // top 5 most similar chunks
    );

    if (similarChunks.length === 0) {
      throw new Error("No relevant content found in PDF");
    }

    console.log(`Found ${similarChunks.length} relevant chunks`);

    // 4. Build context from retrieved chunks
    const context = similarChunks
      .map((chunk, index) => `[Chunk ${index + 1}]\n${chunk.text}`)
      .join("\n\n---\n\n");

    // 5. Build RAG prompt
    const ragPrompt = `You are a helpful assistant answering questions about a PDF document.

Context from the PDF:
${context}

User Question: ${question}

Based on the context provided above, please answer the question. If the answer is not found in the context, say "I couldn't find this information in the provided PDF."

Answer:`;

    // 6. Call Gemini API
    const response = await model.generateContent(ragPrompt);
    const answer = response.response.text();

    // 7. Save conversation to Database
    let conversation = await prisma.conversation.findFirst({
      where: { pdfId, userId },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          pdfId,
          userId,
        },
      });
    }

    await prisma.message.createMany({
      data: [
        { conversationId: conversation.id, role: "user", content: question },
        { conversationId: conversation.id, role: "assistant", content: answer },
      ],
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    console.log("Conversation saved");

    return {
      answer,
      sources: similarChunks.length,
      pdfId,
      question,
    };
  } catch (error) {
    console.error("Error in askQuestion:", error);
    throw error;
  }
};

export const getConversationHistory = async (pdfId: string, userId: string) => {
  try {
    const conversation = await prisma.conversation.findFirst({
      where: { pdfId, userId },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });
    if (!conversation) {
      return { messages: [], pdfId };
    }
    return conversation;
  } catch (error) {
    console.error("Error fetching conversation:", error);
    throw error;
  }
};


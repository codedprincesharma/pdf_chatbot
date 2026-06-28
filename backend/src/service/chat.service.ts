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

    // 5. Fetch conversation history for context-aware answers
    const existingConversation = await prisma.conversation.findFirst({
      where: { pdfId, userId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: 20, // Last 20 messages (10 Q&A pairs)
        },
      },
    });

    const chatHistory = existingConversation?.messages
      ?.map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
      .join("\n") || "No previous conversation.";

    // 6. Build RAG prompt with conversation history
    const ragPrompt = `You are an AI assistant that answers questions using both the conversation history and the retrieved document context.

Instructions:

1. Always understand the user's current question in the context of the previous conversation.

2. Use the conversation history to answer questions about previous messages, follow-up questions, references like "this", "that", "it", "previous answer", "last question", etc.

3. Use the retrieved document context only for answering questions related to the uploaded documents.

4. If the user's question requires both conversation history and document context, combine both intelligently.

5. Never invent information that is not present in the conversation history or retrieved context.

6. If the answer cannot be found in either the conversation history or the retrieved context, clearly say:
"I couldn't find that information in the available conversation history or uploaded documents."

7. Give concise, accurate, and well-structured answers.

----------------------------------------
Conversation History:
${chatHistory}

----------------------------------------
Retrieved Context:
${context}

----------------------------------------
Current User Question:
${question}

----------------------------------------
Generate the best possible answer using the conversation history and the retrieved document context.`;

    // 7. Call Gemini API
    const response = await model.generateContent(ragPrompt);
    const answer = response.response.text();

    // 8. Save conversation to Database
    let conversationId: string;

    if (existingConversation) {
      conversationId = existingConversation.id;
    } else {
      const newConversation = await prisma.conversation.create({
        data: {
          pdfId,
          userId,
        },
      });
      conversationId = newConversation.id;
    }

    await prisma.message.createMany({
      data: [
        { conversationId, role: "user", content: question },
        { conversationId, role: "assistant", content: answer },
      ],
    });

    await prisma.conversation.update({
      where: { id: conversationId },
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


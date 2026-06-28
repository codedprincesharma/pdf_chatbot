import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import config from "../config/config";

const llm = new ChatGoogleGenerativeAI({
  apiKey: config.GEMINI_API_KEY,
  model: "gemini-2.5-flash",
});

export const generateAnswer = async (
  prompt: string
) => {
  const response = await llm.invoke(prompt);

  return response.content.toString();
};

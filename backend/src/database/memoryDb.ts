export interface IPdf {
  id: string;
  fileName: string;
  originalName: string;
  vectorCollectionId: string;
  textLength: number;
  chunkCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage {
  role: "user" | "assistant";
  content: string;
}

export interface IConversation {
  pdfId: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// In-memory data stores
export const pdfs: IPdf[] = [];
export const conversations: IConversation[] = [];

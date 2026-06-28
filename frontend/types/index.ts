export interface Pdf {
  id: string;
  originalName: string;
  chunkCount: number;
  vectorCollectionId: string;
  createdAt: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: number;
}

export interface ChatResponse {
  answer: string;
  sources: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface AuthData {
  accessToken: string;
  user: {
    email: string;
  };
}

export interface ToastItem {
  id: string;
  title: string;
  desc: string;
  type: 'success' | 'error' | 'info';
}

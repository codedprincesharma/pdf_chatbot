import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'DocuMind AI - Chat with your PDFs',
  description:
    'An AI-powered PDF chatbot. Upload documents, extract context, and ask questions with cited sources.',
  keywords: 'PDF Chatbot, AI, Gemini, Qdrant, RAG, Document Analysis',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="" suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

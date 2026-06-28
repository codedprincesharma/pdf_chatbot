'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FileText, Info, Menu } from 'lucide-react';
import { authFetch } from '@/lib/api';
import { Pdf, Message } from '@/types';
import MessageBubble from './MessageBubble';
import ThinkingBubble from './ThinkingBubble';
import SuggestionBar from './SuggestionBar';
import ChatInput from './ChatInput';

interface ChatViewProps {
  activePdf: Pdf;
  showToast: (title: string, desc: string, type: 'success' | 'error' | 'info') => void;
  onSessionExpired: () => void;
  onOpenSidebar?: () => void;
}

export default function ChatView({
  activePdf,
  showToast,
  onSessionExpired,
  onOpenSidebar,
}: ChatViewProps) {
  const [messages, setMessages] = useState<
    Array<Message & { timestamp?: string }>
  >([]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch chat history when activePdf changes
  useEffect(() => {
    const fetchHistory = async () => {
      setMessages([]);
      try {
        const response = await authFetch(`/api/chat/history/${activePdf.id}`);
        const result = await response.json();
        if (result.success && result.data?.messages) {
          setMessages(
            result.data.messages.map((msg: Message) => ({
              ...msg,
              timestamp: undefined,
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching history:', error);
        if (
          error instanceof Error &&
          error.message === 'SESSION_EXPIRED'
        ) {
          onSessionExpired();
          return;
        }
        showToast('Error', 'Failed to retrieve conversation history', 'error');
      }
    };

    fetchHistory();
  }, [activePdf.id, showToast, onSessionExpired]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSubmit = async () => {
    const question = inputValue.trim();
    if (!question) return;

    const userTimestamp = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    setInputValue('');
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: question, timestamp: userTimestamp },
    ]);
    setIsThinking(true);

    try {
      const response = await authFetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, pdfId: activePdf.id }),
      });

      const result = await response.json();
      setIsThinking(false);

      const aiTimestamp = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      if (result.success && result.data) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: result.data.answer,
            sources: result.data.sources,
            timestamp: aiTimestamp,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              result.message ||
              'Sorry, I encountered an issue processing your request.',
            timestamp: aiTimestamp,
          },
        ]);
      }
    } catch (error) {
      console.error('Error sending question:', error);
      setIsThinking(false);

      if (
        error instanceof Error &&
        error.message === 'SESSION_EXPIRED'
      ) {
        onSessionExpired();
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Sorry, I am having trouble connecting to the server. Please check your connection.',
        },
      ]);
    }
  };

  const handleSuggestion = (prompt: string) => {
    setInputValue(prompt);
  };

  return (
    <div className="chat-view" id="chat-view">
      {/* Chat Header */}
      <header className="chat-header">
        <div className="active-doc-info">
          <button className="mobile-menu-btn" id="mobile-menu-btn" onClick={onOpenSidebar} aria-label="Open sidebar">
            <Menu style={{ width: '18px', height: '18px' }} />
          </button>
          <FileText className="active-doc-icon" />
          <div className="active-doc-details">
            <h2 id="active-doc-title" title={activePdf.originalName}>
              {activePdf.originalName}
            </h2>
            <span id="active-doc-meta" className="active-doc-meta">
              {activePdf.chunkCount} chunks • Vector ID:{' '}
              {activePdf.vectorCollectionId.substring(0, 15)}...
            </span>
          </div>
        </div>
        <div className="header-actions">
          <span className="status-badge">
            <span className="pulse-dot" />
            Ready
          </span>
        </div>
      </header>

      {/* Messages Area */}
      <div className="messages-area" id="messages-area">
        {/* System status message */}
        <div className="system-status-msg">
          <Info
            style={{
              width: 13,
              height: 13,
              color: 'var(--accent-purple)',
            }}
          />
          <span>Connected. Ask me anything about this document!</span>
        </div>

        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            role={msg.role}
            content={msg.content}
            sources={msg.sources}
            timestamp={msg.timestamp}
          />
        ))}

        {isThinking && <ThinkingBubble />}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Footer */}
      <footer className="chat-footer">
        <SuggestionBar onSelectPrompt={handleSuggestion} />
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSubmit}
          disabled={isThinking}
        />
      </footer>
    </div>
  );
}

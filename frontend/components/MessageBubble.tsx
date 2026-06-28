'use client';

import React from 'react';
import { Quote } from 'lucide-react';
import { parseMarkdown } from '@/lib/markdown';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  sources?: number;
  timestamp?: string;
}

export default function MessageBubble({
  role,
  content,
  sources,
  timestamp,
}: MessageBubbleProps) {
  const time =
    timestamp ||
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`message ${role}`}>
      <div className="message-bubble">
        {role === 'assistant' ? (
          <span dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }} />
        ) : (
          content
        )}
      </div>
      <div className="message-meta">
        <span>{time}</span>
        {role === 'assistant' && sources != null && (
          <span
            className="sources-pill"
            title={`Retrieved ${sources} relevant chunks from PDF`}
          >
            <Quote style={{ width: 10, height: 10 }} />
            {sources} sources
          </span>
        )}
      </div>
    </div>
  );
}

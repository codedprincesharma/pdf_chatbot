'use client';

import React from 'react';

export default function ThinkingBubble() {
  return (
    <div className="message assistant thinking-bubble">
      <div className="message-bubble">
        <div className="thinking-indicator">
          <div className="thinking-dot" />
          <div className="thinking-dot" />
          <div className="thinking-dot" />
        </div>
      </div>
    </div>
  );
}

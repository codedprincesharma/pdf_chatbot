'use client';

import React from 'react';
import { ScrollText, Lightbulb, BookOpen } from 'lucide-react';

interface SuggestionBarProps {
  onSelectPrompt: (prompt: string) => void;
}

const suggestions = [
  {
    icon: ScrollText,
    label: 'Summarize',
    prompt: 'Summarize the main points of this document.',
  },
  {
    icon: Lightbulb,
    label: 'Key Takeaways',
    prompt: 'What are the key takeaways or findings?',
  },
  {
    icon: BookOpen,
    label: 'Definitions',
    prompt: 'Can you list any definitions or technical terms defined here?',
  },
];

export default function SuggestionBar({ onSelectPrompt }: SuggestionBarProps) {
  return (
    <div className="suggestions-container" id="suggestions-container">
      {suggestions.map((s) => (
        <button
          key={s.label}
          className="suggestion-btn"
          onClick={() => onSelectPrompt(s.prompt)}
        >
          <s.icon className="btn-icon" />
          {s.label}
        </button>
      ))}
    </div>
  );
}

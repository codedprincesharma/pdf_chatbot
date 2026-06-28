import React from 'react';
import { Sparkles, Zap, Search, Quote, Menu } from 'lucide-react';

interface WelcomeViewProps {
  onOpenSidebar?: () => void;
}

export default function WelcomeView({ onOpenSidebar }: WelcomeViewProps) {
  return (
    <div className="welcome-view" id="welcome-view">
      {/* Mobile Top Header */}
      <header className="mobile-welcome-header" id="mobile-welcome-header">
        <button className="mobile-menu-btn" onClick={onOpenSidebar} aria-label="Open sidebar">
          <Menu style={{ width: '18px', height: '18px' }} />
        </button>
        <span className="mobile-logo-text">DocuMind <span className="accent-text">AI</span></span>
      </header>

      <div className="welcome-content">
        <div className="welcome-logo">
          <Sparkles className="welcome-icon" />
        </div>
        <h1>
          Supercharge your reading with{' '}
          <span className="gradient-text">DocuMind AI</span>
        </h1>
        <p className="welcome-desc">
          Upload a PDF document in the sidebar to begin. Our advanced RAG
          technology chunks your document, creates vector embeddings, and
          enables real-time cited conversation.
        </p>

        <div className="feature-grid">
          <div className="feature-card">
            <Zap className="feature-icon" />
            <h4>Instant Answers</h4>
            <p>
              Extract crucial information and get answers to complex questions
              immediately.
            </p>
          </div>
          <div className="feature-card">
            <Search className="feature-icon" />
            <h4>Semantic Retrieval</h4>
            <p>
              Finds relevant sections of your PDF automatically using advanced
              Qdrant searches.
            </p>
          </div>
          <div className="feature-card">
            <Quote className="feature-icon" />
            <h4>Cited Sources</h4>
            <p>
              AI answers are generated strictly using document context and point
              back to exact text chunks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

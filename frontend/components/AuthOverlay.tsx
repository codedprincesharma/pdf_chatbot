'use client';

import React, { useState, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  BrainCircuit,
  Mail,
  User,
  ArrowRight,
} from 'lucide-react';

interface AuthOverlayProps {
  onSuccess?: () => void;
  showToast: (title: string, desc: string, type: 'success' | 'error' | 'info') => void;
}

export default function AuthOverlay({ onSuccess, showToast }: AuthOverlayProps) {
  const { showAuthModal, login } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!showAuthModal) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) return;

    setLoading(true);
    try {
      await login(email.trim(), name.trim());
      showToast('Success', 'Access granted successfully!', 'success');
      onSuccess?.();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Operation failed';
      showToast('Access Failed', msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay" id="auth-overlay">
      <div className="auth-card">
        <div className="auth-header">
          <BrainCircuit className="auth-logo-icon" />
          <h2>
            DocuMind <span className="accent-text">AI</span>
          </h2>
          <p id="auth-subtitle">
            Enter your name and Gmail to access the PDF chatbot
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="auth-name">Your Name</label>
            <div className="input-wrapper">
              <User className="input-icon" />
              <input
                type="text"
                id="auth-name"
                placeholder="John Doe"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="auth-email">Gmail Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" />
              <input
                type="email"
                id="auth-email"
                placeholder="you@gmail.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            id="auth-submit-btn"
            disabled={loading}
          >
            <span>
              {loading ? 'Entering...' : 'Access Website'}
            </span>
            <ArrowRight className="btn-arrow" />
          </button>
        </form>
      </div>
    </div>
  );
}

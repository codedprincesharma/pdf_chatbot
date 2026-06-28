'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/useToast';
import { authFetch } from '@/lib/api';
import { Pdf } from '@/types';

import AuthOverlay from '@/components/AuthOverlay';
import Sidebar from '@/components/Sidebar';
import WelcomeView from '@/components/WelcomeView';
import ChatView from '@/components/ChatView';
import ToastContainer from '@/components/ToastContainer';

export default function Home() {
  const { isAuthenticated, checkAuth, openAuthModal } = useAuth();
  const { toasts, showToast } = useToast();

  const [pdfsList, setPdfsList] = useState<Pdf[]>([]);
  const [activePdfId, setActivePdfId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Fetch PDFs when authenticated
  const fetchPdfs = useCallback(async () => {
    try {
      const response = await authFetch('/api/pdf/list');
      const result = await response.json();
      if (result.success) {
        setPdfsList(result.data);
      } else {
        showToast('Error', result.message || 'Failed to fetch library list', 'error');
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'SESSION_EXPIRED') {
        openAuthModal();
        return;
      }
      console.error('Error fetching PDFs:', error);
      showToast('Connection Error', 'Could not reach the server', 'error');
    }
  }, [showToast, openAuthModal]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPdfs();
    }
  }, [isAuthenticated, fetchPdfs]);

  const handleSelectPdf = (pdfId: string) => {
    if (activePdfId !== pdfId) {
      setActivePdfId(pdfId);
    }
    setIsSidebarOpen(false);
  };

  const handleUploadSuccess = (pdfId: string) => {
    fetchPdfs().then(() => {
      setActivePdfId(pdfId);
      setIsSidebarOpen(false);
    });
  };

  const handleSessionExpired = () => {
    openAuthModal();
    showToast('Session Expired', 'Please log in again.', 'error');
  };

  const handleAuthSuccess = () => {
    fetchPdfs();
  };

  const activePdf = pdfsList.find((p) => p.id === activePdfId) || null;

  return (
    <>
      {/* Auth Modal */}
      <AuthOverlay onSuccess={handleAuthSuccess} showToast={showToast} />

      {/* Main App */}
      {isAuthenticated && (
        <div className={`app-container${isSidebarOpen ? ' sidebar-open' : ''}`} id="app-container">
          <Sidebar
            pdfs={pdfsList}
            activePdfId={activePdfId}
            onSelectPdf={handleSelectPdf}
            onUploadSuccess={handleUploadSuccess}
            showToast={showToast}
            onSessionExpired={handleSessionExpired}
            onClose={() => setIsSidebarOpen(false)}
          />

          {isSidebarOpen && (
            <div className="mobile-backdrop" id="mobile-backdrop" onClick={() => setIsSidebarOpen(false)} />
          )}

          <main className="chat-container">
            {activePdf ? (
              <ChatView
                activePdf={activePdf}
                showToast={showToast}
                onSessionExpired={handleSessionExpired}
                onOpenSidebar={() => setIsSidebarOpen(true)}
              />
            ) : (
              <WelcomeView onOpenSidebar={() => setIsSidebarOpen(true)} />
            )}
          </main>
        </div>
      )}

      {/* Toasts */}
      <ToastContainer toasts={toasts} />
    </>
  );
}

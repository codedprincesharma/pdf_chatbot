'use client';

import React, { useRef, useCallback, useEffect } from 'react';
import { BrainCircuit, X } from 'lucide-react';
import { Pdf } from '@/types';
import ThemeToggle from './ThemeToggle';
import DropZone from './DropZone';
import DocumentList from './DocumentList';
import UserProfile from './UserProfile';

interface SidebarProps {
  pdfs: Pdf[];
  activePdfId: string | null;
  onSelectPdf: (id: string) => void;
  onUploadSuccess: (pdfId: string) => void;
  showToast: (title: string, desc: string, type: 'success' | 'error' | 'info') => void;
  onSessionExpired: () => void;
  onClose?: () => void;
}

export default function Sidebar({
  pdfs,
  activePdfId,
  onSelectPdf,
  onUploadSuccess,
  showToast,
  onSessionExpired,
  onClose,
}: SidebarProps) {
  const sidebarRef = useRef<HTMLElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);

  // Load saved sidebar width
  useEffect(() => {
    const savedWidth = localStorage.getItem('sidebarWidth');
    if (savedWidth && sidebarRef.current) {
      sidebarRef.current.style.width = savedWidth + 'px';
      sidebarRef.current.style.minWidth = savedWidth + 'px';
    }
  }, []);

  // Sidebar drag-to-resize
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      document.body.classList.add('resizing');

      const startX = e.clientX;
      const startWidth = sidebarRef.current?.getBoundingClientRect().width || 320;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        let newWidth = startWidth + deltaX;
        if (newWidth < 240) newWidth = 240;
        if (newWidth > 480) newWidth = 480;

        if (sidebarRef.current) {
          sidebarRef.current.style.width = newWidth + 'px';
          sidebarRef.current.style.minWidth = newWidth + 'px';
        }
      };

      const handleMouseUp = () => {
        document.body.classList.remove('resizing');
        const finalWidth = sidebarRef.current?.getBoundingClientRect().width || 320;
        localStorage.setItem('sidebarWidth', String(finalWidth));
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    []
  );

  return (
    <>
      <aside className="sidebar" id="sidebar" ref={sidebarRef}>
        {/* Logo + Theme Toggle */}
        <div className="sidebar-header">
          <div className="logo-row">
            <div className="logo">
              <BrainCircuit className="logo-icon" />
              <span>
                DocuMind <span className="accent-text">AI</span>
              </span>
            </div>
            <div className="sidebar-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ThemeToggle />
              <button className="sidebar-close-btn" id="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <DropZone
          onUploadSuccess={onUploadSuccess}
          showToast={showToast}
          onSessionExpired={onSessionExpired}
        />

        {/* Library Section */}
        <div className="library-section">
          <div className="library-header">
            <h3>Your Library</h3>
            <span className="doc-count" id="doc-count">
              {pdfs.length} file{pdfs.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="doc-list" id="doc-list">
            <DocumentList
              pdfs={pdfs}
              activePdfId={activePdfId}
              onSelectPdf={onSelectPdf}
            />
          </div>

          {/* User Profile */}
          <UserProfile showToast={showToast} />
        </div>
      </aside>

      {/* Resize Handle */}
      <div
        className="sidebar-resizer"
        id="sidebar-resizer"
        ref={resizerRef}
        onMouseDown={handleMouseDown}
      />
    </>
  );
}

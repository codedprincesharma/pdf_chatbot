'use client';

import React from 'react';
import { FileText, Files } from 'lucide-react';
import { Pdf } from '@/types';

interface DocumentListProps {
  pdfs: Pdf[];
  activePdfId: string | null;
  onSelectPdf: (id: string) => void;
}

export default function DocumentList({
  pdfs,
  activePdfId,
  onSelectPdf,
}: DocumentListProps) {
  if (pdfs.length === 0) {
    return (
      <div className="empty-library">
        <Files className="empty-icon" />
        <p>No documents uploaded yet</p>
      </div>
    );
  }

  return (
    <>
      {pdfs.map((pdf) => (
        <div
          key={pdf.id}
          className={`doc-item${pdf.id === activePdfId ? ' active' : ''}`}
          data-id={pdf.id}
          onClick={() => onSelectPdf(pdf.id)}
        >
          <div className="doc-icon-container">
            <FileText />
          </div>
          <div className="doc-details">
            <div className="doc-name" title={pdf.originalName}>
              {pdf.originalName}
            </div>
            <div className="doc-meta">
              {pdf.chunkCount} chunks •{' '}
              {new Date(pdf.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

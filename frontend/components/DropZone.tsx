'use client';

import React, { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { UploadCloud } from 'lucide-react';
import { getAccessToken, refreshToken } from '@/lib/api';

interface DropZoneProps {
  onUploadSuccess: (pdfId: string) => void;
  showToast: (title: string, desc: string, type: 'success' | 'error' | 'info') => void;
  onSessionExpired: () => void;
}

export default function DropZone({
  onUploadSuccess,
  showToast,
  onSessionExpired,
}: DropZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusText, setStatusText] = useState('Uploading...');
  const [statusPercent, setStatusPercent] = useState('0%');
  const [progressWidth, setProgressWidth] = useState('0%');

  const handleClick = () => fileInputRef.current?.click();

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);
  const handleDragEnd = () => setIsDragOver(false);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    if (file.type !== 'application/pdf') {
      showToast('Invalid File Type', 'Please upload a PDF file only', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('pdf', file);

    setUploading(true);
    setStatusText('Uploading...');
    setStatusPercent('0%');
    setProgressWidth('0%');

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        setProgressWidth(`${percent}%`);
        setStatusPercent(`${percent}%`);
        if (percent === 100) {
          setStatusText('Processing PDF (Extracting text & creating embeddings)...');
          setStatusPercent('');
        }
      }
    });

    xhr.addEventListener('load', async () => {
      if (xhr.status === 401) {
        console.log('Access token expired during upload, attempting refresh...');
        const refreshed = await refreshToken();
        if (refreshed) {
          handleFileUpload(file);
        } else {
          onSessionExpired();
          showToast('Session Expired', 'Please log in again to upload files', 'error');
          setUploading(false);
        }
        return;
      }

      if (xhr.status === 201) {
        try {
          const response = JSON.parse(xhr.responseText);
          showToast('Success', 'PDF uploaded and processed successfully!', 'success');
          setUploading(false);
          if (response.success && response.data?.id) {
            onUploadSuccess(response.data.id);
          }
        } catch {
          showToast('Processing Error', 'Server returned unexpected response', 'error');
          setUploading(false);
        }
      } else {
        let errMsg = 'PDF upload failed';
        try {
          const errObj = JSON.parse(xhr.responseText);
          errMsg = errObj.message || errMsg;
        } catch { /* ignore parse errors */ }
        showToast('Upload Failed', errMsg, 'error');
        setUploading(false);
      }
    });

    xhr.addEventListener('error', () => {
      showToast('Connection Error', 'Network error occurred during file upload', 'error');
      setUploading(false);
    });

    xhr.open('POST', '/api/pdf/upload');
    const token = getAccessToken();
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    xhr.withCredentials = true;
    xhr.send(formData);
  };

  return (
    <div className="upload-section">
      <h3>Upload Document</h3>
      <div
        className={`drag-drop-zone${isDragOver ? ' dragover' : ''}`}
        id="drop-zone"
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDragEnd={handleDragEnd}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept=".pdf"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <UploadCloud className="upload-icon" />
        <p className="upload-title">Drag & drop your PDF here</p>
        <p className="upload-subtitle">
          or <span className="browse-link">browse files</span>
        </p>
      </div>

      {uploading && (
        <div className="upload-status" id="upload-status">
          <div className="status-info">
            <span className="status-text">{statusText}</span>
            <span className="status-percent">{statusPercent}</span>
          </div>
          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{ width: progressWidth }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

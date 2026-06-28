'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { ToastItem } from '@/types';

interface ToastContainerProps {
  toasts: ToastItem[];
}

const iconMap = {
  success: CheckCircle,
  error: AlertTriangle,
  info: Info,
};

export default function ToastContainer({ toasts }: ToastContainerProps) {
  return (
    <div className="toast-container" id="toast-container">
      {toasts.map((toast) => (
        <ToastElement key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

function ToastElement({ toast }: { toast: ToastItem }) {
  const [exiting, setExiting] = useState(false);
  const Icon = iconMap[toast.type] || Info;

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`toast ${toast.type}`}
      style={
        exiting
          ? {
              animation:
                'toastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse forwards',
            }
          : undefined
      }
    >
      <Icon className="toast-icon" />
      <div className="toast-content">
        <div className="toast-title">{toast.title}</div>
        <div className="toast-desc">{toast.desc}</div>
      </div>
    </div>
  );
}

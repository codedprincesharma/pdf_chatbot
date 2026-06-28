'use client';

import { useState, useCallback } from 'react';
import { ToastItem } from '@/types';

let toastIdCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback(
    (title: string, desc: string, type: ToastItem['type'] = 'info') => {
      const id = `toast-${++toastIdCounter}`;
      const toast: ToastItem = { id, title, desc, type };
      setToasts((prev) => [...prev, toast]);

      // Auto-dismiss after 4 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4300);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, showToast, removeToast };
}

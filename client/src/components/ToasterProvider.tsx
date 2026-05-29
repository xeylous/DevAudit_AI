'use client';

import { Toaster } from 'react-hot-toast';

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#1c2129',
          color: '#e6edf3',
          border: '1px solid #30363d',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '14px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(12px)',
        },
        success: {
          iconTheme: { primary: '#3fb950', secondary: '#0d1117' },
        },
        error: {
          iconTheme: { primary: '#f85149', secondary: '#0d1117' },
        },
      }}
    />
  );
}

import React from 'react';
import { Toaster } from 'react-hot-toast';

export const ToastContainer: React.FC = () => {
  return (
    <Toaster
      position="top-right"
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: 'rgba(17, 22, 39, 0.95)',
          color: '#d0d3de',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          backdropFilter: 'blur(20px)',
          fontSize: '13px',
          padding: '12px 16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#111627',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#111627',
          },
        },
      }}
    />
  );
};

export default ToastContainer;

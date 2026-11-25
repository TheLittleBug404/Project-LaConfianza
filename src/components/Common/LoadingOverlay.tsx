import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isLoading, 
  message = 'Guardando en Supabase...' 
}) => {
  if (!isLoading) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 10, 20, 0.85)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
      cursor: 'wait'
    }}>
      <div style={{
        backgroundColor: '#131f37',
        border: '3px solid #2563eb',
        borderRadius: '16px',
        padding: '32px 40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
        maxWidth: '420px',
        textAlign: 'center'
      }}>
        <Loader2 
          size={56} 
          color="#3b82f6" 
          style={{ animation: 'spin 1s linear infinite' }} 
        />
        <h3 style={{ 
          fontSize: '1.35rem', 
          fontWeight: 800, 
          color: '#ffffff',
          margin: 0
        }}>
          {message}
        </h3>
        <p style={{ 
          fontSize: '0.95rem', 
          color: '#cbd5e1', 
          margin: 0 
        }}>
          Por favor espere un momento, procesando la información...
        </p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

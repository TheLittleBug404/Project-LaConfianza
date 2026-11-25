import React from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

export type DialogType = 'confirm' | 'success' | 'danger' | 'warning' | 'info';

export interface DialogOptions {
  isOpen: boolean;
  type?: DialogType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const CustomDialogModal: React.FC<DialogOptions> = ({
  isOpen,
  type = 'info',
  title,
  message,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const isConfirm = type === 'confirm' || Boolean(onCancel && onConfirm);

  const getIconAndColors = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <XCircle size={44} color="#ef4444" />,
          borderColor: '#ef4444',
          btnClass: 'btn-danger'
        };
      case 'warning':
      case 'confirm':
        return {
          icon: <AlertTriangle size={44} color="#f59e0b" />,
          borderColor: '#f59e0b',
          btnClass: 'btn-secondary'
        };
      case 'success':
        return {
          icon: <CheckCircle2 size={44} color="#10b981" />,
          borderColor: '#10b981',
          btnClass: 'btn-primary'
        };
      default:
        return {
          icon: <Info size={44} color="#3b82f6" />,
          borderColor: '#3b82f6',
          btnClass: 'btn-primary'
        };
    }
  };

  const { icon, borderColor, btnClass } = getIconAndColors();

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 10, 20, 0.85)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#131f37',
        border: `3px solid ${borderColor}`,
        borderRadius: '16px',
        padding: '28px 24px',
        maxWidth: '480px',
        width: '100%',
        boxShadow: '0 20px 45px rgba(0, 0, 0, 0.8)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        animation: 'fadeInDialog 0.15s ease-out'
      }}>
        <div style={{ marginBottom: '16px' }}>
          {icon}
        </div>

        <h3 style={{
          fontSize: '1.35rem',
          fontWeight: 800,
          color: '#ffffff',
          marginBottom: '10px'
        }}>
          {title}
        </h3>

        <div style={{
          fontSize: '1.02rem',
          color: '#cbd5e1',
          lineHeight: '1.5',
          marginBottom: '26px',
          whiteSpace: 'pre-line'
        }}>
          {message}
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          width: '100%',
          justifyContent: 'center'
        }}>
          {isConfirm && onCancel && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{
                flex: 1,
                fontSize: '1.05rem',
                padding: '12px 18px',
                fontWeight: 700
              }}
              onClick={onCancel}
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            className={`btn ${btnClass}`}
            style={{
              flex: 1,
              fontSize: '1.05rem',
              padding: '12px 18px',
              fontWeight: 700
            }}
            onClick={() => {
              if (onConfirm) onConfirm();
              else if (onCancel) onCancel();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeInDialog {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

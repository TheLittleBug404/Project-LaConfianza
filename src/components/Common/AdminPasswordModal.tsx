import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Lock, Eye, EyeOff, X } from 'lucide-react';

interface AdminPasswordModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  verifyPassword: (password: string) => boolean;
}

export const AdminPasswordModal: React.FC<AdminPasswordModalProps> = ({
  isOpen,
  title = 'Autorización de Administrador Requerida',
  message = 'Para realizar esta acción crítica, debe ingresar su contraseña de Administrador.',
  confirmLabel = 'Confirmar y Eliminar',
  onConfirm,
  onClose,
  verifyPassword
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      setShowPassword(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password.trim()) {
      setError('Por favor introduzca su código o contraseña.');
      inputRef.current?.focus();
      return;
    }

    if (!verifyPassword(password.trim())) {
      setError('❌ Contraseña incorrecta. Verifique e intente nuevamente.');
      inputRef.current?.focus();
      return;
    }

    onConfirm();
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 10, 20, 0.88)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10001,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#131f37',
        border: '3px solid #ef4444',
        borderRadius: '16px',
        padding: '28px 26px',
        maxWidth: '480px',
        width: '100%',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          type="button"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid rgba(239, 68, 68, 0.4)'
          }}>
            <ShieldAlert size={28} color="#ef4444" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              {title}
            </h3>
            <span style={{ fontSize: '0.85rem', color: '#f87171', fontWeight: 600 }}>
              Zona de Seguridad Restringida
            </span>
          </div>
        </div>

        <p style={{
          fontSize: '0.98rem',
          color: '#cbd5e1',
          lineHeight: '1.5',
          marginBottom: '20px',
          whiteSpace: 'pre-line'
        }}>
          {message}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '8px' }}>
              Código / Contraseña de Administrador:
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                display: 'flex'
              }}>
                <Lock size={18} />
              </div>

              <input
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Ingrese su clave (ej. 1234)"
                style={{
                  width: '100%',
                  padding: '12px 44px 12px 42px',
                  backgroundColor: '#0a101d',
                  border: error ? '2px solid #ef4444' : '2px solid #334e68',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '1.05rem',
                  outline: 'none'
                }}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
              <div style={{ color: '#ef4444', fontSize: '0.88rem', fontWeight: 700, marginTop: '8px' }}>
                {error}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{ flex: 1, padding: '12px' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-danger"
              style={{ flex: 1.2, padding: '12px', fontWeight: 800 }}
            >
              {confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

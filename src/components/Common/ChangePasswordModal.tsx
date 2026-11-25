import React, { useState } from 'react';
import { KeyRound, Lock, Eye, EyeOff, X, CheckCircle2 } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPasswordActual: string;
  onChangeSuccess: (newPassword: string) => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  currentPasswordActual,
  onChangeSuccess
}) => {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (currentPass !== currentPasswordActual) {
      setError('La contraseña actual es incorrecta.');
      return;
    }

    if (newPass.length < 4) {
      setError('La nueva contraseña debe tener al menos 4 caracteres.');
      return;
    }

    if (newPass !== confirmPass) {
      setError('Las contraseñas nuevas no coinciden.');
      return;
    }

    onChangeSuccess(newPass);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 10, 20, 0.85)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10001,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#131f37',
        border: '3px solid #3b82f6',
        borderRadius: '16px',
        padding: '28px 24px',
        maxWidth: '460px',
        width: '100%',
        boxShadow: '0 20px 45px rgba(0, 0, 0, 0.8)',
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid rgba(59, 130, 246, 0.4)'
          }}>
            <KeyRound size={26} color="#3b82f6" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Cambiar Contraseña de Admin
            </h3>
            <span style={{ fontSize: '0.85rem', color: '#93c5fd' }}>
              Se actualizará para inicio de sesión y acciones críticas
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
              Contraseña Actual:
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                <Lock size={16} />
              </div>
              <input
                type={showPass ? 'text' : 'password'}
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="Contraseña actual"
                style={{
                  width: '100%',
                  padding: '10px 40px 10px 38px',
                  backgroundColor: '#0a101d',
                  border: '2px solid #334e68',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '0.98rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
              Nueva Contraseña:
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                <Lock size={16} />
              </div>
              <input
                type={showPass ? 'text' : 'password'}
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Nueva clave (mín. 4 caracteres)"
                style={{
                  width: '100%',
                  padding: '10px 40px 10px 38px',
                  backgroundColor: '#0a101d',
                  border: '2px solid #334e68',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '0.98rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
              Confirmar Nueva Contraseña:
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                <Lock size={16} />
              </div>
              <input
                type={showPass ? 'text' : 'password'}
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Repita nueva clave"
                style={{
                  width: '100%',
                  padding: '10px 40px 10px 38px',
                  backgroundColor: '#0a101d',
                  border: '2px solid #334e68',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '0.98rem'
                }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              alignSelf: 'flex-start'
            }}
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            <span>{showPass ? 'Ocultar caracteres' : 'Mostrar caracteres'}</span>
          </button>

          {error && (
            <div style={{ color: '#ef4444', fontSize: '0.88rem', fontWeight: 700 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{ flex: 1, padding: '10px' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1.2, padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <CheckCircle2 size={16} />
              <span>Guardar Nueva Clave</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Lock, LogIn, AlertCircle, Shield, Briefcase } from 'lucide-react';
import { AppTitles } from '../../constants/pageTitles';
import logoImg from '../../assets/logo.png';
import type { UserSession, UserRole } from '../../types';

interface LoginViewProps {
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  // Selector directo de los 2 roles: ADMIN o EMPLEADO
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
  const [password, setPassword] = useState('1234');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== '1234') {
      setError('Contraseña incorrecta. Escriba 1234');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const username = selectedRole === 'ADMIN' ? 'usuario' : 'empleado';
      const session: UserSession = {
        authenticated: true,
        username,
        role: selectedRole,
        timestamp: Date.now()
      };
      localStorage.setItem('nelly_auth_session', JSON.stringify(session));
      setIsLoading(false);
      onLoginSuccess(session);
    }, 200);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      backgroundColor: '#0b1324'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '520px',
        backgroundColor: '#131f37',
        border: '3px solid #2d4573',
        borderRadius: '16px',
        padding: '36px 30px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)'
      }}>
        
        {/* Cabecera limpia con Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '84px',
            height: '84px',
            margin: '0 auto 16px',
            borderRadius: '14px',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '3px solid #f59e0b',
            overflow: 'hidden'
          }}>
            <img 
              src={logoImg} 
              alt={AppTitles.BRAND.TITLE} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>

          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#ffffff',
            marginBottom: '6px'
          }}>
            {AppTitles.BRAND.TITLE}
          </h1>

          <p style={{
            fontSize: '1.05rem',
            color: '#f59e0b',
            fontWeight: 700
          }}>
            {AppTitles.BRAND.SUBTITLE}
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin}>
          
          {/* Paso 1: Elegir el Rol (Solo 2 Roles, botones gigantes) */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '1.1rem',
              fontWeight: 800,
              color: '#ffffff',
              marginBottom: '12px'
            }}>
              1. Seleccione quién está usando el sistema:
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              
              {/* Botón Administrador */}
              <button
                type="button"
                onClick={() => { setSelectedRole('ADMIN'); setError(''); }}
                style={{
                  padding: '18px 12px',
                  borderRadius: '12px',
                  border: selectedRole === 'ADMIN' ? '3px solid #60a5fa' : '2px solid #2d4573',
                  backgroundColor: selectedRole === 'ADMIN' ? '#1e3a8a' : '#1e293b',
                  color: '#ffffff',
                  cursor: 'pointer',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <Shield size={32} color={selectedRole === 'ADMIN' ? '#93c5fd' : '#94a3b8'} />
                <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                  Administrador
                </span>
                <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                  Acceso Total
                </span>
              </button>

              {/* Botón Empleado */}
              <button
                type="button"
                onClick={() => { setSelectedRole('EMPLEADO'); setError(''); }}
                style={{
                  padding: '18px 12px',
                  borderRadius: '12px',
                  border: selectedRole === 'EMPLEADO' ? '3px solid #f59e0b' : '2px solid #2d4573',
                  backgroundColor: selectedRole === 'EMPLEADO' ? '#78350f' : '#1e293b',
                  color: '#ffffff',
                  cursor: 'pointer',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <Briefcase size={32} color={selectedRole === 'EMPLEADO' ? '#fde047' : '#94a3b8'} />
                <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                  Empleado
                </span>
                <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                  Atención Préstamos
                </span>
              </button>

            </div>
          </div>

          {/* Paso 2: Contraseña con texto grande */}
          <div style={{ marginBottom: '24px' }}>
            <label 
              htmlFor="login-password"
              style={{
                display: 'block',
                fontSize: '1.05rem',
                fontWeight: 700,
                color: '#ffffff',
                marginBottom: '8px'
              }}
            >
              2. Clave de acceso (1234):
            </label>

            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#f59e0b',
                display: 'flex'
              }}>
                <Lock size={22} />
              </div>

              <input
                id="login-password"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 50px',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  backgroundColor: '#091020',
                  color: '#ffffff',
                  border: '2px solid #2d4573',
                  borderRadius: '10px',
                  outline: 'none',
                  letterSpacing: '2px'
                }}
                required
              />
            </div>
          </div>

          {/* Mensaje de error claro */}
          {error && (
            <div style={{
              backgroundColor: '#450a0a',
              border: '2px solid #ef4444',
              borderRadius: '10px',
              padding: '14px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#fecaca',
              fontSize: '1rem',
              fontWeight: 700
            }}>
              <AlertCircle size={24} color="#ef4444" style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Botón de Entrada Gigante */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '1.25rem',
              fontWeight: 800,
              backgroundColor: '#f59e0b',
              color: '#0b1324',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)'
            }}
          >
            <LogIn size={26} />
            <span>{isLoading ? 'Ingresando...' : 'ENTRAR AL SISTEMA'}</span>
          </button>

        </form>
      </div>
    </div>
  );
};

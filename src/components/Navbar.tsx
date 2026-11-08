import React from 'react';
import {
  Users,
  Receipt,
  Vault,
  LayoutDashboard,
  PlusCircle,
  Coins,
  LogOut,
  Shield,
  Briefcase
} from 'lucide-react';
import { usePawn } from '../context/PawnContext';
import { AppTitles } from '../constants/pageTitles';
import logoImg from '../assets/logo.png';
import type { UserSession } from '../types';

export type ActiveTab = 'dashboard' | 'loans' | 'customers' | 'vault' | 'cashier' | 'employees';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewLoan: () => void;
  onOpenNewCustomer: () => void;
  currentUser?: UserSession | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewLoan,
  currentUser,
  onLogout,
}) => {
  const { stats } = usePawn();
  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="brand" onClick={() => setActiveTab('dashboard')}>
          <div className="brand-icon-wrapper">
            <img src={logoImg} alt={AppTitles.BRAND.TITLE} className="brand-logo-img" />
          </div>
          <div>
            <h1 className="brand-title">{AppTitles.BRAND.SHORT_TITLE || AppTitles.BRAND.TITLE}</h1>
            <p className="brand-subtitle">{AppTitles.BRAND.SUBTITLE}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        {isAdmin ? (
          <nav className="nav-links">
            <button
              className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard size={22} />
              <span>Inicio</span>
            </button>

            <button
              className={`nav-btn ${activeTab === 'loans' ? 'active' : ''}`}
              onClick={() => setActiveTab('loans')}
            >
              <Receipt size={22} />
              <span>Préstamos</span>
              <span className="badge-count">{stats.activeLoansCount}</span>
            </button>

            <button
              className={`nav-btn ${activeTab === 'customers' ? 'active' : ''}`}
              onClick={() => setActiveTab('customers')}
            >
              <Users size={22} />
              <span>Clientes</span>
            </button>

            <button
              className={`nav-btn ${activeTab === 'vault' ? 'active' : ''}`}
              onClick={() => setActiveTab('vault')}
            >
              <Vault size={22} />
              <span>Almacén</span>
            </button>

            <button
              className={`nav-btn ${activeTab === 'cashier' ? 'active' : ''}`}
              onClick={() => setActiveTab('cashier')}
            >
              <Coins size={22} />
              <span>Caja</span>
            </button>

            <button
              className={`nav-btn ${activeTab === 'employees' ? 'active' : ''}`}
              onClick={() => setActiveTab('employees')}
            >
              <Briefcase size={22} />
              <span>Empleados</span>
            </button>
          </nav>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fde047', fontWeight: 800, fontSize: '1.1rem' }}>
            <Receipt size={24} />
            <span>Atención de Préstamos</span>
          </div>
        )}

        {/* Actions & User Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            className="btn btn-yellow"
            onClick={onOpenNewLoan}
          >
            <PlusCircle size={20} />
            <span>Nuevo Empeño</span>
          </button>

          {currentUser && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-card)',
                border: '2px solid var(--border-subtle)',
                fontSize: '0.92rem'
              }}
            >
              {isAdmin ? (
                <Shield size={18} color="#60A5FA" />
              ) : (
                <Briefcase size={18} color="#FBBF24" />
              )}
              <span style={{ fontWeight: 700, color: isAdmin ? '#60A5FA' : 'var(--secondary)' }}>
                {currentUser.username}
              </span>
              <span className={`badge ${isAdmin ? 'badge-antiguo' : 'badge-vip'}`} style={{ fontSize: '0.8rem', padding: '3px 8px' }}>
                {isAdmin ? 'Admin' : 'Empleado'}
              </span>
            </div>
          )}

          {onLogout && (
            <button
              className="btn btn-danger btn-sm"
              onClick={onLogout}
              title="Cerrar sesión"
            >
              <LogOut size={18} />
              <span>Salir</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};


import React, { useState } from 'react';
import { 
  TrendingUp, 
  Vault, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  PlusCircle, 
  Users, 
  Eye, 
  ArrowRight,
  Wallet,
  Edit3,
  FileCheck,
  Database,
  Download,
  RefreshCw,
  KeyRound
} from 'lucide-react';
import { usePawn } from '../context/PawnContext';
import { StorageService } from '../services/storageService';
import type { PawnLoan, UserRole } from '../types';

interface DashboardProps {
  userRole?: UserRole;
  onOpenNewLoan: () => void;
  onOpenNewCustomer: () => void;
  onSelectLoan: (loan: PawnLoan) => void;
  onNavigateTab: (tab: 'loans' | 'customers' | 'vault' | 'cashier') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  userRole = 'ADMIN',
  onOpenNewLoan,
  onOpenNewCustomer,
  onSelectLoan,
  onNavigateTab
}) => {
  const { stats, loans, monthlyBudget, setMonthlyBudget, resetToDefaultData, employees, showDialog, openChangePasswordModal } = usePawn();

  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [newBudgetValue, setNewBudgetValue] = useState(monthlyBudget.toString());

  const handleDownloadBackup = async () => {
    try {
      const json = await StorageService.exportBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `respaldo_empenos_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showDialog({
        type: 'success',
        title: 'Copia de Seguridad',
        message: 'Copia de seguridad descargada exitosamente en formato JSON.'
      });
    } catch {
      showDialog({
        type: 'danger',
        title: 'Error de Respaldo',
        message: 'Error al generar la copia de seguridad.'
      });
    }
  };

  const handleResetDatabase = () => {
    showDialog({
      type: 'confirm',
      title: 'Restablecer Base de Datos',
      message: '¿Está seguro de restablecer la base de datos local con los 4 clientes oficiales de ejemplo?\n\nEsta acción reiniciará los clientes y préstamos a sus valores predeterminados.',
      confirmText: 'Sí, Restablecer',
      cancelText: 'Cancelar',
      onConfirm: () => {
        resetToDefaultData();
        showDialog({
          type: 'success',
          title: 'Base de Datos Restablecida',
          message: 'Base de datos restablecida correctamente con los clientes de ejemplo.'
        });
      }
    });
  };

  const dueSoonLoans = loans.filter(l => l.status === 'POR_VENCER');
  const overdueLoans = loans.filter(l => l.status === 'EN_MORA');
  const recentLoans = loans.slice(0, 6);

  const isAdmin = userRole === 'ADMIN';

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newBudgetValue);
    if (!isNaN(val) && val >= 0) {
      setMonthlyBudget(val);
      setIsEditingBudget(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Botones de Acción Rápida - Grandes y Visibles */}
      <div 
        style={{
          backgroundColor: '#131f37',
          border: '2px solid #2d4573',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
            Panel Principal - {isAdmin ? 'Administrador' : 'Empleado'}
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '1.05rem', marginTop: '4px' }}>
            ¿Qué operación desea realizar el día de hoy?
          </p>
        </div>

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-yellow" 
            onClick={onOpenNewLoan}
            style={{ fontSize: '1.1rem', padding: '14px 22px' }}
          >
            <PlusCircle size={24} />
            <span>+ NUEVO EMPEÑO / PRÉSTAMO</span>
          </button>

          {isAdmin && (
            <>
              <button 
                className="btn btn-primary" 
                onClick={onOpenNewCustomer}
                style={{ fontSize: '1.1rem', padding: '14px 22px' }}
              >
                <Users size={24} />
                <span>+ NUEVO CLIENTE</span>
              </button>

              <button 
                className="btn btn-secondary" 
                onClick={() => onNavigateTab('cashier')}
                style={{ fontSize: '1.1rem', padding: '14px 22px' }}
              >
                <FileCheck size={24} />
                <span>CIERRE DE CAJA DIARIO</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* CONTROL DE FONDO MENSUAL DE PRÉSTAMOS (SOLO ADMINISTRADOR) */}
      {isAdmin && (
        <div style={{
          backgroundColor: '#0f1f3d',
          border: '3px solid #3b82f6',
          borderRadius: '16px',
          padding: '22px 26px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '12px',
              backgroundColor: '#1d4ed8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <Wallet size={32} />
            </div>

            <div>
              <span style={{ fontSize: '1rem', color: '#93c5fd', fontWeight: 800, textTransform: 'uppercase' }}>
                FONDO / BOLSA MENSUAL DE DINERO PARA PRESTAR
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '4px' }}>
                <span style={{ fontSize: '1.9rem', fontWeight: 900, color: '#ffffff' }}>
                  Bs. {stats.monthlyLendingBudget.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setNewBudgetValue(monthlyBudget.toString());
                    setIsEditingBudget(!isEditingBudget);
                  }}
                  style={{ gap: '6px' }}
                >
                  <Edit3 size={16} />
                  <span>Cambiar Fondo</span>
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>Dinero ya prestado:</span>
              <strong style={{ display: 'block', fontSize: '1.4rem', color: '#f59e0b' }}>
                Bs. {stats.monthlyLendedAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </strong>
            </div>

            <div style={{ borderLeft: '2px solid #2d4573', paddingLeft: '20px' }}>
              <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>Fondo Disponible Restante:</span>
              <strong style={{ 
                display: 'block', 
                fontSize: '1.5rem', 
                color: stats.monthlyRemainingBudget > 0 ? '#34d399' : '#f87171' 
              }}>
                Bs. {stats.monthlyRemainingBudget.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* MODAL / FORMULARIO RÁPIDO PARA CAMBIAR FONDO MENSUAL */}
      {isEditingBudget && (
        <form onSubmit={handleSaveBudget} style={{
          backgroundColor: '#131f37',
          border: '2px solid #f59e0b',
          borderRadius: '12px',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
              Escriba el nuevo total de dinero asignado para prestar este mes (Bs.):
            </label>
            <input
              type="number"
              min="0"
              value={newBudgetValue}
              onChange={(e) => setNewBudgetValue(e.target.value)}
              className="input-control"
              style={{ width: '280px', fontSize: '1.3rem', fontWeight: 800 }}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '22px' }}>
            <button type="submit" className="btn btn-yellow">
              Guardar Fondo Mensual
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => setIsEditingBudget(false)}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Alertas Importantes (Solo si existen avisos) */}
      {(overdueLoans.length > 0 || dueSoonLoans.length > 0) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {overdueLoans.length > 0 && (
            <div 
              style={{
                background: '#450a0a',
                border: '2px solid #ef4444',
                borderRadius: '14px',
                padding: '18px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <AlertTriangle size={32} color="#f87171" />
                <div>
                  <strong style={{ color: '#ffffff', fontSize: '1.2rem', display: 'block' }}>
                    ATENCIÓN: {overdueLoans.length} Préstamo(s) vencidos / en mora
                  </strong>
                  <span style={{ fontSize: '0.98rem', color: '#fecaca' }}>
                    Clientes con fecha cumplida que deben pagar intereses o capital.
                  </span>
                </div>
              </div>
              <button 
                className="btn btn-danger"
                onClick={() => onNavigateTab('loans')}
                style={{ fontSize: '1rem', padding: '10px 20px' }}
              >
                Ver Lista de Morosos <ArrowRight size={18} />
              </button>
            </div>
          )}

          {dueSoonLoans.length > 0 && (
            <div 
              style={{
                background: '#451a03',
                border: '2px solid #f59e0b',
                borderRadius: '14px',
                padding: '18px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Clock size={32} color="#fbbf24" />
                <div>
                  <strong style={{ color: '#ffffff', fontSize: '1.2rem', display: 'block' }}>
                    AVISO: {dueSoonLoans.length} Préstamo(s) por vencer en los próximos 3 días
                  </strong>
                  <span style={{ fontSize: '0.98rem', color: '#fef08a' }}>
                    Próximos a cumplir plazo de pago mensual.
                  </span>
                </div>
              </div>
              <button 
                className="btn btn-yellow"
                onClick={() => onNavigateTab('loans')}
                style={{ fontSize: '1rem', padding: '10px 20px' }}
              >
                Ver Vencimientos <ArrowRight size={18} />
              </button>
            </div>
          )}

        </div>
      )}

      {/* RESUMEN FINANCIERO COMPLETO: GANANCIAS, PÉRDIDAS, PRESTADO */}
      {isAdmin && (
        <div className="grid-4">
          
          {/* Tarjeta 1: Dinero Prestado en la Calle */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <DollarSign size={28} color="#f59e0b" />
              <span style={{ color: '#cbd5e1', fontSize: '1rem', fontWeight: 700 }}>
                Dinero Prestado (Calle)
              </span>
            </div>
            <h3 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#ffffff' }}>
              Bs. {stats.totalCapitalActive.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#93c5fd', marginTop: '6px' }}>
              En {stats.activeLoansCount} contratos activos
            </p>
          </div>

          {/* Tarjeta 2: Ganancias Acumuladas */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <TrendingUp size={28} color="#34d399" />
              <span style={{ color: '#cbd5e1', fontSize: '1rem', fontWeight: 700 }}>
                Ganancia Intereses (Total)
              </span>
            </div>
            <h3 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#34d399' }}>
              Bs. {stats.totalInterestEarned.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#cbd5e1', marginTop: '6px' }}>
              Cobrado en refrendos y cancelaciones
            </p>
          </div>

          {/* Tarjeta 3: Pérdidas / Capital en Mora */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <AlertTriangle size={28} color="#f87171" />
              <span style={{ color: '#cbd5e1', fontSize: '1rem', fontWeight: 700 }}>
                Deuda en Riesgo / Mora
              </span>
            </div>
            <h3 style={{ fontSize: '2.1rem', fontWeight: 800, color: stats.totalLossesInDefault > 0 ? '#f87171' : '#ffffff' }}>
              Bs. {stats.totalLossesInDefault.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#fca5a5', marginTop: '6px' }}>
              {stats.overdueCount} contratos vencidos
            </p>
          </div>

          {/* Tarjeta 4: Prendas en Bóveda */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <Vault size={28} color="#10b981" />
              <span style={{ color: '#cbd5e1', fontSize: '1rem', fontWeight: 700 }}>
                Prendas en Bóveda
              </span>
            </div>
            <h3 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#ffffff' }}>
              Bs. {stats.totalVaultAppraisal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#cbd5e1', marginTop: '6px' }}>
              Valor tasado en custodia
            </p>
          </div>

        </div>
      )}

      {/* CLASIFICACIÓN DE CLIENTES POR SEMÁFORO (3 COLORES) */}
      {isAdmin && (
        <div className="card" style={{ padding: '22px 26px', backgroundColor: '#131f37' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                Clientes por Nivel de Cumplimiento (Semáforo)
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#cbd5e1' }}>
                Total: {stats.totalCustomersCount} clientes registrados
              </p>
            </div>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigateTab('customers')}
            >
              Ver Directorio de Clientes
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {/* Cliente Excelente */}
            <div style={{
              backgroundColor: '#064e3b',
              border: '2px solid #10b981',
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#a7f3d0' }}>
                  🟢 CLIENTE EXCELENTE
                </span>
                <p style={{ fontSize: '0.85rem', color: '#d1fae5', marginTop: '2px' }}>
                  Pagan puntual / Sin mora
                </p>
              </div>
              <strong style={{ fontSize: '2rem', color: '#ffffff' }}>
                {stats.greenCustomersCount}
              </strong>
            </div>

            {/* Cliente Regular */}
            <div style={{
              backgroundColor: '#451a03',
              border: '2px solid #f59e0b',
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fde047' }}>
                  🟡 CLIENTE REGULAR
                </span>
                <p style={{ fontSize: '0.85rem', color: '#fef08a', marginTop: '2px' }}>
                  Cumple con prórrogas o demoras
                </p>
              </div>
              <strong style={{ fontSize: '2rem', color: '#ffffff' }}>
                {stats.yellowCustomersCount}
              </strong>
            </div>

            {/* Cliente Malo */}
            <div style={{
              backgroundColor: '#450a0a',
              border: '2px solid #ef4444',
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fca5a5' }}>
                  🔴 CLIENTE MALO
                </span>
                <p style={{ fontSize: '0.85rem', color: '#fee2e2', marginTop: '2px' }}>
                  Morosos / No pagan
                </p>
              </div>
              <strong style={{ fontSize: '2rem', color: '#ffffff' }}>
                {stats.redCustomersCount}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* Lista Limpia de Últimos Préstamos con Códigos Correlativos (A1, A2...) */}
      <div className="card" style={{ padding: '26px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
              Últimos Recibos y Préstamos Emitidos
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#cbd5e1' }}>
              Toque cualquier contrato para ver recibo oficial, cobrar intereses o liquidar
            </p>
          </div>

          <button 
            className="btn btn-secondary"
            onClick={() => onNavigateTab('loans')}
            style={{ fontSize: '1rem' }}
          >
            Ver Todos los Préstamos
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {recentLoans.map((loan) => (
            <div 
              key={loan.id}
              onClick={() => onSelectLoan(loan)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 20px',
                background: '#091020',
                borderRadius: '12px',
                border: '2px solid #2d4573',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flexWrap: 'wrap',
                gap: '14px'
              }}
            >
              {/* Cliente y Prenda */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: 900, 
                    color: '#f59e0b', 
                    background: '#1e293b', 
                    padding: '3px 10px', 
                    borderRadius: '6px', 
                    border: '1px solid #f59e0b' 
                  }}>
                    {loan.receiptCode || loan.code}
                  </span>
                  <strong style={{ color: '#ffffff', fontSize: '1.2rem' }}>
                    {loan.customerName}
                  </strong>
                </div>
                <p style={{ fontSize: '1rem', color: '#cbd5e1', marginTop: '4px' }}>
                  Prenda: <strong style={{ color: '#ffffff' }}>{loan.item.name}</strong> | Plazo: {loan.termDays || (loan.termMonths * 30) || 30} días
                </p>
              </div>

              {/* Monto y Estado */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f59e0b' }}>
                    Bs. {loan.remainingCapital.toLocaleString('es-PE')}
                  </div>
                  <span className={`badge status-${loan.status.toLowerCase().replace('_', '-')}`} style={{ marginTop: '4px' }}>
                    {loan.status === 'VIGENTE' && 'Al Día'}
                    {loan.status === 'POR_VENCER' && 'Vence Pronto'}
                    {loan.status === 'EN_MORA' && 'Atrasado / En Mora'}
                    {loan.status === 'PAGADO' && 'Pagado'}
                    {loan.status === 'REMATADO' && 'Rematado'}
                  </span>
                </div>

                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectLoan(loan);
                  }}
                  style={{ gap: '6px' }}
                >
                  <Eye size={18} />
                  <span>Ver Recibo</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Control de Base de Datos Local y Preparación para Supabase */}
      {isAdmin && (
        <div className="card" style={{
          backgroundColor: '#091020',
          border: '2px solid #3b82f6',
          borderRadius: '14px',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '12px',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #3b82f6'
              }}>
                <Database size={28} color="#60a5fa" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                  Base de Datos Local (IndexedDB)
                </h3>
                <p style={{ fontSize: '0.92rem', color: '#cbd5e1', marginTop: '3px' }}>
                  Todos los datos se guardan de forma segura en tu navegador. Esquema preparado para migrar a <strong>Supabase</strong>.
                </p>
                <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '0.85rem', color: '#94a3b8', flexWrap: 'wrap' }}>
                  <span>Tablas: <code>customers</code> ({stats.totalCustomersCount}), <code>loans</code> ({loans.length}), <code>employees</code> ({employees.length})</span>
                  <span>• Compatible con PostgreSQL 15+</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={openChangePasswordModal}
                title="Cambiar la contraseña de inicio de sesión y seguridad del Administrador"
                style={{ fontSize: '0.92rem' }}
              >
                <KeyRound size={18} />
                <span>Cambiar Contraseña Admin</span>
              </button>

              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handleDownloadBackup}
                title="Descargar copia de seguridad en archivo JSON"
                style={{ fontSize: '0.92rem' }}
              >
                <Download size={18} />
                <span>Exportar Respaldo JSON</span>
              </button>

              <button 
                type="button" 
                className="btn btn-danger btn-sm"
                onClick={handleResetDatabase}
                title="Restablecer los 4 clientes oficiales de ejemplo"
                style={{ fontSize: '0.92rem' }}
              >
                <RefreshCw size={16} />
                <span>Restablecer 4 Clientes de Ejemplo</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

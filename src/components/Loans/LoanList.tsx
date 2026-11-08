import React, { useState } from 'react';
import { 
  Receipt, 
  Search, 
  Plus, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Eye, 
  ShieldAlert, 
  Coins, 
  Calendar
} from 'lucide-react';
import { usePawn } from '../../context/PawnContext';
import type { PawnLoan, LoanStatus } from '../../types';

interface LoanListProps {
  onSelectLoan: (loan: PawnLoan) => void;
  onOpenNewLoan: () => void;
}

export const LoanList: React.FC<LoanListProps> = ({
  onSelectLoan,
  onOpenNewLoan
}) => {
  const { loans } = usePawn();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('TODOS');

  const filteredLoans = loans.filter(l => {
    const matchesSearch = 
      l.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.customerDni.includes(searchTerm) ||
      l.item.name.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedStatus === 'TODOS') return true;
    if (selectedStatus === 'ACTIVOS') return l.status === 'VIGENTE' || l.status === 'POR_VENCER' || l.status === 'EN_MORA';
    return l.status === selectedStatus;
  });

  const getStatusBadge = (status: LoanStatus) => {
    switch (status) {
      case 'VIGENTE':
        return <span className="badge status-vigente"><Clock size={12} /> Al Día / Vigente</span>;
      case 'POR_VENCER':
        return <span className="badge status-por-vencer"><AlertTriangle size={12} /> Por Vencer (&le; 3 días)</span>;
      case 'EN_MORA':
        return <span className="badge status-en-mora"><ShieldAlert size={12} /> En Mora / Vencido</span>;
      case 'PAGADO':
        return <span className="badge status-pagado"><CheckCircle2 size={12} /> Pagado / Devuelto</span>;
      case 'REMATADO':
        return <span className="badge status-rematado"><Coins size={12} /> Rematado</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF' }}>
            Préstamos y Empeños
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '1rem', marginTop: '4px' }}>
            Lista de contratos para cobrar intereses (refrendo), amortizar capital o liquidar.
          </p>
        </div>

        <button 
          className="btn btn-yellow" 
          onClick={onOpenNewLoan}
          style={{ fontSize: '1.1rem', padding: '12px 24px' }}
        >
          <Plus size={22} />
          <span>+ NUEVO PRÉSTAMO</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div style={{ position: 'relative', flex: '1', minWidth: '300px' }}>
            <Search 
              size={22} 
              style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1' }} 
            />
            <input
              type="text"
              className="input-control"
              placeholder="Buscar por Nombre, Carnet o Prenda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '48px', fontSize: '1.05rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'TODOS', label: 'Todos' },
              { id: 'ACTIVOS', label: 'Activos' },
              { id: 'POR_VENCER', label: 'Por Vencer' },
              { id: 'EN_MORA', label: 'Atrasados (Mora)' },
              { id: 'PAGADO', label: 'Pagados' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`btn ${selectedStatus === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.95rem', padding: '10px 18px' }}
              >
                {tab.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Loans Table / Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredLoans.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px 20px' }}>
            <Receipt size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: '1.1rem', color: '#FFFFFF', marginBottom: '6px' }}>No hay préstamos con este criterio</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Modifica los filtros o registra un nuevo empeño en el botón superior.
            </p>
          </div>
        ) : (
          filteredLoans.map((loan) => {
            const dueDateObj = new Date(loan.dueDate);
            const today = new Date();
            const diffDays = Math.ceil((dueDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            const monthlyInterest = (loan.remainingCapital * loan.monthlyInterestRate) / 100;

            return (
              <div
                key={loan.id}
                className="card"
                style={{
                  padding: '18px 22px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                  cursor: 'pointer',
                  borderLeft: loan.status === 'EN_MORA' ? '4px solid #EF4444' :
                              loan.status === 'POR_VENCER' ? '4px solid #F59E0B' :
                              loan.status === 'VIGENTE' ? '4px solid #10B981' :
                              loan.status === 'PAGADO' ? '4px solid #06B6D4' :
                              loan.status === 'REMATADO' ? '4px solid #8B5CF6' : '4px solid #64748B',
                  background: loan.status === 'PAGADO' ? 'rgba(6, 182, 212, 0.04)' : undefined
                }}
                onClick={() => onSelectLoan(loan)}
              >
                {/* Left: Code, Customer & Pledge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '300px', flex: '1.5' }}>
                  <div 
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: 'var(--radius-md)',
                      background: loan.status === 'PAGADO' ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-surface)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      color: loan.status === 'PAGADO' ? '#22D3EE' : 'var(--primary)',
                      border: loan.status === 'PAGADO' ? '1px solid #06B6D4' : '1px solid var(--border-subtle)'
                    }}
                  >
                    EMP
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="font-mono" style={{ fontSize: '0.88rem', fontWeight: 800, color: loan.status === 'PAGADO' ? '#22D3EE' : 'var(--secondary)' }}>
                        {loan.code}
                      </span>
                      {getStatusBadge(loan.status)}
                    </div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>
                      {loan.customerName}
                    </h4>
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      <strong style={{ color: '#E2E8F0' }}>Prenda:</strong> {loan.item.name} 
                      <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>(Tasada en Bs. {loan.item.appraisalValue})</span>
                    </div>
                  </div>
                </div>

                {/* Middle: Dates and Term */}
                <div style={{ minWidth: '180px', flex: '1', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    <Calendar size={14} color={loan.status === 'PAGADO' ? '#22D3EE' : 'var(--primary)'} />
                    <span>Vencimiento: <strong style={{ color: '#FFFFFF' }}>{dueDateObj.toLocaleDateString('es-PE')}</strong></span>
                  </div>
                  
                  {loan.status === 'PAGADO' ? (
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#22D3EE' }}>
                      ✓ Deuda Cancelada / Prenda Devuelta
                    </span>
                  ) : loan.status !== 'REMATADO' && (
                    <span 
                      style={{ 
                        fontSize: '0.8rem', 
                        fontWeight: 600,
                        color: diffDays < 0 ? '#F87171' : diffDays <= 3 ? '#FBBF24' : '#34D399' 
                      }}
                    >
                      {diffDays < 0 ? `Vencido hace ${Math.abs(diffDays)} días` : 
                       diffDays === 0 ? 'Vence HOY' : 
                       `Quedan ${diffDays} días`}
                    </span>
                  )}
                  
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Tasa: {loan.monthlyInterestRate}% mes (Refrendo: Bs. {monthlyInterest.toFixed(2)})
                  </span>
                </div>

                {/* Right: Amounts & Action */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', textAlign: 'right' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                      {loan.status === 'PAGADO' ? 'Saldo Pendiente' : 'Capital Deudor'}
                    </span>
                    <strong style={{ fontSize: '1.25rem', fontWeight: 800, color: loan.status === 'PAGADO' ? '#22D3EE' : '#FBBF24' }}>
                      Bs. {loan.remainingCapital.toLocaleString('es-PE')}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                      Inicial: Bs. {loan.loanAmount.toLocaleString('es-PE')}
                    </span>
                  </div>

                  <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); onSelectLoan(loan); }}>
                    <Eye size={15} />
                    <span>Detalles</span>
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

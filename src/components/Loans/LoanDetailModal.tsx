import React, { useState } from 'react';
import { 
  X, 
  Receipt, 
  RefreshCw, 
  CheckCircle2, 
  Coins, 
  ShieldAlert, 
  Printer
} from 'lucide-react';
import { usePawn } from '../../context/PawnContext';
import type { PawnLoan, UserRole } from '../../types';

interface LoanDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: PawnLoan | null;
  onOpenTicket: (loan: PawnLoan) => void;
  userRole?: UserRole;
}

export const LoanDetailModal: React.FC<LoanDetailModalProps> = ({
  isOpen,
  onClose,
  loan,
  onOpenTicket,
  userRole = 'ADMIN'
}) => {
  const { 
    payInterestRefinance, 
    payCapitalAmortization, 
    payFullLiquidation, 
    sendToAuction,
    payments,
    showDialog
  } = usePawn();

  const [activeAction, setActiveAction] = useState<'NONE' | 'REFRENDO' | 'AMORTIZACION' | 'LIQUIDACION' | 'REMATE'>('NONE');
  const [paymentMethod, setPaymentMethod] = useState<'EFECTIVO' | 'TRANSFERENCIA' | 'QR'>('EFECTIVO');
  const [amortizeAmount, setAmortizeAmount] = useState<number>(100);
  const [actionNotes, setActionNotes] = useState('');

  if (!isOpen || !loan) return null;

  const loanPayments = payments.filter(p => p.loanId === loan.id);
  const monthlyInterest = (loan.remainingCapital * loan.monthlyInterestRate) / 100;
  const totalToLiquidate = loan.remainingCapital + monthlyInterest;

  const dueDate = new Date(loan.dueDate);
  const today = new Date();
  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const handleRefrendo = () => {
    payInterestRefinance(loan.id, paymentMethod, actionNotes || 'Refrendo de 30 días adicionales');
    setActiveAction('NONE');
    showDialog({
      title: '¡Refrendo Procesado!',
      message: 'Se extendió la fecha de vencimiento por 30 días adicionales.',
      type: 'success'
    });
  };

  const handleAmortize = () => {
    if (amortizeAmount <= 0) return;
    payCapitalAmortization(loan.id, amortizeAmount, paymentMethod, actionNotes);
    setActiveAction('NONE');
    showDialog({
      title: '¡Abono Registrado!',
      message: `¡Abono de Bs. ${amortizeAmount} registrado con éxito!`,
      type: 'success'
    });
  };

  const handleFullLiquidation = () => {
    showDialog({
      title: 'Confirmar Liquidación Total',
      message: `¿Confirmar cancelación total de Bs. ${totalToLiquidate.toFixed(2)}? La prenda será marcada como DEVUELTA.`,
      type: 'confirm',
      confirmText: 'Sí, Liquidar',
      cancelText: 'Cancelar',
      onConfirm: () => {
        payFullLiquidation(loan.id, paymentMethod, actionNotes);
        setActiveAction('NONE');
        showDialog({
          title: '¡Préstamo Liquidado!',
          message: '¡Préstamo liquidado en su totalidad! Prenda devuelta al titular.',
          type: 'success'
        });
      }
    });
  };

  const handleAuction = () => {
    showDialog({
      title: 'Confirmar Pase a Remate',
      message: '¿Confirmar pase de la prenda a REMATE por incumplimiento de pago? El cliente pasará a estado MOROSO.',
      type: 'danger',
      confirmText: 'Sí, Pasar a Remate',
      cancelText: 'Cancelar',
      onConfirm: () => {
        sendToAuction(loan.id, actionNotes || 'Pase a remate tras vencimiento de plazo');
        setActiveAction('NONE');
        showDialog({
          title: 'Prenda en Remate',
          message: 'Prenda transferida exitosamente al catálogo de remate.',
          type: 'warning'
        });
      }
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '840px' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div 
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)'
              }}
            >
              <Receipt size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
                  Contrato {loan.code}
                </h3>
                <span className={`badge status-${loan.status.toLowerCase().replace('_', '-')}`}>
                  {loan.status.replace('_', ' ')}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Titular: <strong style={{ color: '#F1F5F9' }}>{loan.customerName}</strong> ({loan.customerDni})
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onOpenTicket(loan)}
              title="Imprimir Contrato / Ticket"
            >
              <Printer size={16} />
              <span>Ticket / Contrato</span>
            </button>
            <button className="btn btn-secondary btn-icon" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Main Info Grid */}
          <div className="grid-2">
            
            {/* Prenda Card */}
            <div className="card" style={{ padding: '16px', background: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Prendas en Garantía ({loan.items?.length || 1})
                </span>
                <span style={{ fontSize: '0.82rem', color: '#34d399', fontWeight: 700 }}>
                  Avalúo Total: Bs. {loan.item.appraisalValue.toLocaleString('es-PE')}
                </span>
              </div>

              {loan.items && loan.items.length > 1 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                  {loan.items.map((it, idx) => (
                    <div key={it.id || idx} style={{ background: '#091020', padding: '10px 12px', borderRadius: '8px', border: '1px solid #2d4573' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: '#F59E0B', fontSize: '0.92rem' }}>
                          #{idx + 1} {it.name}
                        </strong>
                        <strong style={{ color: '#10B981', fontSize: '0.88rem' }}>
                          Bs. {it.appraisalValue.toLocaleString('es-PE')}
                        </strong>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '3px' }}>
                        {it.description ? `${it.description} | ` : ''}{it.condition} | {it.storageLocation}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <h4 style={{ fontSize: '1.05rem', color: '#F59E0B', fontWeight: 700, marginBottom: '6px' }}>
                    {loan.item.name}
                  </h4>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    {loan.item.description || 'Sin descripción adicional.'}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Categoría:</span>
                      <span style={{ color: '#FFFFFF' }}>{loan.item.category.replace('_', ' ')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Estado Físico:</span>
                      <span style={{ color: '#FFFFFF' }}>{loan.item.condition}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Tasación / Avalúo:</span>
                      <strong style={{ color: '#10B981' }}>Bs. {loan.item.appraisalValue.toLocaleString('es-PE')}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Ubicación en Bóveda:</span>
                      <span style={{ color: '#FBBF24' }}>{loan.item.storageLocation}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Estado Custodia:</span>
                      <span style={{ color: '#FFFFFF', fontWeight: 700 }}>{loan.item.status}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Financial Status Card */}
            <div className="card" style={{ padding: '16px', background: 'var(--bg-surface)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                Estado Financiero del Préstamo
              </span>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Capital Restante</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FBBF24' }}>
                    S/ {loan.remainingCapital.toLocaleString('es-PE')}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Monto Inicial</span>
                  <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                    S/ {loan.loanAmount.toLocaleString('es-PE')}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Tasa Interés Mensual:</span>
                  <span style={{ color: '#FFFFFF' }}>{loan.monthlyInterestRate}% / mes</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Costo Refrendo (Interés):</span>
                  <strong style={{ color: '#10B981' }}>S/ {monthlyInterest.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Fecha Vencimiento:</span>
                  <strong style={{ color: diffDays < 0 ? '#F87171' : '#FFFFFF' }}>
                    {dueDate.toLocaleDateString('es-PE')} ({diffDays < 0 ? `Vencido ${Math.abs(diffDays)}d` : `${diffDays} días restantes`})
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Total Intereses Pagados:</span>
                  <span style={{ color: '#60A5FA' }}>S/ {loan.totalInterestPaid.toLocaleString('es-PE')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Capital Amortizado:</span>
                  <span style={{ color: '#34D399' }}>S/ {loan.totalCapitalPaid.toLocaleString('es-PE')}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Action Operations Bar (if loan is active) - Habilitado para ADMIN y EMPLEADO */}
          {loan.status !== 'PAGADO' && loan.status !== 'REMATADO' && (
            <div className="card" style={{ padding: '16px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>
                Operaciones de Caja Disponibles
              </span>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button 
                  className={`btn ${activeAction === 'REFRENDO' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  onClick={() => setActiveAction(activeAction === 'REFRENDO' ? 'NONE' : 'REFRENDO')}
                >
                  <RefreshCw size={15} />
                  <span>Pagar Prórroga / Refrendo (Bs. {monthlyInterest.toFixed(2)})</span>
                </button>

                <button 
                  className={`btn ${activeAction === 'AMORTIZACION' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  onClick={() => setActiveAction(activeAction === 'AMORTIZACION' ? 'NONE' : 'AMORTIZACION')}
                >
                  <Coins size={15} />
                  <span>Pagar Cuota / Abono</span>
                </button>

                <button 
                  className={`btn ${activeAction === 'LIQUIDACION' ? 'btn-emerald' : 'btn-secondary'} btn-sm`}
                  onClick={() => setActiveAction(activeAction === 'LIQUIDACION' ? 'NONE' : 'LIQUIDACION')}
                >
                  <CheckCircle2 size={15} />
                  <span>Liquidación Total (Bs. {totalToLiquidate.toFixed(2)})</span>
                </button>

                {loan.status === 'EN_MORA' && userRole === 'ADMIN' && (
                  <button 
                    className={`btn ${activeAction === 'REMATE' ? 'btn-danger' : 'btn-secondary'} btn-sm`}
                    onClick={() => setActiveAction(activeAction === 'REMATE' ? 'NONE' : 'REMATE')}
                  >
                    <ShieldAlert size={15} />
                    <span>Pasar Prenda a Remate</span>
                  </button>
                )}
              </div>

              {/* Sub-form according to active action */}
              {activeAction !== 'NONE' && (
                <div 
                  style={{ 
                    marginTop: '16px', 
                    padding: '16px', 
                    background: 'var(--bg-main)', 
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div className="grid-2">
                    <div className="input-group">
                      <label className="input-label">Medio de Pago</label>
                      <select 
                        className="input-control"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as 'EFECTIVO' | 'TRANSFERENCIA' | 'QR')}
                      >
                        <option value="EFECTIVO">Efectivo en Caja</option>
                        <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                        <option value="QR">Yape / Plin / QR</option>
                      </select>
                    </div>

                    {activeAction === 'AMORTIZACION' && (
                      <div className="input-group">
                        <label className="input-label">Monto de Cuota / Abono a Capital (Bs.)</label>
                        <input 
                          type="number"
                          min="1"
                          max={loan.remainingCapital}
                          className="input-control font-mono"
                          value={amortizeAmount}
                          onChange={(e) => setAmortizeAmount(Number(e.target.value))}
                        />
                      </div>
                    )}
                  </div>

                  <div className="input-group">
                    <label className="input-label">Nota o Concepto de Operación</label>
                    <input 
                      type="text"
                      className="input-control"
                      placeholder="Ej. Recibo de pago entregado al cliente"
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setActiveAction('NONE')}>
                      Cancelar
                    </button>
                    {activeAction === 'REFRENDO' && (
                      <button className="btn btn-primary btn-sm" onClick={handleRefrendo}>
                        Confirmar Prórroga (30 días)
                      </button>
                    )}
                    {activeAction === 'AMORTIZACION' && (
                      <button className="btn btn-primary btn-sm" onClick={handleAmortize}>
                        Registrar Cuota / Abono
                      </button>
                    )}
                    {activeAction === 'LIQUIDACION' && (
                      <button className="btn btn-emerald btn-sm" onClick={handleFullLiquidation}>
                        Confirmar Cancelación y Entregar Prenda
                      </button>
                    )}
                    {activeAction === 'REMATE' && (
                      <button className="btn btn-danger btn-sm" onClick={handleAuction}>
                        Ejecutar Pase a Remate
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Payment History */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '10px' }}>
              Historial de Pagos y Movimientos ({loanPayments.length})
            </h4>

            {loanPayments.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No hay transacciones registradas.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {loanPayments.map(p => (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.84rem'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="font-mono" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                          {p.receiptCode}
                        </span>
                        <strong style={{ color: '#FFFFFF' }}>{p.type.replace(/_/g, ' ')}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({p.paymentMethod})</span>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        Fecha: {new Date(p.date).toLocaleString('es-PE')} {p.notes && ` - ${p.notes}`}
                      </span>
                    </div>

                    <strong style={{ fontSize: '0.95rem', color: p.type === 'DESEMBOLSO_INICIAL' ? '#F87171' : '#10B981' }}>
                      {p.type === 'DESEMBOLSO_INICIAL' ? '-' : '+'} S/ {p.amount.toLocaleString('es-PE')}
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  X, 
  RefreshCw, 
  Coins, 
  CheckCircle2, 
  Search
} from 'lucide-react';
import { usePawn } from '../../context/PawnContext';
import type { PawnLoan } from '../../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedLoan?: PawnLoan | null;
  onOpenTicket?: (loan: PawnLoan) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  preselectedLoan,
  onOpenTicket
}) => {
  const { 
    loans, 
    payInterestRefinance, 
    payCapitalAmortization, 
    payFullLiquidation, 
    showDialog 
  } = usePawn();

  const [selectedLoanId, setSelectedLoanId] = useState<string>('');
  const [loanSearch, setLoanSearch] = useState('');
  const [paymentType, setPaymentType] = useState<'PRORROGA' | 'CUOTA' | 'LIQUIDACION'>('PRORROGA');
  const [amortizeAmount, setAmortizeAmount] = useState<number>(100);
  const [paymentMethod, setPaymentMethod] = useState<'EFECTIVO' | 'TRANSFERENCIA' | 'QR'>('EFECTIVO');
  const [notes, setNotes] = useState('');

  // Préstamos que pueden recibir pagos (activos)
  const activeLoans = loans.filter(l => 
    l.status === 'VIGENTE' || l.status === 'POR_VENCER' || l.status === 'EN_MORA'
  );

  useEffect(() => {
    if (preselectedLoan) {
      setSelectedLoanId(preselectedLoan.id);
    } else if (activeLoans.length > 0 && !selectedLoanId) {
      setSelectedLoanId(activeLoans[0].id);
    }
  }, [preselectedLoan, isOpen]);

  if (!isOpen) return null;

  const currentLoan = activeLoans.find(l => l.id === selectedLoanId);

  // Cálculos financieros
  const remainingCapital = currentLoan ? currentLoan.remainingCapital : 0;
  const monthlyRate = currentLoan ? currentLoan.monthlyInterestRate : 3;
  const monthlyInterest = currentLoan ? (remainingCapital * monthlyRate) / 100 : 0;
  const totalToLiquidate = currentLoan ? remainingCapital + monthlyInterest : 0;
  const newBalanceAfterCuota = Math.max(0, remainingCapital - amortizeAmount);

  // Filtro de búsqueda de préstamos
  const filteredActiveLoans = activeLoans.filter(l => 
    l.code.toLowerCase().includes(loanSearch.toLowerCase()) ||
    l.customerName.toLowerCase().includes(loanSearch.toLowerCase()) ||
    l.customerDni.includes(loanSearch) ||
    l.item.name.toLowerCase().includes(loanSearch.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentLoan) {
      showDialog({
        title: 'Seleccione un Préstamo',
        message: 'Debe seleccionar un préstamo activo para registrar el cobro.',
        type: 'warning'
      });
      return;
    }

    if (paymentType === 'PRORROGA') {
      payInterestRefinance(
        currentLoan.id, 
        paymentMethod, 
        notes || 'Prórroga / Refrendo de 30 días adicionales'
      );
      showDialog({
        title: '¡Prórroga Registrada con Éxito!',
        message: `Se cobró el interés de Bs. ${monthlyInterest.toFixed(2)} al cliente ${currentLoan.customerName}.\nEl vencimiento del préstamo ${currentLoan.code} se extendió por 30 días.`,
        type: 'success',
        confirmText: 'Aceptar',
        onConfirm: () => {
          onClose();
          if (onOpenTicket) onOpenTicket(currentLoan);
        }
      });
    } else if (paymentType === 'CUOTA') {
      if (amortizeAmount <= 0) {
        showDialog({
          title: 'Monto Inválido',
          message: 'Por favor ingrese un monto de cuota o abono mayor a Bs. 0.',
          type: 'warning'
        });
        return;
      }
      if (amortizeAmount > remainingCapital) {
        showDialog({
          title: 'Monto Excede la Deuda',
          message: `El monto ingresado (Bs. ${amortizeAmount}) supera el capital restante (Bs. ${remainingCapital}). Para cancelar todo use la opción de Liquidación Total.`,
          type: 'warning'
        });
        return;
      }

      payCapitalAmortization(
        currentLoan.id, 
        amortizeAmount, 
        paymentMethod, 
        notes || `Pago de cuota / abono a capital de Bs. ${amortizeAmount}`
      );
      showDialog({
        title: '¡Cuota / Abono Registrado!',
        message: `Se registró el abono de Bs. ${amortizeAmount.toFixed(2)}.\nNuevo saldo de deuda: Bs. ${newBalanceAfterCuota.toFixed(2)}.`,
        type: 'success',
        confirmText: 'Aceptar',
        onConfirm: () => {
          onClose();
          if (onOpenTicket) onOpenTicket(currentLoan);
        }
      });
    } else if (paymentType === 'LIQUIDACION') {
      showDialog({
        title: 'Confirmar Liquidación Total',
        message: `¿Confirmar cobro de liquidación total de Bs. ${totalToLiquidate.toFixed(2)} al cliente ${currentLoan.customerName}?\n\nAl confirmar, la deuda quedará en Bs. 0 y las prendas deben ser entregadas al titular.`,
        type: 'confirm',
        confirmText: 'Sí, Liquidar Deuda',
        cancelText: 'Cancelar',
        onConfirm: () => {
          payFullLiquidation(
            currentLoan.id, 
            paymentMethod, 
            notes || 'Liquidación total y devolución de prendas'
          );
          showDialog({
            title: '¡Préstamo Liquidado!',
            message: `El préstamo ${currentLoan.code} ha sido liquidado en su totalidad.\nEntregue las prendas bajo custodia al cliente.`,
            type: 'success',
            confirmText: 'Aceptar',
            onConfirm: () => {
              onClose();
              if (onOpenTicket) onOpenTicket(currentLoan);
            }
          });
        }
      });
    }
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
      zIndex: 9999,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#131f37',
        border: '3px solid #10b981',
        borderRadius: '16px',
        padding: '28px 26px',
        maxWidth: '820px',
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85)',
        position: 'relative'
      }}>
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          type="button"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer'
          }}
        >
          <X size={22} />
        </button>

        {/* Encabezado */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '22px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'rgba(16, 185, 129, 0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid rgba(16, 185, 129, 0.5)'
          }}>
            <Coins size={30} color="#10b981" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Caja: Pagar Prórroga, Cuota o Liquidación
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', margin: '3px 0 0 0' }}>
              Módulo de cobro rápido para Clientes (Habilitado para Empleados y Administradores).
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* PASO 1: SELECCIONAR PRÉSTAMO / CLIENTE */}
          <div style={{
            backgroundColor: '#091020',
            border: '2px solid #2d4573',
            borderRadius: '12px',
            padding: '16px 18px'
          }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
              1. Seleccione el Préstamo o Busque al Cliente
            </span>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Buscar por código (ej. A1), nombre de cliente o CI..."
                  value={loanSearch}
                  onChange={(e) => setLoanSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    backgroundColor: '#131f37',
                    border: '1px solid #334e68',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <select
                value={selectedLoanId}
                onChange={(e) => setSelectedLoanId(e.target.value)}
                style={{
                  flex: 1.2,
                  minWidth: '280px',
                  padding: '10px 14px',
                  backgroundColor: '#131f37',
                  border: '2px solid #3b82f6',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  fontWeight: 700
                }}
              >
                {filteredActiveLoans.length === 0 ? (
                  <option value="">No hay préstamos activos con ese criterio</option>
                ) : (
                  filteredActiveLoans.map(l => (
                    <option key={l.id} value={l.id}>
                      [{l.code}] {l.customerName} - Saldo: Bs. {l.remainingCapital.toLocaleString('es-PE')} ({l.item.name})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Ficha Resumen del Préstamo Seleccionado */}
            {currentLoan && (
              <div style={{
                backgroundColor: '#131f37',
                border: '1px solid #334e68',
                borderRadius: '10px',
                padding: '12px 16px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
                marginTop: '10px'
              }}>
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block' }}>Titular del Empeño:</span>
                  <strong style={{ color: '#ffffff', fontSize: '1rem' }}>{currentLoan.customerName}</strong>
                  <span style={{ fontSize: '0.82rem', color: '#cbd5e1', display: 'block' }}>CI: {currentLoan.customerDni}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block' }}>Prenda en Garantía:</span>
                  <strong style={{ color: '#f59e0b', fontSize: '0.98rem' }}>{currentLoan.item.name}</strong>
                  <span style={{ fontSize: '0.82rem', color: '#cbd5e1', display: 'block' }}>Tasada en: Bs. {currentLoan.item.appraisalValue}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block' }}>Capital Adeudado:</span>
                  <strong style={{ color: '#f87171', fontSize: '1.25rem' }}>
                    Bs. {currentLoan.remainingCapital.toLocaleString('es-PE')}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block' }}>Vence el:</span>
                  <strong style={{ color: '#38bdf8', fontSize: '0.95rem' }}>
                    {new Date(currentLoan.dueDate).toLocaleDateString('es-PE')}
                  </strong>
                </div>
              </div>
            )}
          </div>

          {/* PASO 2: TIPO DE PAGO / OPERACIÓN */}
          <div>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
              2. ¿Qué Desea Realizar el Cliente? (Elija una opción)
            </span>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px'
            }}>
              {/* Opción 1: Prórroga */}
              <div
                onClick={() => setPaymentType('PRORROGA')}
                style={{
                  backgroundColor: paymentType === 'PRORROGA' ? 'rgba(59, 130, 246, 0.2)' : '#091020',
                  border: paymentType === 'PRORROGA' ? '3px solid #3b82f6' : '2px solid #2d4573',
                  borderRadius: '12px',
                  padding: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RefreshCw size={20} color="#3b82f6" />
                  <strong style={{ color: '#ffffff', fontSize: '1.05rem' }}>Pagar Prórroga</strong>
                </div>
                <p style={{ color: '#cbd5e1', fontSize: '0.82rem', margin: 0 }}>
                  Paga solo intereses del mes y extiende la fecha de vencimiento por 30 días.
                </p>
                <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid #1e293b' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Monto a Pagar:</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8' }}>
                    Bs. {monthlyInterest.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Opción 2: Cuota / Abono */}
              <div
                onClick={() => setPaymentType('CUOTA')}
                style={{
                  backgroundColor: paymentType === 'CUOTA' ? 'rgba(245, 158, 11, 0.2)' : '#091020',
                  border: paymentType === 'CUOTA' ? '3px solid #f59e0b' : '2px solid #2d4573',
                  borderRadius: '12px',
                  padding: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Coins size={20} color="#f59e0b" />
                  <strong style={{ color: '#ffffff', fontSize: '1.05rem' }}>Pagar Cuota / Abono</strong>
                </div>
                <p style={{ color: '#cbd5e1', fontSize: '0.82rem', margin: 0 }}>
                  Abona dinero directo al capital para disminuir la deuda del préstamo.
                </p>
                <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid #1e293b' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Monto sugerido:</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fbbf24' }}>
                    Bs. {amortizeAmount.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Opción 3: Liquidación */}
              <div
                onClick={() => setPaymentType('LIQUIDACION')}
                style={{
                  backgroundColor: paymentType === 'LIQUIDACION' ? 'rgba(16, 185, 129, 0.2)' : '#091020',
                  border: paymentType === 'LIQUIDACION' ? '3px solid #10b981' : '2px solid #2d4573',
                  borderRadius: '12px',
                  padding: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={20} color="#10b981" />
                  <strong style={{ color: '#ffffff', fontSize: '1.05rem' }}>Pago Total / Liquidar</strong>
                </div>
                <p style={{ color: '#cbd5e1', fontSize: '0.82rem', margin: 0 }}>
                  Cancela toda la deuda pendiente y retira las prendas empeñadas.
                </p>
                <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid #1e293b' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total a Cancelar:</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399' }}>
                    Bs. {totalToLiquidate.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PASO 3: DETALLES SEGÚN LA OPERACIÓN SELECCIONADA */}
          <div style={{
            backgroundColor: '#091020',
            border: '2px solid #2d4573',
            borderRadius: '12px',
            padding: '18px'
          }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', display: 'block', marginBottom: '14px' }}>
              3. Datos del Cobro en Caja
            </span>

            {/* Campo especial si eligió cuota */}
            {paymentType === 'CUOTA' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
                  Monto de la Cuota / Abono a Capital (Bs.):
                </label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input
                    type="number"
                    min="1"
                    max={remainingCapital}
                    value={amortizeAmount || ''}
                    onChange={(e) => setAmortizeAmount(Number(e.target.value))}
                    style={{
                      padding: '12px 16px',
                      fontSize: '1.3rem',
                      fontWeight: 800,
                      color: '#fbbf24',
                      backgroundColor: '#131f37',
                      border: '2px solid #f59e0b',
                      borderRadius: '8px',
                      width: '200px'
                    }}
                    required
                  />
                  <div style={{ fontSize: '0.92rem', color: '#cbd5e1' }}>
                    Nuevo saldo de deuda tras el pago: <strong style={{ color: '#34d399' }}>Bs. {newBalanceAfterCuota.toFixed(2)}</strong>
                  </div>
                </div>
              </div>
            )}

            <div className="grid-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
                  Medio de Pago:
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#131f37',
                    border: '2px solid #334e68',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '1rem',
                    fontWeight: 700
                  }}
                >
                  <option value="EFECTIVO">💵 Efectivo en Caja</option>
                  <option value="TRANSFERENCIA">🏦 Transferencia Bancaria</option>
                  <option value="QR">📱 QR / Pago Móvil</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
                  Observaciones / Notas (Opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ej. Pagado por el titular en ventanilla..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#131f37',
                    border: '2px solid #334e68',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.95rem'
                  }}
                />
              </div>
            </div>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{ flex: 1, padding: '14px', fontSize: '1rem' }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="btn btn-emerald"
              style={{ flex: 1.5, padding: '14px', fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <CheckCircle2 size={20} />
              <span>
                {paymentType === 'PRORROGA' && `Confirmar Prórroga (Bs. ${monthlyInterest.toFixed(2)})`}
                {paymentType === 'CUOTA' && `Confirmar Abono de Cuota (Bs. ${amortizeAmount.toFixed(2)})`}
                {paymentType === 'LIQUIDACION' && `Confirmar Pago Total (Bs. ${totalToLiquidate.toFixed(2)})`}
              </span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

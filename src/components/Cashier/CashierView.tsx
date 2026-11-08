import React, { useState } from 'react';
import { 
  Coins, 
  Search, 
  ArrowDownLeft, 
  ArrowUpRight,
  Receipt,
  FileCheck,
  Calendar,
  Printer,
  ChevronLeft,
  ChevronRight,
  Users
} from 'lucide-react';
import { usePawn } from '../../context/PawnContext';
import type { UserRole } from '../../types';

interface CashierViewProps {
  userRole?: UserRole;
}

export const CashierView: React.FC<CashierViewProps> = () => {
  const { payments } = usePawn();

  const [activeTab, setActiveTab] = useState<'CIERRE_DIARIO' | 'HISTORIAL'>('CIERRE_DIARIO');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('TODOS');

  // Navegación de fechas para el cierre diario
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  // Filtrado de pagos para el día seleccionado
  const paymentsOfDay = payments.filter(p => {
    const pDate = new Date(p.date).toISOString().split('T')[0];
    return pDate === selectedDate;
  });

  const dayTotalIn = paymentsOfDay
    .filter(p => p.type !== 'DESEMBOLSO_INICIAL')
    .reduce((sum, p) => sum + p.amount, 0);

  const dayTotalOut = paymentsOfDay
    .filter(p => p.type === 'DESEMBOLSO_INICIAL')
    .reduce((sum, p) => sum + p.amount, 0);

  const dayNetBalance = dayTotalIn - dayTotalOut;
  const dayInterestEarned = paymentsOfDay.reduce((sum, p) => sum + p.interestPortion, 0);
  const dayUniqueCustomers = new Set(paymentsOfDay.map(p => p.customerId)).size;

  // Filtrado general para la pestaña de historial
  const filteredPayments = payments.filter(p => {
    const matchesSearch = 
      p.receiptCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.loanCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.notes && p.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (selectedType !== 'TODOS' && p.type !== selectedType) return false;

    return true;
  });

  const handlePrintDailyClose = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF' }}>
            Control de Caja y Cierre Diario
          </h2>
          <p style={{ color: '#CBD5E1', fontSize: '1rem', marginTop: '4px' }}>
            Resumen diario de dinero ingresado por cobros y dinero entregado en préstamos.
          </p>
        </div>

        {/* Pestañas de Vista */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`btn ${activeTab === 'CIERRE_DIARIO' ? 'btn-yellow' : 'btn-secondary'}`}
            onClick={() => setActiveTab('CIERRE_DIARIO')}
            style={{ fontSize: '1rem' }}
          >
            <FileCheck size={20} />
            <span>Cierre Diario</span>
          </button>

          <button
            className={`btn ${activeTab === 'HISTORIAL' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('HISTORIAL')}
            style={{ fontSize: '1rem' }}
          >
            <Receipt size={20} />
            <span>Historial de Movimientos</span>
          </button>
        </div>
      </div>

      {/* PESTAÑA 1: CIERRE DE CAJA DEL DÍA */}
      {activeTab === 'CIERRE_DIARIO' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* Selector de Fecha del Cierre */}
          <div className="card" style={{ padding: '18px 24px', backgroundColor: '#131f37' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Calendar size={26} color="#f59e0b" />
                <div>
                  <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>Fecha de Cierre Seleccionada:</span>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
                    {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </h3>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button className="btn btn-secondary btn-sm" onClick={handlePrevDay}>
                  <ChevronLeft size={18} /> Día Anterior
                </button>
                <button className="btn btn-secondary btn-sm" onClick={handleToday}>
                  Hoy
                </button>
                <button className="btn btn-secondary btn-sm" onClick={handleNextDay}>
                  Día Siguiente <ChevronRight size={18} />
                </button>

                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input-control"
                  style={{ width: '180px', padding: '8px 12px', fontSize: '0.95rem' }}
                />

                <button className="btn btn-yellow btn-sm" onClick={handlePrintDailyClose} style={{ marginLeft: '8px' }}>
                  <Printer size={18} />
                  <span>Imprimir Cierre</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4 Tarjetas de Balance del Día */}
          <div className="grid-4">
            
            {/* Dinero Ingresado Hoy */}
            <div className="card" style={{ padding: '22px', backgroundColor: '#064e3b', border: '2px solid #10b981' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <ArrowDownLeft size={24} color="#34d399" />
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#d1fae5' }}>
                  Dinero Ingresado Hoy
                </span>
              </div>
              <h3 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff' }}>
                Bs. {dayTotalIn.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#a7f3d0', marginTop: '4px' }}>
                (Bs. {dayInterestEarned.toLocaleString('es-PE', { minimumFractionDigits: 2 })} en intereses)
              </p>
            </div>

            {/* Dinero Prestado Hoy */}
            <div className="card" style={{ padding: '22px', backgroundColor: '#450a0a', border: '2px solid #ef4444' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <ArrowUpRight size={24} color="#f87171" />
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fee2e2' }}>
                  Dinero Prestado Hoy
                </span>
              </div>
              <h3 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff' }}>
                Bs. {dayTotalOut.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#fca5a5', marginTop: '4px' }}>
                Desembolsos entregados a clientes
              </p>
            </div>

            {/* Balance Neto del Día */}
            <div className="card" style={{ padding: '22px', backgroundColor: '#1e293b', border: '2px solid #3b82f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <Coins size={24} color="#60a5fa" />
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#cbd5e1' }}>
                  Balance Neto del Día
                </span>
              </div>
              <h3 style={{ 
                fontSize: '2rem', 
                fontWeight: 900, 
                color: dayNetBalance >= 0 ? '#34d399' : '#f87171' 
              }}>
                {dayNetBalance >= 0 ? '+' : ''}Bs. {dayNetBalance.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '4px' }}>
                {dayNetBalance >= 0 ? 'Flujo positivo en caja' : 'Más préstamos entregados que cobrados'}
              </p>
            </div>

            {/* Clientes Atendidos Hoy */}
            <div className="card" style={{ padding: '22px', backgroundColor: '#131f37' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <Users size={24} color="#f59e0b" />
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#cbd5e1' }}>
                  Atenciones de Hoy
                </span>
              </div>
              <h3 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff' }}>
                {paymentsOfDay.length} operaciones
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#fde047', marginTop: '4px' }}>
                {dayUniqueCustomers} clientes distintos
              </p>
            </div>

          </div>

          {/* Lista de Operaciones del Día */}
          <div className="card" style={{ padding: '24px', backgroundColor: '#131f37' }}>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '16px' }}>
              Detalle de Movimientos del Día ({paymentsOfDay.length})
            </h4>

            {paymentsOfDay.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 20px', color: '#cbd5e1' }}>
                <p style={{ fontSize: '1.1rem' }}>No se registraron movimientos en esta fecha.</p>
                <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Seleccione otra fecha o el botón "Hoy" arriba.</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {paymentsOfDay.map((p) => {
                  const isOut = p.type === 'DESEMBOLSO_INICIAL';
                  const pTime = new Date(p.date).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div 
                      key={p.id}
                      style={{
                        padding: '16px 20px',
                        borderRadius: '10px',
                        backgroundColor: '#091020',
                        border: '2px solid #2d4573',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '10px',
                          backgroundColor: isOut ? '#7f1d1d' : '#064e3b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {isOut ? <ArrowUpRight size={24} color="#fca5a5" /> : <ArrowDownLeft size={24} color="#a7f3d0" />}
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <strong style={{ fontSize: '1.15rem', color: '#ffffff' }}>
                              {p.customerName}
                            </strong>
                            <span style={{ fontSize: '0.9rem', color: '#f59e0b', fontWeight: 800 }}>
                              Recibo: {p.receiptCode || p.loanCode}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.95rem', color: '#cbd5e1', marginTop: '2px' }}>
                            {isOut ? '📤 Préstamo Otorgado (Desembolso)' : '📥 Cobro de Interés / Refrendo'} • {p.paymentMethod} • Hora: {pTime}
                          </p>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ 
                          fontSize: '1.4rem', 
                          fontWeight: 900, 
                          color: isOut ? '#f87171' : '#34d399' 
                        }}>
                          {isOut ? '- ' : '+ '}Bs. {p.amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* PESTAÑA 2: HISTORIAL COMPLETO */}
      {activeTab === 'HISTORIAL' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Buscador y Filtros */}
          <div className="card" style={{ padding: '18px 20px', backgroundColor: '#131f37' }}>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ position: 'relative', flex: '1', minWidth: '280px' }}>
                <Search 
                  size={20} 
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1' }} 
                />
                <input
                  type="text"
                  className="input-control"
                  placeholder="Buscar por cliente, recibo o contrato..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '44px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { id: 'TODOS', label: 'Todos' },
                  { id: 'PAGO_INTERES_REFRENDO', label: 'Refrendos (Interés)' },
                  { id: 'ABONO_CAPITAL', label: 'Abonos Capital' },
                  { id: 'LIQUIDACION_TOTAL', label: 'Liquidaciones' },
                  { id: 'DESEMBOLSO_INICIAL', label: 'Desembolsos' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedType(tab.id)}
                    className={`btn ${selectedType === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.9rem', padding: '8px 14px' }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Lista de Transacciones Filtradas */}
          <div className="card" style={{ padding: '20px', backgroundColor: '#131f37' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredPayments.map(p => {
                const isOut = p.type === 'DESEMBOLSO_INICIAL';
                return (
                  <div 
                    key={p.id}
                    style={{
                      padding: '14px 18px',
                      borderRadius: '8px',
                      backgroundColor: '#091020',
                      border: '1px solid #2d4573',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <strong style={{ color: '#ffffff', fontSize: '1.05rem' }}>{p.customerName}</strong>
                        <span style={{ color: '#f59e0b', fontWeight: 800 }}>Recibo: {p.receiptCode || p.loanCode}</span>
                        <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>• {p.paymentMethod}</span>
                      </div>
                      <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                        {new Date(p.date).toLocaleString('es-PE')} — {p.notes || p.type.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div>
                      <strong style={{ fontSize: '1.25rem', color: isOut ? '#f87171' : '#34d399' }}>
                        {isOut ? '- ' : '+ '}Bs. {p.amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

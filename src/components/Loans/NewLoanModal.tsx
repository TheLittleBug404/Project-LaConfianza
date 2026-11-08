import React, { useState, useEffect } from 'react';
import { 
  X, 
  Coins, 
  Plus, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  FileText,
  UserPlus
} from 'lucide-react';
import { usePawn } from '../../context/PawnContext';
import type { Customer, CollateralCategory, ItemCondition, PawnLoan, UserRole } from '../../types';
import { getCustomerRatingMeta } from '../../utils/customerRating';

interface NewLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCustomer?: Customer | null;
  onSuccessCreated: (loan: PawnLoan) => void;
  onOpenNewCustomer: () => void;
  userRole?: UserRole;
}

export const NewLoanModal: React.FC<NewLoanModalProps> = ({
  isOpen,
  onClose,
  preselectedCustomer,
  onSuccessCreated,
  onOpenNewCustomer,
  userRole = 'ADMIN'
}) => {
  const { customers, loans, stats, createPawnLoan, nextReceiptCode } = usePawn();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerSearch, setCustomerSearch] = useState('');

  // Item Form
  const [category, setCategory] = useState<CollateralCategory>('JOYERIA_ORO');
  const [itemName, setItemName] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const serialNumber = '';
  const [condition, setCondition] = useState<ItemCondition>('EXCELENTE');
  const [appraisalValue, setAppraisalValue] = useState<number>(1000);
  const [storageLocation, setStorageLocation] = useState('Bóveda Principal');

  // Loan Terms Form
  const [loanAmount, setLoanAmount] = useState<number>(1000);
  const [monthlyRate, setMonthlyRate] = useState<number>(3); // Por defecto 3%
  const [termDays, setTermDays] = useState<number>(30); // 30, 60, 90, 120...
  const gracePeriodDays = 5;
  const notes = '';

  // Autorización de sobrepaso de fondo o cliente de riesgo
  const [riskAuthConfirmed, setRiskAuthConfirmed] = useState(false);
  const [budgetOverflowConfirmed, setBudgetOverflowConfirmed] = useState(false);

  useEffect(() => {
    if (preselectedCustomer) {
      setSelectedCustomerId(preselectedCustomer.id);
    }
  }, [preselectedCustomer, isOpen]);

  // Sugerencia de monto según tasación
  useEffect(() => {
    if (appraisalValue > 0 && loanAmount === 1000) {
      const suggestedMax = Math.round(appraisalValue * 0.70);
      setLoanAmount(suggestedMax);
    }
  }, [appraisalValue]);

  if (!isOpen) return null;

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  // Deuda actual del cliente si ya tiene préstamos activos
  const customerActiveLoans = selectedCustomer 
    ? loans.filter(l => l.customerId === selectedCustomer.id && (l.status === 'VIGENTE' || l.status === 'POR_VENCER' || l.status === 'EN_MORA'))
    : [];
  const existingDebt = customerActiveLoans.reduce((sum, l) => sum + l.remainingCapital, 0);
  const isEnlargingDebt = existingDebt > 0;

  // Fondo mensual restante
  const remainingBudget = stats.monthlyRemainingBudget;
  const isOverBudget = loanAmount > remainingBudget;

  // Cálculo de fecha de vencimiento en días (30, 60, 90...)
  const startDate = new Date();
  const dueDate = new Date(startDate);
  dueDate.setDate(dueDate.getDate() + termDays);

  const interestAmount = (loanAmount * monthlyRate) / 100;
  const adminExpensesRate = 12;
  const adminExpensesAmount = (loanAmount * adminExpensesRate) / 100;
  const totalMonthlyCharge = interestAmount + adminExpensesAmount;

  // Validación de autorización según el semáforo
  const isCustomerRed = selectedCustomer?.trafficColor === 'ROJO';
  const isCustomerYellow = selectedCustomer?.trafficColor === 'AMARILLO';
  const isCustomerGreen = selectedCustomer?.trafficColor === 'VERDE';

  const isEmployee = userRole === 'EMPLEADO';
  const isRedBlockedForEmployee = isCustomerRed && isEmployee;

  const filteredCustomerList = customers.filter(c => 
    c.fullName.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.dni.includes(customerSearch) ||
    c.phone.includes(customerSearch)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomerId) {
      alert('Debe seleccionar a un cliente titular.');
      return;
    }

    if (!itemName.trim() || appraisalValue <= 0 || loanAmount <= 0) {
      alert('Por favor complete la prenda y el monto del préstamo.');
      return;
    }

    // Regla de fondos mensuales
    if (isOverBudget && !budgetOverflowConfirmed) {
      alert(`ALERTA: El préstamo de Bs. ${loanAmount} supera el fondo disponible de este mes (Quedan Bs. ${remainingBudget}). Marque la casilla de confirmación para continuar.`);
      return;
    }

    // Regla de semáforo rojo
    if (isCustomerRed) {
      if (isEmployee) {
        alert('OPERACIÓN DENEGADA: Un empleado NO puede otorgar préstamos a un Cliente en ROJO (Moroso / No paga). Requiere autorización directa del Administrador.');
        return;
      }
      if (!riskAuthConfirmed) {
        alert('ATENCIÓN: Debe marcar la casilla de autorización como Administrador para otorgar este préstamo a un cliente en ROJO.');
        return;
      }
    }

    // Regla de cliente amarillo con deuda previa
    if (isCustomerYellow && isEnlargingDebt && !riskAuthConfirmed) {
      if (!window.confirm(`El cliente tiene historial regular (AMARILLO) y ya mantiene una deuda activa de Bs. ${existingDebt}. ¿Confirma que desea agrandar su deuda?`)) {
        return;
      }
    }

    const createdLoan = createPawnLoan({
      customerId: selectedCustomerId,
      itemData: {
        code: `PRD-${Date.now().toString().slice(-6)}`,
        category,
        name: itemName,
        description: itemDesc,
        serialNumber,
        condition,
        appraisalValue,
        storageLocation,
      },
      loanAmount,
      monthlyInterestRate: monthlyRate,
      adminExpensesRate,
      termDays,
      termMonths: Math.max(1, Math.round(termDays / 30)),
      gracePeriodDays,
      notes,
    });

    onSuccessCreated(createdLoan);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '880px', width: '95%' }} 
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Cabecera del Recibo / Préstamo */}
        <div className="modal-header" style={{ padding: '20px 24px', backgroundColor: '#0f1a30' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileText size={28} color="#f59e0b" />
              <div>
                <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff' }}>
                  Nuevo Préstamo de Empeño
                </h3>
                <span style={{ fontSize: '1rem', color: '#fde047', fontWeight: 800 }}>
                  Nº DE RECIBO / CONTRATO: {nextReceiptCode}
                </span>
              </div>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
            
            {/* ALERTA DE PRESUPUESTO MENSUAL */}
            <div style={{
              padding: '14px 18px',
              borderRadius: '12px',
              backgroundColor: isOverBudget ? '#450a0a' : '#1e293b',
              border: isOverBudget ? '3px solid #ef4444' : '2px solid #334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <span style={{ fontSize: '0.95rem', color: '#cbd5e1', fontWeight: 700 }}>
                  Fondo de dinero disponible este mes para prestar:
                </span>
                <strong style={{ fontSize: '1.25rem', color: remainingBudget > 0 ? '#34d399' : '#f87171', display: 'block' }}>
                  Bs. {remainingBudget.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </strong>
              </div>

              {isOverBudget && (
                <div style={{ color: '#fca5a5', fontSize: '0.92rem', fontWeight: 700, maxWidth: '420px' }}>
                  ⚠️ ¡ALERTA!: Este préstamo (Bs. {loanAmount}) supera el saldo disponible del mes.
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', color: '#ffffff', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={budgetOverflowConfirmed} 
                      onChange={(e) => setBudgetOverflowConfirmed(e.target.checked)} 
                    />
                    <span>Autorizo prestar por encima del fondo mensual</span>
                  </label>
                </div>
              )}
            </div>

            {/* SECCIÓN 1: CLIENTE & SEMÁFORO DE 3 COLORES */}
            <div className="card" style={{ padding: '20px', backgroundColor: '#131f37' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f59e0b' }}>
                  1. Cliente Titular del Préstamo
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={onOpenNewCustomer}
                >
                  <Plus size={18} /> Registrar Nuevo
                </button>
              </div>

              {selectedCustomer ? (
                <div style={{
                  backgroundColor: '#091020',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  border: '2px solid #2d4573'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
                    <div>
                      <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                        {selectedCustomer.fullName}
                      </h4>
                      <p style={{ fontSize: '1rem', color: '#cbd5e1', marginTop: '3px' }}>
                        C.I. / DNI: <strong style={{ color: '#ffffff' }}>{selectedCustomer.dni}</strong> | Celular: {selectedCustomer.phone}
                      </p>
                      <p style={{ fontSize: '0.92rem', color: '#94a3b8' }}>
                        Dirección: {selectedCustomer.address}
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                      {/* Distintivo de Clasificación */}
                      {isCustomerGreen && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.25)', border: '2px solid #10b981', padding: '6px 12px', borderRadius: '8px', color: '#6ee7b7', fontWeight: 800, fontSize: '0.95rem' }}>
                          <CheckCircle2 size={20} color="#10b981" />
                          <span>🟢 CLIENTE EXCELENTE (Puntual / Sin Mora)</span>
                        </div>
                      )}
                      {isCustomerYellow && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(245, 158, 11, 0.25)', border: '2px solid #f59e0b', padding: '6px 12px', borderRadius: '8px', color: '#fde047', fontWeight: 800, fontSize: '0.95rem' }}>
                          <Clock size={20} color="#f59e0b" />
                          <span>🟡 CLIENTE REGULAR (Con Demoras)</span>
                        </div>
                      )}
                      {isCustomerRed && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(239, 68, 68, 0.25)', border: '2px solid #ef4444', padding: '6px 12px', borderRadius: '8px', color: '#fca5a5', fontWeight: 800, fontSize: '0.95rem' }}>
                          <ShieldAlert size={20} color="#ef4444" />
                          <span>🔴 CLIENTE MALO (Moroso / No Paga)</span>
                        </div>
                      )}

                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedCustomerId('')}
                        style={{ marginTop: '6px' }}
                      >
                        Cambiar Cliente
                      </button>
                    </div>
                  </div>

                  {/* Advertencia si ya tiene deuda o si es Malo/Regular */}
                  {isEnlargingDebt && (
                    <div style={{
                      marginTop: '14px',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      backgroundColor: isCustomerRed ? '#450a0a' : isCustomerYellow ? '#451a03' : '#064e3b',
                      border: `2px solid ${isCustomerRed ? '#ef4444' : isCustomerYellow ? '#f59e0b' : '#10b981'}`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertTriangle size={20} color={isCustomerRed ? '#f87171' : isCustomerYellow ? '#fbbf24' : '#34d399'} />
                        <strong style={{ color: '#ffffff', fontSize: '1rem' }}>
                          {isEnlargingDebt 
                            ? `AMPLIACIÓN DE DEUDA: Este cliente ya tiene una deuda activa de Bs. ${existingDebt.toLocaleString('es-PE')}`
                            : 'Cliente sin deuda pendiente'
                          }
                        </strong>
                      </div>

                      {isCustomerRed && (
                        <div style={{ marginTop: '8px', color: '#fecaca', fontSize: '0.92rem' }}>
                          {isRedBlockedForEmployee ? (
                            <strong>❌ BLOQUEADO: Un empleado NO puede prestar dinero a clientes clasificados como CLIENTE MALO. Solicite aprobación al Administrador.</strong>
                          ) : (
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '6px', color: '#ffffff', fontWeight: 700 }}>
                              <input 
                                type="checkbox" 
                                checked={riskAuthConfirmed} 
                                onChange={(e) => setRiskAuthConfirmed(e.target.checked)} 
                              />
                              <span>Autorizo expresamente este préstamo bajo mi responsabilidad de Administrador</span>
                            </label>
                          )}
                        </div>
                      )}

                      {isCustomerYellow && (
                        <p style={{ marginTop: '4px', color: '#fde047', fontSize: '0.9rem' }}>
                          Precaución: El cliente está clasificado como CLIENTE REGULAR (historial de demoras). Asegúrese de que la prenda cubra con holgura el total de la deuda.
                        </p>
                      )}
                    </div>
                  )}

                  {!isEnlargingDebt && isCustomerRed && (
                    <div style={{
                      marginTop: '14px',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      backgroundColor: '#450a0a',
                      border: '2px solid #ef4444',
                      color: '#fecaca'
                    }}>
                      <strong>⚠️ CLIENTE MALO: Historial de impago / mora registrado.</strong>
                      {isRedBlockedForEmployee ? (
                        <p style={{ marginTop: '4px' }}>❌ Solo un Administrador puede autorizar otorgarle un nuevo préstamo.</p>
                      ) : (
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '6px', color: '#ffffff', fontWeight: 700 }}>
                          <input 
                            type="checkbox" 
                            checked={riskAuthConfirmed} 
                            onChange={(e) => setRiskAuthConfirmed(e.target.checked)} 
                          />
                          <span>Autorizo otorgar préstamo a este cliente clasificado como CLIENTE MALO</span>
                        </label>
                      )}
                    </div>
                  )}

                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '240px' }}>
                      <input
                        type="text"
                        className="input-control"
                        placeholder="Buscar por Nombre o Carnet (CI / DNI)..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        style={{ fontSize: '1rem' }}
                      />
                    </div>
                    <button
                      type="button"
                      className="btn btn-yellow"
                      onClick={onOpenNewCustomer}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      <UserPlus size={18} />
                      <span>+ Registrar Cliente</span>
                    </button>
                  </div>

                  <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {filteredCustomerList.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '20px', background: '#091020', borderRadius: '8px', border: '1px dashed #2d4573' }}>
                        <p style={{ color: '#cbd5e1', marginBottom: '10px' }}>
                          No se encontró ningún cliente registrado con "{customerSearch}".
                        </p>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={onOpenNewCustomer}
                        >
                          <UserPlus size={16} />
                          <span>Registrar Nuevo Cliente Ahora</span>
                        </button>
                      </div>
                    ) : (
                      filteredCustomerList.map(c => {
                        const rating = getCustomerRatingMeta(c.trafficColor || 'VERDE');
                        return (
                          <div
                            key={c.id}
                            onClick={() => setSelectedCustomerId(c.id)}
                            style={{
                              padding: '12px 16px',
                              background: '#091020',
                              borderRadius: '8px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              cursor: 'pointer',
                              border: '2px solid #2d4573',
                              gap: '12px',
                              flexWrap: 'wrap'
                            }}
                          >
                            <div>
                              <strong style={{ fontSize: '1.05rem', color: '#ffffff' }}>{c.fullName}</strong>
                              <span style={{ color: '#f59e0b', marginLeft: '10px', fontSize: '0.95rem', fontWeight: 700 }}>
                                CI: {c.dni}
                              </span>
                              {c.phone && (
                                <span style={{ color: '#94a3b8', marginLeft: '10px', fontSize: '0.88rem' }}>
                                  Tel: {c.phone}
                                </span>
                              )}
                            </div>
                            <div>
                              <span style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                                fontWeight: 800,
                                backgroundColor: rating.bgColor,
                                color: rating.color,
                                border: `1px solid ${rating.borderColor}`
                              }}>
                                {rating.badgeText}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* SECCIÓN 2: DATOS DE LA PRENDA */}
            <div className="card" style={{ padding: '20px', backgroundColor: '#131f37' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f59e0b', display: 'block', marginBottom: '14px' }}>
                2. Prenda a Dejar en Garantía
              </span>

              <div className="grid-2">
                <div className="input-group">
                  <label className="input-label">Tipo de Prenda</label>
                  <select
                    className="input-control"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CollateralCategory)}
                  >
                    <option value="JOYERIA_ORO">Joyas de Oro</option>
                    <option value="JOYERIA_PLATA">Joyas de Plata</option>
                    <option value="ELECTRONICA">Electrónica / Computadoras</option>
                    <option value="HERRAMIENTAS">Herramientas Industriales</option>
                    <option value="VEHICULOS">Vehículos / Motos</option>
                    <option value="ELECTRODOMESTICOS">Electrodomésticos</option>
                    <option value="OTROS">Otros Bienes</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Nombre o Título de la Prenda *</label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="Ej. Anillo de Oro 18k con piedra"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Detalles / Estado de la Prenda</label>
                <textarea
                  className="input-control"
                  rows={2}
                  placeholder="Detalles físicos, peso en gramos, marca, detalles de conservación..."
                  value={itemDesc}
                  onChange={(e) => setItemDesc(e.target.value)}
                />
              </div>

              <div className="grid-3">
                <div className="input-group">
                  <label className="input-label">Valor de Tasación Real (Bs.)</label>
                  <input
                    type="number"
                    min="1"
                    className="input-control"
                    value={appraisalValue || ''}
                    onChange={(e) => setAppraisalValue(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Condición Física</label>
                  <select
                    className="input-control"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as ItemCondition)}
                  >
                    <option value="EXCELENTE">Excelente / Como Nuevo</option>
                    <option value="BUENO">Bueno</option>
                    <option value="REGULAR">Regular / Desgaste Normal</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Ubicación en Bóveda</label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="Caja A1, Estante 3..."
                    value={storageLocation}
                    onChange={(e) => setStorageLocation(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 3: CONDICIONES FINANCIERAS (PORCENTAJE 3% DEFECTO + DIAS DE 30 EN 30) */}
            <div className="card" style={{ padding: '20px', backgroundColor: '#131f37' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f59e0b', display: 'block', marginBottom: '14px' }}>
                3. Condiciones del Préstamo (Monto, Interés y Plazo)
              </span>

              <div className="grid-3">
                {/* Monto del préstamo */}
                <div className="input-group">
                  <label className="input-label">Monto de Dinero a Prestar (Bs.) *</label>
                  <input
                    type="number"
                    min="1"
                    className="input-control"
                    style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b' }}
                    value={loanAmount || ''}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    required
                  />
                </div>

                {/* Porcentaje de Préstamo (Por defecto 3%) */}
                <div className="input-group">
                  <label className="input-label">Porcentaje de Interés Mensual (%)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="50"
                      className="input-control"
                      style={{ fontSize: '1.25rem', fontWeight: 800 }}
                      value={monthlyRate}
                      onChange={(e) => setMonthlyRate(Number(e.target.value))}
                      required
                    />
                    <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: '#f59e0b' }}>
                      %
                    </span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#93c5fd' }}>Por defecto: 3% mensual</span>
                </div>

                {/* Límite de Rango en Días (De 30 en 30) */}
                <div className="input-group">
                  <label className="input-label">Plazo de Pago (Días)</label>
                  <select
                    className="input-control"
                    style={{ fontSize: '1.15rem', fontWeight: 700 }}
                    value={termDays}
                    onChange={(e) => setTermDays(Number(e.target.value))}
                  >
                    <option value={30}>30 Días (1 mes)</option>
                    <option value={60}>60 Días (2 meses)</option>
                    <option value={90}>90 Días (3 meses)</option>
                    <option value={120}>120 Días (4 meses)</option>
                    <option value={150}>150 Días (5 meses)</option>
                    <option value={180}>180 Días (6 meses)</option>
                    <option value={360}>360 Días (1 año)</option>
                  </select>
                </div>
              </div>

              {/* Resumen de cobro mensual y fecha exacta */}
              <div style={{
                marginTop: '16px',
                padding: '16px 20px',
                borderRadius: '10px',
                backgroundColor: '#091020',
                border: '2px solid #2d4573',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '14px'
              }}>
                <div>
                  <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>Fecha de Emisión:</span>
                  <strong style={{ display: 'block', fontSize: '1.05rem', color: '#ffffff' }}>
                    {startDate.toLocaleDateString('es-PE')}
                  </strong>
                </div>

                <div>
                  <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>Fecha Límite de Vencimiento:</span>
                  <strong style={{ display: 'block', fontSize: '1.15rem', color: '#fde047' }}>
                    {dueDate.toLocaleDateString('es-PE')} ({termDays} días)
                  </strong>
                </div>

                <div>
                  <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>Interés del {monthlyRate}%:</span>
                  <strong style={{ display: 'block', fontSize: '1.05rem', color: '#34d399' }}>
                    Bs. {interestAmount.toFixed(2)} al mes
                  </strong>
                </div>

                <div>
                  <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>Pago para Renovar / Refrendo:</span>
                  <strong style={{ display: 'block', fontSize: '1.15rem', color: '#f59e0b' }}>
                    Bs. {totalMonthlyCharge.toFixed(2)}
                  </strong>
                </div>
              </div>

            </div>

          </div>

          {/* Pie del Modal con Botón Gigante */}
          <div className="modal-footer" style={{ padding: '20px 24px', backgroundColor: '#0f1a30' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{ fontSize: '1rem', padding: '12px 20px' }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isRedBlockedForEmployee}
              className="btn btn-yellow"
              style={{
                fontSize: '1.2rem',
                padding: '14px 28px',
                fontWeight: 800,
                opacity: isRedBlockedForEmployee ? 0.5 : 1,
                cursor: isRedBlockedForEmployee ? 'not-allowed' : 'pointer'
              }}
            >
              <Coins size={22} />
              <span>{isRedBlockedForEmployee ? '❌ BLOQUEADO (CLIENTE EN ROJO)' : 'GUARDAR Y EMITIR RECIBO'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

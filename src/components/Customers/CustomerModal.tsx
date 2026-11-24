import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Award, 
  AlertCircle, 
  Clock, 
  PlusCircle,
  History,
  Trash2
} from 'lucide-react';
import { usePawn } from '../../context/PawnContext';
import type { Customer, CustomerCategory, UserRole } from '../../types';
import { getCustomerRatingMeta } from '../../utils/customerRating';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer | null;
  mode: 'create' | 'edit' | 'view';
  onCreateLoanForCustomer?: (customer: Customer) => void;
  userRole?: UserRole;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  customer,
  mode: initialMode,
  onCreateLoanForCustomer,
  userRole = 'ADMIN'
}) => {
  const { addCustomer, updateCustomer, deleteCustomer, loans } = usePawn();
  const [mode, setMode] = useState<'create' | 'edit' | 'view'>(initialMode);

  const [formData, setFormData] = useState<{
    dni: string;
    fullName: string;
    phone: string;
    email: string;
    address: string;
    notes: string;
  }>({
    dni: '',
    fullName: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

  useEffect(() => {
    setMode(initialMode);
    if (customer && (initialMode === 'view' || initialMode === 'edit')) {
      setFormData({
        dni: customer.dni,
        fullName: customer.fullName,
        phone: customer.phone,
        email: customer.email || '',
        address: customer.address,
        notes: customer.notes || '',
      });
    } else {
      setFormData({
        dni: '',
        fullName: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
      });
    }
  }, [customer, initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.dni || !formData.fullName || !formData.phone) {
      alert('Carnet (CI/DNI), Nombre Completo y Teléfono son obligatorios.');
      return;
    }

    if (mode === 'create') {
      addCustomer(formData);
      onClose();
    } else if (mode === 'edit' && customer) {
      updateCustomer(customer.id, formData);
      setMode('view');
    }
  };

  const customerLoans = customer ? loans.filter(l => l.customerId === customer.id) : [];

  const getCategoryDetails = (cat: CustomerCategory) => {
    switch (cat) {
      case 'VIP':
        return {
          title: 'Cliente VIP',
          icon: <Award size={18} color="#FBBF24" />,
          color: '#FBBF24',
          badgeClass: 'badge-vip',
          desc: 'Excelente historial. Múltiples préstamos pagados a tiempo. Califica para tasas reducidas (8% mensual) y mayores montos de avalúo.'
        };
      case 'ANTIGUO':
        return {
          title: 'Cliente Antiguo / Recurrente',
          icon: <ShieldCheck size={18} color="#60A5FA" />,
          color: '#60A5FA',
          badgeClass: 'badge-antiguo',
          desc: 'Cliente con historial confiable y recurrente. Mínimo 2 operaciones liquidadas o más de 60 días de antigüedad con buen comportamiento.'
        };
      case 'NUEVO':
        return {
          title: 'Cliente Nuevo',
          icon: <Clock size={18} color="#34D399" />,
          color: '#34D399',
          badgeClass: 'badge-nuevo',
          desc: 'Cliente de primera vez o con poca trayectoria. Requiere verificación estricta de documentos y comprobantes de propiedad de la prenda.'
        };
      case 'MOROSO':
        return {
          title: 'Cliente en Mora / Alto Riesgo',
          icon: <AlertCircle size={18} color="#F87171" />,
          color: '#F87171',
          badgeClass: 'badge-moroso',
          desc: 'Cliente con historial de retraso superior al periodo de gracia o prendas pasadas a remate. Se recomienda no otorgar nuevos préstamos sin aprobación de gerencia.'
        };
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: mode === 'view' ? '800px' : '600px', zIndex: 1101 }}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
              {mode === 'create' ? 'Registrar Nuevo Cliente' : 
               mode === 'edit' ? 'Editar Información del Cliente' : 
               'Ficha Integral del Cliente'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {mode === 'view' && customer ? `Código: ${customer.id} | DNI: ${customer.dni}` : 'Datos personales y de contacto'}
            </p>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {mode === 'view' && customer ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Category & Scoring Banner */}
              {(() => {
                const details = getCategoryDetails(customer.category);
                return (
                  <div 
                    style={{
                      background: 'var(--bg-surface)',
                      border: `1px solid ${details.color}40`,
                      borderRadius: 'var(--radius-lg)',
                      padding: '18px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        {details.icon}
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: details.color }}>
                          {details.title}
                        </h4>
                        {(() => {
                          const rating = getCustomerRatingMeta(customer.trafficColor);
                          return (
                            <span style={{
                              padding: '6px 12px',
                              borderRadius: '8px',
                              fontWeight: 800,
                              fontSize: '0.9rem',
                              backgroundColor: rating.bgColor,
                              color: rating.color,
                              border: `2px solid ${rating.borderColor}`
                            }}>
                              {rating.badgeText}
                            </span>
                          );
                        })()}
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Score Crediticio:</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: details.color }}>
                          {customer.creditScore} / 100
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {details.desc}
                    </p>
                  </div>
                );
              })()}

              {/* Personal Info Grid */}
              <div className="grid-2">
                <div className="card" style={{ padding: '16px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '10px' }}>
                    Información Personal
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Nombre: </span>
                      <strong style={{ color: '#FFFFFF' }}>{customer.fullName}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>DNI / C.E.: </span>
                      <span className="font-mono" style={{ color: '#FBBF24' }}>{customer.dni}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Teléfono: </span>
                      <span style={{ color: '#FFFFFF' }}>{customer.phone}</span>
                    </div>
                    {customer.email && (
                      <div>
                        <span style={{ color: 'var(--text-secondary)' }}>Email: </span>
                        <span style={{ color: '#FFFFFF' }}>{customer.email}</span>
                      </div>
                    )}
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Dirección: </span>
                      <span style={{ color: '#FFFFFF' }}>{customer.address}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Fecha de Registro: </span>
                      <span style={{ color: '#FFFFFF' }}>{new Date(customer.registeredAt).toLocaleDateString('es-PE')}</span>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ padding: '16px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '10px' }}>
                    Resumen Financiero Prendario
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Total Préstamos:</span>
                      <strong style={{ color: '#FFFFFF' }}>{customer.totalLoansCount} ({customer.activeLoansCount} activos)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Capital Histórico Prestado:</span>
                      <strong style={{ color: '#FFFFFF' }}>S/ {customer.totalBorrowedAmount.toLocaleString('es-PE')}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Total Pagado (Cap + Int):</span>
                      <strong style={{ color: '#10B981' }}>S/ {customer.totalPaidAmount.toLocaleString('es-PE')}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Prendas Rematadas (Mora):</span>
                      <strong style={{ color: customer.defaultedLoansCount > 0 ? '#EF4444' : '#FFFFFF' }}>
                        {customer.defaultedLoansCount}
                      </strong>
                    </div>
                  </div>
                  {customer.notes && (
                    <div style={{ marginTop: '12px', padding: '8px 10px', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <strong>Notas: </strong>{customer.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Pawned Items / Loans History */}
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <History size={16} color="var(--primary)" />
                  <span>Historial de Empeños ({customerLoans.length})</span>
                </h4>

                {customerLoans.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No registra contratos de empeño aún.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {customerLoans.map(loan => (
                      <div 
                        key={loan.id}
                        style={{
                          background: 'var(--bg-surface)',
                          borderRadius: 'var(--radius-md)',
                          padding: '12px 16px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          border: '1px solid var(--border-subtle)'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="font-mono" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#F59E0B' }}>
                              {loan.code}
                            </span>
                            <span className={`badge status-${loan.status.toLowerCase().replace('_', '-')}`} style={{ fontSize: '0.7rem' }}>
                              {loan.status.replace('_', ' ')}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.85rem', color: '#FFFFFF', fontWeight: 600, display: 'block', marginTop: '2px' }}>
                            {loan.item.name}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Avalúo: S/ {loan.item.appraisalValue} | Vence: {new Date(loan.dueDate).toLocaleDateString('es-PE')}
                          </span>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Saldo Deudor</span>
                          <strong style={{ fontSize: '1rem', color: '#FBBF24' }}>
                            S/ {loan.remainingCapital.toLocaleString('es-PE')}
                          </strong>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ) : (
            /* Form for Create / Edit */
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="grid-2">
                <div className="input-group">
                  <label className="input-label">DNI / Documento Identidad *</label>
                  <input
                    type="text"
                    required
                    className="input-control font-mono"
                    placeholder="Ej. 72384910"
                    value={formData.dni}
                    onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Teléfono de Contacto / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    className="input-control"
                    placeholder="Ej. +51 984 512 890"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Nombres y Apellidos Completos *</label>
                <input
                  type="text"
                  required
                  className="input-control"
                  placeholder="Ej. Carlos Mendoza Rivera"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              <div className="grid-2">
                <div className="input-group">
                  <label className="input-label">Correo Electrónico (Opcional)</label>
                  <input
                    type="email"
                    className="input-control"
                    placeholder="cliente@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Dirección Domiciliaria *</label>
                  <input
                    type="text"
                    required
                    className="input-control"
                    placeholder="Av. Principal 123, Urb. Los Pinos"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>

              {/* Nota sobre la calificación automática por sistema */}
              <div style={{
                padding: '14px 16px',
                borderRadius: '8px',
                backgroundColor: '#091020',
                border: '2px solid #2d4573',
                fontSize: '0.92rem',
                color: '#93c5fd'
              }}>
                <strong style={{ color: '#f59e0b' }}>ℹ️ Calificación del Sistema:</strong> La clasificación del cliente (Cliente Excelente, Cliente Regular o Cliente Malo) es calculada automáticamente por el sistema de acuerdo a su puntualidad, historial de préstamos y cumplimiento.
              </div>

              <div className="input-group">
                <label className="input-label">Observaciones y Referencias Crediticias</label>
                <textarea
                  className="input-control"
                  rows={3}
                  placeholder="Notas adicionales sobre el cliente, actividad laboral o referencias..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="modal-footer" style={{ margin: '12px -24px -24px', padding: '16px 24px' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {mode === 'create' ? 'Guardar Cliente' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer for View Mode */}
        {mode === 'view' && customer && (
          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              {userRole === 'ADMIN' && (
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    if (window.confirm(`¿Está seguro de eliminar definitivamente al cliente "${customer.fullName}"?\n\nEsta acción no se puede deshacer.`)) {
                      const res = deleteCustomer(customer.id);
                      if (!res.success) {
                        alert(res.message);
                      } else {
                        alert('Cliente eliminado exitosamente.');
                        onClose();
                      }
                    }
                  }}
                >
                  <Trash2 size={16} />
                  <span>Eliminar Cliente</span>
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary" onClick={() => setMode('edit')}>
                Editar Datos
              </button>
              {onCreateLoanForCustomer && (
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    onClose();
                    onCreateLoanForCustomer(customer);
                  }}
                >
                  <PlusCircle size={16} />
                  <span>Nuevo Empeño</span>
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Eye,
  PlusCircle,
  Trash2
} from 'lucide-react';
import { usePawn } from '../../context/PawnContext';
import type { Customer, CustomerTrafficColor, UserRole } from '../../types';
import { getCustomerRatingMeta } from '../../utils/customerRating';

interface CustomerListProps {
  onSelectCustomer: (customer: Customer) => void;
  onOpenNewCustomer: () => void;
  onCreateLoanForCustomer: (customer: Customer) => void;
  userRole?: UserRole;
}

export const CustomerList: React.FC<CustomerListProps> = ({
  onSelectCustomer,
  onOpenNewCustomer,
  onCreateLoanForCustomer,
  userRole = 'ADMIN'
}) => {
  const { customers, loans, deleteCustomer, showDialog, requestAdminAuth } = usePawn();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>('TODOS');
  const isAdmin = userRole === 'ADMIN';

  const filteredCustomers = customers.filter(c => {
    const custLoans = loans.filter(l => l.customerId === c.id);
    const matchesSearch = 
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.dni.includes(searchTerm) ||
      c.phone.includes(searchTerm) ||
      custLoans.some(l => 
        l.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
        l.receiptCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
    if (!matchesSearch) return false;

    if (selectedColor === 'TODOS') return true;
    return (c.trafficColor || 'VERDE') === selectedColor;
  });

  const getTrafficBadge = (color: CustomerTrafficColor = 'VERDE') => {
    const rating = getCustomerRatingMeta(color);
    return (
      <span style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '6px', 
        backgroundColor: rating.bgColor, 
        color: rating.color, 
        border: `2px solid ${rating.borderColor}`, 
        padding: '5px 12px', 
        borderRadius: '8px', 
        fontWeight: 800, 
        fontSize: '0.9rem' 
      }}>
        {color === 'VERDE' && <CheckCircle2 size={16} color="#34d399" />}
        {color === 'AMARILLO' && <Clock size={16} color="#fbbf24" />}
        {color === 'ROJO' && <AlertTriangle size={16} color="#f87171" />}
        <span>{rating.label}</span>
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF' }}>
            Directorio de Clientes
          </h2>
          <p style={{ color: '#CBD5E1', fontSize: '1rem', marginTop: '4px' }}>
            Calificación por cumplimiento: Cliente Excelente, Cliente Regular y Cliente Malo.
          </p>
        </div>

        <button 
          className="btn btn-yellow" 
          onClick={onOpenNewCustomer}
          style={{ fontSize: '1.1rem', padding: '12px 22px' }}
        >
          <Plus size={22} />
          <span>+ REGISTRAR CLIENTE</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="card" style={{ padding: '20px', backgroundColor: '#131f37' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1', minWidth: '280px' }}>
            <Search 
              size={20} 
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1' }} 
            />
            <input
              type="text"
              className="input-control"
              placeholder="Buscar por Nombre, CI, Teléfono o Código de Contrato (ej. A1)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '44px', fontSize: '1.05rem' }}
            />
          </div>

          {/* Traffic Light Filter Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'TODOS', label: 'Todos' },
              { id: 'VERDE', label: '🟢 Clientes Excelentes' },
              { id: 'AMARILLO', label: '🟡 Clientes Regulares' },
              { id: 'ROJO', label: '🔴 Clientes Malos' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedColor(tab.id)}
                className={`btn ${selectedColor === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.95rem', padding: '10px 16px' }}
              >
                {tab.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Customers Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '18px' }}>
        {filteredCustomers.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 20px' }}>
            <Users size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: '1.2rem', color: '#FFFFFF', marginBottom: '6px' }}>No se encontraron clientes</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Intente cambiar los términos de búsqueda o el filtro de color.
            </p>
          </div>
        ) : (
          filteredCustomers.map((customer) => {
            const customerLoans = loans.filter(l => l.customerId === customer.id);
            const activeLoans = customerLoans.filter(l => l.status === 'VIGENTE' || l.status === 'POR_VENCER' || l.status === 'EN_MORA');
            const color = customer.trafficColor || 'VERDE';

            return (
              <div 
                key={customer.id} 
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  backgroundColor: '#131f37',
                  border: `2px solid ${color === 'VERDE' ? '#10b981' : color === 'AMARILLO' ? '#f59e0b' : '#ef4444'}`
                }}
              >
                {/* Header */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', flexWrap: 'wrap' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
                        {customer.fullName}
                      </h3>
                      <span className="font-mono" style={{ fontSize: '0.95rem', color: '#f59e0b', fontWeight: 700 }}>
                        Carnet / DNI: {customer.dni}
                      </span>
                    </div>
                    {getTrafficBadge(color)}
                  </div>

                  {/* Contact Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', color: '#cbd5e1' }}>
                      <Phone size={16} color="#3b82f6" />
                      <span>{customer.phone}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', color: '#cbd5e1' }}>
                      <MapPin size={16} color="#f59e0b" />
                      <span>{customer.address}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: '#94a3b8' }}>
                      <Calendar size={14} />
                      <span>Registrado: {new Date(customer.registeredAt).toLocaleDateString('es-PE')}</span>
                    </div>

                    {/* Contratos asociados al cliente */}
                    {customerLoans.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                        <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 700 }}>Contrato(s):</span>
                        {customerLoans.map(l => (
                          <span 
                            key={l.id}
                            style={{
                              backgroundColor: l.status === 'PAGADO' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                              color: l.status === 'PAGADO' ? '#34d399' : '#f59e0b',
                              border: `1.5px solid ${l.status === 'PAGADO' ? '#10b981' : '#f59e0b'}`,
                              borderRadius: '6px',
                              padding: '2px 8px',
                              fontSize: '0.82rem',
                              fontWeight: 800,
                              fontFamily: 'monospace'
                            }}
                          >
                            {l.code}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Metrics */}
                <div 
                  style={{
                    background: '#091020',
                    borderRadius: '10px',
                    padding: '14px',
                    border: '1px solid #2d4573',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    textAlign: 'center'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'block' }}>Préstamos</span>
                    <strong style={{ fontSize: '1.15rem', color: '#FFFFFF' }}>
                      {customer.totalLoansCount} ({activeLoans.length} activos)
                    </strong>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'block' }}>Total Pagado</span>
                    <strong style={{ fontSize: '1.15rem', color: '#34d399' }}>
                      Bs. {customer.totalPaidAmount.toLocaleString('es-PE')}
                    </strong>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                  <button 
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '10px' }}
                    onClick={() => onSelectCustomer(customer)}
                  >
                    <Eye size={18} />
                    <span>Ver Perfil</span>
                  </button>

                  <button 
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '10px' }}
                    onClick={() => onCreateLoanForCustomer(customer)}
                  >
                    <PlusCircle size={18} />
                    <span>Empeñar</span>
                  </button>

                  {isAdmin && (
                    <button
                      className="btn btn-danger"
                      style={{ padding: '10px 14px' }}
                      title="Eliminar cliente"
                      onClick={() => {
                        requestAdminAuth({
                          title: 'Eliminar Cliente',
                          message: `¿Está seguro de eliminar al cliente "${customer.fullName}"?\n\nEsta acción es irreversible y borrará su registro.\nPor favor ingrese su código de Administrador para confirmar:`,
                          confirmLabel: 'Confirmar y Eliminar',
                          onSuccess: () => {
                            const res = deleteCustomer(customer.id);
                            if (!res.success) {
                              showDialog({
                                type: 'danger',
                                title: 'No se pudo eliminar',
                                message: res.message || 'Error al eliminar cliente'
                              });
                            } else {
                              showDialog({
                                type: 'success',
                                title: 'Cliente Eliminado',
                                message: 'Cliente eliminado correctamente con autorización de Administrador.'
                              });
                            }
                          }
                        });
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};


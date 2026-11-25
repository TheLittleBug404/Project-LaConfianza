import React, { useState } from 'react';
import { 
  Vault, 
  Search, 
  Coins, 
  Laptop, 
  Wrench, 
  Car, 
  Tv, 
  Package, 
  MapPin, 
  Eye
} from 'lucide-react';
import { usePawn } from '../../context/PawnContext';
import type { PawnLoan, CollateralCategory } from '../../types';

interface VaultInventoryProps {
  onSelectLoan: (loan: PawnLoan) => void;
}

export const VaultInventory: React.FC<VaultInventoryProps> = ({ onSelectLoan }) => {
  const { loans } = usePawn();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');
  const [selectedStatus, setSelectedStatus] = useState<string>('EN_CUSTODIA');

  const filteredItems = loans.filter(l => {
    const item = l.item;
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.serialNumber && item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.code && item.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.storageLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.customerDni.includes(searchTerm) ||
      l.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.receiptCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.items && l.items.some(it => 
        it.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (it.code && it.code.toLowerCase().includes(searchTerm.toLowerCase()))
      ));

    if (!matchesSearch) return false;
    if (selectedCategory !== 'TODAS' && item.category !== selectedCategory) return false;
    if (selectedStatus !== 'TODOS' && item.status !== selectedStatus) return false;

    return true;
  });

  const getCategoryIcon = (category: CollateralCategory) => {
    switch (category) {
      case 'JOYERIA_ORO':
      case 'JOYERIA_PLATA':
        return <Coins size={18} color="#F59E0B" />;
      case 'ELECTRONICA':
        return <Laptop size={18} color="#3B82F6" />;
      case 'HERRAMIENTAS':
        return <Wrench size={18} color="#10B981" />;
      case 'VEHICULOS':
        return <Car size={18} color="#8B5CF6" />;
      case 'ELECTRODOMESTICOS':
        return <Tv size={18} color="#EC4899" />;
      default:
        return <Package size={18} color="#94A3B8" />;
    }
  };

  const inCustodyCount = loans.filter(l => l.item.status === 'EN_CUSTODIA').length;
  const inAuctionCount = loans.filter(l => l.item.status === 'EN_REMATE').length;
  const returnedCount = loans.filter(l => l.item.status === 'DEVUELTA').length;
  const totalValuation = filteredItems.reduce((sum, l) => sum + l.item.appraisalValue, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF' }}>
            Almacén & Inventario de Prendas
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Control físico de artículos en custodia, ubicación en garajes/estanterías y prendas para remate.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Valuación Total:</span>
            <strong style={{ fontSize: '1.1rem', color: '#10B981' }}>
              Bs. {totalValuation.toLocaleString('es-BO')}
            </strong>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div style={{ position: 'relative', flex: '1', minWidth: '280px' }}>
            <Search 
              size={18} 
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
            />
            <input
              type="text"
              className="input-control"
              placeholder="Buscar por Código de Contrato (ej. A1), Prenda, Cliente, CI o Ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'TODAS', label: 'Todas' },
              { id: 'VEHICULOS', label: '🚗 Vehículos' },
              { id: 'JOYERIA_ORO', label: 'Oro' },
              { id: 'JOYERIA_PLATA', label: 'Plata' },
              { id: 'ELECTRONICA', label: 'Electrónica' },
              { id: 'HERRAMIENTAS', label: 'Herramientas' },
              { id: 'ELECTRODOMESTICOS', label: 'Electrodomésticos' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`btn btn-sm ${selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'EN_CUSTODIA', label: `En Almacén (${inCustodyCount})` },
              { id: 'EN_REMATE', label: `En Remate (${inAuctionCount})` },
              { id: 'DEVUELTA', label: `Devueltas (${returnedCount})` },
              { id: 'TODOS', label: 'Todas' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`btn btn-sm ${selectedStatus === tab.id ? 'btn-primary' : 'btn-secondary'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Grid of Pawn Items */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '18px' }}>
        {filteredItems.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 20px' }}>
            <Vault size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: '1.1rem', color: '#FFFFFF', marginBottom: '6px' }}>No hay prendas en este filtro</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Cambia la categoría o el estado de custodia seleccionado.
            </p>
          </div>
        ) : (
          filteredItems.map(loan => {
            const item = loan.item;
            const isVehicle = item.category === 'VEHICULOS';

            return (
              <div 
                key={item.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px',
                  borderTop: item.status === 'EN_REMATE' ? '4px solid #8B5CF6' :
                             item.status === 'EN_CUSTODIA' ? '4px solid #F59E0B' : '4px solid #64748B',
                  borderColor: isVehicle ? 'rgba(245, 158, 11, 0.3)' : undefined
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ padding: '6px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
                        {getCategoryIcon(item.category)}
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {item.category.replace('_', ' ')}
                      </span>
                    </div>

                    <span 
                      className="badge"
                      style={{
                        background: item.status === 'EN_CUSTODIA' ? 'rgba(245, 158, 11, 0.15)' : 
                                    item.status === 'EN_REMATE' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                        color: item.status === 'EN_CUSTODIA' ? '#FBBF24' : 
                               item.status === 'EN_REMATE' ? '#C084FC' : '#94A3B8',
                        border: '1px solid currentColor'
                      }}
                    >
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', marginTop: '10px' }}>
                    {item.name}
                  </h3>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                    {item.description}
                  </p>

                  {/* Garaje Especial para Vehículos */}
                  {isVehicle ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(245, 158, 11, 0.12))',
                      border: '1.5px solid var(--secondary)',
                      borderRadius: 'var(--radius-md)',
                      marginTop: '12px',
                      marginBottom: '6px'
                    }}>
                      <Car size={22} color="var(--secondary)" style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: 'block', fontSize: '0.68rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          📍 Ubicación del Garaje / Parqueo:
                        </span>
                        <strong style={{ color: '#FFFFFF', fontSize: '0.88rem', wordBreak: 'break-word' }}>
                          {item.storageLocation}
                        </strong>
                      </div>
                    </div>
                  ) : null}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: isVehicle ? '6px' : '12px', fontSize: '0.82rem' }}>
                    {!isVehicle && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                        <MapPin size={13} color="var(--primary)" />
                        <span>Ubicación: <strong style={{ color: '#F1F5F9' }}>{item.storageLocation}</strong></span>
                      </div>
                    )}
                    {item.serialNumber && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {isVehicle ? 'Placa / Chasis / VIN:' : 'Serie / ID:'}{' '}
                        <span className="font-mono" style={{ color: '#FBBF24', fontWeight: 600 }}>{item.serialNumber}</span>
                      </div>
                    )}
                    
                    {/* Ficha de Pertenencia del Cliente y Código de Contrato */}
                    <div style={{
                      marginTop: '6px',
                      padding: '8px 10px',
                      background: '#091020',
                      border: '1.5px solid #2d4573',
                      borderRadius: '8px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700 }}>Pertenece al Cliente:</span>
                        <span style={{ 
                          fontSize: '0.78rem', 
                          fontWeight: 800, 
                          color: '#f59e0b', 
                          backgroundColor: 'rgba(245, 158, 11, 0.15)',
                          border: '1px solid #f59e0b',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontFamily: 'monospace' 
                        }}>
                          Contrato N° {loan.code}
                        </span>
                      </div>
                      <strong style={{ color: '#ffffff', fontSize: '0.92rem', display: 'block', marginTop: '2px' }}>
                        {loan.customerName}
                      </strong>
                      <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>CI / DNI: {loan.customerDni}</span>
                    </div>
                  </div>
                </div>

                {/* Valuation & Loan summary */}
                <div 
                  style={{
                    background: 'var(--bg-main)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Tasación Real</span>
                    <strong style={{ fontSize: '1rem', color: '#10B981' }}>
                      Bs. {item.appraisalValue.toLocaleString('es-BO')}
                    </strong>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Préstamo ({loan.code})</span>
                    <strong style={{ fontSize: '0.95rem', color: '#FBBF24' }}>
                      Bs. {loan.remainingCapital.toLocaleString('es-BO')}
                    </strong>
                  </div>
                </div>

                <button 
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%' }}
                  onClick={() => onSelectLoan(loan)}
                >
                  <Eye size={14} />
                  <span>Ver Contrato y Opciones</span>
                </button>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

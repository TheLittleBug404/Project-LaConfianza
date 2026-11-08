import React, { useState } from 'react';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Phone, 
  Clock, 
  FileText, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  Calendar
} from 'lucide-react';
import { usePawn } from '../../context/PawnContext';
import { EmployeeModal } from './EmployeeModal';
import type { Employee } from '../../types';

export const EmployeeList: React.FC = () => {
  const { employees, deleteEmployee } = usePawn();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const filteredEmployees = employees.filter(emp =>
    emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.dni.includes(searchTerm) ||
    emp.phone.includes(searchTerm) ||
    emp.primaryDuties.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenCreate = () => {
    setSelectedEmployee(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setSelectedEmployee(emp);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = (emp: Employee) => {
    if (window.confirm(`¿Está seguro de eliminar al empleado "${emp.fullName}" (CI: ${emp.dni})?\n\nEsta acción no se puede deshacer.`)) {
      deleteEmployee(emp.id);
      alert('Empleado eliminado correctamente.');
    }
  };

  const totalPayroll = employees
    .filter(e => e.status === 'ACTIVO')
    .reduce((sum, e) => sum + e.salary, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Briefcase size={28} color="#f59e0b" />
            <span>Gestión de Personal y Empleados</span>
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '1rem', marginTop: '4px' }}>
            Administración de sueldos, horarios de trabajo y tareas obligatorias asignadas a cada empleado.
          </p>
        </div>

        <button 
          className="btn btn-yellow" 
          onClick={handleOpenCreate}
          style={{ fontSize: '1.05rem', padding: '12px 22px' }}
        >
          <Plus size={20} />
          <span>+ AÑADIR NUEVO EMPLEADO</span>
        </button>
      </div>

      {/* Resumen Superior de Nómina */}
      <div className="grid-3">
        <div className="card" style={{ padding: '20px', backgroundColor: '#131f37', border: '2px solid #3b82f6' }}>
          <span style={{ fontSize: '0.9rem', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
            Total de Empleados Registrados
          </span>
          <h3 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff' }}>
            {employees.length}
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#93c5fd', marginTop: '4px' }}>
            {employees.filter(e => e.status === 'ACTIVO').length} activos en funciones
          </p>
        </div>

        <div className="card" style={{ padding: '20px', backgroundColor: '#064e3b', border: '2px solid #10b981' }}>
          <span style={{ fontSize: '0.9rem', color: '#d1fae5', display: 'block', marginBottom: '6px' }}>
            Gasto Total en Sueldos Mensuales
          </span>
          <h3 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff' }}>
            Bs. {totalPayroll.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#a7f3d0', marginTop: '4px' }}>
            Planilla mensual de empleados activos
          </p>
        </div>

        <div className="card" style={{ padding: '20px', backgroundColor: '#131f37', border: '2px solid #f59e0b' }}>
          <span style={{ fontSize: '0.9rem', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
            Rol en el Sistema
          </span>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fde047' }}>
            Acceso Operativo
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '4px' }}>
            Los empleados solo atienden empeños y tienen restringidos clientes morosos
          </p>
        </div>
      </div>

      {/* Buscador */}
      <div className="card" style={{ padding: '16px 20px', backgroundColor: '#131f37' }}>
        <div style={{ position: 'relative' }}>
          <Search 
            size={20} 
            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1' }} 
          />
          <input
            type="text"
            className="input-control"
            placeholder="Buscar empleado por nombre, Carnet (CI), teléfono o funciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '44px', fontSize: '1.05rem' }}
          />
        </div>
      </div>

      {/* Listado de Empleados en Cuadrícula Responsiva */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}>
        {filteredEmployees.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 20px', backgroundColor: '#131f37' }}>
            <Briefcase size={48} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '6px' }}>No se encontraron empleados</h4>
            <p style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>
              Presione "+ AÑADIR NUEVO EMPLEADO" para registrar personal a su cargo.
            </p>
          </div>
        ) : (
          filteredEmployees.map((emp) => (
            <div 
              key={emp.id} 
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                backgroundColor: '#131f37',
                border: emp.status === 'ACTIVO' ? '2px solid #2d4573' : '2px solid #475569',
                padding: '22px'
              }}
            >
              {/* Header de la tarjeta */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                      {emp.fullName}
                    </h3>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '4px', flexWrap: 'wrap' }}>
                      <span className="font-mono" style={{ fontSize: '0.95rem', color: '#f59e0b', fontWeight: 700 }}>
                        CI: {emp.dni}
                      </span>
                      <span style={{ fontSize: '0.95rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={14} color="#3b82f6" /> {emp.phone}
                      </span>
                    </div>
                  </div>

                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    backgroundColor: emp.status === 'ACTIVO' ? '#064e3b' : '#334155',
                    color: emp.status === 'ACTIVO' ? '#34d399' : '#94a3b8',
                    border: `1px solid ${emp.status === 'ACTIVO' ? '#10b981' : '#64748b'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {emp.status === 'ACTIVO' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    {emp.status}
                  </span>
                </div>

                {/* Sueldo Destacado */}
                <div style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  backgroundColor: '#091020',
                  border: '1px solid #2d4573',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '0.95rem', color: '#cbd5e1' }}>Sueldo Mensual a Pagar:</span>
                  <strong style={{ fontSize: '1.35rem', color: '#34d399', fontWeight: 900 }}>
                    Bs. {emp.salary.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </strong>
                </div>

                {/* Horarios de Trabajo */}
                <div style={{ marginTop: '14px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <Clock size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <span style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>
                      Horarios de Trabajo:
                    </span>
                    <span style={{ fontSize: '0.95rem', color: '#ffffff', fontWeight: 600 }}>
                      {emp.workSchedule}
                    </span>
                  </div>
                </div>

                {/* Lo más necesario que debe hacer */}
                <div style={{ marginTop: '14px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <FileText size={18} color="#fde047" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <span style={{ fontSize: '0.82rem', color: '#fde047', display: 'block', fontWeight: 800, textTransform: 'uppercase' }}>
                      Lo más necesario que debe hacer:
                    </span>
                    <p style={{ fontSize: '0.92rem', color: '#e2e8f0', marginTop: '3px', lineHeight: 1.4 }}>
                      {emp.primaryDuties}
                    </p>
                  </div>
                </div>

                {emp.notes && (
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '10px', fontStyle: 'italic' }}>
                    Nota: {emp.notes}
                  </p>
                )}

                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={13} />
                  <span>Contratado: {new Date(emp.createdAt).toLocaleDateString('es-PE')}</span>
                </div>
              </div>

              {/* Botones de Acción */}
              <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #1e2e4f' }}>
                <button
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '10px' }}
                  onClick={() => handleOpenEdit(emp)}
                >
                  <Edit3 size={16} />
                  <span>Editar Empleado</span>
                </button>

                <button
                  className="btn btn-danger"
                  style={{ padding: '10px 14px' }}
                  title="Eliminar empleado"
                  onClick={() => handleDelete(emp)}
                >
                  <Trash2 size={16} />
                  <span>Eliminar</span>
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Modal para Crear / Editar Empleado */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employee={selectedEmployee}
        mode={modalMode}
      />

    </div>
  );
};

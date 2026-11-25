import React, { useState, useEffect } from 'react';
import { X, UserCheck, DollarSign, Clock, FileText, Phone, Award } from 'lucide-react';
import { usePawn } from '../../context/PawnContext';
import type { Employee } from '../../types';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee?: Employee | null;
  mode: 'create' | 'edit';
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  onClose,
  employee,
  mode
}) => {
  const { addEmployee, updateEmployee, showDialog } = usePawn();

  const [formData, setFormData] = useState<{
    fullName: string;
    dni: string;
    phone: string;
    salary: number;
    workSchedule: string;
    primaryDuties: string;
    notes: string;
    status: 'ACTIVO' | 'INACTIVO';
  }>({
    fullName: '',
    dni: '',
    phone: '',
    salary: 2500,
    workSchedule: 'Lunes a Viernes de 8:30 a 18:00, Sábados de 8:30 a 13:00',
    primaryDuties: '',
    notes: '',
    status: 'ACTIVO',
  });

  useEffect(() => {
    if (employee && mode === 'edit') {
      setFormData({
        fullName: employee.fullName,
        dni: employee.dni,
        phone: employee.phone,
        salary: employee.salary,
        workSchedule: employee.workSchedule,
        primaryDuties: employee.primaryDuties,
        notes: employee.notes || '',
        status: employee.status,
      });
    } else {
      setFormData({
        fullName: '',
        dni: '',
        phone: '',
        salary: 2500,
        workSchedule: 'Lunes a Viernes de 8:30 a 18:00, Sábados de 8:30 a 13:00',
        primaryDuties: '',
        notes: '',
        status: 'ACTIVO',
      });
    }
  }, [employee, mode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.dni.trim() || !formData.phone.trim()) {
      showDialog({
        type: 'warning',
        title: 'Campos requeridos',
        message: 'Nombre, Carnet de Identidad (CI) y Teléfono son requeridos.'
      });
      return;
    }
    if (!formData.workSchedule.trim()) {
      showDialog({
        type: 'warning',
        title: 'Horario requerido',
        message: 'Debe especificar el horario de trabajo del empleado.'
      });
      return;
    }
    if (!formData.primaryDuties.trim()) {
      showDialog({
        type: 'warning',
        title: 'Tareas requeridas',
        message: 'Debe especificar las tareas principales y lo más necesario que debe hacer el empleado.'
      });
      return;
    }

    if (mode === 'create') {
      addEmployee({
        fullName: formData.fullName.trim(),
        dni: formData.dni.trim(),
        phone: formData.phone.trim(),
        salary: Number(formData.salary) || 0,
        workSchedule: formData.workSchedule.trim(),
        primaryDuties: formData.primaryDuties.trim(),
        notes: formData.notes.trim(),
        status: formData.status,
      });
      showDialog({
        type: 'success',
        title: 'Empleado Registrado',
        message: 'Empleado registrado exitosamente.'
      });
      onClose();
    } else if (mode === 'edit' && employee) {
      updateEmployee(employee.id, {
        fullName: formData.fullName.trim(),
        dni: formData.dni.trim(),
        phone: formData.phone.trim(),
        salary: Number(formData.salary) || 0,
        workSchedule: formData.workSchedule.trim(),
        primaryDuties: formData.primaryDuties.trim(),
        notes: formData.notes.trim(),
        status: formData.status,
      });
      showDialog({
        type: 'success',
        title: 'Empleado Actualizado',
        message: 'Datos del empleado actualizados correctamente.'
      });
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '680px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserCheck size={26} color="#f59e0b" />
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                {mode === 'create' ? 'Registrar Nuevo Empleado' : 'Editar Datos del Empleado'}
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#cbd5e1' }}>
                Establezca sueldo, horarios de atención y funciones obligatorias del puesto.
              </p>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Nombres y Carnet */}
          <div className="grid-2">
            <div className="input-group">
              <label className="input-label">Nombres y Apellidos Completos *</label>
              <input
                type="text"
                required
                className="input-control"
                placeholder="Ej. Roberto Gómez Flores"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Carnet de Identidad (CI / DNI) *</label>
              <input
                type="text"
                required
                className="input-control font-mono"
                placeholder="Ej. 61829304"
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
              />
            </div>
          </div>

          {/* Teléfono y Sueldo */}
          <div className="grid-2">
            <div className="input-group">
              <label className="input-label">Teléfono / Celular de Contacto *</label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  required
                  className="input-control"
                  style={{ paddingLeft: '40px' }}
                  placeholder="Ej. 71234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label" style={{ color: '#34d399', fontWeight: 800 }}>
                Sueldo / Cuánto le pagará mensual (Bs.) *
              </label>
              <div style={{ position: 'relative' }}>
                <DollarSign size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#34d399' }} />
                <input
                  type="number"
                  min="0"
                  step="50"
                  required
                  className="input-control"
                  style={{ paddingLeft: '40px', fontSize: '1.2rem', fontWeight: 800, color: '#34d399' }}
                  placeholder="2500"
                  value={formData.salary || ''}
                  onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          {/* Horarios de Trabajo */}
          <div className="input-group">
            <label className="input-label" style={{ color: '#f59e0b', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} />
              <span>Horarios de Trabajo *</span>
            </label>
            <input
              type="text"
              required
              className="input-control"
              placeholder="Ej. Lunes a Viernes de 8:30 a 18:00, Sábados de 8:30 a 13:00"
              value={formData.workSchedule}
              onChange={(e) => setFormData({ ...formData, workSchedule: e.target.value })}
            />
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Especifique los días y rangos horarios exactos en los que debe cumplir su turno.
            </span>
          </div>

          {/* Lo más necesario que debe hacer este empleado */}
          <div className="input-group">
            <label className="input-label" style={{ color: '#fde047', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={16} />
              <span>Lo Más Necesario que Debe Hacer (Tareas y Funciones Clave) *</span>
            </label>
            <textarea
              required
              className="input-control"
              rows={4}
              placeholder="Describa aquí lo que debe cumplir este empleado (Ej. Atención en ventanilla, recepción y custodia de joyas, tasación de prendas, llamadas de cobranza, orden de almacén...)"
              value={formData.primaryDuties}
              onChange={(e) => setFormData({ ...formData, primaryDuties: e.target.value })}
            />
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Instrucciones indispensables para que el empleado conozca sus responsabilidades diarias.
            </span>
          </div>

          {/* Estado y Notas */}
          <div className="grid-2">
            <div className="input-group">
              <label className="input-label">Estado del Empleado</label>
              <select
                className="input-control"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVO' | 'INACTIVO' })}
              >
                <option value="ACTIVO">ACTIVO (En funciones)</option>
                <option value="INACTIVO">INACTIVO (Suspendido / Retirado)</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Observaciones Adicionales (Opcional)</label>
              <input
                type="text"
                className="input-control"
                placeholder="Ej. Empleado de confianza, turno mañana..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer" style={{ margin: '14px -24px -24px', padding: '16px 24px', backgroundColor: '#0f1a30' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-yellow">
              <Award size={18} />
              <span>{mode === 'create' ? 'Contratar / Guardar Empleado' : 'Guardar Cambios'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};


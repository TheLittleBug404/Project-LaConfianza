/**
 * Esquema de Base de Datos para el Sistema de Empeños
 * Estructura de 12 Tablas 100% compatible con Supabase (PostgreSQL) e IndexedDB
 * Base limpia: solo roles y usuarios de acceso para pruebas reales.
 */

import type { 
  Customer, 
  Employee, 
  PawnLoan, 
  PaymentTransaction,
  SystemRole,
  ItemCategoryRecord,
  PledgeItem,
  AppraisalHistoryRecord,
  LoanPaymentSchedule,
  CashierSessionRecord,
  AuctionItemRecord,
  AppConfigRecord
} from '../types';

export const DB_CONFIG = {
  NAME: 'NellyPawnShop_DB',
  VERSION: 3, // Forzar reinicio limpio
  STORES: {
    ROLES: 'roles',
    EMPLOYEES: 'empleados',
    CUSTOMERS: 'clientes',
    CATEGORIES: 'categorias_prenda',
    ITEMS: 'prendas',
    APPRAISALS: 'tasaciones_historial',
    LOANS: 'prestamos',
    PAYMENT_SCHEDULES: 'plan_pagos',
    CASHIER_SESSIONS: 'caja_sesiones',
    PAYMENTS: 'pagos',
    AUCTIONS: 'remates',
    CONFIG: 'configuracion',
  }
} as const;

export type { AppConfigRecord };

// 1. Roles Base
export const SEED_ROLES: SystemRole[] = [
  {
    id: 'rol-admin',
    nombre: 'ADMINISTRADOR',
    descripcion: 'Acceso total a la administración, empleados, presupuestos y auditoría.',
    creadoEl: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'rol-empleado',
    nombre: 'EMPLEADO',
    descripcion: 'Atención en ventanilla, registro de prendas y cobro de caja.',
    creadoEl: '2026-01-01T00:00:00.000Z'
  }
];

// 2. Personal autorizado para ingresar (Admin y Empleado)
export const SEED_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    rolId: 'rol-admin',
    fullName: 'Administrador General',
    dni: '10000001',
    phone: '70000001',
    salary: 4000,
    workSchedule: 'Lunes a Viernes de 8:30 a 18:00',
    primaryDuties: 'Gestión total del negocio, autorización de préstamos y configuración.',
    notes: 'Usuario Administrador principal.',
    rol: 'ADMIN',
    status: 'ACTIVO',
    createdAt: new Date().toISOString()
  },
  {
    id: 'emp-2',
    rolId: 'rol-empleado',
    fullName: 'Empleado de Ventanilla',
    dni: '20000002',
    phone: '70000002',
    salary: 2800,
    workSchedule: 'Lunes a Viernes de 9:00 a 17:30',
    primaryDuties: 'Recepción de clientes, registro de empeños y cobro de cuotas en caja.',
    notes: 'Usuario Empleado operador.',
    rol: 'EMPLEADO',
    status: 'ACTIVO',
    createdAt: new Date().toISOString()
  }
];

// 3. Clientes vacíos para pruebas
export const SEED_CUSTOMERS: Customer[] = [];

// 4. Categorías de Prenda Base
export const SEED_CATEGORIES: ItemCategoryRecord[] = [
  { id: 'cat-joyeria-oro', nombre: 'JOYERIA_ORO', porcentajeMaxPrestamo: 65, descripcion: 'Oro 14k, 18k, 24k' },
  { id: 'cat-joyeria-plata', nombre: 'JOYERIA_PLATA', porcentajeMaxPrestamo: 50, descripcion: 'Plata 925' },
  { id: 'cat-electronica', nombre: 'ELECTRONICA', porcentajeMaxPrestamo: 45, descripcion: 'Laptops, Smart TVs, Teléfonos' },
  { id: 'cat-herramientas', nombre: 'HERRAMIENTAS', porcentajeMaxPrestamo: 40, descripcion: 'Taladros y maquinaria' },
  { id: 'cat-vehiculos', nombre: 'VEHICULOS', porcentajeMaxPrestamo: 50, descripcion: 'Motos y autos' },
  { id: 'cat-electrodomesticos', nombre: 'ELECTRODOMESTICOS', porcentajeMaxPrestamo: 35, descripcion: 'Línea blanca' },
  { id: 'cat-otros', nombre: 'OTROS', porcentajeMaxPrestamo: 30, descripcion: 'Varios' }
];

// 5. Prendas vacías
export const SEED_ITEMS: PledgeItem[] = [];

// 6. Tasaciones vacías
export const SEED_APPRAISALS: AppraisalHistoryRecord[] = [];

// 7. Préstamos vacíos
export const SEED_LOANS: PawnLoan[] = [];

// 8. Cronogramas vacíos
export const SEED_SCHEDULES: LoanPaymentSchedule[] = [];

// 9. Sesión de caja inicial
export const SEED_CASHIER_SESSIONS: CashierSessionRecord[] = [
  {
    id: 'ses-hoy',
    empleadoId: 'emp-1',
    fechaOperacion: new Date().toISOString().split('T')[0],
    saldoApertura: 5000,
    totalIngresos: 0,
    totalEgresos: 0,
    saldoCierreTeorico: 5000,
    diferenciaCuadre: 0,
    estado: 'ABIERTA',
    abiertoEl: new Date().toISOString()
  }
];

// 10. Pagos vacíos
export const SEED_PAYMENTS: PaymentTransaction[] = [];

// 11. Remates vacíos
export const SEED_AUCTIONS: AuctionItemRecord[] = [];

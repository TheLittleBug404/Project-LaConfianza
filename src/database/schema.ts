/**
 * Esquema de Base de Datos para el Sistema de Empeños
 * Diseñado para ser 100% compatible con Supabase (PostgreSQL)
 */

import type { 
  Customer, 
  Employee, 
  PawnLoan, 
  PaymentTransaction 
} from '../types';

export const DB_CONFIG = {
  NAME: 'NellyPawnShop_DB',
  VERSION: 1,
  STORES: {
    CUSTOMERS: 'customers',
    EMPLOYEES: 'employees',
    LOANS: 'loans',
    PAYMENTS: 'payments',
    CONFIG: 'app_config',
  }
} as const;

export interface AppConfigRecord {
  key: string;
  value: any;
  updatedAt: string;
}

// 4 Clientes de Ejemplo oficiales representativos para la Base de Datos Local
export const SEED_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    dni: '72384910',
    fullName: 'Carlos Mendoza Rivera',
    phone: '71234567',
    email: 'carlos.mendoza@gmail.com',
    address: 'Calle Bolívar 120, Zona Central',
    registeredAt: '2024-02-15T10:00:00.000Z',
    category: 'VIP',
    trafficColor: 'VERDE', // Cliente Excelente
    creditScore: 98,
    notes: 'Cliente muy puntual. Siempre refrenda antes de fecha y cuida sus prendas.',
    totalLoansCount: 8,
    activeLoansCount: 1,
    totalPaidAmount: 14500,
    totalBorrowedAmount: 18000,
    defaultedLoansCount: 0,
  },
  {
    id: 'cust-2',
    dni: '45192837',
    fullName: 'María Elena Vargas Solís',
    phone: '76543210',
    email: 'maria.vargas@hotmail.com',
    address: 'Av. 6 de Agosto 430, Edif. Los Pinos',
    registeredAt: '2024-08-10T14:30:00.000Z',
    category: 'ANTIGUO',
    trafficColor: 'AMARILLO', // Cliente Regular
    creditScore: 78,
    notes: 'Cliente regular. Suele pedir 3 a 5 días de prórroga pero termina pagando los intereses.',
    totalLoansCount: 4,
    activeLoansCount: 1,
    totalPaidAmount: 5200,
    totalBorrowedAmount: 6400,
    defaultedLoansCount: 0,
  },
  {
    id: 'cust-3',
    dni: '78291044',
    fullName: 'Kevin Alexander Quispe',
    phone: '68123456',
    email: 'kevin.quispe@outlook.com',
    address: 'Calle San Martín 880, Int. 4',
    registeredAt: '2026-03-01T11:20:00.000Z',
    category: 'NUEVO',
    trafficColor: 'VERDE', // Cliente Excelente Nuevo
    creditScore: 82,
    notes: 'Cliente nuevo. Empeñó laptop gaming en excelente estado, comprobante verificado.',
    totalLoansCount: 1,
    activeLoansCount: 1,
    totalPaidAmount: 0,
    totalBorrowedAmount: 1800,
    defaultedLoansCount: 0,
  },
  {
    id: 'cust-4',
    dni: '38291023',
    fullName: 'Jorge Luis Mamani Choque',
    phone: '79812345',
    email: 'jorgeluis.mamani@gmail.com',
    address: 'Villa Victoria, Calle 3 Nº 412',
    registeredAt: '2025-01-20T16:00:00.000Z',
    category: 'MOROSO',
    trafficColor: 'ROJO', // Cliente Malo
    creditScore: 25,
    notes: 'Cliente moroso crítico. Retraso superior a 45 días sin pagar refrendo ni responder llamadas.',
    totalLoansCount: 3,
    activeLoansCount: 1,
    totalPaidAmount: 600,
    totalBorrowedAmount: 3500,
    defaultedLoansCount: 1,
  }
];

// 2 Empleados de Ejemplo oficiales
export const SEED_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    fullName: 'Roberto Gómez Flores',
    dni: '61829304',
    phone: '71234567',
    salary: 3200,
    workSchedule: 'Lunes a Viernes de 8:30 a 17:30, Sábados de 8:30 a 13:00',
    primaryDuties: 'Atención en ventanilla, recepción y tasación de joyas, registro de clientes nuevos y emisión de boletas de empeño.',
    notes: 'Encargado de apertura y custodia de caja menor.',
    status: 'ACTIVO',
    createdAt: '2026-01-10T08:00:00.000Z'
  },
  {
    id: 'emp-2',
    fullName: 'Lucía Fernández Quispe',
    dni: '59281043',
    phone: '68921450',
    salary: 2800,
    workSchedule: 'Lunes a Viernes de 9:00 a 18:00',
    primaryDuties: 'Custodia y organización de prendas en bóveda, control de inventario físico, llamadas de cortesía por vencimientos próximos.',
    notes: 'Turno tarde y archivo de pólizas.',
    status: 'ACTIVO',
    createdAt: '2026-02-01T09:00:00.000Z'
  }
];

// Préstamos de Ejemplo vinculados a los clientes
export const SEED_LOANS: PawnLoan[] = [
  {
    id: 'loan-1',
    code: 'A1',
    receiptCode: 'A1',
    customerId: 'cust-1',
    customerName: 'Carlos Mendoza Rivera',
    customerDni: '72384910',
    customerAddress: 'Calle Bolívar 120, Zona Central',
    customerPhone: '71234567',
    item: {
      id: 'item-1',
      code: 'PRD-001201',
      category: 'JOYERIA_ORO',
      name: 'Anillo de Oro 18k con Diamante 0.25ct',
      description: 'Anillo solitario de compromiso, 4.2 gramos, grabado interior C&M.',
      condition: 'EXCELENTE',
      appraisalValue: 4200,
      storageLocation: 'Bóveda A - Casillero 04',
      status: 'EN_CUSTODIA',
    },
    loanAmount: 2500,
    remainingCapital: 2500,
    monthlyInterestRate: 3,
    adminExpensesRate: 12,
    adminExpensesAmount: 300,
    termDays: 30,
    termMonths: 1,
    startDate: new Date(Date.now() - 10 * 86400000).toISOString(),
    dueDate: new Date(Date.now() + 20 * 86400000).toISOString(),
    gracePeriodDays: 5,
    status: 'VIGENTE',
    totalInterestPaid: 0,
    totalCapitalPaid: 0,
    notes: 'Prenda resguardada con seguro en bóveda principal.'
  },
  {
    id: 'loan-2',
    code: 'A2',
    receiptCode: 'A2',
    customerId: 'cust-2',
    customerName: 'María Elena Vargas Solís',
    customerDni: '45192837',
    customerAddress: 'Av. 6 de Agosto 430, Edif. Los Pinos',
    customerPhone: '76543210',
    item: {
      id: 'item-2',
      code: 'PRD-001202',
      category: 'ELECTRONICA',
      name: 'Smart TV Samsung 55" QLED 4K',
      description: 'Modelo QN55Q60B con control remoto original y cable de poder.',
      serialNumber: 'SN-SAMS-99824',
      condition: 'BUENO',
      appraisalValue: 2400,
      storageLocation: 'Estante B2 - Almacén Electrónica',
      status: 'EN_CUSTODIA',
    },
    loanAmount: 1400,
    remainingCapital: 1400,
    monthlyInterestRate: 3,
    adminExpensesRate: 12,
    adminExpensesAmount: 168,
    termDays: 60,
    termMonths: 2,
    startDate: new Date(Date.now() - 58 * 86400000).toISOString(),
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
    gracePeriodDays: 5,
    status: 'POR_VENCER',
    totalInterestPaid: 42,
    totalCapitalPaid: 0,
    notes: 'Vence en 2 días. Cliente fue contactada para refrendo.'
  },
  {
    id: 'loan-3',
    code: 'A3',
    receiptCode: 'A3',
    customerId: 'cust-4',
    customerName: 'Jorge Luis Mamani Choque',
    customerDni: '38291023',
    customerAddress: 'Villa Victoria, Calle 3 Nº 412',
    customerPhone: '79812345',
    item: {
      id: 'item-3',
      code: 'PRD-001203',
      category: 'HERRAMIENTAS',
      name: 'Taladro Percutor Industrial Bosch 800W',
      description: 'Incluye maletín original y juego de 15 brocas para concreto.',
      serialNumber: 'BSH-IND-7712',
      condition: 'REGULAR',
      appraisalValue: 1800,
      storageLocation: 'Estante C1 - Taller',
      status: 'EN_CUSTODIA',
    },
    loanAmount: 1100,
    remainingCapital: 1100,
    monthlyInterestRate: 3,
    adminExpensesRate: 12,
    adminExpensesAmount: 132,
    termDays: 30,
    termMonths: 1,
    startDate: new Date(Date.now() - 48 * 86400000).toISOString(),
    dueDate: new Date(Date.now() - 18 * 86400000).toISOString(),
    gracePeriodDays: 5,
    status: 'EN_MORA',
    totalInterestPaid: 0,
    totalCapitalPaid: 0,
    notes: '18 días de mora. Se enviará a remate si no liquida en 12 días.'
  },
  {
    id: 'loan-4',
    code: 'A4',
    receiptCode: 'A4',
    customerId: 'cust-3',
    customerName: 'Kevin Alexander Quispe',
    customerDni: '78291044',
    customerAddress: 'Calle San Martín 880, Int. 4',
    customerPhone: '68123456',
    item: {
      id: 'item-4',
      code: 'PRD-001204',
      category: 'ELECTRONICA',
      name: 'Laptop Lenovo Legion 5 Gaming 16GB RAM',
      description: 'Procesador AMD Ryzen 7, RTX 3060, cargador original de 230W.',
      serialNumber: 'PF-39A208B',
      condition: 'EXCELENTE',
      appraisalValue: 3200,
      storageLocation: 'Bóveda Principal - Casillero E2',
      status: 'EN_CUSTODIA',
    },
    loanAmount: 1800,
    remainingCapital: 1800,
    monthlyInterestRate: 3,
    adminExpensesRate: 12,
    adminExpensesAmount: 216,
    termDays: 30,
    termMonths: 1,
    startDate: new Date(Date.now() - 5 * 86400000).toISOString(),
    dueDate: new Date(Date.now() + 25 * 86400000).toISOString(),
    gracePeriodDays: 5,
    status: 'VIGENTE',
    totalInterestPaid: 0,
    totalCapitalPaid: 0,
    notes: 'Nuevo empeño de cliente Kevin Alexander.'
  }
];

// Movimientos de Caja de Ejemplo
export const SEED_PAYMENTS: PaymentTransaction[] = [
  {
    id: 'pay-1',
    loanId: 'loan-1',
    loanCode: 'A1',
    customerId: 'cust-1',
    customerName: 'Carlos Mendoza Rivera',
    type: 'DESEMBOLSO_INICIAL',
    amount: 2500,
    capitalPortion: 2500,
    interestPortion: 0,
    date: new Date(Date.now() - 10 * 86400000).toISOString(),
    paymentMethod: 'EFECTIVO',
    receiptCode: 'A1',
    notes: 'Desembolso inicial por empeño de anillo de oro.'
  },
  {
    id: 'pay-2',
    loanId: 'loan-2',
    loanCode: 'A2',
    customerId: 'cust-2',
    customerName: 'María Elena Vargas Solís',
    type: 'PAGO_INTERES_REFRENDO',
    amount: 42,
    capitalPortion: 0,
    interestPortion: 42,
    date: new Date(Date.now() - 28 * 86400000).toISOString(),
    paymentMethod: 'EFECTIVO',
    receiptCode: 'REC-0982',
    notes: 'Pago de interés para prórroga de Smart TV.'
  },
  {
    id: 'pay-3',
    loanId: 'loan-4',
    loanCode: 'A4',
    customerId: 'cust-3',
    customerName: 'Kevin Alexander Quispe',
    type: 'DESEMBOLSO_INICIAL',
    amount: 1800,
    capitalPortion: 1800,
    interestPortion: 0,
    date: new Date(Date.now() - 5 * 86400000).toISOString(),
    paymentMethod: 'EFECTIVO',
    receiptCode: 'A4',
    notes: 'Desembolso inicial por empeño de laptop gaming.'
  }
];


export type CustomerTrafficColor = 'VERDE' | 'AMARILLO' | 'ROJO';

export type CustomerCategory = 'NUEVO' | 'ANTIGUO' | 'VIP' | 'MOROSO';

export type CollateralCategory = 
  | 'JOYERIA_ORO' 
  | 'JOYERIA_PLATA' 
  | 'ELECTRONICA' 
  | 'HERRAMIENTAS' 
  | 'VEHICULOS' 
  | 'ELECTRODOMESTICOS' 
  | 'OTROS';

export type ItemCondition = 'EXCELENTE' | 'BUENO' | 'REGULAR' | 'DESGASTE_NORMAL';

export type LoanStatus = 
  | 'VIGENTE' 
  | 'POR_VENCER' 
  | 'EN_MORA' 
  | 'PAGADO' 
  | 'REMATADO';

export type PaymentType = 
  | 'PAGO_INTERES_REFRENDO' 
  | 'ABONO_CAPITAL' 
  | 'LIQUIDACION_TOTAL' 
  | 'DESEMBOLSO_INICIAL';

export interface Customer {
  id: string;
  dni: string;
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  registeredAt: string; // ISO date
  category: CustomerCategory;
  trafficColor: CustomerTrafficColor; // Verde = Paga a tiempo, Amarillo = Regular, Rojo = Nunca paga / Mora
  creditScore: number; // 1 to 100
  notes?: string;
  totalLoansCount: number;
  activeLoansCount: number;
  totalPaidAmount: number;
  totalBorrowedAmount: number;
  defaultedLoansCount: number;
}

export interface PledgeItem {
  id: string;
  code?: string; // Código único de prenda en BD (ej: PRD-2026-0884)
  category: CollateralCategory;
  name: string;
  description: string;
  serialNumber?: string;
  condition: ItemCondition;
  appraisalValue: number; // Valor de tasación / avalúo real
  storageLocation: string; // Ej. Bóveda A-12, Estante 4
  photos?: string[];
  status: 'EN_CUSTODIA' | 'DEVUELTA' | 'EN_REMATE' | 'VENDIDA';
}

export interface PawnLoan {
  id: string;
  code: string; // Ej: A1, A2, A3...
  receiptCode: string; // Código de recibo correlativo: A1..A1000, B1..B1000
  customerId: string;
  customerName: string;
  customerDni: string;
  customerAddress?: string;
  customerPhone?: string;
  item: PledgeItem;
  
  // Términos Financieros
  loanAmount: number; // Capital prestado
  remainingCapital: number; // Capital adeudado
  monthlyInterestRate: number; // % mensual de interés (por defecto 3%)
  adminExpensesRate?: number; // % mensual de gastos administrativos/custodia (ej: 12%)
  adminExpensesAmount?: number; // Monto en Bs. de gastos
  termDays?: number; // Plazo en días (30, 60, 90, 120...)
  termMonths: number; // Duración pactada en meses
  startDate: string;
  dueDate: string; // Fecha de vencimiento
  gracePeriodDays: number; // Días de gracia
  status: LoanStatus;
  
  // Histórico
  totalInterestPaid: number;
  totalCapitalPaid: number;
  lastPaymentDate?: string;
  closedAt?: string;
  notes?: string;
}

export interface PaymentTransaction {
  id: string;
  loanId: string;
  loanCode: string;
  customerId: string;
  customerName: string;
  type: PaymentType;
  amount: number;
  capitalPortion: number;
  interestPortion: number;
  date: string;
  paymentMethod: 'EFECTIVO' | 'TRANSFERENCIA' | 'QR';
  receiptCode: string;
  notes?: string;
  newDueDate?: string;
}

export interface FinancialStats {
  totalCapitalActive: number; // Capital en la calle
  totalVaultAppraisal: number; // Valor de prendas en bóveda
  totalInterestEarned: number; // Intereses acumulados
  totalLoansCount: number;
  activeLoansCount: number;
  dueSoonCount: number;
  overdueCount: number;
  totalCustomersCount: number;
  defaultRate: number; // % morosidad
  // Nuevos campos solicitados por Administrador
  monthlyLendingBudget: number; // Bolsa total para prestar en el mes
  monthlyLendedAmount: number; // Dinero prestado este mes
  monthlyRemainingBudget: number; // Saldo que aún se puede prestar
  totalLossesInDefault: number; // Dinero comprometido en mora/pérdida
  greenCustomersCount: number; // Clientes que pagan puntual (Verde)
  yellowCustomersCount: number; // Clientes regulares (Amarillo)
  redCustomersCount: number; // Clientes morosos (Rojo)
}

export type UserRole = 'ADMIN' | 'EMPLEADO';

export interface Employee {
  id: string;
  fullName: string;
  dni: string;
  phone: string;
  salary: number; // Sueldo mensual en Bs.
  workSchedule: string; // Horario de trabajo
  primaryDuties: string; // Lo más necesario que debe hacer / funciones del puesto
  notes?: string;
  status: 'ACTIVO' | 'INACTIVO';
  createdAt: string;
}

export interface UserSession {
  authenticated: boolean;
  username: string;
  role: UserRole;
  timestamp: number;
}

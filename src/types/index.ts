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

export type UserRole = 'ADMIN' | 'EMPLEADO';

// 1. Roles
export interface SystemRole {
  id: string;
  nombre: string;
  descripcion?: string;
  creadoEl?: string;
}

// 2. Empleados
export interface Employee {
  id: string;
  rolId?: string;
  fullName: string;
  dni: string;
  phone: string;
  salary: number; // Sueldo mensual en Bs.
  workSchedule: string; // Horario de trabajo
  primaryDuties: string; // Lo más necesario que debe hacer / funciones del puesto
  notes?: string;
  rol?: UserRole;
  status: 'ACTIVO' | 'INACTIVO';
  createdAt: string;
}

// 3. Clientes
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

// 4. Categorías de Prenda
export interface ItemCategoryRecord {
  id: string;
  nombre: CollateralCategory;
  porcentajeMaxPrestamo: number;
  descripcion?: string;
}

// 5. Prenda
export interface PledgeItem {
  id: string;
  code?: string; // Código único de prenda en BD (ej: PRD-2026-0884)
  categoriaId?: string;
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

// 6. Historial de Tasaciones
export interface AppraisalHistoryRecord {
  id: string;
  prendaId: string;
  tasadorId?: string;
  valorComercial: number;
  prestamoSugerido: number;
  fechaTasacion: string;
  observaciones?: string;
}

// 7. Préstamos
export interface PawnLoan {
  id: string;
  code: string; // Ej: A1, A2, A3...
  receiptCode: string; // Código de recibo correlativo: A1..A1000, B1..B1000
  customerId: string;
  prendaId?: string;
  empleadoId?: string; // Quien autorizó
  customerName: string;
  customerDni: string;
  customerAddress?: string;
  customerPhone?: string;
  item: PledgeItem;
  items?: PledgeItem[]; // Lista de todas las prendas registradas (1, 2, 3 o más prendas)
  
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

// 8. Plan de Pagos / Cuotas
export interface LoanPaymentSchedule {
  id: string;
  prestamoId: string;
  numeroPeriodo: number;
  fechaLimitePago: string;
  montoInteres: number;
  estadoCuota: 'PENDIENTE' | 'PAGADO' | 'MORA';
  pagadoEl?: string;
}

// 9. Sesión de Caja Diaria
export interface CashierSessionRecord {
  id: string;
  empleadoId: string;
  fechaOperacion: string;
  saldoApertura: number;
  totalIngresos: number;
  totalEgresos: number;
  saldoCierreTeorico: number;
  saldoCierreReal?: number;
  diferenciaCuadre: number;
  estado: 'ABIERTA' | 'CERRADA';
  abiertoEl: string;
  cerradoEl?: string;
  observaciones?: string;
}

// 10. Pagos / Movimientos
export interface PaymentTransaction {
  id: string;
  sesionCajaId?: string;
  loanId: string;
  loanCode: string;
  customerId: string;
  empleadoId?: string;
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

// 11. Remates
export interface AuctionItemRecord {
  id: string;
  prendaId: string;
  prestamoOrigenId?: string;
  capitalAdeudado: number;
  precioBaseSubasta: number;
  precioVentaFinal?: number;
  fechaIngresoRemate: string;
  fechaVenta?: string;
  compradorNombre?: string;
  estadoRemate: 'EN_VITRINA' | 'VENDIDO' | 'FUNDICION';
  observaciones?: string;
}

// 12. Configuración
export interface AppConfigRecord {
  key: string;
  value: any;
  updatedAt: string;
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
  monthlyLendingBudget: number; // Bolsa total para prestar en el mes
  monthlyLendedAmount: number; // Dinero prestado este mes
  monthlyRemainingBudget: number; // Saldo que aún se puede prestar
  totalLossesInDefault: number; // Dinero comprometido en mora/pérdida
  greenCustomersCount: number; // Clientes que pagan puntual (Verde)
  yellowCustomersCount: number; // Clientes regulares (Amarillo)
  redCustomersCount: number; // Clientes morosos (Rojo)
}

export interface UserSession {
  authenticated: boolean;
  username: string;
  role: UserRole;
  timestamp: number;
}

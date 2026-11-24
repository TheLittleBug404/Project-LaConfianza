import type { Customer, Employee, PawnLoan, PaymentTransaction } from '../types';
import { 
  SEED_CUSTOMERS, 
  SEED_EMPLOYEES, 
  SEED_LOANS, 
  SEED_PAYMENTS 
} from '../database/schema';
import { localDb } from '../database/localDb';
import { supabase } from '../database/supabaseClient';

const STORAGE_KEYS = {
  CUSTOMERS: 'nelly_pawn_customers',
  LOANS: 'nelly_pawn_loans',
  PAYMENTS: 'nelly_pawn_payments',
  BUDGET: 'nelly_pawn_monthly_budget',
  EMPLOYEES: 'nelly_pawn_employees',
};

// Conversor de clientes entre Supabase (snake_case) y TypeScript (camelCase)
const mapDbToCustomer = (row: any): Customer => ({
  id: row.id,
  dni: row.dni,
  fullName: row.nombre_completo || row.fullName || '',
  phone: row.telefono || row.phone || '',
  email: row.email,
  address: row.direccion || row.address || '',
  registeredAt: row.fecha_registro || row.registeredAt || new Date().toISOString(),
  category: row.categoria || row.category || 'NUEVO',
  trafficColor: row.color_trafico || row.trafficColor || 'VERDE',
  creditScore: row.puntuacion_credito ?? row.creditScore ?? 80,
  totalLoansCount: row.total_prestamos ?? row.totalLoansCount ?? 0,
  activeLoansCount: row.prestamos_activos ?? row.activeLoansCount ?? 0,
  totalPaidAmount: Number(row.total_pagado ?? row.totalPaidAmount ?? 0),
  totalBorrowedAmount: Number(row.total_prestado ?? row.totalBorrowedAmount ?? 0),
  defaultedLoansCount: row.prestamos_default ?? row.defaultedLoansCount ?? 0,
  notes: row.observaciones || row.notes || ''
});

const mapCustomerToDb = (c: Customer) => ({
  id: c.id,
  dni: c.dni,
  nombre_completo: c.fullName,
  telefono: c.phone,
  email: c.email || null,
  direccion: c.address,
  fecha_registro: c.registeredAt,
  categoria: c.category,
  color_trafico: c.trafficColor,
  puntuacion_credito: c.creditScore,
  total_prestamos: c.totalLoansCount,
  prestamos_activos: c.activeLoansCount,
  total_pagado: c.totalPaidAmount,
  total_prestado: c.totalBorrowedAmount,
  prestamos_default: c.defaultedLoansCount,
  observaciones: c.notes || null
});

// Conversor de empleados
const mapDbToEmployee = (row: any): Employee => ({
  id: row.id,
  rolId: row.rol_id,
  fullName: row.nombre_completo || row.fullName || '',
  dni: row.dni,
  phone: row.telefono || row.phone || '',
  salary: Number(row.salario ?? row.salary ?? 0),
  workSchedule: row.horario_trabajo || row.workSchedule || '',
  primaryDuties: row.tareas_principales || row.primaryDuties || '',
  notes: row.observaciones || row.notes || '',
  rol: row.rol || 'EMPLEADO',
  status: row.estado || row.status || 'ACTIVO',
  createdAt: row.creado_el || row.createdAt || new Date().toISOString()
});

const mapEmployeeToDb = (e: Employee) => ({
  id: e.id,
  rol_id: e.rolId || (e.rol === 'ADMIN' ? 'rol-admin' : 'rol-empleado'),
  nombre_completo: e.fullName,
  dni: e.dni,
  telefono: e.phone,
  salario: e.salary,
  horario_trabajo: e.workSchedule,
  tareas_principales: e.primaryDuties,
  observaciones: e.notes || null,
  rol: e.rol || 'EMPLEADO',
  estado: e.status || 'ACTIVO',
  creado_el: e.createdAt
});

// Conversor de préstamos
const mapDbToLoan = (row: any): PawnLoan => ({
  id: row.id,
  code: row.codigo || row.code,
  receiptCode: row.codigo_recibo || row.receiptCode,
  customerId: row.cliente_id || row.customerId,
  prendaId: row.prenda_id || row.item?.id,
  empleadoId: row.empleado_id,
  customerName: row.nombre_cliente || row.customerName,
  customerDni: row.dni_cliente || row.customerDni,
  customerAddress: row.direccion_cliente || row.customerAddress,
  customerPhone: row.telefono_cliente || row.customerPhone,
  item: {
    id: row.prenda_id || 'item-' + row.id,
    code: row.codigo_recibo,
    category: row.categoria_prenda || 'OTROS',
    name: row.nombre_prenda || 'Artículo empeñado',
    description: row.descripcion_prenda || '',
    serialNumber: row.numero_serie,
    condition: row.condicion_prenda || 'BUENO',
    appraisalValue: Number(row.valor_tasacion || row.monto_prestamo || 0),
    storageLocation: row.ubicacion_almacen || 'Bóveda General',
    status: row.estado_prenda || 'EN_CUSTODIA'
  },
  loanAmount: Number(row.monto_prestamo || 0),
  remainingCapital: Number(row.capital_restante ?? row.monto_prestamo ?? 0),
  monthlyInterestRate: Number(row.tasa_interes_mensual ?? 3),
  adminExpensesRate: Number(row.tasa_gastos_admin ?? 12),
  adminExpensesAmount: Number(row.gastos_admin ?? 0),
  termDays: Number(row.dias_plazo ?? 30),
  termMonths: Number(row.meses_plazo ?? 1),
  startDate: row.fecha_inicio || new Date().toISOString(),
  dueDate: row.fecha_vencimiento,
  gracePeriodDays: Number(row.dias_gracia ?? 5),
  status: row.estado || 'VIGENTE',
  totalInterestPaid: Number(row.total_intereses_pagados ?? 0),
  totalCapitalPaid: Number(row.total_capital_pagado ?? 0),
  notes: row.observaciones || row.notes || ''
});

const mapLoanToDb = (l: PawnLoan) => ({
  id: l.id,
  codigo: l.code,
  codigo_recibo: l.receiptCode,
  cliente_id: l.customerId,
  prenda_id: l.item?.id || l.prendaId || ('item-' + l.id),
  empleado_id: l.empleadoId || null,
  nombre_cliente: l.customerName,
  dni_cliente: l.customerDni,
  direccion_cliente: l.customerAddress || null,
  telefono_cliente: l.customerPhone || null,
  categoria_prenda: l.item?.category || 'OTROS',
  nombre_prenda: l.item?.name || 'Prenda',
  descripcion_prenda: l.item?.description || null,
  numero_serie: l.item?.serialNumber || null,
  condicion_prenda: l.item?.condition || 'BUENO',
  valor_tasacion: l.item?.appraisalValue || l.loanAmount,
  ubicacion_almacen: l.item?.storageLocation || 'Bóveda Principal',
  estado_prenda: l.item?.status || 'EN_CUSTODIA',
  monto_prestamo: l.loanAmount,
  capital_restante: l.remainingCapital,
  tasa_interes_mensual: l.monthlyInterestRate,
  tasa_gastos_admin: l.adminExpensesRate || 12,
  gastos_admin: l.adminExpensesAmount || 0,
  dias_plazo: l.termDays || 30,
  meses_plazo: l.termMonths || 1,
  fecha_inicio: l.startDate,
  fecha_vencimiento: l.dueDate,
  dias_gracia: l.gracePeriodDays || 5,
  estado: l.status,
  total_intereses_pagados: l.totalInterestPaid || 0,
  total_capital_pagado: l.totalCapitalPaid || 0,
  observaciones: l.notes || null
});

// Conversor de pagos
const mapDbToPayment = (row: any): PaymentTransaction => ({
  id: row.id,
  sesionCajaId: row.sesion_caja_id,
  loanId: row.prestamo_id || row.loanId,
  loanCode: row.codigo_prestamo || row.loanCode || '',
  customerId: row.cliente_id || row.customerId || '',
  empleadoId: row.empleado_id,
  customerName: row.nombre_cliente || row.customerName || '',
  type: row.tipo || row.type,
  amount: Number(row.monto ?? row.amount ?? 0),
  capitalPortion: Number(row.porcion_capital ?? row.capitalPortion ?? 0),
  interestPortion: Number(row.porcion_interes ?? row.interestPortion ?? 0),
  date: row.fecha || row.date || new Date().toISOString(),
  paymentMethod: row.metodo_pago || row.paymentMethod || 'EFECTIVO',
  receiptCode: row.codigo_recibo || row.receiptCode || '',
  notes: row.observaciones || row.notes || ''
});

const mapPaymentToDb = (p: PaymentTransaction) => ({
  id: p.id,
  sesion_caja_id: p.sesionCajaId || null,
  prestamo_id: p.loanId || null,
  cliente_id: p.customerId || null,
  empleado_id: p.empleadoId || null,
  codigo_prestamo: p.loanCode,
  nombre_cliente: p.customerName,
  tipo: p.type,
  monto: p.amount,
  porcion_capital: p.capitalPortion,
  porcion_interes: p.interestPortion,
  fecha: p.date,
  metodo_pago: p.paymentMethod,
  codigo_recibo: p.receiptCode,
  observaciones: p.notes || null
});

export const StorageService = {
  // Clientes
  getCustomers: (): Customer[] => {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(SEED_CUSTOMERS));
      localDb.saveCustomers(SEED_CUSTOMERS);
      return SEED_CUSTOMERS;
    }
    try {
      return JSON.parse(raw) as Customer[];
    } catch {
      return SEED_CUSTOMERS;
    }
  },

  fetchCustomersAsync: async (): Promise<Customer[]> => {
    try {
      const { data, error } = await supabase.from('clientes').select('*');
      if (error || !data) {
        return StorageService.getCustomers();
      }
      const mapped = data.map(mapDbToCustomer);
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(mapped));
      localDb.saveCustomers(mapped);
      return mapped;
    } catch (err) {
      console.warn('Fallo al conectar con Supabase, usando respaldo local:', err);
      return StorageService.getCustomers();
    }
  },

  saveCustomers: async (customers: Customer[]) => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    localDb.saveCustomers(customers);

    // Sincronizar en segundo plano con Supabase con log de depuración
    try {
      const dbPayload = customers.map(mapCustomerToDb);
      const { data, error } = await supabase.from('clientes').upsert(dbPayload, { onConflict: 'id' }).select();
      if (error) {
        console.error('❌ Error al guardar en Supabase (clientes):', error.message, error.details || '');
      } else {
        console.log('✅ Cliente sincronizado en Supabase con éxito:', data);
      }
    } catch (err) {
      console.error('❌ Excepción conectando con Supabase:', err);
    }
  },

  // Préstamos
  getLoans: (): PawnLoan[] => {
    const raw = localStorage.getItem(STORAGE_KEYS.LOANS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(SEED_LOANS));
      localDb.saveLoans(SEED_LOANS);
      return SEED_LOANS;
    }
    try {
      const parsed: PawnLoan[] = JSON.parse(raw);
      return parsed.map((l, idx) => ({
        ...l,
        receiptCode: l.receiptCode || l.code || `A${idx + 1}`
      }));
    } catch {
      return SEED_LOANS;
    }
  },

  fetchLoansAsync: async (): Promise<PawnLoan[]> => {
    try {
      const { data, error } = await supabase.from('prestamos').select('*');
      if (error || !data) {
        return StorageService.getLoans();
      }
      const mapped = data.map(mapDbToLoan);
      localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(mapped));
      localDb.saveLoans(mapped);
      return mapped;
    } catch (err) {
      console.warn('Fallo al conectar con Supabase (préstamos), usando respaldo local:', err);
      return StorageService.getLoans();
    }
  },

  saveLoans: (loans: PawnLoan[]) => {
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
    localDb.saveLoans(loans);

    // Sincronizar prendas y préstamos con Supabase
    const dbPayload = loans.map(mapLoanToDb);
    supabase.from('prestamos').upsert(dbPayload).then(({ error }) => {
      if (error) console.warn('Aviso sincronizando préstamos con Supabase:', error.message);
    });
  },

  // Pagos y Movimientos
  getPayments: (): PaymentTransaction[] => {
    const raw = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(SEED_PAYMENTS));
      localDb.savePayments(SEED_PAYMENTS);
      return SEED_PAYMENTS;
    }
    try {
      return JSON.parse(raw) as PaymentTransaction[];
    } catch {
      return SEED_PAYMENTS;
    }
  },

  fetchPaymentsAsync: async (): Promise<PaymentTransaction[]> => {
    try {
      const { data, error } = await supabase.from('pagos').select('*');
      if (error || !data) {
        return StorageService.getPayments();
      }
      const mapped = data.map(mapDbToPayment);
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(mapped));
      localDb.savePayments(mapped);
      return mapped;
    } catch (err) {
      console.warn('Fallo al conectar con Supabase (pagos), usando respaldo local:', err);
      return StorageService.getPayments();
    }
  },

  savePayments: (payments: PaymentTransaction[]) => {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
    localDb.savePayments(payments);

    const dbPayload = payments.map(mapPaymentToDb);
    supabase.from('pagos').upsert(dbPayload).then(({ error }) => {
      if (error) console.warn('Aviso sincronizando pagos con Supabase:', error.message);
    });
  },

  // Empleados
  getEmployees: (): Employee[] => {
    const raw = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(SEED_EMPLOYEES));
      localDb.saveEmployees(SEED_EMPLOYEES);
      return SEED_EMPLOYEES;
    }
    try {
      const parsed: Employee[] = JSON.parse(raw);
      return parsed.length === 0 ? SEED_EMPLOYEES : parsed;
    } catch {
      return SEED_EMPLOYEES;
    }
  },

  fetchEmployeesAsync: async (): Promise<Employee[]> => {
    try {
      const { data, error } = await supabase.from('empleados').select('*');
      if (error || !data || data.length === 0) {
        return StorageService.getEmployees();
      }
      const mapped = data.map(mapDbToEmployee);
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(mapped));
      localDb.saveEmployees(mapped);
      return mapped;
    } catch (err) {
      console.warn('Fallo al conectar con Supabase (empleados), usando respaldo local:', err);
      return StorageService.getEmployees();
    }
  },

  saveEmployees: (employees: Employee[]) => {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    localDb.saveEmployees(employees);

    const dbPayload = employees.map(mapEmployeeToDb);
    supabase.from('empleados').upsert(dbPayload).then(({ error }) => {
      if (error) console.warn('Aviso sincronizando empleados con Supabase:', error.message);
    });
  },

  // Fondo Mensual
  getMonthlyBudget: (): number => {
    const raw = localStorage.getItem(STORAGE_KEYS.BUDGET);
    if (!raw) {
      const defaultBudget = 50000;
      localStorage.setItem(STORAGE_KEYS.BUDGET, defaultBudget.toString());
      localDb.setConfig('monthly_budget', defaultBudget);
      return defaultBudget;
    }
    const parsed = parseFloat(raw);
    return isNaN(parsed) || parsed <= 0 ? 50000 : parsed;
  },

  fetchMonthlyBudgetAsync: async (): Promise<number> => {
    try {
      const { data, error } = await supabase.from('configuracion').select('valor').eq('clave', 'monthly_budget').single();
      if (!error && data && data.valor) {
        const val = Number(data.valor);
        localStorage.setItem(STORAGE_KEYS.BUDGET, val.toString());
        localDb.setConfig('monthly_budget', val);
        return val;
      }
      return StorageService.getMonthlyBudget();
    } catch {
      return StorageService.getMonthlyBudget();
    }
  },

  saveMonthlyBudget: (amount: number) => {
    localStorage.setItem(STORAGE_KEYS.BUDGET, amount.toString());
    localDb.setConfig('monthly_budget', amount);

    supabase.from('configuracion').upsert({
      clave: 'monthly_budget',
      valor: amount,
      actualizado_el: new Date().toISOString()
    }).then(({ error }) => {
      if (error) console.warn('Aviso sincronizando presupuesto con Supabase:', error.message);
    });
  },

  // Restablecer Base de Datos Local
  resetDefaults: () => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(SEED_CUSTOMERS));
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(SEED_LOANS));
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(SEED_PAYMENTS));
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(SEED_EMPLOYEES));
    localStorage.setItem(STORAGE_KEYS.BUDGET, '50000');

    localDb.seedInitialData();

    return { 
      customers: SEED_CUSTOMERS, 
      loans: SEED_LOANS, 
      payments: SEED_PAYMENTS, 
      employees: SEED_EMPLOYEES 
    };
  },

  // Exportar copia de seguridad
  exportBackup: async () => {
    return await localDb.exportBackup();
  }
};

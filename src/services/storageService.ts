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
  ADMIN_PASSWORD: 'nelly_pawn_admin_password',
};

// Categorías oficiales en Supabase para integridad de llaves foráneas
const SEED_CATEGORIAS = [
  { id: 'cat-joyeria-oro', nombre: 'JOYERIA_ORO', porcentaje_max_prestamo: 65, descripcion: 'Joyas de oro 14k, 18k y 24k' },
  { id: 'cat-joyeria-plata', nombre: 'JOYERIA_PLATA', porcentaje_max_prestamo: 50, descripcion: 'Joyas y orfebrería en plata 925' },
  { id: 'cat-electronica', nombre: 'ELECTRONICA', porcentaje_max_prestamo: 45, descripcion: 'Laptops, televisores, consolas y smartphones' },
  { id: 'cat-herramientas', nombre: 'HERRAMIENTAS', porcentaje_max_prestamo: 40, descripcion: 'Maquinaria y herramientas eléctricas profesionales' },
  { id: 'cat-vehiculos', nombre: 'VEHICULOS', porcentaje_max_prestamo: 50, descripcion: 'Automóviles y motocicletas con documentación en regla' },
  { id: 'cat-otros', nombre: 'OTROS', porcentaje_max_prestamo: 40, descripcion: 'Otros artículos de valor' }
];

const CATEGORY_MAP: Record<string, string> = {
  'JOYERIA_ORO': 'cat-joyeria-oro',
  'JOYERIA_PLATA': 'cat-joyeria-plata',
  'ELECTRODOMESTICOS': 'cat-electronica',
  'LINEA_BLANCA': 'cat-electronica',
  'TECNOLOGIA': 'cat-electronica',
  'HERRAMIENTAS': 'cat-herramientas',
  'VEHICULOS': 'cat-vehiculos',
  'MAQUINARIA': 'cat-herramientas',
  'INSTRUMENTOS_MUSICALES': 'cat-otros',
  'RELOJES_ALTA_GAMA': 'cat-joyeria-oro',
  'OTROS': 'cat-otros'
};

let categoriasSeeded = false;

const ensureCategoriasSeeded = async () => {
  if (categoriasSeeded) return;
  try {
    const { error } = await supabase.from('categorias_prenda').upsert(SEED_CATEGORIAS, { onConflict: 'id' });
    if (!error) {
      categoriasSeeded = true;
    } else {
      console.warn('Aviso asegurando categorias_prenda:', error.message);
    }
  } catch (err) {
    console.warn('Aviso asegurando categorias_prenda:', err);
  }
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
    // Desduplicar clientes por DNI en memoria antes de persistir
    const uniqueByDni = new Map<string, Customer>();
    customers.forEach(c => {
      const cleanDni = c.dni ? c.dni.trim().toLowerCase() : c.id;
      uniqueByDni.set(cleanDni, c);
    });
    const sanitizedCustomers = Array.from(uniqueByDni.values());

    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(sanitizedCustomers));
    localDb.saveCustomers(sanitizedCustomers);

    try {
      const dbPayload = sanitizedCustomers.map(mapCustomerToDb);
      const { data, error } = await supabase.from('clientes').upsert(dbPayload, { onConflict: 'id' }).select();
      if (error) {
        console.error('❌ Error al guardar en Supabase (clientes):', error.message, error.details || '');
        // Si hay conflicto con clave única DNI (código 23505), reconciliar IDs con los existentes en Supabase
        if (error.message?.includes('clientes_dni_key') || error.code === '23505') {
          const { data: remoteData } = await supabase.from('clientes').select('id, dni');
          if (remoteData && remoteData.length > 0) {
            const remoteMap = new Map(remoteData.map(r => [r.dni?.trim().toLowerCase(), r.id]));
            const reconciled = dbPayload.map(c => {
              const cleanDni = c.dni ? c.dni.trim().toLowerCase() : '';
              return {
                ...c,
                id: remoteMap.get(cleanDni) || c.id
              };
            });
            const { error: retryErr } = await supabase.from('clientes').upsert(reconciled, { onConflict: 'id' });
            if (!retryErr) {
              console.log('✅ Clientes reconciliados con IDs de Supabase y sincronizados con éxito');
            }
          }
        }
      } else {
        console.log('✅ Cliente sincronizado en Supabase con éxito:', data);
      }
    } catch (err) {
      console.error('❌ Excepción conectando con Supabase:', err);
    }
  },

  deleteCustomer: async (id: string) => {
    const current = StorageService.getCustomers().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(current));
    localDb.saveCustomers(current);

    try {
      const { error } = await supabase.from('clientes').delete().eq('id', id);
      if (error) {
        console.error('❌ Error eliminando cliente en Supabase:', error.message, error.details || '');
      } else {
        console.log('✅ Cliente eliminado de Supabase con éxito:', id);
      }
    } catch (err) {
      console.error('❌ Excepción eliminando cliente en Supabase:', err);
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

  saveLoans: async (loans: PawnLoan[]) => {
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
    localDb.saveLoans(loans);

    try {
      // 0. Asegurar categorías base para integridad referencial de prendas
      await ensureCategoriasSeeded();

      // 1. Primero asegurar que las prendas existan en la tabla prendas (integridad referencial)
      // Se guardan todas las prendas (individuales o múltiples por préstamo)
      const prendasPayload: any[] = [];
      loans.forEach(l => {
        if (l.items && l.items.length > 0) {
          l.items.forEach((it, idx) => {
            const catId = CATEGORY_MAP[it.category] || 'cat-joyeria-oro';
            const cleanItemId = it.id || `item-${l.id}-${idx}`;
            // Código de prenda garantizado único con prefijo PRD-, NUNCA usar l.code (que es A1, A2...)
            const cleanCode = (it.code && it.code.startsWith('PRD-'))
              ? it.code
              : `PRD-${cleanItemId.replace(/^item-/, '')}`;
            prendasPayload.push({
              id: cleanItemId,
              codigo: cleanCode,
              categoria_id: catId,
              nombre: it.name || 'Prenda en Garantía',
              descripcion: it.description || null,
              numero_serie: it.serialNumber || null,
              condicion: it.condition || 'BUENO',
              valor_tasacion: it.appraisalValue || 0,
              ubicacion_almacen: it.storageLocation || 'Bóveda Principal',
              estado_prenda: it.status || 'EN_CUSTODIA'
            });
          });
        } else if (l.item) {
          const catId = CATEGORY_MAP[l.item.category] || 'cat-joyeria-oro';
          const cleanItemId = l.item.id || l.prendaId || ('item-' + l.id);
          const cleanCode = (l.item.code && l.item.code.startsWith('PRD-'))
            ? l.item.code
            : `PRD-${cleanItemId.replace(/^item-/, '')}`;
          prendasPayload.push({
            id: cleanItemId,
            codigo: cleanCode,
            categoria_id: catId,
            nombre: l.item.name || 'Prenda en Garantía',
            descripcion: l.item.description || null,
            numero_serie: l.item.serialNumber || null,
            condicion: l.item.condition || 'BUENO',
            valor_tasacion: l.item.appraisalValue || l.loanAmount,
            ubicacion_almacen: l.item.storageLocation || 'Bóveda Principal',
            estado_prenda: l.item.status || 'EN_CUSTODIA'
          });
        }
      });

      if (prendasPayload.length > 0) {
        // Desduplicar prendas por ID y asegurar códigos únicos dentro del lote
        const uniqueById = new Map<string, any>();
        const usedCodes = new Set<string>();

        prendasPayload.forEach(p => {
          let code = p.codigo;
          if (usedCodes.has(code)) {
            code = `${code}-${Math.random().toString(36).substring(2, 6)}`;
            p.codigo = code;
          }
          usedCodes.add(code);
          uniqueById.set(p.id, p);
        });

        const uniquePrendas = Array.from(uniqueById.values());
        const { error: prendaErr } = await supabase.from('prendas').upsert(uniquePrendas, { onConflict: 'id' });
        if (prendaErr) {
          console.error('❌ Error al guardar prendas en Supabase:', prendaErr.message, prendaErr.details || '');
        } else {
          console.log(`✅ ${uniquePrendas.length} Prenda(s) sincronizada(s) en Supabase con éxito`);
        }
      }

      // 2. Guardar el préstamo (claves foráneas cliente_id y prenda_id ya existen)
      const dbPayload = loans.map(mapLoanToDb);
      const { data, error } = await supabase.from('prestamos').upsert(dbPayload, { onConflict: 'id' }).select();
      if (error) {
        console.error('❌ Error al guardar préstamo en Supabase:', error.message, error.details || '');
      } else {
        console.log('✅ Préstamo sincronizado en Supabase con éxito:', data);
      }
    } catch (err) {
      console.error('❌ Excepción guardando préstamos:', err);
    }
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

  savePayments: async (payments: PaymentTransaction[]) => {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
    localDb.savePayments(payments);

    try {
      const dbPayload = payments.map(mapPaymentToDb);
      const { data, error } = await supabase.from('pagos').upsert(dbPayload, { onConflict: 'id' }).select();
      if (error) {
        console.error('❌ Error al guardar pagos en Supabase:', error.message, error.details || '');
      } else {
        console.log('✅ Pago sincronizado en Supabase con éxito:', data);
      }
    } catch (err) {
      console.error('❌ Excepción guardando pagos:', err);
    }
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

  saveEmployees: async (employees: Employee[]) => {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    localDb.saveEmployees(employees);

    try {
      const dbPayload = employees.map(mapEmployeeToDb);
      await supabase.from('empleados').upsert(dbPayload, { onConflict: 'id' });
    } catch (err) {
      console.error('❌ Excepción guardando empleados:', err);
    }
  },

  deleteEmployee: async (id: string) => {
    const current = StorageService.getEmployees().filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(current));
    localDb.saveEmployees(current);

    try {
      const { error } = await supabase.from('empleados').delete().eq('id', id);
      if (error) {
        console.error('❌ Error eliminando empleado en Supabase:', error.message, error.details || '');
      } else {
        console.log('✅ Empleado eliminado de Supabase con éxito:', id);
      }
    } catch (err) {
      console.error('❌ Excepción eliminando empleado en Supabase:', err);
    }
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
      const { data, error } = await supabase.from('configuracion').select('valor').eq('clave', 'monthly_budget').maybeSingle();
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

  // Contraseña de Administrador
  getAdminPassword: (): string => {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD) || '1234';
  },

  fetchAdminPasswordAsync: async (): Promise<string> => {
    try {
      const { data, error } = await supabase.from('configuracion').select('valor').eq('clave', 'admin_password').maybeSingle();
      if (!error && data && data.valor) {
        const val = String(data.valor);
        localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, val);
        return val;
      }
      return StorageService.getAdminPassword();
    } catch {
      return StorageService.getAdminPassword();
    }
  },

  saveAdminPassword: (newPass: string) => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, newPass);
    supabase.from('configuracion').upsert({
      clave: 'admin_password',
      valor: newPass,
      actualizado_el: new Date().toISOString()
    }).then(({ error }) => {
      if (error) console.warn('Aviso sincronizando contraseña con Supabase:', error.message);
    });
  },

  // Exportar copia de seguridad
  exportBackup: async () => {
    return await localDb.exportBackup();
  }
};

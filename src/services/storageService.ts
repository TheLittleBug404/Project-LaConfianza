import type { Customer, Employee, PawnLoan, PaymentTransaction } from '../types';
import { 
  SEED_CUSTOMERS, 
  SEED_EMPLOYEES, 
  SEED_LOANS, 
  SEED_PAYMENTS 
} from '../database/schema';
import { localDb } from '../database/localDb';

const STORAGE_KEYS = {
  CUSTOMERS: 'nelly_pawn_customers',
  LOANS: 'nelly_pawn_loans',
  PAYMENTS: 'nelly_pawn_payments',
  BUDGET: 'nelly_pawn_monthly_budget',
  EMPLOYEES: 'nelly_pawn_employees',
};

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
      const parsed: Customer[] = JSON.parse(raw);
      // Validar si los clientes tienen formato actualizado
      if (parsed.length === 0) {
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(SEED_CUSTOMERS));
        localDb.saveCustomers(SEED_CUSTOMERS);
        return SEED_CUSTOMERS;
      }
      return parsed;
    } catch {
      return SEED_CUSTOMERS;
    }
  },

  saveCustomers: (customers: Customer[]) => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    localDb.saveCustomers(customers);
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
      if (parsed.length === 0) {
        localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(SEED_LOANS));
        localDb.saveLoans(SEED_LOANS);
        return SEED_LOANS;
      }
      return parsed.map((l, idx) => ({
        ...l,
        receiptCode: l.receiptCode || l.code || `A${idx + 1}`
      }));
    } catch {
      return SEED_LOANS;
    }
  },

  saveLoans: (loans: PawnLoan[]) => {
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
    localDb.saveLoans(loans);
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
      const parsed: PaymentTransaction[] = JSON.parse(raw);
      if (parsed.length === 0) {
        localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(SEED_PAYMENTS));
        localDb.savePayments(SEED_PAYMENTS);
        return SEED_PAYMENTS;
      }
      return parsed;
    } catch {
      return SEED_PAYMENTS;
    }
  },

  savePayments: (payments: PaymentTransaction[]) => {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
    localDb.savePayments(payments);
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
      if (parsed.length === 0) {
        localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(SEED_EMPLOYEES));
        localDb.saveEmployees(SEED_EMPLOYEES);
        return SEED_EMPLOYEES;
      }
      return parsed;
    } catch {
      return SEED_EMPLOYEES;
    }
  },

  saveEmployees: (employees: Employee[]) => {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    localDb.saveEmployees(employees);
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

  saveMonthlyBudget: (amount: number) => {
    localStorage.setItem(STORAGE_KEYS.BUDGET, amount.toString());
    localDb.setConfig('monthly_budget', amount);
  },

  // Restablecer Base de Datos Local con los 4 clientes de ejemplo
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

  // Exportar copia de seguridad de la base de datos local
  exportBackup: async () => {
    return await localDb.exportBackup();
  }
};

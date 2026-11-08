/**
 * Base de Datos Local con motor IndexedDB
 * Totalmente desacoplada y estructurada para migrar directamente a Supabase
 */

import { 
  DB_CONFIG, 
  SEED_CUSTOMERS, 
  SEED_EMPLOYEES, 
  SEED_LOANS, 
  SEED_PAYMENTS 
} from './schema';
import type { Customer, Employee, PawnLoan, PaymentTransaction } from '../types';

class LocalDatabase {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private isAvailable: boolean = typeof window !== 'undefined' && 'indexedDB' in window;

  constructor() {
    if (this.isAvailable) {
      this.initDB();
    }
  }

  /**
   * Abre o actualiza la Base de Datos IndexedDB
   */
  private initDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      try {
        const request = window.indexedDB.open(DB_CONFIG.NAME, DB_CONFIG.VERSION);

        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
          const db = (event.target as IDBOpenDBRequest).result;

          // 1. Tabla de Clientes
          if (!db.objectStoreNames.contains(DB_CONFIG.STORES.CUSTOMERS)) {
            const customerStore = db.createObjectStore(DB_CONFIG.STORES.CUSTOMERS, { keyPath: 'id' });
            customerStore.createIndex('dni', 'dni', { unique: true });
            customerStore.createIndex('trafficColor', 'trafficColor', { unique: false });
            customerStore.createIndex('fullName', 'fullName', { unique: false });
          }

          // 2. Tabla de Empleados
          if (!db.objectStoreNames.contains(DB_CONFIG.STORES.EMPLOYEES)) {
            const empStore = db.createObjectStore(DB_CONFIG.STORES.EMPLOYEES, { keyPath: 'id' });
            empStore.createIndex('dni', 'dni', { unique: true });
            empStore.createIndex('status', 'status', { unique: false });
          }

          // 3. Tabla de Préstamos y Empeños
          if (!db.objectStoreNames.contains(DB_CONFIG.STORES.LOANS)) {
            const loanStore = db.createObjectStore(DB_CONFIG.STORES.LOANS, { keyPath: 'id' });
            loanStore.createIndex('code', 'code', { unique: false });
            loanStore.createIndex('receiptCode', 'receiptCode', { unique: false });
            loanStore.createIndex('customerId', 'customerId', { unique: false });
            loanStore.createIndex('status', 'status', { unique: false });
          }

          // 4. Tabla de Transacciones y Caja
          if (!db.objectStoreNames.contains(DB_CONFIG.STORES.PAYMENTS)) {
            const payStore = db.createObjectStore(DB_CONFIG.STORES.PAYMENTS, { keyPath: 'id' });
            payStore.createIndex('loanId', 'loanId', { unique: false });
            payStore.createIndex('customerId', 'customerId', { unique: false });
            payStore.createIndex('date', 'date', { unique: false });
          }

          // 5. Tabla de Configuración General (Presupuesto mensual, etc.)
          if (!db.objectStoreNames.contains(DB_CONFIG.STORES.CONFIG)) {
            db.createObjectStore(DB_CONFIG.STORES.CONFIG, { keyPath: 'key' });
          }
        };

        request.onsuccess = () => {
          const db = request.result;
          resolve(db);
        };

        request.onerror = () => {
          console.warn('Error al abrir IndexedDB local, operando en modo memoria/fallback.', request.error);
          reject(request.error);
        };
      } catch (err) {
        reject(err);
      }
    });

    return this.dbPromise;
  }

  /**
   * Operación genérica para obtener todos los registros de una tabla
   */
  private async getAllFromStore<T>(storeName: string): Promise<T[]> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch {
      return [];
    }
  }

  /**
   * Operación genérica para guardar múltiples registros
   */
  private async putMultipleInStore<T>(storeName: string, items: T[]): Promise<void> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);

        items.forEach(item => store.put(item));

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (err) {
      console.warn(`Error al guardar en ${storeName}:`, err);
    }
  }

  /**
   * Inicializa o restablece la Base de Datos con los 4 clientes de ejemplo
   */
  async seedInitialData(): Promise<{
    customers: Customer[];
    employees: Employee[];
    loans: PawnLoan[];
    payments: PaymentTransaction[];
    monthlyBudget: number;
  }> {
    await this.putMultipleInStore(DB_CONFIG.STORES.CUSTOMERS, SEED_CUSTOMERS);
    await this.putMultipleInStore(DB_CONFIG.STORES.EMPLOYEES, SEED_EMPLOYEES);
    await this.putMultipleInStore(DB_CONFIG.STORES.LOANS, SEED_LOANS);
    await this.putMultipleInStore(DB_CONFIG.STORES.PAYMENTS, SEED_PAYMENTS);
    await this.setConfig('monthly_budget', 50000);

    return {
      customers: SEED_CUSTOMERS,
      employees: SEED_EMPLOYEES,
      loans: SEED_LOANS,
      payments: SEED_PAYMENTS,
      monthlyBudget: 50000,
    };
  }

  // --- MÉTODOS DE CLIENTES ---
  async getCustomers(): Promise<Customer[]> {
    const list = await this.getAllFromStore<Customer>(DB_CONFIG.STORES.CUSTOMERS);
    if (!list || list.length === 0) {
      await this.putMultipleInStore(DB_CONFIG.STORES.CUSTOMERS, SEED_CUSTOMERS);
      return SEED_CUSTOMERS;
    }
    return list;
  }

  async saveCustomers(customers: Customer[]): Promise<void> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction(DB_CONFIG.STORES.CUSTOMERS, 'readwrite');
      const store = transaction.objectStore(DB_CONFIG.STORES.CUSTOMERS);
      store.clear();
      customers.forEach(c => store.put(c));
    } catch (err) {
      console.warn('Error sincronizando clientes en IndexedDB:', err);
    }
  }

  // --- MÉTODOS DE EMPLEADOS ---
  async getEmployees(): Promise<Employee[]> {
    const list = await this.getAllFromStore<Employee>(DB_CONFIG.STORES.EMPLOYEES);
    if (!list || list.length === 0) {
      await this.putMultipleInStore(DB_CONFIG.STORES.EMPLOYEES, SEED_EMPLOYEES);
      return SEED_EMPLOYEES;
    }
    return list;
  }

  async saveEmployees(employees: Employee[]): Promise<void> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction(DB_CONFIG.STORES.EMPLOYEES, 'readwrite');
      const store = transaction.objectStore(DB_CONFIG.STORES.EMPLOYEES);
      store.clear();
      employees.forEach(e => store.put(e));
    } catch (err) {
      console.warn('Error sincronizando empleados en IndexedDB:', err);
    }
  }

  // --- MÉTODOS DE PRÉSTAMOS ---
  async getLoans(): Promise<PawnLoan[]> {
    const list = await this.getAllFromStore<PawnLoan>(DB_CONFIG.STORES.LOANS);
    if (!list || list.length === 0) {
      await this.putMultipleInStore(DB_CONFIG.STORES.LOANS, SEED_LOANS);
      return SEED_LOANS;
    }
    return list;
  }

  async saveLoans(loans: PawnLoan[]): Promise<void> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction(DB_CONFIG.STORES.LOANS, 'readwrite');
      const store = transaction.objectStore(DB_CONFIG.STORES.LOANS);
      store.clear();
      loans.forEach(l => store.put(l));
    } catch (err) {
      console.warn('Error sincronizando préstamos en IndexedDB:', err);
    }
  }

  // --- MÉTODOS DE PAGOS Y CAJA ---
  async getPayments(): Promise<PaymentTransaction[]> {
    const list = await this.getAllFromStore<PaymentTransaction>(DB_CONFIG.STORES.PAYMENTS);
    if (!list || list.length === 0) {
      await this.putMultipleInStore(DB_CONFIG.STORES.PAYMENTS, SEED_PAYMENTS);
      return SEED_PAYMENTS;
    }
    return list;
  }

  async savePayments(payments: PaymentTransaction[]): Promise<void> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction(DB_CONFIG.STORES.PAYMENTS, 'readwrite');
      const store = transaction.objectStore(DB_CONFIG.STORES.PAYMENTS);
      store.clear();
      payments.forEach(p => store.put(p));
    } catch (err) {
      console.warn('Error sincronizando pagos en IndexedDB:', err);
    }
  }

  // --- MÉTODOS DE CONFIGURACIÓN ---
  async getConfig<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const db = await this.initDB();
      return new Promise((resolve) => {
        const transaction = db.transaction(DB_CONFIG.STORES.CONFIG, 'readonly');
        const store = transaction.objectStore(DB_CONFIG.STORES.CONFIG);
        const req = store.get(key);
        req.onsuccess = () => {
          if (req.result && req.result.value !== undefined) {
            resolve(req.result.value as T);
          } else {
            resolve(defaultValue);
          }
        };
        req.onerror = () => resolve(defaultValue);
      });
    } catch {
      return defaultValue;
    }
  }

  async setConfig(key: string, value: any): Promise<void> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction(DB_CONFIG.STORES.CONFIG, 'readwrite');
      const store = transaction.objectStore(DB_CONFIG.STORES.CONFIG);
      store.put({ key, value, updatedAt: new Date().toISOString() });
    } catch (err) {
      console.warn(`Error guardando config ${key}:`, err);
    }
  }

  /**
   * Exporta toda la base de datos a un objeto JSON (Copia de seguridad)
   */
  async exportBackup(): Promise<string> {
    const customers = await this.getCustomers();
    const employees = await this.getEmployees();
    const loans = await this.getLoans();
    const payments = await this.getPayments();
    const monthlyBudget = await this.getConfig('monthly_budget', 50000);

    const backup = {
      database: DB_CONFIG.NAME,
      version: DB_CONFIG.VERSION,
      exportedAt: new Date().toISOString(),
      schemaCompatibleWith: 'Supabase PostgreSQL 15+',
      data: {
        customers,
        employees,
        loans,
        payments,
        monthlyBudget
      }
    };

    return JSON.stringify(backup, null, 2);
  }
}

export const localDb = new LocalDatabase();


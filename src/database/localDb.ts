/**
 * Base de Datos Local con motor IndexedDB
 * Estructurada en 12 tiendas y desacoplada para migración directa a Supabase
 */

import { 
  DB_CONFIG, 
  SEED_ROLES,
  SEED_EMPLOYEES, 
  SEED_CUSTOMERS, 
  SEED_CATEGORIES,
  SEED_ITEMS,
  SEED_APPRAISALS,
  SEED_LOANS, 
  SEED_SCHEDULES,
  SEED_CASHIER_SESSIONS,
  SEED_PAYMENTS,
  SEED_AUCTIONS
} from './schema';
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
  AuctionItemRecord
} from '../types';

class LocalDatabase {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private isAvailable: boolean = typeof window !== 'undefined' && 'indexedDB' in window;

  constructor() {
    if (this.isAvailable) {
      this.initDB();
    }
  }

  /**
   * Abre o actualiza la Base de Datos IndexedDB con las 12 tiendas
   */
  private initDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      try {
        const request = window.indexedDB.open(DB_CONFIG.NAME, DB_CONFIG.VERSION);

        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
          const db = (event.target as IDBOpenDBRequest).result;

          // 1. Roles
          if (!db.objectStoreNames.contains(DB_CONFIG.STORES.ROLES)) {
            db.createObjectStore(DB_CONFIG.STORES.ROLES, { keyPath: 'id' });
          }

          // 2. Empleados
          if (!db.objectStoreNames.contains(DB_CONFIG.STORES.EMPLOYEES)) {
            const empStore = db.createObjectStore(DB_CONFIG.STORES.EMPLOYEES, { keyPath: 'id' });
            empStore.createIndex('dni', 'dni', { unique: true });
            empStore.createIndex('status', 'status', { unique: false });
          }

          // 3. Clientes
          if (!db.objectStoreNames.contains(DB_CONFIG.STORES.CUSTOMERS)) {
            const customerStore = db.createObjectStore(DB_CONFIG.STORES.CUSTOMERS, { keyPath: 'id' });
            customerStore.createIndex('dni', 'dni', { unique: true });
            customerStore.createIndex('trafficColor', 'trafficColor', { unique: false });
            customerStore.createIndex('fullName', 'fullName', { unique: false });
          }

          // 4. Categorías de Prenda
          if (!db.objectStoreNames.contains(DB_CONFIG.STORES.CATEGORIES)) {
            db.createObjectStore(DB_CONFIG.STORES.CATEGORIES, { keyPath: 'id' });
          }

          // 5. Prendas
          if (!db.objectStoreNames.contains(DB_CONFIG.STORES.ITEMS)) {
            const itemStore = db.createObjectStore(DB_CONFIG.STORES.ITEMS, { keyPath: 'id' });
            itemStore.createIndex('code', 'code', { unique: false });
            itemStore.createIndex('category', 'category', { unique: false });
          }

          // 6. Tasaciones Historial
          if (!db.objectStoreNames.contains(DB_CONFIG.STORES.APPRAISALS)) {
            const appraisalStore = db.createObjectStore(DB_CONFIG.STORES.APPRAISALS, { keyPath: 'id' });
            appraisalStore.createIndex('prendaId', 'prendaId', { unique: false });
          }

          // 7. Préstamos
          if (!db.objectStoreNames.contains(DB_CONFIG.STORES.LOANS)) {
            const loanStore = db.createObjectStore(DB_CONFIG.STORES.LOANS, { keyPath: 'id' });
            loanStore.createIndex('code', 'code', { unique: false });
            loanStore.createIndex('receiptCode', 'receiptCode', { unique: false });
            loanStore.createIndex('customerId', 'customerId', { unique: false });
            loanStore.createIndex('status', 'status', { unique: false });
          }

          // 8. Plan de Pagos
          if (!db.objectStoreNames.contains(DB_CONFIG.STORES.PAYMENT_SCHEDULES)) {
            const scheduleStore = db.createObjectStore(DB_CONFIG.STORES.PAYMENT_SCHEDULES, { keyPath: 'id' });
            scheduleStore.createIndex('prestamoId', 'prestamoId', { unique: false });
          }

          // 9. Sesiones de Caja
          if (!db.objectStoreNames.contains(DB_CONFIG.STORES.CASHIER_SESSIONS)) {
            const sessionStore = db.createObjectStore(DB_CONFIG.STORES.CASHIER_SESSIONS, { keyPath: 'id' });
            sessionStore.createIndex('fechaOperacion', 'fechaOperacion', { unique: false });
          }

          // 10. Pagos y Movimientos
          if (!db.objectStoreNames.contains(DB_CONFIG.STORES.PAYMENTS)) {
            const payStore = db.createObjectStore(DB_CONFIG.STORES.PAYMENTS, { keyPath: 'id' });
            payStore.createIndex('loanId', 'loanId', { unique: false });
            payStore.createIndex('customerId', 'customerId', { unique: false });
            payStore.createIndex('date', 'date', { unique: false });
          }

          // 11. Remates
          if (!db.objectStoreNames.contains(DB_CONFIG.STORES.AUCTIONS)) {
            const auctionStore = db.createObjectStore(DB_CONFIG.STORES.AUCTIONS, { keyPath: 'id' });
            auctionStore.createIndex('prendaId', 'prendaId', { unique: false });
          }

          // 12. Configuración Global
          if (!db.objectStoreNames.contains(DB_CONFIG.STORES.CONFIG)) {
            db.createObjectStore(DB_CONFIG.STORES.CONFIG, { keyPath: 'key' });
          }
        };

        request.onsuccess = () => {
          const db = request.result;
          resolve(db);
        };

        request.onerror = () => {
          console.warn('Error al abrir IndexedDB local, operando en modo fallback.', request.error);
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
   * Inicializa o restablece la Base de Datos con las 12 tablas
   */
  async seedInitialData(): Promise<{
    roles: SystemRole[];
    employees: Employee[];
    customers: Customer[];
    categories: ItemCategoryRecord[];
    items: PledgeItem[];
    appraisals: AppraisalHistoryRecord[];
    loans: PawnLoan[];
    schedules: LoanPaymentSchedule[];
    cashierSessions: CashierSessionRecord[];
    payments: PaymentTransaction[];
    auctions: AuctionItemRecord[];
    monthlyBudget: number;
  }> {
    await this.putMultipleInStore(DB_CONFIG.STORES.ROLES, SEED_ROLES);
    await this.putMultipleInStore(DB_CONFIG.STORES.EMPLOYEES, SEED_EMPLOYEES);
    await this.putMultipleInStore(DB_CONFIG.STORES.CUSTOMERS, SEED_CUSTOMERS);
    await this.putMultipleInStore(DB_CONFIG.STORES.CATEGORIES, SEED_CATEGORIES);
    await this.putMultipleInStore(DB_CONFIG.STORES.ITEMS, SEED_ITEMS);
    await this.putMultipleInStore(DB_CONFIG.STORES.APPRAISALS, SEED_APPRAISALS);
    await this.putMultipleInStore(DB_CONFIG.STORES.LOANS, SEED_LOANS);
    await this.putMultipleInStore(DB_CONFIG.STORES.PAYMENT_SCHEDULES, SEED_SCHEDULES);
    await this.putMultipleInStore(DB_CONFIG.STORES.CASHIER_SESSIONS, SEED_CASHIER_SESSIONS);
    await this.putMultipleInStore(DB_CONFIG.STORES.PAYMENTS, SEED_PAYMENTS);
    await this.putMultipleInStore(DB_CONFIG.STORES.AUCTIONS, SEED_AUCTIONS);
    await this.setConfig('monthly_budget', 50000);

    return {
      roles: SEED_ROLES,
      employees: SEED_EMPLOYEES,
      customers: SEED_CUSTOMERS,
      categories: SEED_CATEGORIES,
      items: SEED_ITEMS,
      appraisals: SEED_APPRAISALS,
      loans: SEED_LOANS,
      schedules: SEED_SCHEDULES,
      cashierSessions: SEED_CASHIER_SESSIONS,
      payments: SEED_PAYMENTS,
      auctions: SEED_AUCTIONS,
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

  // --- MÉTODOS DE TRANSACCIONES / PAGOS ---
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
  async setConfig(key: string, value: any): Promise<void> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction(DB_CONFIG.STORES.CONFIG, 'readwrite');
      const store = transaction.objectStore(DB_CONFIG.STORES.CONFIG);
      store.put({ key, value, updatedAt: new Date().toISOString() });
    } catch (err) {
      console.warn(`Error al guardar configuración ${key}:`, err);
    }
  }

  async getConfig<T>(key: string): Promise<T | null> {
    try {
      const db = await this.initDB();
      return new Promise((resolve) => {
        const transaction = db.transaction(DB_CONFIG.STORES.CONFIG, 'readonly');
        const store = transaction.objectStore(DB_CONFIG.STORES.CONFIG);
        const request = store.get(key);

        request.onsuccess = () => {
          if (request.result) {
            resolve(request.result.value as T);
          } else {
            resolve(null);
          }
        };
        request.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  // --- RESPALDO TOTAL DE LAS 12 TABLAS ---
  async exportBackup(): Promise<string> {
    const roles = await this.getAllFromStore(DB_CONFIG.STORES.ROLES);
    const employees = await this.getEmployees();
    const customers = await this.getCustomers();
    const categories = await this.getAllFromStore(DB_CONFIG.STORES.CATEGORIES);
    const items = await this.getAllFromStore(DB_CONFIG.STORES.ITEMS);
    const appraisals = await this.getAllFromStore(DB_CONFIG.STORES.APPRAISALS);
    const loans = await this.getLoans();
    const schedules = await this.getAllFromStore(DB_CONFIG.STORES.PAYMENT_SCHEDULES);
    const cashierSessions = await this.getAllFromStore(DB_CONFIG.STORES.CASHIER_SESSIONS);
    const payments = await this.getPayments();
    const auctions = await this.getAllFromStore(DB_CONFIG.STORES.AUCTIONS);
    const config = await this.getAllFromStore(DB_CONFIG.STORES.CONFIG);

    const backup = {
      version: DB_CONFIG.VERSION,
      schema: '12_tablas_empenos',
      exportedAt: new Date().toISOString(),
      data: {
        roles,
        employees,
        customers,
        categories,
        items,
        appraisals,
        loans,
        schedules,
        cashierSessions,
        payments,
        auctions,
        config
      }
    };

    return JSON.stringify(backup, null, 2);
  }
}

export const localDb = new LocalDatabase();

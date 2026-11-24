import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  Customer, 
  Employee,
  PawnLoan, 
  PaymentTransaction, 
  FinancialStats, 
  CustomerCategory, 
  CustomerTrafficColor,
  LoanStatus,
  CollateralCategory,
  ItemCondition 
} from '../types';
import { StorageService } from '../services/storageService';
import { generateReceiptCode } from '../utils/receiptCode';

interface PawnContextType {
  customers: Customer[];
  employees: Employee[];
  loans: PawnLoan[];
  payments: PaymentTransaction[];
  stats: FinancialStats;
  monthlyBudget: number;
  setMonthlyBudget: (amount: number) => void;
  nextReceiptCode: string;
  
  // Acciones de Clientes
  addCustomer: (customerData: Omit<Customer, 'id' | 'registeredAt' | 'category' | 'creditScore' | 'totalLoansCount' | 'activeLoansCount' | 'totalPaidAmount' | 'totalBorrowedAmount' | 'defaultedLoansCount' | 'trafficColor'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => { success: boolean; message?: string };
  getCustomerById: (id: string) => Customer | undefined;

  // Acciones de Empleados
  addEmployee: (employeeData: Omit<Employee, 'id' | 'createdAt'>) => Employee;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  
  // Acciones de Préstamos y Prendas
  createPawnLoan: (loanData: {
    customerId: string;
    itemData: {
      code?: string;
      category: CollateralCategory;
      name: string;
      description: string;
      serialNumber?: string;
      condition: ItemCondition;
      appraisalValue: number;
      storageLocation: string;
    };
    loanAmount: number;
    monthlyInterestRate: number;
    adminExpensesRate?: number;
    termDays?: number;
    termMonths: number;
    gracePeriodDays: number;
    notes?: string;
  }) => PawnLoan;
  
  // Operaciones de Pago / Refrendo / Liquidación
  payInterestRefinance: (loanId: string, paymentMethod: 'EFECTIVO' | 'TRANSFERENCIA' | 'QR', notes?: string) => void;
  payCapitalAmortization: (loanId: string, amount: number, paymentMethod: 'EFECTIVO' | 'TRANSFERENCIA' | 'QR', notes?: string) => void;
  payFullLiquidation: (loanId: string, paymentMethod: 'EFECTIVO' | 'TRANSFERENCIA' | 'QR', notes?: string) => void;
  sendToAuction: (loanId: string, notes?: string) => void;
  
  // Utilidades
  resetToDefaultData: () => void;
}

const PawnContext = createContext<PawnContextType | undefined>(undefined);

export const PawnProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>(() => StorageService.getCustomers());
  const [employees, setEmployees] = useState<Employee[]>(() => StorageService.getEmployees());
  const [loans, setLoans] = useState<PawnLoan[]>(() => StorageService.getLoans());
  const [payments, setPayments] = useState<PaymentTransaction[]>(() => StorageService.getPayments());
  const [monthlyBudget, setMonthlyBudgetState] = useState<number>(() => StorageService.getMonthlyBudget());

  // Carga asíncrona inicial desde Supabase solo si hay registros reales en la nube
  useEffect(() => {
    let isMounted = true;
    const syncFromSupabase = async () => {
      try {
        const [remoteCust, remoteEmp, remoteLoans, remotePay, remoteBudget] = await Promise.all([
          StorageService.fetchCustomersAsync(),
          StorageService.fetchEmployeesAsync(),
          StorageService.fetchLoansAsync(),
          StorageService.fetchPaymentsAsync(),
          StorageService.fetchMonthlyBudgetAsync()
        ]);

        if (isMounted) {
          // Solo sobrescribir si el usuario ya registró datos reales
          setCustomers(remoteCust);
          if (remoteEmp.length > 0) setEmployees(remoteEmp);
          setLoans(remoteLoans);
          setPayments(remotePay);
          if (remoteBudget > 0) setMonthlyBudgetState(remoteBudget);
        }
      } catch (err) {
        console.warn('Error sincronizando datos iniciales de Supabase:', err);
      }
    };

    syncFromSupabase();
    return () => { isMounted = false; };
  }, []);

  const setMonthlyBudget = (amount: number) => {
    setMonthlyBudgetState(amount);
    StorageService.saveMonthlyBudget(amount);
  };

  const nextReceiptCode = generateReceiptCode(loans.length);

  // Evaluar estado dinámico de préstamos al cargar (vencimientos vs fecha actual)
  useEffect(() => {
    const today = new Date();
    const updatedLoans = loans.map((loan) => {
      if (loan.status === 'PAGADO' || loan.status === 'REMATADO') return loan;
      
      const dueDate = new Date(loan.dueDate);
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let newStatus: LoanStatus = loan.status;
      if (diffDays < 0) {
        newStatus = 'EN_MORA';
      } else if (diffDays <= 3) {
        newStatus = 'POR_VENCER';
      } else {
        newStatus = 'VIGENTE';
      }

      if (newStatus !== loan.status) {
        return { ...loan, status: newStatus };
      }
      return loan;
    });

    if (JSON.stringify(updatedLoans) !== JSON.stringify(loans)) {
      setLoans(updatedLoans);
      StorageService.saveLoans(updatedLoans);
    }
  }, []);

  // Guardar en Storage ante cambios (solo tras la carga inicial)
  const isInitialMount = React.useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    StorageService.saveCustomers(customers);
  }, [customers]);

  useEffect(() => {
    // Los empleados solo se guardan cuando el admin explícitamente agrega/edita
  }, [employees]);

  useEffect(() => {
    StorageService.saveLoans(loans);
  }, [loans]);

  useEffect(() => {
    StorageService.savePayments(payments);
  }, [payments]);

  // Recalcular categoría y scoring de un cliente de forma 100% automática por el sistema
  const computeCustomerCategory = (
    c: Customer,
    customLoans: PawnLoan[] = loans
  ): { category: CustomerCategory; creditScore: number; trafficColor: CustomerTrafficColor } => {
    const custLoans = customLoans.filter(l => l.customerId === c.id);
    const hasDefaulted = custLoans.some(l => l.status === 'REMATADO') || c.defaultedLoansCount > 0;
    const hasOverdue = custLoans.some(l => l.status === 'EN_MORA');
    
    let score = 80;
    if (hasDefaulted) score -= 45;
    if (hasOverdue) score -= 25;
    
    score += Math.min(25, (c.totalPaidAmount / 1000) * 2);
    score += (c.totalLoansCount * 3);
    score = Math.max(10, Math.min(100, Math.round(score)));

    let category: CustomerCategory = 'NUEVO';
    let trafficColor: CustomerTrafficColor = 'VERDE';

    // Regla de cumplimiento:
    // ROJO (Cliente Malo): Si tiene mora activa o prendas rematadas por impago
    // AMARILLO (Cliente Regular): Si tiene atrasos, prórrogas o puntaje medio
    // VERDE (Cliente Excelente): Sin moras, cumplimiento puntual o cliente nuevo
    if (hasDefaulted || hasOverdue || score < 50) {
      category = 'MOROSO';
      trafficColor = 'ROJO';
    } else if (c.totalLoansCount > 0 && score < 80) {
      category = 'ANTIGUO';
      trafficColor = 'AMARILLO';
    } else {
      category = c.totalLoansCount >= 3 ? 'VIP' : 'NUEVO';
      trafficColor = 'VERDE';
    }

    return { category, creditScore: score, trafficColor };
  };

  const getCustomerById = (id: string) => customers.find(c => c.id === id);

  const addCustomer = (customerData: Omit<Customer, 'id' | 'registeredAt' | 'category' | 'creditScore' | 'totalLoansCount' | 'activeLoansCount' | 'totalPaidAmount' | 'totalBorrowedAmount' | 'defaultedLoansCount' | 'trafficColor'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      registeredAt: new Date().toISOString(),
      category: 'NUEVO',
      trafficColor: 'VERDE', // Sistema asigna Cliente Excelente de forma inicial
      creditScore: 80,
      totalLoansCount: 0,
      activeLoansCount: 0,
      totalPaidAmount: 0,
      totalBorrowedAmount: 0,
      defaultedLoansCount: 0,
    };

    const updated = [newCustomer, ...customers];
    setCustomers(updated);
    return newCustomer;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === id) {
        const merged = { ...c, ...updates };
        const { category, creditScore, trafficColor } = computeCustomerCategory(merged);
        return { 
          ...merged, 
          category, 
          creditScore, 
          trafficColor 
        };
      }
      return c;
    }));
  };

  const deleteCustomer = (id: string): { success: boolean; message?: string } => {
    const cust = customers.find(c => c.id === id);
    if (!cust) return { success: false, message: 'Cliente no encontrado' };

    const hasActiveLoans = loans.some(
      l => l.customerId === id && (l.status === 'VIGENTE' || l.status === 'POR_VENCER' || l.status === 'EN_MORA')
    );
    if (hasActiveLoans) {
      return { 
        success: false, 
        message: `No se puede eliminar a "${cust.fullName}" porque tiene préstamos activos vigentes. Cancele o liquide sus préstamos primero.` 
      };
    }

    setCustomers(prev => prev.filter(c => c.id !== id));
    return { success: true };
  };

  // Acciones de Gestión de Empleados
  const addEmployee = (employeeData: Omit<Employee, 'id' | 'createdAt'>) => {
    const newEmployee: Employee = {
      ...employeeData,
      id: `emp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setEmployees(prev => [newEmployee, ...prev]);
    return newEmployee;
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
  };

  const createPawnLoan = (loanData: {
    customerId: string;
    itemData: {
      category: CollateralCategory;
      name: string;
      description: string;
      serialNumber?: string;
      condition: ItemCondition;
      appraisalValue: number;
      storageLocation: string;
    };
    loanAmount: number;
    monthlyInterestRate: number;
    adminExpensesRate?: number;
    termDays?: number;
    termMonths: number;
    gracePeriodDays: number;
    notes?: string;
  }) => {
    const customer = customers.find(c => c.id === loanData.customerId);
    if (!customer) throw new Error('Cliente no encontrado');

    const startDate = new Date();
    // Plazo exacto en días: 30, 60, 90, 120...
    const days = loanData.termDays || (loanData.termMonths * 30) || 30;
    const dueDate = new Date(startDate);
    dueDate.setDate(dueDate.getDate() + days);

    // Código correlativo secuencial: A1, A2 ... A1000, B1 ... B1000
    const receiptCode = generateReceiptCode(loans.length);
    const code = receiptCode;
    const adminRate = loanData.adminExpensesRate ?? 12;
    const adminAmount = (loanData.loanAmount * adminRate) / 100;

    const newLoan: PawnLoan = {
      id: `loan-${Date.now()}`,
      code,
      receiptCode,
      customerId: customer.id,
      customerName: customer.fullName,
      customerDni: customer.dni,
      customerAddress: customer.address,
      customerPhone: customer.phone,
      item: {
        id: `item-${Date.now()}`,
        ...loanData.itemData,
        status: 'EN_CUSTODIA'
      },
      loanAmount: loanData.loanAmount,
      remainingCapital: loanData.loanAmount,
      monthlyInterestRate: loanData.monthlyInterestRate ?? 3,
      adminExpensesRate: adminRate,
      adminExpensesAmount: adminAmount,
      termDays: days,
      termMonths: Math.max(1, Math.round(days / 30)),
      startDate: startDate.toISOString(),
      dueDate: dueDate.toISOString(),
      gracePeriodDays: loanData.gracePeriodDays,
      status: 'VIGENTE',
      totalInterestPaid: 0,
      totalCapitalPaid: 0,
      notes: loanData.notes
    };

    // Actualizar cliente
    setCustomers(prev => prev.map(c => {
      if (c.id === customer.id) {
        const updatedCustomer: Customer = {
          ...c,
          totalLoansCount: c.totalLoansCount + 1,
          activeLoansCount: c.activeLoansCount + 1,
          totalBorrowedAmount: c.totalBorrowedAmount + loanData.loanAmount,
        };
        const { category, creditScore, trafficColor } = computeCustomerCategory(updatedCustomer, [...loans, newLoan]);
        return { ...updatedCustomer, category, creditScore, trafficColor };
      }
      return c;
    }));

    // Transacción de desembolso
    const initialDisbursement: PaymentTransaction = {
      id: `pay-${Date.now()}`,
      loanId: newLoan.id,
      loanCode: newLoan.code,
      customerId: customer.id,
      customerName: customer.fullName,
      type: 'DESEMBOLSO_INICIAL',
      amount: loanData.loanAmount,
      capitalPortion: loanData.loanAmount,
      interestPortion: 0,
      date: new Date().toISOString(),
      paymentMethod: 'EFECTIVO',
      receiptCode,
      notes: `Desembolso inicial por empeño de ${loanData.itemData.name}`
    };

    setLoans(prev => [newLoan, ...prev]);
    setPayments(prev => [initialDisbursement, ...prev]);

    return newLoan;
  };

  const payInterestRefinance = (loanId: string, paymentMethod: 'EFECTIVO' | 'TRANSFERENCIA' | 'QR', notes?: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;

    const interestAmount = (loan.remainingCapital * loan.monthlyInterestRate) / 100;
    
    // Extender fecha de vencimiento 1 mes más
    const currentDue = new Date(loan.dueDate);
    const newDueDate = new Date(currentDue);
    newDueDate.setMonth(newDueDate.getMonth() + 1);

    const transaction: PaymentTransaction = {
      id: `pay-${Date.now()}`,
      loanId: loan.id,
      loanCode: loan.code,
      customerId: loan.customerId,
      customerName: loan.customerName,
      type: 'PAGO_INTERES_REFRENDO',
      amount: interestAmount,
      capitalPortion: 0,
      interestPortion: interestAmount,
      date: new Date().toISOString(),
      paymentMethod,
      receiptCode: `REC-${Date.now().toString().slice(-6)}`,
      notes: notes || 'Refrendo / Renovación de plazo 30 días',
      newDueDate: newDueDate.toISOString(),
    };

    // Actualizar préstamo
    setLoans(prev => prev.map(l => {
      if (l.id === loanId) {
        return {
          ...l,
          dueDate: newDueDate.toISOString(),
          status: 'VIGENTE',
          totalInterestPaid: l.totalInterestPaid + interestAmount,
          lastPaymentDate: new Date().toISOString(),
        };
      }
      return l;
    }));

    // Actualizar cliente
    setCustomers(prev => prev.map(c => {
      if (c.id === loan.customerId) {
        const updated = {
          ...c,
          totalPaidAmount: c.totalPaidAmount + interestAmount
        };
        const { category, creditScore } = computeCustomerCategory(updated);
        return { ...updated, category, creditScore };
      }
      return c;
    }));

    setPayments(prev => [transaction, ...prev]);
  };

  const payCapitalAmortization = (loanId: string, amount: number, paymentMethod: 'EFECTIVO' | 'TRANSFERENCIA' | 'QR', notes?: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;

    const effectiveAmount = Math.min(amount, loan.remainingCapital);
    const newRemainingCapital = loan.remainingCapital - effectiveAmount;
    const isFullyPaid = newRemainingCapital <= 0;

    const transaction: PaymentTransaction = {
      id: `pay-${Date.now()}`,
      loanId: loan.id,
      loanCode: loan.code,
      customerId: loan.customerId,
      customerName: loan.customerName,
      type: isFullyPaid ? 'LIQUIDACION_TOTAL' : 'ABONO_CAPITAL',
      amount: effectiveAmount,
      capitalPortion: effectiveAmount,
      interestPortion: 0,
      date: new Date().toISOString(),
      paymentMethod,
      receiptCode: `REC-${Date.now().toString().slice(-6)}`,
      notes: notes || (isFullyPaid ? 'Cancelación y liquidación total' : `Abono a capital (${effectiveAmount})`)
    };

    setLoans(prev => prev.map(l => {
      if (l.id === loanId) {
        return {
          ...l,
          remainingCapital: newRemainingCapital,
          totalCapitalPaid: l.totalCapitalPaid + effectiveAmount,
          status: isFullyPaid ? 'PAGADO' : l.status,
          closedAt: isFullyPaid ? new Date().toISOString() : undefined,
          lastPaymentDate: new Date().toISOString(),
          item: {
            ...l.item,
            status: isFullyPaid ? 'DEVUELTA' : l.item.status
          }
        };
      }
      return l;
    }));

    setCustomers(prev => prev.map(c => {
      if (c.id === loan.customerId) {
        const updated = {
          ...c,
          totalPaidAmount: c.totalPaidAmount + effectiveAmount,
          activeLoansCount: isFullyPaid ? Math.max(0, c.activeLoansCount - 1) : c.activeLoansCount
        };
        const { category, creditScore } = computeCustomerCategory(updated);
        return { ...updated, category, creditScore };
      }
      return c;
    }));

    setPayments(prev => [transaction, ...prev]);
  };

  const payFullLiquidation = (loanId: string, paymentMethod: 'EFECTIVO' | 'TRANSFERENCIA' | 'QR', notes?: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;

    const currentInterest = (loan.remainingCapital * loan.monthlyInterestRate) / 100;
    const totalToPay = loan.remainingCapital + currentInterest;

    const transaction: PaymentTransaction = {
      id: `pay-${Date.now()}`,
      loanId: loan.id,
      loanCode: loan.code,
      customerId: loan.customerId,
      customerName: loan.customerName,
      type: 'LIQUIDACION_TOTAL',
      amount: totalToPay,
      capitalPortion: loan.remainingCapital,
      interestPortion: currentInterest,
      date: new Date().toISOString(),
      paymentMethod,
      receiptCode: `LIQ-${Date.now().toString().slice(-6)}`,
      notes: notes || 'Liquidación total del préstamo con retiro de prenda',
    };

    setLoans(prev => prev.map(l => {
      if (l.id === loanId) {
        return {
          ...l,
          remainingCapital: 0,
          totalCapitalPaid: l.totalCapitalPaid + loan.remainingCapital,
          totalInterestPaid: l.totalInterestPaid + currentInterest,
          status: 'PAGADO',
          closedAt: new Date().toISOString(),
          lastPaymentDate: new Date().toISOString(),
          item: {
            ...l.item,
            status: 'DEVUELTA'
          }
        };
      }
      return l;
    }));

    setCustomers(prev => prev.map(c => {
      if (c.id === loan.customerId) {
        const updated = {
          ...c,
          totalPaidAmount: c.totalPaidAmount + totalToPay,
          activeLoansCount: Math.max(0, c.activeLoansCount - 1)
        };
        const { category, creditScore } = computeCustomerCategory(updated);
        return { ...updated, category, creditScore };
      }
      return c;
    }));

    setPayments(prev => [transaction, ...prev]);
  };

  const sendToAuction = (loanId: string, notes?: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;

    setLoans(prev => prev.map(l => {
      if (l.id === loanId) {
        return {
          ...l,
          status: 'REMATADO',
          notes: notes ? `${l.notes || ''} | Rematado: ${notes}` : l.notes,
          item: {
            ...l.item,
            status: 'EN_REMATE'
          }
        };
      }
      return l;
    }));

    setCustomers(prev => prev.map(c => {
      if (c.id === loan.customerId) {
        const updated = {
          ...c,
          defaultedLoansCount: c.defaultedLoansCount + 1,
          activeLoansCount: Math.max(0, c.activeLoansCount - 1),
          category: 'MOROSO' as CustomerCategory,
          creditScore: Math.max(10, c.creditScore - 35)
        };
        return updated;
      }
      return c;
    }));
  };

  const resetToDefaultData = () => {
    const defaults = StorageService.resetDefaults();
    setCustomers(defaults.customers);
    setLoans(defaults.loans);
    setPayments(defaults.payments);
    setEmployees(defaults.employees);
  };

  // Cálculo de estadísticas globales
  const activeLoans = loans.filter(l => l.status === 'VIGENTE' || l.status === 'POR_VENCER' || l.status === 'EN_MORA');
  const totalCapitalActive = activeLoans.reduce((sum, l) => sum + l.remainingCapital, 0);
  const totalVaultAppraisal = loans
    .filter(l => l.item.status === 'EN_CUSTODIA' || l.item.status === 'EN_REMATE')
    .reduce((sum, l) => sum + l.item.appraisalValue, 0);
  const totalInterestEarned = payments.reduce((sum, p) => sum + p.interestPortion, 0);
  const dueSoonCount = loans.filter(l => l.status === 'POR_VENCER').length;
  const overdueCount = loans.filter(l => l.status === 'EN_MORA').length;
  const rematadosCount = loans.filter(l => l.status === 'REMATADO').length;
  const defaultRate = loans.length > 0 ? Math.round(((overdueCount + rematadosCount) / loans.length) * 100) : 0;

  // Nuevas métricas para el Administrador
  const monthlyLendingBudget = monthlyBudget;
  const monthlyLendedAmount = totalCapitalActive;
  const monthlyRemainingBudget = Math.max(0, monthlyLendingBudget - monthlyLendedAmount);
  const totalLossesInDefault = loans
    .filter(l => l.status === 'EN_MORA' || l.status === 'REMATADO')
    .reduce((sum, l) => sum + l.remainingCapital, 0);

  const greenCustomersCount = customers.filter(c => c.trafficColor === 'VERDE').length;
  const yellowCustomersCount = customers.filter(c => c.trafficColor === 'AMARILLO').length;
  const redCustomersCount = customers.filter(c => c.trafficColor === 'ROJO').length;

  const stats: FinancialStats = {
    totalCapitalActive,
    totalVaultAppraisal,
    totalInterestEarned,
    totalLoansCount: loans.length,
    activeLoansCount: activeLoans.length,
    dueSoonCount,
    overdueCount,
    totalCustomersCount: customers.length,
    defaultRate,
    monthlyLendingBudget,
    monthlyLendedAmount,
    monthlyRemainingBudget,
    totalLossesInDefault,
    greenCustomersCount,
    yellowCustomersCount,
    redCustomersCount,
  };

  return (
    <PawnContext.Provider
      value={{
        customers,
        employees,
        loans,
        payments,
        stats,
        monthlyBudget,
        setMonthlyBudget,
        nextReceiptCode,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        getCustomerById,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        createPawnLoan,
        payInterestRefinance,
        payCapitalAmortization,
        payFullLiquidation,
        sendToAuction,
        resetToDefaultData,
      }}
    >
      {children}
    </PawnContext.Provider>
  );
};

export const usePawn = () => {
  const context = useContext(PawnContext);
  if (!context) {
    throw new Error('usePawn must be used within a PawnProvider');
  }
  return context;
};

import React, { useState } from 'react';
import { PawnProvider } from './context/PawnContext';
import { Navbar } from './components/Navbar';
import type { ActiveTab } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { CustomerList } from './components/Customers/CustomerList';
import { CustomerModal } from './components/Customers/CustomerModal';
import { LoanList } from './components/Loans/LoanList';
import { NewLoanModal } from './components/Loans/NewLoanModal';
import { LoanDetailModal } from './components/Loans/LoanDetailModal';
import { PaymentModal } from './components/Loans/PaymentModal';
import { VaultInventory } from './components/Inventory/VaultInventory';
import { CashierView } from './components/Cashier/CashierView';
import { EmployeeList } from './components/Employees/EmployeeList';
import { TicketModal } from './components/Common/TicketModal';
import { LoadingOverlay } from './components/Common/LoadingOverlay';
import { LoginView } from './components/Auth/LoginView';
import { usePawn } from './context/PawnContext';
import type { Customer, PawnLoan, UserSession } from './types';

interface MainAppProps {
  currentUser: UserSession;
  onLogout: () => void;
}

const MainApp: React.FC<MainAppProps> = ({ currentUser, onLogout }) => {
  const { isSaving, savingMessage } = usePawn();
  const isAdmin = currentUser.role === 'ADMIN';
  const [selectedTab, setSelectedTab] = useState<ActiveTab>(() => isAdmin ? 'dashboard' : 'loans');
  const activeTab: ActiveTab = isAdmin ? selectedTab : 'loans';
  const setActiveTab = (tab: ActiveTab) => {
    if (isAdmin) {
      setSelectedTab(tab);
    }
  };

  // Modals state
  const [isNewLoanOpen, setIsNewLoanOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerModalMode, setCustomerModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  const [selectedLoanForDetail, setSelectedLoanForDetail] = useState<PawnLoan | null>(null);
  const [selectedLoanForTicket, setSelectedLoanForTicket] = useState<PawnLoan | null>(null);
  const [selectedLoanForPayment, setSelectedLoanForPayment] = useState<PawnLoan | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [preselectedCustomerForLoan, setPreselectedCustomerForLoan] = useState<Customer | null>(null);

  // Handlers
  const handleOpenPaymentModal = (loan?: PawnLoan | null) => {
    setSelectedLoanForPayment(loan || null);
    setIsPaymentModalOpen(true);
  };
  const handleOpenNewCustomer = () => {
    setSelectedCustomer(null);
    setCustomerModalMode('create');
    setIsCustomerModalOpen(true);
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerModalMode('view');
    setIsCustomerModalOpen(true);
  };

  const handleOpenNewLoan = (preselected?: Customer | null) => {
    setPreselectedCustomerForLoan(preselected || null);
    setIsNewLoanOpen(true);
  };

  const handleLoanCreated = (loan: PawnLoan) => {
    setSelectedLoanForTicket(loan);
  };

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewLoan={() => handleOpenNewLoan(null)}
        onOpenNewCustomer={handleOpenNewCustomer}
        onOpenPaymentModal={() => handleOpenPaymentModal(null)}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      <main className="main-content">
        {isAdmin && activeTab === 'dashboard' && (
          <Dashboard
            userRole={currentUser.role}
            onOpenNewLoan={() => handleOpenNewLoan(null)}
            onOpenNewCustomer={handleOpenNewCustomer}
            onSelectLoan={(loan) => setSelectedLoanForDetail(loan)}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'loans' && (
          <LoanList
            onSelectLoan={(loan) => setSelectedLoanForDetail(loan)}
            onOpenNewLoan={() => handleOpenNewLoan(null)}
            onOpenPaymentModal={(loan) => handleOpenPaymentModal(loan)}
          />
        )}

        {isAdmin && activeTab === 'customers' && (
          <CustomerList
            onSelectCustomer={handleSelectCustomer}
            onOpenNewCustomer={handleOpenNewCustomer}
            onCreateLoanForCustomer={(cust) => handleOpenNewLoan(cust)}
            userRole={currentUser.role}
          />
        )}

        {isAdmin && activeTab === 'vault' && (
          <VaultInventory
            onSelectLoan={(loan) => setSelectedLoanForDetail(loan)}
          />
        )}

        {isAdmin && activeTab === 'cashier' && (
          <CashierView userRole={currentUser.role} />
        )}

        {isAdmin && activeTab === 'employees' && (
          <EmployeeList />
        )}
      </main>

      {/* Customer Modal (Create / Edit / View Profile & Score) */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        customer={selectedCustomer}
        mode={customerModalMode}
        onCreateLoanForCustomer={(cust) => handleOpenNewLoan(cust)}
        userRole={currentUser.role}
      />

      {/* New Loan Modal */}
      <NewLoanModal
        isOpen={isNewLoanOpen}
        onClose={() => setIsNewLoanOpen(false)}
        preselectedCustomer={preselectedCustomerForLoan}
        onSuccessCreated={handleLoanCreated}
        onOpenNewCustomer={handleOpenNewCustomer}
        userRole={currentUser.role}
      />

      {/* Loan Detail & Cash Operations Modal */}
      <LoanDetailModal
        isOpen={!!selectedLoanForDetail}
        onClose={() => setSelectedLoanForDetail(null)}
        loan={selectedLoanForDetail}
        onOpenTicket={(loan) => setSelectedLoanForTicket(loan)}
        userRole={currentUser.role}
      />

      {/* Ticket & Pawn Contract Printable Modal */}
      <TicketModal
        isOpen={!!selectedLoanForTicket}
        onClose={() => setSelectedLoanForTicket(null)}
        loan={selectedLoanForTicket}
      />

      {/* Payment / Prórroga / Cuota Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        preselectedLoan={selectedLoanForPayment}
        onOpenTicket={(loan) => setSelectedLoanForTicket(loan)}
      />

      {/* Global Loading Overlay para bloquear pantalla ante guardados */}
      <LoadingOverlay isLoading={isSaving} message={savingMessage} />
    </div>
  );
};

export default function App() {
  // Purga obligatoria inicial de datos anteriores para asegurar entorno 100% limpio en pruebas
  if (!localStorage.getItem('nelly_clean_v3_done')) {
    localStorage.removeItem('nelly_pawn_customers');
    localStorage.removeItem('nelly_pawn_loans');
    localStorage.removeItem('nelly_pawn_payments');
    try {
      window.indexedDB.deleteDatabase('NellyPawnShop_DB');
    } catch {
      // Ignorar si el navegador no permite borrado sincrono
    }
    localStorage.setItem('nelly_clean_v3_done', 'true');
  }

  const [session, setSession] = useState<UserSession | null>(() => {
    try {
      const stored = localStorage.getItem('nelly_auth_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.authenticated === true) {
          return {
            authenticated: true,
            username: parsed.username || parsed.user || 'usuario',
            role: parsed.role || (parsed.user === 'empleado' || parsed.username === 'empleado' ? 'EMPLEADO' : 'ADMIN'),
            timestamp: parsed.timestamp || Date.now()
          };
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('nelly_auth_session');
    setSession(null);
  };

  if (!session || !session.authenticated) {
    return <LoginView onLoginSuccess={(newSession) => setSession(newSession)} />;
  }

  return (
    <PawnProvider>
      <MainApp currentUser={session} onLogout={handleLogout} />
    </PawnProvider>
  );
}

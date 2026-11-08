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
import { VaultInventory } from './components/Inventory/VaultInventory';
import { CashierView } from './components/Cashier/CashierView';
import { EmployeeList } from './components/Employees/EmployeeList';
import { TicketModal } from './components/Common/TicketModal';
import { LoginView } from './components/Auth/LoginView';
import type { Customer, PawnLoan, UserSession } from './types';

interface MainAppProps {
  currentUser: UserSession;
  onLogout: () => void;
}

const MainApp: React.FC<MainAppProps> = ({ currentUser, onLogout }) => {
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
  const [preselectedCustomerForLoan, setPreselectedCustomerForLoan] = useState<Customer | null>(null);

  // Handlers
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
    </div>
  );
};

export default function App() {
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

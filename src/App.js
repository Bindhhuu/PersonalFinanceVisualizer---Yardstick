import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import BudgetForm from './components/BudgetForm';
import SavingsGoals from './components/SavingsGoals';
import InvestmentPortfolio from './components/InvestmentPortfolio';
import FinancialInsights from './components/FinancialInsights';
import Settings from './components/Settings';
import Navigation from './components/Navigation';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Enhanced localStorage functions
  const loadFromStorage = (key, defaultValue = []) => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) || typeof parsed === 'object' ? parsed : defaultValue;
      }
    } catch (error) {
      console.warn(`Error loading ${key} from localStorage:`, error);
    }
    return defaultValue;
  };

  const saveToStorage = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
      showToast('Error saving data. Storage might be full.', 'error');
    }
  };

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedTransactions = loadFromStorage('financeTracker_transactions', []);
    const savedBudgets = loadFromStorage('financeTracker_budgets', {});
    const savedGoals = loadFromStorage('financeTracker_savingsGoals', []);
    const savedInvestments = loadFromStorage('financeTracker_investments', []);
    const savedActiveTab = loadFromStorage('financeTracker_activeTab', 'dashboard');

    setTransactions(savedTransactions);
    setBudgets(savedBudgets);
    setSavingsGoals(savedGoals);
    setInvestments(savedInvestments);
    setActiveTab(savedActiveTab);

    // Show welcome back message if user has data
    if (savedTransactions.length > 0 || savedGoals.length > 0 || savedInvestments.length > 0) {
      setTimeout(() => {
        showToast('Welcome back! Your data has been restored.', 'success');
      }, 1000);
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    if (transactions.length >= 0) { // Allow empty arrays to be saved
      saveToStorage('financeTracker_transactions', transactions);
    }
  }, [transactions]);

  useEffect(() => {
    saveToStorage('financeTracker_budgets', budgets);
  }, [budgets]);

  useEffect(() => {
    if (savingsGoals.length >= 0) {
      saveToStorage('financeTracker_savingsGoals', savingsGoals);
    }
  }, [savingsGoals]);

  useEffect(() => {
    if (investments.length >= 0) {
      saveToStorage('financeTracker_investments', investments);
    }
  }, [investments]);

  // Save active tab preference
  useEffect(() => {
    saveToStorage('financeTracker_activeTab', activeTab);
  }, [activeTab]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const addTransaction = (transaction) => {
    setTransactions([...transactions, { ...transaction, id: Date.now() }]);
    showToast('Transaction added successfully');
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
    showToast('Transaction deleted successfully');
  };

  const setBudget = (category, amount) => {
    setBudgets({ ...budgets, [category]: amount });
    showToast('Budget updated successfully');
  };

  const addSavingsGoal = (goal) => {
    setSavingsGoals([...savingsGoals, { ...goal, id: Date.now(), currentAmount: 0 }]);
    showToast('Savings goal created successfully');
  };

  const updateSavingsGoal = (id, amount) => {
    setSavingsGoals(savingsGoals.map(goal => 
      goal.id === id ? { ...goal, currentAmount: goal.currentAmount + amount } : goal
    ));
    showToast('Savings goal updated successfully');
  };

  const deleteSavingsGoal = (id) => {
    setSavingsGoals(savingsGoals.filter(goal => goal.id !== id));
    showToast('Savings goal deleted successfully');
  };

  const addInvestment = (investment) => {
    setInvestments([...investments, { ...investment, id: Date.now() }]);
    showToast('Investment added successfully');
  };

  const updateInvestment = (id, updatedInvestment) => {
    setInvestments(investments.map(inv => 
      inv.id === id ? { ...inv, ...updatedInvestment } : inv
    ));
    showToast('Investment updated successfully');
  };

  const deleteInvestment = (id) => {
    setInvestments(investments.filter(inv => inv.id !== id));
    showToast('Investment deleted successfully');
  };

  // Data management functions
  const exportData = () => {
    const data = {
      transactions,
      budgets,
      savingsGoals,
      investments,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `finance-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast('Data exported successfully!');
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        if (importedData.transactions) setTransactions(importedData.transactions);
        if (importedData.budgets) setBudgets(importedData.budgets);
        if (importedData.savingsGoals) setSavingsGoals(importedData.savingsGoals);
        if (importedData.investments) setInvestments(importedData.investments);
        
        showToast('Data imported successfully!');
      } catch (error) {
        showToast('Error importing data. Please check the file format.', 'error');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      setTransactions([]);
      setBudgets({});
      setSavingsGoals([]);
      setInvestments([]);
      
      // Clear localStorage
      localStorage.removeItem('financeTracker_transactions');
      localStorage.removeItem('financeTracker_budgets');
      localStorage.removeItem('financeTracker_savingsGoals');
      localStorage.removeItem('financeTracker_investments');
      localStorage.removeItem('financeTracker_activeTab');
      
      showToast('All data cleared successfully');
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <Dashboard 
              transactions={transactions} 
              budgets={budgets}
              savingsGoals={savingsGoals}
              investments={investments}
            />
            <div className="content-grid">
              <div className="left-panel">
                <TransactionForm onAddTransaction={addTransaction} />
                <BudgetForm onSetBudget={setBudget} />
              </div>
              <div className="right-panel">
                <TransactionList 
                  transactions={transactions} 
                  onDeleteTransaction={deleteTransaction}
                />
              </div>
            </div>
          </>
        );
      case 'savings':
        return (
          <SavingsGoals 
            savingsGoals={savingsGoals}
            onAddGoal={addSavingsGoal}
            onUpdateGoal={updateSavingsGoal}
            onDeleteGoal={deleteSavingsGoal}
          />
        );
      case 'investments':
        return (
          <InvestmentPortfolio 
            investments={investments}
            onAddInvestment={addInvestment}
            onUpdateInvestment={updateInvestment}
            onDeleteInvestment={deleteInvestment}
          />
        );
      case 'insights':
        return (
          <FinancialInsights 
            transactions={transactions}
            budgets={budgets}
            savingsGoals={savingsGoals}
            investments={investments}
          />
        );
      case 'settings':
        return (
          <Settings 
            onExportData={exportData}
            onImportData={importData}
            onClearData={clearAllData}
            transactions={transactions}
            budgets={budgets}
            savingsGoals={savingsGoals}
            investments={investments}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="container">
      <h1>Personal Finance Tracker</h1>
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      {renderActiveTab()}
      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default App;
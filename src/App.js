import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import BudgetForm from './components/BudgetForm';
import './App.css';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

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

  return (
    <div className="container">
      <h1>Personal Finance Tracker</h1>
      <Dashboard 
        transactions={transactions} 
        budgets={budgets}
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
      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default App;
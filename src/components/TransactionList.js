import React, { useState } from 'react';

function TransactionList({ transactions, onDeleteTransaction }) {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const getFilteredTransactions = () => {
    let filtered = [...transactions];
    
    if (filter === 'income') {
      filtered = filtered.filter(t => t.amount < 0);
    } else if (filter === 'expense') {
      filtered = filtered.filter(t => t.amount > 0);
    }
    
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'amount') {
        aValue = Math.abs(parseFloat(aValue));
        bValue = Math.abs(parseFloat(bValue));
      } else if (sortBy === 'date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return filtered;
  };

  const filteredTransactions = getFilteredTransactions();
  const totalIncome = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const totalExpenses = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const netAmount = totalIncome - totalExpenses;

  return (
    <div className="card">
      <div className="transaction-header">
        <h2>💳 Transactions</h2>
        <div className="transaction-summary">
          <div className="summary-item income">
            <span className="label">Income:</span>
            <span className="value">+${totalIncome.toFixed(2)}</span>
          </div>
          <div className="summary-item expense">
            <span className="label">Expenses:</span>
            <span className="value">-${totalExpenses.toFixed(2)}</span>
          </div>
          <div className={`summary-item net ${netAmount >= 0 ? 'positive' : 'negative'}`}>
            <span className="label">Net:</span>
            <span className="value">{netAmount >= 0 ? '+' : ''}${netAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="transaction-controls">
        <div className="filter-controls">
          <label>Filter:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="form-control filter-select"
          >
            <option value="all">All Transactions</option>
            <option value="income">Income Only</option>
            <option value="expense">Expenses Only</option>
          </select>
        </div>
        
        <div className="sort-controls">
          <label>Sort by:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="form-control filter-select"
          >
            <option value="date">Date</option>
            <option value="amount">Amount</option>
            <option value="description">Description</option>
            <option value="category">Category</option>
          </select>
          <button 
            className="sort-order-btn"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      <div className="transaction-list">
        {filteredTransactions.length > 0 ? (
          <table className="transaction-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(transaction => {
                const isIncome = transaction.amount < 0;
                const displayAmount = Math.abs(transaction.amount);
                
                return (
                  <tr key={transaction.id} className={isIncome ? 'income-row' : 'expense-row'}>
                    <td>
                      <span className={`transaction-type ${isIncome ? 'income' : 'expense'}`}>
                        {isIncome ? '💰' : '💸'}
                      </span>
                    </td>
                    <td>{new Date(transaction.date).toLocaleDateString()}</td>
                    <td>{transaction.description}</td>
                    <td>
                      <span className="category-tag">{transaction.category}</span>
                    </td>
                    <td className={isIncome ? 'income-amount' : 'expense-amount'}>
                      {isIncome ? '+' : '-'}${displayAmount.toFixed(2)}
                    </td>
                    <td>
                      <button 
                        className="btn btn-delete btn-sm"
                        onClick={() => onDeleteTransaction(transaction.id)}
                        title="Delete transaction"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="empty-transactions">
            <p>No transactions found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TransactionList;
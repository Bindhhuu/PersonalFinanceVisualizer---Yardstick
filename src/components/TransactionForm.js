import React, { useState } from 'react';

const expenseCategories = [
  'Food', 'Transportation', 'Housing', 'Utilities', 
  'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Other'
];

const incomeCategories = [
  'Salary', 'Freelance', 'Investment Returns', 'Business', 'Gifts', 'Other Income'
];

function TransactionForm({ onAddTransaction }) {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: 'Other',
    type: 'expense',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) return;
    
    onAddTransaction({
      ...formData,
      amount: formData.type === 'expense' ? parseFloat(formData.amount) : -parseFloat(formData.amount)
    });
    
    setFormData({
      amount: '',
      description: '',
      category: formData.type === 'expense' ? 'Other' : 'Salary',
      type: 'expense',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const getCurrentCategories = () => {
    return formData.type === 'expense' ? expenseCategories : incomeCategories;
  };

  return (
    <div className="card">
      <h2>Add Transaction</h2>
      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-group">
          <label>Type</label>
          <div className="transaction-type-toggle">
            <button
              type="button"
              className={`type-btn ${formData.type === 'expense' ? 'active' : ''}`}
              onClick={() => setFormData({ 
                ...formData, 
                type: 'expense',
                category: 'Other'
              })}
            >
              💸 Expense
            </button>
            <button
              type="button"
              className={`type-btn ${formData.type === 'income' ? 'active' : ''}`}
              onClick={() => setFormData({ 
                ...formData, 
                type: 'income',
                category: 'Salary'
              })}
            >
              💰 Income
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Amount ($)</label>
          <input
            type="number"
            className="form-control"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            min="0"
            step="0.01"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <input
            type="text"
            className="form-control"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder={formData.type === 'expense' ? 'What did you spend on?' : 'Source of income'}
            required
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <select
            className="form-control"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            {getCurrentCategories().map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            className="form-control"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>

        <button type="submit" className="btn">
          Add {formData.type === 'expense' ? 'Expense' : 'Income'}
        </button>
      </form>
    </div>
  );
}

export default TransactionForm;
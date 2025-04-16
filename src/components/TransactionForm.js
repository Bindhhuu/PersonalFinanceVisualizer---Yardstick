import React, { useState } from 'react';

const categories = [
  'Food', 'Transportation', 'Housing', 'Utilities', 
  'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Other'
];

function TransactionForm({ onAddTransaction }) {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: 'Other',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) return;
    
    onAddTransaction(formData);
    setFormData({
      amount: '',
      description: '',
      category: 'Other',
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="card">
      <h2>Add Transaction</h2>
      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-group">
          <label>Amount</label>
          <input
            type="number"
            className="form-control"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
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
            {categories.map(category => (
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

        <button type="submit" className="btn">Add Transaction</button>
      </form>
    </div>
  );
}

export default TransactionForm;
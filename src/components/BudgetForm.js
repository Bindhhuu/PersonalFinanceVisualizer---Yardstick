import React, { useState } from 'react';

const categories = [
  'Food', 'Transportation', 'Housing', 'Utilities', 
  'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Other'
];

function BudgetForm({ onSetBudget }) {
  const [category, setCategory] = useState('Food');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount) return;
    
    onSetBudget(category, Number(amount));
    setAmount('');
  };

  return (
    <div className="card">
      <h2>Set Budget</h2>
      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-group">
          <label>Category</label>
          <select
            className="form-control"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Budget Amount</label>
          <input
            type="number"
            className="form-control"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn">Set Budget</button>
      </form>
    </div>
  );
}

export default BudgetForm;
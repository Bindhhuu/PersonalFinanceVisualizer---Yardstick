import React from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

function Dashboard({ transactions, budgets }) {
  const totalExpenses = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

  const categoryData = transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
    return acc;
  }, {});

  const pieData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));

  const monthlyData = transactions.reduce((acc, t) => {
    const month = new Date(t.date).toLocaleString('default', { month: 'short' });
    acc[month] = (acc[month] || 0) + Number(t.amount);
    return acc;
  }, {});

  const barData = Object.entries(monthlyData).map(([month, amount]) => ({
    month,
    amount
  }));

  const budgetComparison = Object.entries(categoryData).map(([category, spent]) => ({
    category,
    spent,
    budget: budgets[category] || 0,
    remaining: (budgets[category] || 0) - spent
  }));

  return (
    <div className="dashboard">
      <div className="card">
        <h2>Total Expenses</h2>
        <p className="total-amount">${totalExpenses.toFixed(2)}</p>
      </div>

      <div className="card">
        <h2>Category Breakdown</h2>
        <div className="chart-container">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h2>Monthly Expenses</h2>
        <div className="chart-container">
          <ResponsiveContainer>
            <BarChart data={barData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card full-width">
        <h2>Budget vs Actual</h2>
        <div className="budget-comparison">
          {budgetComparison.map(({ category, spent, budget, remaining }) => (
            <div key={category} className="budget-item">
              <h3>{category}</h3>
              <p>Budget: ${budget}</p>
              <p>Spent: ${spent}</p>
              <p className={remaining < 0 ? 'over-budget' : ''}>
                Remaining: ${remaining}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
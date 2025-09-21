import React from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

function Dashboard({ transactions = [], budgets = {}, savingsGoals = [], investments = [] }) {
  // Filter out income (negative amounts) for expense calculations
  const expenseTransactions = transactions.filter(t => Number(t.amount) > 0);
  const incomeTransactions = transactions.filter(t => Number(t.amount) < 0);
  
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
  const totalSavings = savingsGoals.reduce((sum, goal) => sum + (goal.currentAmount || 0), 0);
  const totalInvestments = investments.reduce((sum, inv) => sum + (inv.currentValue || 0), 0);
  const totalInvested = investments.reduce((sum, inv) => sum + (inv.totalInvested || 0), 0);
  const investmentGainLoss = totalInvestments - totalInvested;

  // Only use expense transactions for category breakdown
  const categoryData = expenseTransactions.reduce((acc, t) => {
    const amount = Number(t.amount);
    if (!isNaN(amount) && amount > 0) {
      acc[t.category] = (acc[t.category] || 0) + amount;
    }
    return acc;
  }, {});

  const pieData = Object.entries(categoryData)
    .filter(([name, value]) => !isNaN(value) && value > 0)
    .map(([name, value]) => ({ name, value }));

  const monthlyData = expenseTransactions.reduce((acc, t) => {
    const amount = Number(t.amount);
    if (!isNaN(amount) && amount > 0) {
      const month = new Date(t.date).toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + amount;
    }
    return acc;
  }, {});

  const barData = Object.entries(monthlyData)
    .filter(([month, amount]) => !isNaN(amount) && amount > 0)
    .map(([month, amount]) => ({ month, amount }));

  const budgetComparison = Object.entries(categoryData).map(([category, spent]) => ({
    category,
    spent: spent || 0,
    budget: budgets[category] || 0,
    remaining: (budgets[category] || 0) - (spent || 0)
  }));

  // Calculate savings goals progress with validation
  const savingsProgress = savingsGoals
    .filter(goal => goal.targetAmount > 0)
    .map(goal => ({
      name: goal.title && goal.title.length > 15 ? goal.title.substring(0, 15) + '...' : goal.title || 'Untitled',
      progress: Math.min(((goal.currentAmount || 0) / goal.targetAmount) * 100, 100)
    }))
    .filter(goal => !isNaN(goal.progress));

  return (
    <div className="dashboard">
      {/* Financial Overview Cards */}
      <div className="overview-cards">
        <div className="card metric-card">
          <h3>💰 Total Expenses</h3>
          <p className="metric-value expense">${totalExpenses.toFixed(2)}</p>
        </div>

        <div className="card metric-card">
          <h3>💵 Total Income</h3>
          <p className="metric-value income">${totalIncome.toFixed(2)}</p>
        </div>

        <div className="card metric-card">
          <h3>🎯 Total Savings</h3>
          <p className="metric-value savings">${totalSavings.toFixed(2)}</p>
        </div>

        <div className="card metric-card">
          <h3>📈 Investments</h3>
          <p className="metric-value investment">${totalInvestments.toFixed(2)}</p>
          {investments.length > 0 && (
            <p className={`metric-subtitle ${investmentGainLoss >= 0 ? 'positive' : 'negative'}`}>
              {investmentGainLoss >= 0 ? '+' : ''}${investmentGainLoss.toFixed(2)}
            </p>
          )}
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {pieData.length > 0 ? (
          <div className="card">
            <h2>📊 Category Breakdown</h2>
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
                  <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="card">
            <h2>📊 Category Breakdown</h2>
            <div className="empty-chart">
              <p>No expense data available yet. Add some transactions to see the breakdown!</p>
            </div>
          </div>
        )}

        {barData.length > 0 ? (
          <div className="card">
            <h2>📅 Monthly Expenses</h2>
            <div className="chart-container">
              <ResponsiveContainer>
                <BarChart data={barData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']} />
                  <Bar dataKey="amount" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="card">
            <h2>📅 Monthly Expenses</h2>
            <div className="empty-chart">
              <p>No monthly data available yet. Add some transactions to see trends!</p>
            </div>
          </div>
        )}

        {savingsProgress.length > 0 && (
          <div className="card">
            <h2>🎯 Savings Goals Progress</h2>
            <div className="chart-container">
              <ResponsiveContainer>
                <BarChart data={savingsProgress} layout="horizontal">
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Progress']} />
                  <Bar dataKey="progress" fill="#38a169" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Budget Comparison */}
      <div className="card full-width">
        <h2>💳 Budget vs Actual</h2>
        <div className="budget-comparison">
          {budgetComparison.length > 0 ? budgetComparison.map(({ category, spent, budget, remaining }) => (
            <div key={category} className="budget-item">
              <h3>{category}</h3>
              <div className="budget-details">
                <p>Budget: <span className="budget-amount">${budget.toFixed(2)}</span></p>
                <p>Spent: <span className="spent-amount">${spent.toFixed(2)}</span></p>
                <p className={remaining < 0 ? 'over-budget' : 'under-budget'}>
                  Remaining: <span>${remaining.toFixed(2)}</span>
                </p>
              </div>
              {budget > 0 && (
                <div className="budget-progress-bar">
                  <div 
                    className={`progress-fill ${spent > budget ? 'over-budget' : ''}`}
                    style={{ width: `${Math.min((spent / budget) * 100, 100)}%` }}
                  ></div>
                </div>
              )}
            </div>
          )) : (
            <div className="empty-budget-state">
              <p>No budget data available. Set up budgets to track your spending!</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-item">
          <span className="stat-label">Active Savings Goals:</span>
          <span className="stat-value">{savingsGoals.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Investment Holdings:</span>
          <span className="stat-value">{investments.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">This Month's Transactions:</span>
          <span className="stat-value">
            {transactions.filter(t => {
              const transactionDate = new Date(t.date);
              const now = new Date();
              return transactionDate.getMonth() === now.getMonth() && 
                     transactionDate.getFullYear() === now.getFullYear();
            }).length}
          </span>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
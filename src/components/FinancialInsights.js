import React, { useState } from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

function FinancialInsights({ transactions = [], budgets = {}, savingsGoals = [], investments = [] }) {
  const [timeRange, setTimeRange] = useState('6months');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const getFilteredTransactions = () => {
    if (!transactions || transactions.length === 0) return [];
    
    const now = new Date();
    const months = timeRange === '1month' ? 1 : timeRange === '3months' ? 3 : timeRange === '6months' ? 6 : 12;
    const startDate = new Date(now.getFullYear(), now.getMonth() - months, 1);
    
    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const categoryMatch = selectedCategory === 'all' || t.category === selectedCategory;
      const amount = Number(t.amount);
      return transactionDate >= startDate && categoryMatch && !isNaN(amount) && amount > 0; // Only expenses for insights
    });
  };

  const getSpendingTrends = () => {
    const filteredTransactions = getFilteredTransactions();
    const monthlyData = {};
    
    filteredTransactions.forEach(t => {
      const amount = parseFloat(t.amount);
      if (!isNaN(amount) && amount > 0) {
        const date = new Date(t.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + amount;
      }
    });

    return Object.entries(monthlyData)
      .filter(([month, amount]) => !isNaN(amount) && amount > 0)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, amount]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        amount: amount
      }));
  };

  const getCategoryInsights = () => {
    const filteredTransactions = getFilteredTransactions();
    const categoryData = {};
    
    filteredTransactions.forEach(t => {
      const amount = parseFloat(t.amount);
      if (!isNaN(amount) && amount > 0) {
        categoryData[t.category] = (categoryData[t.category] || 0) + amount;
      }
    });

    return Object.entries(categoryData)
      .filter(([category, amount]) => !isNaN(amount) && amount > 0)
      .map(([category, amount]) => ({
        category,
        amount,
        budget: budgets[category] || 0,
        percentage: budgets[category] && budgets[category] > 0 ? (amount / budgets[category]) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  const getWeeklySpending = () => {
    const filteredTransactions = getFilteredTransactions();
    const weeklyData = {};
    
    filteredTransactions.forEach(t => {
      const amount = parseFloat(t.amount);
      if (!isNaN(amount) && amount > 0) {
        const date = new Date(t.date);
        const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
        const weekKey = weekStart.toISOString().split('T')[0];
        weeklyData[weekKey] = (weeklyData[weekKey] || 0) + amount;
      }
    });

    return Object.entries(weeklyData)
      .filter(([week, amount]) => !isNaN(amount) && amount > 0)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, amount]) => ({
        week: new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount: amount
      }));
  };

  const calculateFinancialHealth = () => {
    const expenseTransactions = transactions.filter(t => {
      const amount = parseFloat(t.amount);
      return !isNaN(amount) && amount > 0;
    });
    
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalSavingsGoals = savingsGoals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);
    const totalInvestments = investments.reduce((sum, i) => sum + (i.currentValue || 0), 0);
    
    if (expenseTransactions.length === 0) return 50; // Default score if no data
    
    const monthlyExpenses = totalExpenses / Math.max(1, 
      Math.ceil((new Date() - new Date(Math.min(...expenseTransactions.map(t => new Date(t.date))))) / (1000 * 60 * 60 * 24 * 30)));
    
    const emergencyFundRatio = monthlyExpenses > 0 ? totalSavingsGoals / (monthlyExpenses * 6) : 0;
    const investmentRatio = totalExpenses > 0 ? totalInvestments / totalExpenses : 0;
    
    let healthScore = 0;
    if (emergencyFundRatio >= 1) healthScore += 40;
    else healthScore += Math.min(emergencyFundRatio * 40, 40);
    
    if (investmentRatio >= 0.5) healthScore += 30;
    else healthScore += Math.min(investmentRatio * 60, 30);
    
    // Budget adherence
    const categoryInsights = getCategoryInsights();
    const budgetAdherence = categoryInsights.reduce((acc, cat) => {
      if (cat.budget > 0) {
        acc.total += 1;
        if (cat.percentage <= 100) acc.onTrack += 1;
      }
      return acc;
    }, { total: 0, onTrack: 0 });
    
    if (budgetAdherence.total > 0) {
      healthScore += (budgetAdherence.onTrack / budgetAdherence.total) * 30;
    } else {
      healthScore += 15; // Partial credit if no budgets set
    }

    return Math.min(100, Math.max(0, healthScore));
  };

  const getTopExpenseCategories = () => {
    return getCategoryInsights().slice(0, 5);
  };

  const getSavingsProgress = () => {
    return savingsGoals.map(goal => ({
      name: goal.title,
      progress: Math.min((goal.currentAmount / goal.targetAmount) * 100, 100),
      current: goal.currentAmount,
      target: goal.targetAmount
    }));
  };

  const spendingTrends = getSpendingTrends();
  const categoryInsights = getCategoryInsights();
  const weeklySpending = getWeeklySpending();
  const financialHealth = calculateFinancialHealth();
  const topCategories = getTopExpenseCategories();
  const savingsProgress = getSavingsProgress();

  const categories = [...new Set(transactions.map(t => t.category))];

  return (
    <div className="financial-insights">
      <div className="section-header">
        <h2>Financial Insights</h2>
        <div className="filters">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="form-control filter-select"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="12months">Last Year</option>
          </select>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="form-control filter-select"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Financial Health Score */}
      <div className="card health-score-card">
        <h3>Financial Health Score</h3>
        <div className="health-score">
          <div className="score-circle">
            <div className="score-value">{financialHealth.toFixed(0)}</div>
            <div className="score-label">/ 100</div>
          </div>
          <div className="health-indicators">
            <div className="indicator">
              <span className="indicator-label">Emergency Fund:</span>
              <span className={`indicator-value ${savingsGoals.length > 0 ? 'good' : 'needs-work'}`}>
                {savingsGoals.length > 0 ? 'On Track' : 'Needs Work'}
              </span>
            </div>
            <div className="indicator">
              <span className="indicator-label">Investments:</span>
              <span className={`indicator-value ${investments.length > 0 ? 'good' : 'needs-work'}`}>
                {investments.length > 0 ? 'Active' : 'None'}
              </span>
            </div>
            <div className="indicator">
              <span className="indicator-label">Budget Tracking:</span>
              <span className={`indicator-value ${Object.keys(budgets).length > 0 ? 'good' : 'needs-work'}`}>
                {Object.keys(budgets).length > 0 ? 'Active' : 'Not Set'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="insights-grid">
        {/* Spending Trends */}
        <div className="card">
          <h3>Spending Trends</h3>
          <div className="chart-container">
            <ResponsiveContainer>
              <AreaChart data={spendingTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']} />
                <Area type="monotone" dataKey="amount" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Spending Pattern */}
        <div className="card">
          <h3>Weekly Spending Pattern</h3>
          <div className="chart-container">
            <ResponsiveContainer>
              <BarChart data={weeklySpending}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']} />
                <Bar dataKey="amount" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="card">
          <h3>Category Spending</h3>
          <div className="chart-container">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={topCategories}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ category, percentage }) => `${category} ${percentage.toFixed(1)}%`}
                >
                  {topCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Savings Goals Progress */}
        {savingsGoals.length > 0 && (
          <div className="card">
            <h3>Savings Goals Progress</h3>
            <div className="chart-container">
              <ResponsiveContainer>
                <BarChart data={savingsProgress} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Progress']} />
                  <Bar dataKey="progress" fill="#38a169" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Insights */}
      <div className="insights-details">
        <div className="card">
          <h3>Budget Performance</h3>
          <div className="budget-performance">
            {categoryInsights.map(category => (
              <div key={category.category} className="budget-item">
                <div className="budget-header">
                  <span className="category-name">{category.category}</span>
                  <span className="budget-amount">${category.amount.toFixed(2)}</span>
                </div>
                {category.budget > 0 && (
                  <div className="budget-progress">
                    <div className="progress-bar-container">
                      <div 
                        className={`progress-bar ${category.percentage > 100 ? 'over-budget' : ''}`}
                        style={{ width: `${Math.min(category.percentage, 100)}%` }}
                      ></div>
                    </div>
                    <span className={`percentage ${category.percentage > 100 ? 'over-budget' : ''}`}>
                      {category.percentage.toFixed(1)}% of budget
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Key Insights</h3>
          <div className="insights-list">
            <div className="insight-item">
              <strong>Average Monthly Spending:</strong> 
              ${(spendingTrends.reduce((sum, month) => sum + month.amount, 0) / Math.max(1, spendingTrends.length)).toFixed(2)}
            </div>
            <div className="insight-item">
              <strong>Highest Spending Category:</strong> 
              {topCategories.length > 0 ? `${topCategories[0].category} ($${topCategories[0].amount.toFixed(2)})` : 'No data'}
            </div>
            <div className="insight-item">
              <strong>Total Savings Goals:</strong> 
              ${savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0).toFixed(2)}
            </div>
            <div className="insight-item">
              <strong>Investment Portfolio Value:</strong> 
              ${investments.reduce((sum, inv) => sum + inv.currentValue, 0).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinancialInsights;
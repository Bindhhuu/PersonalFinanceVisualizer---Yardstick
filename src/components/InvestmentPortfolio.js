import React, { useState } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const INVESTMENT_TYPES = [
  'Stocks', 'Bonds', 'ETFs', 'Mutual Funds', 'Real Estate', 'Cryptocurrency', 'Commodities', 'Other'
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

function InvestmentPortfolio({ investments = [], onAddInvestment, onUpdateInvestment, onDeleteInvestment }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Stocks',
    shares: '',
    purchasePrice: '',
    currentPrice: '',
    purchaseDate: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.shares || !formData.purchasePrice || !formData.currentPrice) return;

    const investmentData = {
      ...formData,
      shares: parseFloat(formData.shares),
      purchasePrice: parseFloat(formData.purchasePrice),
      currentPrice: parseFloat(formData.currentPrice),
      totalInvested: parseFloat(formData.shares) * parseFloat(formData.purchasePrice),
      currentValue: parseFloat(formData.shares) * parseFloat(formData.currentPrice)
    };

    if (editingId) {
      onUpdateInvestment(editingId, investmentData);
      setEditingId(null);
    } else {
      onAddInvestment(investmentData);
    }

    setFormData({
      name: '',
      type: 'Stocks',
      shares: '',
      purchasePrice: '',
      currentPrice: '',
      purchaseDate: new Date().toISOString().split('T')[0]
    });
    setShowForm(false);
  };

  const handleEdit = (investment) => {
    setFormData({
      name: investment.name,
      type: investment.type,
      shares: investment.shares.toString(),
      purchasePrice: investment.purchasePrice.toString(),
      currentPrice: investment.currentPrice.toString(),
      purchaseDate: investment.purchaseDate
    });
    setEditingId(investment.id);
    setShowForm(true);
  };

  const calculatePortfolioMetrics = () => {
    const totalInvested = investments.reduce((sum, inv) => sum + (inv.totalInvested || 0), 0);
    const currentValue = investments.reduce((sum, inv) => sum + (inv.currentValue || 0), 0);
    const totalGainLoss = currentValue - totalInvested;
    const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

    return { totalInvested, currentValue, totalGainLoss, totalGainLossPercent };
  };

  const getPortfolioAllocation = () => {
    const allocation = investments.reduce((acc, inv) => {
      const value = inv.currentValue || 0;
      if (value > 0) {
        acc[inv.type] = (acc[inv.type] || 0) + value;
      }
      return acc;
    }, {});

    return Object.entries(allocation)
      .filter(([name, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  };

  const getTopPerformers = () => {
    return investments
      .filter(inv => (inv.totalInvested || 0) > 0 && (inv.currentValue || 0) > 0)
      .map(inv => ({
        ...inv,
        gainLoss: (inv.currentValue || 0) - (inv.totalInvested || 0),
        gainLossPercent: inv.totalInvested > 0 ? (((inv.currentValue || 0) - (inv.totalInvested || 0)) / inv.totalInvested) * 100 : 0
      }))
      .filter(inv => !isNaN(inv.gainLossPercent))
      .sort((a, b) => b.gainLossPercent - a.gainLossPercent)
      .slice(0, 5);
  };

  const metrics = calculatePortfolioMetrics();
  const allocationData = getPortfolioAllocation();
  const topPerformers = getTopPerformers();

  return (
    <div className="investment-portfolio">
      <div className="section-header">
        <h2>Investment Portfolio</h2>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              name: '',
              type: 'Stocks',
              shares: '',
              purchasePrice: '',
              currentPrice: '',
              purchaseDate: new Date().toISOString().split('T')[0]
            });
          }}
        >
          {showForm ? 'Cancel' : 'Add Investment'}
        </button>
      </div>

      {/* Portfolio Overview */}
      <div className="portfolio-overview">
        <div className="metric-card">
          <h3>Total Invested</h3>
          <p className="metric-value">${metrics.totalInvested.toFixed(2)}</p>
        </div>
        <div className="metric-card">
          <h3>Current Value</h3>
          <p className="metric-value">${metrics.currentValue.toFixed(2)}</p>
        </div>
        <div className="metric-card">
          <h3>Total Gain/Loss</h3>
          <p className={`metric-value ${metrics.totalGainLoss >= 0 ? 'positive' : 'negative'}`}>
            ${metrics.totalGainLoss.toFixed(2)} ({metrics.totalGainLossPercent.toFixed(2)}%)
          </p>
        </div>
      </div>

      {showForm && (
        <div className="card">
          <h3>{editingId ? 'Edit Investment' : 'Add New Investment'}</h3>
          <form onSubmit={handleSubmit} className="form-container">
            <div className="form-row">
              <div className="form-group">
                <label>Investment Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Apple Inc., S&P 500 ETF"
                  required
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select
                  className="form-control"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  {INVESTMENT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Shares/Units</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.shares}
                  onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
                  min="0"
                  step="0.001"
                  required
                />
              </div>
              <div className="form-group">
                <label>Purchase Price ($)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Current Price ($)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.currentPrice}
                  onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="form-group">
                <label>Purchase Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary">
              {editingId ? 'Update Investment' : 'Add Investment'}
            </button>
          </form>
        </div>
      )}

      {investments.length > 0 && (
        <>
          {/* Charts Section */}
          <div className="charts-section">
            <div className="card">
              <h3>Portfolio Allocation</h3>
              <div className="chart-container">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={allocationData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                    >
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Value']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <h3>Top Performers</h3>
              <div className="chart-container">
                <ResponsiveContainer>
                  <BarChart data={topPerformers}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value.toFixed(2)}%`, 'Return']} />
                    <Bar dataKey="gainLossPercent" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Investment List */}
          <div className="card">
            <h3>Investment Holdings</h3>
            <div className="investment-table-container">
              <table className="investment-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Shares</th>
                    <th>Purchase Price</th>
                    <th>Current Price</th>
                    <th>Total Invested</th>
                    <th>Current Value</th>
                    <th>Gain/Loss</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {investments.map(investment => {
                    const gainLoss = investment.currentValue - investment.totalInvested;
                    const gainLossPercent = (gainLoss / investment.totalInvested) * 100;
                    
                    return (
                      <tr key={investment.id}>
                        <td>{investment.name}</td>
                        <td>{investment.type}</td>
                        <td>{investment.shares}</td>
                        <td>${investment.purchasePrice.toFixed(2)}</td>
                        <td>${investment.currentPrice.toFixed(2)}</td>
                        <td>${investment.totalInvested.toFixed(2)}</td>
                        <td>${investment.currentValue.toFixed(2)}</td>
                        <td className={gainLoss >= 0 ? 'positive' : 'negative'}>
                          ${gainLoss.toFixed(2)} ({gainLossPercent.toFixed(2)}%)
                        </td>
                        <td>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleEdit(investment)}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-delete btn-sm"
                            onClick={() => onDeleteInvestment(investment.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {investments.length === 0 && (
        <div className="empty-state">
          <h3>No Investments Yet</h3>
          <p>Add your first investment to start tracking your portfolio performance.</p>
        </div>
      )}
    </div>
  );
}

export default InvestmentPortfolio;
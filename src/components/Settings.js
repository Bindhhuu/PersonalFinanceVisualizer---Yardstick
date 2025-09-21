import React, { useRef } from 'react';

function Settings({ onExportData, onImportData, onClearData, transactions, budgets, savingsGoals, investments }) {
  const fileInputRef = useRef(null);

  const getDataStats = () => {
    const totalTransactions = transactions.length;
    const totalBudgets = Object.keys(budgets).length;
    const totalGoals = savingsGoals.length;
    const totalInvestments = investments.length;
    
    const dataSize = JSON.stringify({ transactions, budgets, savingsGoals, investments }).length;
    const sizeInKB = (dataSize / 1024).toFixed(2);
    
    return { totalTransactions, totalBudgets, totalGoals, totalInvestments, sizeInKB };
  };

  const stats = getDataStats();

  return (
    <div className="settings">
      <div className="section-header">
        <h2>⚙️ Settings & Data Management</h2>
      </div>

      {/* Data Statistics */}
      <div className="card">
        <h3>📊 Data Overview</h3>
        <div className="data-stats">
          <div className="stat-item">
            <span className="stat-icon">💳</span>
            <div className="stat-info">
              <span className="stat-number">{stats.totalTransactions}</span>
              <span className="stat-label">Transactions</span>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">💰</span>
            <div className="stat-info">
              <span className="stat-number">{stats.totalBudgets}</span>
              <span className="stat-label">Budget Categories</span>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">🎯</span>
            <div className="stat-info">
              <span className="stat-number">{stats.totalGoals}</span>
              <span className="stat-label">Savings Goals</span>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">📈</span>
            <div className="stat-info">
              <span className="stat-number">{stats.totalInvestments}</span>
              <span className="stat-label">Investments</span>
            </div>
          </div>
        </div>
        <div className="storage-info">
          <p><strong>Data Size:</strong> {stats.sizeInKB} KB stored locally</p>
          <p><strong>Storage:</strong> All data is saved automatically in your browser's local storage</p>
        </div>
      </div>

      {/* Data Management */}
      <div className="card">
        <h3>💾 Data Backup & Restore</h3>
        <div className="data-management">
          <div className="management-section">
            <h4>Export Data</h4>
            <p>Download a backup of all your financial data as a JSON file.</p>
            <button className="btn btn-primary" onClick={onExportData}>
              📤 Export Data
            </button>
          </div>

          <div className="management-section">
            <h4>Import Data</h4>
            <p>Restore your data from a previously exported backup file.</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={onImportData}
              accept=".json"
              style={{ display: 'none' }}
            />
            <button 
              className="btn btn-secondary" 
              onClick={() => fileInputRef.current?.click()}
            >
              📥 Import Data
            </button>
          </div>

          <div className="management-section danger-zone">
            <h4>⚠️ Danger Zone</h4>
            <p>Permanently delete all your financial data. This action cannot be undone.</p>
            <button className="btn btn-danger" onClick={onClearData}>
              🗑️ Clear All Data
            </button>
          </div>
        </div>
      </div>

      {/* App Information */}
      <div className="card">
        <h3>ℹ️ About</h3>
        <div className="app-info">
          <p><strong>Personal Finance Tracker</strong></p>
          <p>Version 1.0.0</p>
          <p>A comprehensive finance management tool with expense tracking, savings goals, investment portfolio management, and financial insights.</p>
          
          <div className="features-list">
            <h4>Features:</h4>
            <ul>
              <li>✅ Income & Expense Tracking</li>
              <li>✅ Budget Management</li>
              <li>✅ Savings Goals (6 months, 1 year, 5 years)</li>
              <li>✅ Investment Portfolio Tracking</li>
              <li>✅ Financial Health Score</li>
              <li>✅ Interactive Charts & Analytics</li>
              <li>✅ Data Export/Import</li>
              <li>✅ Responsive Design</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="card">
        <h3>🔒 Privacy & Security</h3>
        <div className="privacy-info">
          <div className="privacy-item">
            <span className="privacy-icon">🏠</span>
            <div>
              <h4>Local Storage Only</h4>
              <p>All your data is stored locally in your browser. Nothing is sent to external servers.</p>
            </div>
          </div>
          <div className="privacy-item">
            <span className="privacy-icon">🔐</span>
            <div>
              <h4>No Account Required</h4>
              <p>No registration, login, or personal information required to use this app.</p>
            </div>
          </div>
          <div className="privacy-item">
            <span className="privacy-icon">💻</span>
            <div>
              <h4>Browser Dependent</h4>
              <p>Data is tied to this browser. Use export/import to transfer data between devices.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
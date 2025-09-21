import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const GOAL_PERIODS = {
  '6months': { label: '6 Months', months: 6 },
  '1year': { label: '1 Year', months: 12 },
  '5years': { label: '5 Years', months: 60 }
};

function SavingsGoals({ savingsGoals = [], onAddGoal, onUpdateGoal, onDeleteGoal }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    targetAmount: '',
    period: '6months',
    description: ''
  });
  const [contributionAmount, setContributionAmount] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.targetAmount) return;

    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + GOAL_PERIODS[formData.period].months);

    onAddGoal({
      ...formData,
      targetAmount: parseFloat(formData.targetAmount),
      targetDate: targetDate.toISOString(),
      createdDate: new Date().toISOString()
    });

    setFormData({ title: '', targetAmount: '', period: '6months', description: '' });
    setShowForm(false);
  };

  const handleContribution = (goalId) => {
    if (!contributionAmount) return;
    onUpdateGoal(goalId, parseFloat(contributionAmount));
    setContributionAmount('');
    setSelectedGoalId(null);
  };

  const calculateProgress = (goal) => {
    const current = goal.currentAmount || 0;
    const target = goal.targetAmount || 1;
    return Math.min((current / target) * 100, 100);
  };

  const calculateMonthlyTarget = (goal) => {
    const remaining = (goal.targetAmount || 0) - (goal.currentAmount || 0);
    const monthsLeft = Math.max(1, Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24 * 30)));
    return Math.max(0, remaining) / monthsLeft;
  };

  const getGoalStatus = (goal) => {
    const progress = calculateProgress(goal);
    const daysLeft = Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
    
    if (progress >= 100) return { status: 'completed', color: '#38a169' };
    if (daysLeft < 0) return { status: 'overdue', color: '#e53e3e' };
    if (daysLeft < 30) return { status: 'urgent', color: '#dd6b20' };
    return { status: 'on-track', color: '#4299e1' };
  };

  return (
    <div className="savings-goals">
      <div className="section-header">
        <h2>Savings Goals</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add New Goal'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h3>Create New Savings Goal</h3>
          <form onSubmit={handleSubmit} className="form-container">
            <div className="form-row">
              <div className="form-group">
                <label>Goal Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Emergency Fund, Vacation, New Car"
                  required
                />
              </div>
              <div className="form-group">
                <label>Target Amount ($)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Time Period</label>
                <select
                  className="form-control"
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                >
                  {Object.entries(GOAL_PERIODS).map(([key, period]) => (
                    <option key={key} value={key}>{period.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Description (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional details about your goal"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary">Create Goal</button>
          </form>
        </div>
      )}

      <div className="goals-grid">
        {savingsGoals.map(goal => {
          const progress = calculateProgress(goal);
          const monthlyTarget = calculateMonthlyTarget(goal);
          const { status, color } = getGoalStatus(goal);
          const daysLeft = Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24));

          return (
            <div key={goal.id} className="goal-card">
              <div className="goal-header">
                <h3>{goal.title}</h3>
                <span className={`goal-status ${status}`}>{status.replace('-', ' ')}</span>
              </div>
              
              <div className="goal-progress">
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${progress}%`, backgroundColor: color }}
                  ></div>
                </div>
                <span className="progress-text">{progress.toFixed(1)}%</span>
              </div>

              <div className="goal-details">
                <div className="detail-item">
                  <span className="label">Current:</span>
                  <span className="value">${goal.currentAmount.toFixed(2)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Target:</span>
                  <span className="value">${goal.targetAmount.toFixed(2)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Remaining:</span>
                  <span className="value">${(goal.targetAmount - goal.currentAmount).toFixed(2)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Days Left:</span>
                  <span className="value">{daysLeft > 0 ? daysLeft : 'Overdue'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Monthly Target:</span>
                  <span className="value">${monthlyTarget.toFixed(2)}</span>
                </div>
              </div>

              {goal.description && (
                <p className="goal-description">{goal.description}</p>
              )}

              <div className="goal-actions">
                <div className="contribution-section">
                  {selectedGoalId === goal.id ? (
                    <div className="contribution-form">
                      <input
                        type="number"
                        className="form-control contribution-input"
                        value={contributionAmount}
                        onChange={(e) => setContributionAmount(e.target.value)}
                        placeholder="Amount to add"
                        min="0"
                        step="0.01"
                      />
                      <button 
                        className="btn btn-success"
                        onClick={() => handleContribution(goal.id)}
                      >
                        Add
                      </button>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => setSelectedGoalId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button 
                      className="btn btn-primary"
                      onClick={() => setSelectedGoalId(goal.id)}
                    >
                      Add Money
                    </button>
                  )}
                </div>
                <button 
                  className="btn btn-delete"
                  onClick={() => onDeleteGoal(goal.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {savingsGoals.length === 0 && (
        <div className="empty-state">
          <h3>No Savings Goals Yet</h3>
          <p>Create your first savings goal to start tracking your progress towards financial milestones.</p>
        </div>
      )}
    </div>
  );
}

export default SavingsGoals;
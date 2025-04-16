import React from 'react';

function TransactionList({ transactions, onDeleteTransaction }) {
  return (
    <div className="card">
      <h2>Transactions</h2>
      <div className="transaction-list">
        <table className="transaction-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(transaction => (
              <tr key={transaction.id}>
                <td>{new Date(transaction.date).toLocaleDateString()}</td>
                <td>{transaction.description}</td>
                <td>{transaction.category}</td>
                <td>${Number(transaction.amount).toFixed(2)}</td>
                <td>
                  <button 
                    className="btn btn-delete"
                    onClick={() => onDeleteTransaction(transaction.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TransactionList;
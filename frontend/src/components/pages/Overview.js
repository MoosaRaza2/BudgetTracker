import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Overview() {
  const [userName, setUserName] = useState("User");
  const [financialSummary, setFinancialSummary] = useState({
    income: 0,
    expenses: 0,
    balance: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('authToken');
      try {
        // Fetch financial summary
        const summaryResponse = await axios.get('http://localhost:5000/api/transactions/balance', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFinancialSummary(summaryResponse.data);

        // Fetch recent transactions
        const transactionsResponse = await axios.get('http://localhost:5000/api/transactions', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRecentTransactions(transactionsResponse.data.slice(0, 5)); // Get only the 5 most recent
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Welcome, {userName}!</h2>
      
      {/* Financial Summary Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Financial Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-2">Income</h3>
            <p className="text-2xl font-bold text-green-600">{financialSummary.income.toFixed(2)} AED</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-2">Expenses</h3>
            <p className="text-2xl font-bold text-red-600">{financialSummary.expenses.toFixed(2)} AED</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-2">Balance</h3>
            <p className={`text-2xl font-bold ${financialSummary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {financialSummary.balance.toFixed(2)} AED
            </p>
          </div>
        </div>
        {financialSummary.income > 0 && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${financialSummary.balance >= 0 ? 'bg-green-600' : 'bg-red-600'}`}
                style={{ width: `${Math.min(100, (financialSummary.income - financialSummary.expenses) / financialSummary.income * 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {financialSummary.balance >= 0 
                ? `You're saving ${((financialSummary.balance / financialSummary.income) * 100).toFixed(1)}% of your income` 
                : `You're overspending by ${Math.abs((financialSummary.balance / financialSummary.income) * 100).toFixed(1)}%`}
            </p>
          </div>
        )}
      </div>
      
      {/* Recent Transactions */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Recent Transactions</h3>
        {recentTransactions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No recent transactions</p>
        ) : (
          <ul>
            {recentTransactions.map(transaction => (
              <li key={transaction._id} className="flex justify-between items-center py-2 border-b last:border-0">
                <div>
                  <span className={`inline-block w-20 ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'income' ? '+' : '-'}{transaction.amount} AED
                  </span>
                  <span className="ml-2 text-gray-700">{transaction.category}</span>
                </div>
                <span className="text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Overview; 
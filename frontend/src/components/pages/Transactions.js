import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ 
    amount: '', 
    category: '', 
    date: '', 
    notes: '', 
    type: 'expense',
    incomeSource: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTransactionId, setCurrentTransactionId] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    transactionType: 'all',
    category: 'all',
    source: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Income source options
  const incomeSources = [
    'Salary',
    'Freelance',
    'Investments',
    'Gift',
    'Refund',
    'Other'
  ];

  const fetchTransactions = async () => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await axios.get('http://localhost:5000/api/transactions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTransactions(response.data);
      setFilteredTransactions(response.data);
    } catch (error) {
      console.error('Failed to fetch transactions', error);
    }
  };

  const fetchCategories = async () => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await axios.get('http://localhost:5000/api/categories', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, []);

  // Apply filters whenever transactions or filters change
  useEffect(() => {
    applyFilters();
  }, [transactions, filters]);

  const applyFilters = () => {
    let filtered = [...transactions];
    
    // Filter by date range
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter(transaction => new Date(transaction.date) >= startDate);
    }
    
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999); // Set to end of day
      filtered = filtered.filter(transaction => new Date(transaction.date) <= endDate);
    }
    
    // Filter by transaction type
    if (filters.transactionType !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === filters.transactionType);
    }
    
    // Filter by category (for expenses)
    if (filters.transactionType === 'expense' && filters.category !== 'all') {
      filtered = filtered.filter(transaction => 
        transaction.type === 'expense' && transaction.category === filters.category
      );
    }
    
    // Filter by source (for income)
    if (filters.transactionType === 'income' && filters.source !== 'all') {
      filtered = filtered.filter(transaction => 
        transaction.type === 'income' && transaction.category === filters.source
      );
    }
    
    setFilteredTransactions(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    
    // Update dependent filters
    if (name === 'transactionType') {
      setFilters(prev => ({ 
        ...prev, 
        [name]: value,
        category: 'all',
        source: 'all'
      }));
    }
  };

  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      transactionType: 'all',
      category: 'all',
      source: 'all',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'type') {
      if (value === 'income') {
        setForm(prev => ({ 
          ...prev, 
          type: 'income',
          incomeSource: incomeSources[0],
          category: incomeSources[0]
        }));
      } else {
        setForm(prev => ({ 
          ...prev, 
          type: 'expense',
          incomeSource: '',
          category: prev.category || ''
        }));
      }
    } else if (name === 'incomeSource') {
      setForm(prev => ({ 
        ...prev, 
        incomeSource: value,
        category: value
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    
    const transactionData = {
      amount: form.amount,
      category: form.type === 'income' ? form.incomeSource : form.category,
      date: form.date,
      notes: form.notes,
      type: form.type
    };
    
    console.log('Submitting transaction data:', transactionData);
    
    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/transactions/edit/${currentTransactionId}`, transactionData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setIsEditing(false);
        setCurrentTransactionId(null);
      } else {
        await axios.post('http://localhost:5000/api/transactions/add', transactionData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      fetchTransactions();
      setForm({ 
        amount: '', 
        category: '', 
        date: '', 
        notes: '', 
        type: 'expense',
        incomeSource: ''
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to add or edit transaction', error);
    }
  };

  const handleEdit = (transaction) => {
    const isIncome = transaction.type === 'income';
    
    setForm({
      amount: transaction.amount,
      category: isIncome ? '' : transaction.category,
      incomeSource: isIncome ? transaction.category : '',
      date: new Date(transaction.date).toISOString().split('T')[0],
      notes: transaction.notes,
      type: transaction.type || 'expense',
    });
    
    setCurrentTransactionId(transaction._id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('authToken');
    try {
      await axios.delete(`http://localhost:5000/api/transactions/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchTransactions();
    } catch (error) {
      console.error('Failed to delete transaction', error);
    }
  };

  // Function to get unique sources from income transactions
  const getIncomeSources = () => {
    const sources = transactions
      .filter(t => t.type === 'income')
      .map(t => t.category);
    return [...new Set(sources)];
  };

  // Get unique categories from expense transactions
  const getExpenseCategories = () => {
    const expenseCategories = transactions
      .filter(t => t.type === 'expense')
      .map(t => t.category);
    return [...new Set(expenseCategories)];
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Transaction Management</h2>
      <div className="flex justify-between mb-4">
        <button onClick={() => setIsModalOpen(true)} className="bg-black text-white p-2 rounded">
          Add Transaction
        </button>
        <button 
          onClick={() => setShowFilters(!showFilters)} 
          className="bg-black hover:bg-gray-800 text-white p-2 rounded"
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>
      
      {/* Filters Section */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-3">Filter Transactions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="border p-2 w-full rounded"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">End Date</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="border p-2 w-full rounded"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Transaction Type</label>
              <select
                name="transactionType"
                value={filters.transactionType}
                onChange={handleFilterChange}
                className="border p-2 w-full rounded"
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            
            {filters.transactionType === 'expense' && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">Category</label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="border p-2 w-full rounded"
                >
                  <option value="all">All Categories</option>
                  {getExpenseCategories().map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            )}
            
            {filters.transactionType === 'income' && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">Source</label>
                <select
                  name="source"
                  value={filters.source}
                  onChange={handleFilterChange}
                  className="border p-2 w-full rounded"
                >
                  <option value="all">All Sources</option>
                  {getIncomeSources().map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <button
              onClick={resetFilters}
              className="bg-black hover:bg-gray-800 text-white p-2 rounded"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
      
      {/* Transaction Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h3 className="text-lg font-semibold mb-4">{isEditing ? 'Edit Transaction' : 'Add New Transaction'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Transaction Type</label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="income"
                      checked={form.type === 'income'}
                      onChange={handleInputChange}
                      className="form-radio h-5 w-5 text-green-600"
                    />
                    <span className="ml-2 text-gray-700">Income</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="expense"
                      checked={form.type === 'expense'}
                      onChange={handleInputChange}
                      className="form-radio h-5 w-5 text-red-600"
                    />
                    <span className="ml-2 text-gray-700">Expense</span>
                  </label>
                </div>
              </div>
              
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleInputChange}
                placeholder="Amount"
                className="border p-2 mb-2 w-full"
                required
              />
              
              {form.type === 'expense' ? (
                <select
                  name="category"
                  value={form.category}
                  onChange={handleInputChange}
                  className="border p-2 mb-2 w-full"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category._id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  name="incomeSource"
                  value={form.incomeSource}
                  onChange={handleInputChange}
                  className="border p-2 mb-2 w-full"
                  required
                >
                  <option value="">Select income source</option>
                  {incomeSources.map(source => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              )}
              
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleInputChange}
                className="border p-2 mb-2 w-full"
                required
              />
              <input
                type="text"
                name="notes"
                value={form.notes}
                onChange={handleInputChange}
                placeholder="Notes"
                className="border p-2 mb-2 w-full"
              />
              <div className="flex justify-end">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-500 text-white p-2 rounded mr-2">
                  Cancel
                </button>
                <button type="submit" className="bg-black text-white p-2 rounded">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Results summary */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredTransactions.length} of {transactions.length} transactions
      </div>
      
      {/* Transactions Table */}
      <table className="w-full bg-white rounded-lg shadow-md">
        <thead>
          <tr>
            <th className="border p-2">Type</th>
            <th className="border p-2">Amount</th>
            <th className="border p-2">Category/Source</th>
            <th className="border p-2">Date</th>
            <th className="border p-2">Notes</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTransactions.length === 0 ? (
            <tr>
              <td colSpan="6" className="border p-4 text-center text-gray-500">
                No transactions match your filters
              </td>
            </tr>
          ) : (
            filteredTransactions.map(transaction => (
              <tr key={transaction._id} className={transaction.type === 'income' ? 'bg-green-50' : ''}>
                <td className="border p-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {transaction.type === 'income' ? 'Income' : 'Expense'}
                  </span>
                </td>
                <td className="border p-2">
                  <span className={`inline-block ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'income' ? '+' : '-'}{transaction.amount} AED
                  </span>
                </td>
                <td className="border p-2">{transaction.category}</td>
                <td className="border p-2">{new Date(transaction.date).toLocaleDateString()}</td>
                <td className="border p-2">{transaction.notes}</td>
                <td className="border p-2 flex justify-center">
                  <button onClick={() => handleEdit(transaction)} className="bg-blue-500 text-white p-1 rounded mr-2 w-20">Edit</button>
                  <button onClick={() => handleDelete(transaction._id)} className="bg-red-500 text-white p-1 rounded w-20">Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Transactions; 
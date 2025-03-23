import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Budgeting() {
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [budgetStatus, setBudgetStatus] = useState([]);
  const [form, setForm] = useState({
    category: '',
    amount: '',
    period: 'monthly'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentBudgetId, setCurrentBudgetId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchBudgets();
    fetchBudgetStatus();
  }, []);

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

  const fetchBudgets = async () => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await axios.get('http://localhost:5000/api/budgets', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBudgets(response.data);
    } catch (error) {
      console.error('Failed to fetch budgets', error);
    }
  };

  const fetchBudgetStatus = async () => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await axios.get('http://localhost:5000/api/budgets/status', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBudgetStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch budget status', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!form.category || !form.amount) {
      setError('Please select a category and enter an amount');
      return;
    }
    
    const token = localStorage.getItem('authToken');
    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/budgets/edit/${currentBudgetId}`, {
          amount: form.amount,
          period: form.period
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setIsEditing(false);
        setCurrentBudgetId(null);
      } else {
        await axios.post('http://localhost:5000/api/budgets/add', form, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      
      // Refresh data
      fetchBudgets();
      fetchBudgetStatus();
      
      // Reset form
      setForm({
        category: '',
        amount: '',
        period: 'monthly'
      });
    } catch (error) {
      console.error('Failed to save budget', error);
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError('Failed to save budget. Please try again.');
      }
    }
  };

  const handleEdit = (budget) => {
    setForm({
      category: budget.category,
      amount: budget.amount,
      period: budget.period || 'monthly'
    });
    setCurrentBudgetId(budget._id);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;
    
    const token = localStorage.getItem('authToken');
    try {
      await axios.delete(`http://localhost:5000/api/budgets/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchBudgets();
      fetchBudgetStatus();
    } catch (error) {
      console.error('Failed to delete budget', error);
    }
  };

  const resetForm = () => {
    setForm({
      category: '',
      amount: '',
      period: 'monthly'
    });
    setIsEditing(false);
    setCurrentBudgetId(null);
    setError('');
  };

  // Filter out categories that already have budgets
  const availableCategories = categories.filter(category => 
    !budgets.some(budget => budget.category === category.name)
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Budgeting Tools</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Budget Setting Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">
            {isEditing ? 'Edit Budget' : 'Set a New Budget'}
          </h3>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleInputChange}
                className="border p-2 w-full rounded"
                disabled={isEditing}
                required
              >
                <option value="">Select a category</option>
                {(isEditing ? categories : availableCategories).map(category => (
                  <option key={category._id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Budget Amount</label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleInputChange}
                placeholder="Enter amount"
                className="border p-2 w-full rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Period</label>
              <select
                name="period"
                value={form.period}
                onChange={handleInputChange}
                className="border p-2 w-full rounded"
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-black hover:bg-gray-800 text-white p-2 rounded w-full"
              >
                {isEditing ? 'Update Budget' : 'Set Budget'}
              </button>
              
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 p-2 rounded w-full"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
        
        {/* Budget Status Dashboard */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Budget Status</h3>
          
          {budgetStatus.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-sm text-center text-gray-500">
              No budgets set yet. Create your first budget to track your spending!
            </div>
          ) : (
            <div className="space-y-4">
              {budgetStatus.map(budget => (
                <div key={budget._id} className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-800">{budget.category}</h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(budgets.find(b => b._id === budget._id))}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(budget._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Spent: {budget.spent.toFixed(2)} AED</span>
                    <span>Budget: {budget.budgetAmount.toFixed(2)} AED</span>
                  </div>
                  
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-gray-200">
                      <div
                        style={{ width: `${Math.min(100, budget.percentage)}%` }}
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                          budget.status === 'exceeded' ? 'bg-red-500' : 
                          budget.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>
                      {budget.remaining >= 0 ? 
                        `${budget.remaining.toFixed(2)} AED remaining` : 
                        `Exceeded by ${Math.abs(budget.remaining).toFixed(2)} AED`
                      }
                    </span>
                    <span>{budget.percentage.toFixed(1)}% used</span>
                  </div>
                  
                  {budget.status === 'warning' && (
                    <div className="mt-2 text-sm text-yellow-600 bg-yellow-100 p-1 rounded text-center">
                      Warning: Approaching budget limit
                    </div>
                  )}
                  
                  {budget.status === 'exceeded' && (
                    <div className="mt-2 text-sm text-red-600 bg-red-100 p-1 rounded text-center">
                      Alert: Budget exceeded!
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Budgeting; 
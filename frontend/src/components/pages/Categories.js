import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus } from '@fortawesome/free-solid-svg-icons';

ChartJS.register(ArcElement, Tooltip, Legend);

function Categories() {
  const [categories, setCategories] = useState([]);
  const [categorySpending, setCategorySpending] = useState([]);
  const [form, setForm] = useState({ name: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategoryId, setCurrentCategoryId] = useState(null);

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

  const fetchCategorySpending = async () => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await axios.get('http://localhost:5000/api/transactions/spending-by-category?type=expense', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCategorySpending(response.data);
    } catch (error) {
      console.error('Failed to fetch category spending', error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchCategorySpending();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/categories/edit/${currentCategoryId}`, form, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setIsEditing(false);
        setCurrentCategoryId(null);
      } else {
        await axios.post('http://localhost:5000/api/categories/add', form, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      fetchCategories();
      setForm({ name: '' });
    } catch (error) {
      console.error('Failed to add or edit category', error);
    }
  };

  const handleEdit = (category) => {
    setForm({ name: category.name });
    setCurrentCategoryId(category._id);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setForm({ name: '' });
    setIsEditing(false);
    setCurrentCategoryId(null);
  };

  // Prepare data for the pie chart
  const pieData = {
    labels: categorySpending.map(item => item.category),
    datasets: [
      {
        data: categorySpending.map(item => item.amount),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', 
          '#FF9F40', '#8AC926', '#1982C4', '#6A4C93', '#F94144'
        ],
        hoverBackgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', 
          '#FF9F40', '#8AC926', '#1982C4', '#6A4C93', '#F94144'
        ]
      }
    ]
  };

  // Calculate total spending
  const totalSpending = categorySpending.reduce((total, item) => total + item.amount, 0);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Category Management</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              {isEditing ? 'Edit Category' : 'Add New Category'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="flex mb-4">
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  placeholder="Category Name"
                  className="flex-grow p-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
                <button type="submit" className="bg-black hover:bg-gray-800 text-white p-2 rounded-r transition duration-200">
                  <FontAwesomeIcon icon={isEditing ? faEdit : faPlus} className="mr-2 text-white" />
                  {isEditing ? 'Update' : 'Add'}
                </button>
              </div>
              {isEditing && (
                <button 
                  type="button" 
                  onClick={cancelEdit} 
                  className="text-gray-600 hover:text-gray-800 text-sm"
                >
                  Cancel editing
                </button>
              )}
            </form>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Your Categories</h3>
            {categories.length === 0 ? (
              <p className="text-gray-500 italic">No categories yet. Add one to get started!</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {categories.map(category => (
                  <li key={category._id} className="py-3 flex items-center justify-between">
                    <span className="text-gray-700">{category.name}</span>
                    <button 
                      onClick={() => handleEdit(category)} 
                      className="text-black hover:bg-gray-100 p-2 rounded-full transition duration-200"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Spending by Category</h3>
          <div className="p-4" style={{ maxWidth: '400px', margin: '0 auto' }}>
            {categorySpending.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-gray-500 mb-2">No spending data to display</p>
                <p className="text-gray-400 text-sm">Add transactions to see your spending distribution</p>
              </div>
            ) : (
              <>
                <Pie 
                  data={pieData} 
                  options={{
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          padding: 20,
                          usePointStyle: true,
                        }
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const percentage = ((value / totalSpending) * 100).toFixed(1);
                            return `${label}: ${value} AED (${percentage}%)`;
                          }
                        }
                      }
                    }
                  }}
                />
                <div className="mt-4 text-center text-gray-700">
                  <p>Total Spending: {totalSpending.toFixed(2)} AED</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Categories; 
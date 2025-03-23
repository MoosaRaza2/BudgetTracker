import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPiggyBank, faHome, faCar, faGraduationCap, faBriefcase, 
  faPlane, faHeart, faEdit, faPlus, faTrash, faTimes, faCheck
} from '@fortawesome/free-solid-svg-icons';

function Goals() {
  const [goals, setGoals] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const [currentGoal, setCurrentGoal] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    title: '',
    targetAmount: '',
    targetDate: '',
    category: 'General Savings',
    description: '',
    icon: 'piggy-bank'
  });
  const [contribution, setContribution] = useState({
    amount: '',
    note: ''
  });
  const [error, setError] = useState('');

  // Available icons for goals
  const iconOptions = [
    { value: 'piggy-bank', label: 'Savings', icon: faPiggyBank },
    { value: 'home', label: 'Home', icon: faHome },
    { value: 'car', label: 'Car', icon: faCar },
    { value: 'graduation-cap', label: 'Education', icon: faGraduationCap },
    { value: 'briefcase', label: 'Business', icon: faBriefcase },
    { value: 'plane', label: 'Travel', icon: faPlane },
    { value: 'heart', label: 'Health', icon: faHeart }
  ];

  // Category options
  const categoryOptions = [
    'General Savings',
    'Housing',
    'Transportation',
    'Education',
    'Investment',
    'Travel',
    'Health',
    'Emergency Fund',
    'Retirement',
    'Other'
  ];

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await axios.get('http://localhost:5000/api/goals', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setGoals(response.data);
    } catch (error) {
      console.error('Failed to fetch goals', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });
  };

  const handleContributionChange = (e) => {
    const { name, value } = e.target;
    setContribution({
      ...contribution,
      [name]: value
    });
  };

  const handleOpenModal = (isEdit = false, goal = null) => {
    if (isEdit && goal) {
      // Format the date for the input field (YYYY-MM-DD)
      const targetDate = new Date(goal.targetDate).toISOString().split('T')[0];
      
      setForm({
        title: goal.title,
        targetAmount: goal.targetAmount,
        targetDate,
        category: goal.category,
        description: goal.description || '',
        icon: goal.icon
      });
      setCurrentGoal(goal);
      setIsEditing(true);
    } else {
      // Reset the form for a new goal
      setForm({
        title: '',
        targetAmount: '',
        targetDate: '',
        category: 'General Savings',
        description: '',
        icon: 'piggy-bank'
      });
      setIsEditing(false);
      setCurrentGoal(null);
    }
    setIsModalOpen(true);
  };

  const handleOpenContributeModal = (goal) => {
    setCurrentGoal(goal);
    setContribution({
      amount: '',
      note: ''
    });
    setIsContributeModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!form.title || !form.targetAmount || !form.targetDate) {
      setError('Please fill in all required fields');
      return;
    }
    
    const token = localStorage.getItem('authToken');
    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/goals/edit/${currentGoal._id}`, form, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        await axios.post('http://localhost:5000/api/goals/add', form, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      
      fetchGoals();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save goal', error);
      setError('Failed to save goal. Please try again.');
    }
  };

  const handleContributeSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!contribution.amount || parseFloat(contribution.amount) <= 0) {
      setError('Please enter a valid contribution amount');
      return;
    }
    
    const token = localStorage.getItem('authToken');
    try {
      await axios.post(`http://localhost:5000/api/goals/${currentGoal._id}/contribute`, contribution, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      fetchGoals();
      setIsContributeModalOpen(false);
    } catch (error) {
      console.error('Failed to add contribution', error);
      setError('Failed to add contribution. Please try again.');
    }
  };

  const handleDelete = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) {
      return;
    }
    
    const token = localStorage.getItem('authToken');
    try {
      await axios.delete(`http://localhost:5000/api/goals/delete/${goalId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      fetchGoals();
    } catch (error) {
      console.error('Failed to delete goal', error);
    }
  };

  // Function to get the appropriate icon component
  const getIconComponent = (iconName) => {
    const found = iconOptions.find(option => option.value === iconName);
    return found ? found.icon : faPiggyBank;
  };

  // Calculate days left until target date
  const getDaysLeft = (targetDate) => {
    const today = new Date();
    const target = new Date(targetDate);
    const timeDiff = target - today;
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return daysLeft;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `${parseFloat(amount).toFixed(2)} AED`;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Financial Goals</h2>
        <button
          onClick={() => handleOpenModal()}
          className="bg-black hover:bg-gray-800 text-white py-2 px-4 rounded transition duration-200"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          New Goal
        </button>
      </div>
      
      {goals.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <FontAwesomeIcon icon={faPiggyBank} className="text-5xl text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Goals Yet</h3>
          <p className="text-gray-500 mb-4">Start setting financial goals to track your progress and achieve your dreams.</p>
          <button
            onClick={() => handleOpenModal()}
            className="bg-black hover:bg-gray-800 text-white py-2 px-4 rounded transition duration-200"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map(goal => {
            const icon = getIconComponent(goal.icon);
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const daysLeft = getDaysLeft(goal.targetDate);
            
            return (
              <div key={goal._id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${goal.isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}>
                      <FontAwesomeIcon icon={icon} />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-gray-800">{goal.title}</h3>
                      <p className="text-sm text-gray-500">{goal.category}</p>
                    </div>
                  </div>
                  <div className="flex">
                    <button 
                      onClick={() => handleOpenModal(true, goal)} 
                      className="text-gray-500 hover:text-blue-500 mr-2"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      onClick={() => handleDelete(goal._id)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
                
                {goal.description && (
                  <p className="text-sm text-gray-600 mb-4">{goal.description}</p>
                )}
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      style={{ width: `${progress}%` }}
                      className={`h-2.5 ${
                        goal.isCompleted ? 'bg-green-500' : 'bg-black'
                      } rounded-full transition-all duration-500 ease-out`}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500">Current</p>
                    <p className="font-medium">{formatCurrency(goal.currentAmount)}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500">Target</p>
                    <p className="font-medium">{formatCurrency(goal.targetAmount)}</p>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm text-gray-500 mb-4">
                  <div>
                    <span>Created: </span>
                    <span>{new Date(goal.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span>Target: </span>
                    <span>{new Date(goal.targetDate).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {goal.isCompleted ? (
                  <div className="bg-green-100 text-green-800 text-center py-2 px-4 rounded-lg flex items-center justify-center">
                    <FontAwesomeIcon icon={faCheck} className="mr-2" />
                    Goal Completed!
                  </div>
                ) : (
                  <>
                    <div className="text-sm text-gray-600 mb-3">
                      {daysLeft > 0 ? (
                        <span>{daysLeft} days left to reach your goal</span>
                      ) : (
                        <span className="text-red-500">Goal deadline passed</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleOpenContributeModal(goal)}
                      className="px-3 py-1 bg-black hover:bg-gray-800 text-white rounded-md text-sm"
                      disabled={goal.isCompleted}
                    >
                      Add Progress
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {/* Goal Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {isEditing ? 'Edit Goal' : 'Create New Goal'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Goal Title*
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="E.g., New Car, Emergency Fund"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Target Amount*
                  </label>
                  <input
                    type="number"
                    name="targetAmount"
                    value={form.targetAmount}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Amount"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Target Date*
                  </label>
                  <input
                    type="date"
                    name="targetDate"
                    value={form.targetDate}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  {categoryOptions.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows="3"
                  placeholder="What are you saving for?"
                ></textarea>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Icon
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {iconOptions.map((option) => (
                    <div
                      key={option.value}
                      onClick={() => setForm({ ...form, icon: option.value })}
                      className={`cursor-pointer p-2 rounded-full ${
                        form.icon === option.value 
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } flex items-center justify-center`}
                      title={option.label}
                    >
                      <FontAwesomeIcon icon={option.icon} />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded"
                >
                  {isEditing ? 'Update Goal' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Contribute Modal */}
      {isContributeModalOpen && currentGoal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Add Progress to "{currentGoal.title}"
              </h3>
              <button 
                onClick={() => setIsContributeModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <div className="mb-4 bg-gray-50 p-3 rounded">
              <div className="flex justify-between mb-2">
                <span>Current</span>
                <span>{formatCurrency(currentGoal.currentAmount)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Target</span>
                <span>{formatCurrency(currentGoal.targetAmount)}</span>
              </div>
            </div>
            
            <form onSubmit={handleContributeSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Contribution Amount*
                </label>
                <input
                  type="number"
                  name="amount"
                  value={contribution.amount}
                  onChange={handleContributionChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Amount to add"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Note (Optional)
                </label>
                <input
                  type="text"
                  name="note"
                  value={contribution.note}
                  onChange={handleContributionChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="E.g., Monthly transfer"
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsContributeModalOpen(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded"
                >
                  Add Contribution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Goals; 
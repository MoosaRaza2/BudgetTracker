import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Settings() {
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Profile state
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    currency: 'AED',
    language: 'en'
  });
  
  // Security state
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Notifications state
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    budgetAlerts: true,
    goalReminders: true,
    weeklyReports: false
  });
  
  useEffect(() => {
    fetchUserProfile();
  }, []);
  
  const fetchUserProfile = async () => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await axios.get('http://localhost:5000/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const userData = response.data;
      setUserData(userData);
      
      // Update profile state
      setProfile({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        currency: userData.preferences?.currency || 'AED',
        language: userData.preferences?.language || 'en'
      });
      
      // Update notifications state
      if (userData.notificationPreferences) {
        setNotifications({
          emailNotifications: userData.notificationPreferences.emailNotifications ?? true,
          budgetAlerts: userData.notificationPreferences.budgetAlerts ?? true,
          goalReminders: userData.notificationPreferences.goalReminders ?? true,
          weeklyReports: userData.notificationPreferences.weeklyReports ?? false
        });
      }
    } catch (error) {
      console.error('Failed to fetch user profile', error);
      setError('Failed to load user profile');
    }
  };
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };
  
  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecurity({ ...security, [name]: value });
  };
  
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotifications({ ...notifications, [name]: checked });
  };
  
  const updateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    const token = localStorage.getItem('authToken');
    try {
      const response = await axios.put(
        'http://localhost:5000/api/users/profile',
        profile,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setUserData(response.data);
      setSuccess('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile', error);
      setError(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  
  const updatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    // Validate passwords match
    if (security.newPassword !== security.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }
    
    // Validate password length
    if (security.newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      setLoading(false);
      return;
    }
    
    const token = localStorage.getItem('authToken');
    try {
      await axios.put(
        'http://localhost:5000/api/users/security/password',
        {
          currentPassword: security.currentPassword,
          newPassword: security.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess('Password updated successfully');
      setSecurity({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Failed to update password', error);
      setError(error.response?.data?.error || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };
  
  const updateNotifications = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    const token = localStorage.getItem('authToken');
    try {
      const response = await axios.put(
        'http://localhost:5000/api/users/notifications',
        notifications,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setUserData(response.data);
      setSuccess('Notification preferences updated successfully');
    } catch (error) {
      console.error('Failed to update notification preferences', error);
      setError(error.response?.data?.error || 'Failed to update notification preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
      
      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="font-bold">Error:</span> {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="font-bold">Success:</span> {success}
        </div>
      )}
      
      {/* Settings Tabs */}
      <div className="flex mb-6 border-b">
        <button
          className={`pb-2 px-4 ${activeTab === 'profile' ? 'border-b-2 border-black text-black' : 'text-gray-500'}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button
          className={`pb-2 px-4 ${activeTab === 'security' ? 'border-b-2 border-black text-black' : 'text-gray-500'}`}
          onClick={() => setActiveTab('security')}
        >
          Security
        </button>
        <button
          className={`pb-2 px-4 ${activeTab === 'notifications' ? 'border-b-2 border-black text-black' : 'text-gray-500'}`}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </button>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
          <form onSubmit={updateProfile}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Your name"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Your email"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleProfileChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Your phone number"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Preferred Currency
              </label>
              <select
                name="currency"
                value={profile.currency}
                onChange={handleProfileChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="AED">AED (UAE Dirham)</option>
                <option value="USD">USD (US Dollar)</option>
                <option value="EUR">EUR (Euro)</option>
                <option value="GBP">GBP (British Pound)</option>
                <option value="INR">INR (Indian Rupee)</option>
                <option value="SAR">SAR (Saudi Riyal)</option>
              </select>
            </div>
            
            <div>
              <button
                type="submit"
                className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Security Settings */}
      {activeTab === 'security' && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Change Password</h3>
          <form onSubmit={updatePassword}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={security.currentPassword}
                onChange={handleSecurityChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={security.newPassword}
                onChange={handleSecurityChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
                minLength={8}
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={security.confirmPassword}
                onChange={handleSecurityChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            
            <div>
              <button
                type="submit"
                className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Notification Settings */}
      {activeTab === 'notifications' && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
          <form onSubmit={updateNotifications}>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  name="emailNotifications"
                  checked={notifications.emailNotifications}
                  onChange={handleNotificationChange}
                  className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                />
                <label htmlFor="emailNotifications" className="ml-3 block text-sm font-medium text-gray-700">
                  Email Notifications
                  <p className="text-gray-500 text-xs mt-1">
                    Receive important updates and alerts via email
                  </p>
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="budgetAlerts"
                  name="budgetAlerts"
                  checked={notifications.budgetAlerts}
                  onChange={handleNotificationChange}
                  className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                />
                <label htmlFor="budgetAlerts" className="ml-3 block text-sm font-medium text-gray-700">
                  Budget Alerts
                  <p className="text-gray-500 text-xs mt-1">
                    Get notified when you're approaching or have exceeded budget limits
                  </p>
                </label>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                type="submit"
                className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Settings; 
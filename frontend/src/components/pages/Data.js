import React, { useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileDownload, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

function Data() {
  const [exportType, setExportType] = useState('transactions');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle date range inputs
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange({
      ...dateRange,
      [name]: value
    });
  };

  // Handle export type selection
  const handleExportTypeChange = (e) => {
    setExportType(e.target.value);
  };

  // Export data function
  const handleExport = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('authToken');
      
      // Call the export API with the selected filters
      const response = await axios({
        url: `http://localhost:5000/api/export/${exportType}`,
        method: 'GET',
        params: {
          startDate: dateRange.startDate || undefined,
          endDate: dateRange.endDate || undefined
        },
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob' // Important for file downloads
      });

      // Create a download link for the CSV file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Format the filename with current date
      const today = new Date().toISOString().slice(0, 10);
      const fileName = `${exportType}_export_${today}.csv`;
      
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccess(`${exportType.charAt(0).toUpperCase() + exportType.slice(1)} data exported successfully!`);
    } catch (error) {
      console.error('Export failed:', error);
      setError('Failed to export data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Data Export</h2>
      
      {/* Info Card */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <FontAwesomeIcon icon={faFileDownload} className="h-5 w-5 text-blue-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Export your financial data for backup or analysis in spreadsheet applications.
              You can choose to export all data or filter by date range.
            </p>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      {/* Export Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <form onSubmit={handleExport}>
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              What data would you like to export?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="transactions"
                  name="exportType"
                  value="transactions"
                  checked={exportType === 'transactions'}
                  onChange={handleExportTypeChange}
                  className="h-4 w-4 border-gray-300 text-black focus:ring-black"
                />
                <label htmlFor="transactions" className="ml-2 block text-sm text-gray-700">
                  Transactions
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="radio"
                  id="budgets"
                  name="exportType"
                  value="budgets"
                  checked={exportType === 'budgets'}
                  onChange={handleExportTypeChange}
                  className="h-4 w-4 border-gray-300 text-black focus:ring-black"
                />
                <label htmlFor="budgets" className="ml-2 block text-sm text-gray-700">
                  Budgets
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="radio"
                  id="goals"
                  name="exportType"
                  value="goals"
                  checked={exportType === 'goals'}
                  onChange={handleExportTypeChange}
                  className="h-4 w-4 border-gray-300 text-black focus:ring-black"
                />
                <label htmlFor="goals" className="ml-2 block text-sm text-gray-700">
                  Financial Goals
                </label>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-gray-500" />
                Date Range (Optional)
              </div>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={handleDateChange}
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={handleDateChange}
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Leave dates empty to export all data
            </p>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-black hover:bg-gray-800 text-white font-medium py-2 px-6 rounded-lg flex items-center"
              disabled={loading}
            >
              <FontAwesomeIcon icon={faFileDownload} className="mr-2" />
              {loading ? 'Generating Export...' : 'Export Data (.CSV)'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Additional Information */}
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">About Data Exports</h3>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">CSV Format</h4>
              <p className="text-sm text-gray-600">
                Exported data will be in CSV format (Comma Separated Values) which can be opened in 
                Microsoft Excel, Google Sheets, and other spreadsheet applications.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium">Data Privacy</h4>
              <p className="text-sm text-gray-600">
                Your exported data files contain personal financial information. 
                Please store them securely and be careful when sharing.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium">Need a Different Format?</h4>
              <p className="text-sm text-gray-600">
                If you need your data in a different format, please contact our support team at{' '}
                <a href="mailto:hello@gmail.com" className="text-black hover:underline">
                  hello@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Data; 
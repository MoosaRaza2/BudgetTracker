import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  PointElement,
  LineElement
);

function Reports() {
  // State variables
  const [selectedReport, setSelectedReport] = useState('monthly-summary');
  const [dateRange, setDateRange] = useState({
    month: new Date().getMonth() + 1, // 1-12
    year: new Date().getFullYear()
  });
  const [transactionType, setTransactionType] = useState('expense');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Data states
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState(null);
  const [monthlyTrend, setMonthlyTrend] = useState(null);
  const [budgetComparison, setBudgetComparison] = useState(null);
  
  // Effect to fetch data based on selected report and filters
  useEffect(() => {
    fetchReportData();
  }, [selectedReport, dateRange, transactionType]);
  
  const fetchReportData = async () => {
    setLoading(true);
    setError('');
    
    const token = localStorage.getItem('authToken');
    
    try {
      switch (selectedReport) {
        case 'monthly-summary':
          await fetchMonthlySummary(token);
          break;
        case 'category-breakdown':
          await fetchCategoryBreakdown(token);
          break;
        case 'monthly-trend':
          await fetchMonthlyTrend(token);
          break;
        case 'budget-comparison':
          await fetchBudgetComparison(token);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
      setError('Failed to load report data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchMonthlySummary = async (token) => {
    const response = await axios.get(`http://localhost:5000/api/analytics/monthly-summary?month=${dateRange.month}&year=${dateRange.year}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setMonthlySummary(response.data);
  };
  
  const fetchCategoryBreakdown = async (token) => {
    const response = await axios.get(`http://localhost:5000/api/analytics/category-breakdown?month=${dateRange.month}&year=${dateRange.year}&type=${transactionType}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setCategoryBreakdown(response.data);
  };
  
  const fetchMonthlyTrend = async (token) => {
    const response = await axios.get(`http://localhost:5000/api/analytics/monthly-trend?month=${dateRange.month}&year=${dateRange.year}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setMonthlyTrend(response.data);
  };
  
  const fetchBudgetComparison = async (token) => {
    const response = await axios.get(`http://localhost:5000/api/analytics/budget-vs-actual?month=${dateRange.month}&year=${dateRange.year}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setBudgetComparison(response.data);
  };
  
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange({
      ...dateRange,
      [name]: parseInt(value)
    });
  };
  
  // Generate month options for select dropdown
  const monthOptions = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];
  
  // Generate year options (last 5 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);
  
  // Prepare data for Monthly Summary chart
  const getMonthlySummaryChartData = () => {
    if (!monthlySummary) return null;
    
    return {
      labels: ['Income', 'Expenses', 'Savings'],
      datasets: [
        {
          label: 'Amount (AED)',
          data: [
            monthlySummary.income, 
            monthlySummary.expenses, 
            Math.max(0, monthlySummary.savings)
          ],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)'
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
  };
  
  // Prepare data for Category Breakdown chart
  const getCategoryBreakdownChartData = () => {
    if (!categoryBreakdown || !categoryBreakdown.categories || categoryBreakdown.categories.length === 0) {
      return null;
    }
    
    return {
      labels: categoryBreakdown.categories.map(cat => cat.category),
      datasets: [
        {
          data: categoryBreakdown.categories.map(cat => cat.amount),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(255, 99, 132, 0.6)'
          ],
          borderWidth: 1
        }
      ]
    };
  };
  
  // Prepare data for Monthly Trend chart
  const getMonthlyTrendChartData = () => {
    if (!monthlyTrend || monthlyTrend.length === 0) {
      return null;
    }
    
    const labels = monthlyTrend.map(item => {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthNames[item.month-1]} ${item.year}`;
    });
    
    return {
      labels,
      datasets: [
        {
          label: 'Income',
          data: monthlyTrend.map(item => item.income),
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1
        },
        {
          label: 'Expenses',
          data: monthlyTrend.map(item => item.expenses),
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.1
        },
        {
          label: 'Savings',
          data: monthlyTrend.map(item => item.savings),
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          tension: 0.1
        }
      ]
    };
  };
  
  // Prepare data for Budget Comparison chart
  const getBudgetComparisonChartData = () => {
    if (!budgetComparison || !budgetComparison.comparison || budgetComparison.comparison.length === 0) {
      return null;
    }
    
    return {
      labels: budgetComparison.comparison.map(item => item.category),
      datasets: [
        {
          label: 'Budget',
          data: budgetComparison.comparison.map(item => item.budgeted),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
        },
        {
          label: 'Actual',
          data: budgetComparison.comparison.map(item => item.actual),
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
        }
      ]
    };
  };
  
  // Helper function to format currency
  const formatCurrency = (amount) => {
    return `${amount.toFixed(2)} AED`;
  };
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Reports and Analytics</h2>
      
      {/* Report Selection and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Report Type</label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="border p-2 w-full rounded"
            >
              <option value="monthly-summary">Monthly Summary</option>
              <option value="category-breakdown">Category Breakdown</option>
              <option value="monthly-trend">Monthly Trend (6 Months)</option>
              <option value="budget-comparison">Budget vs. Actual</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Month</label>
            <select
              name="month"
              value={dateRange.month}
              onChange={handleDateChange}
              className="border p-2 w-full rounded"
            >
              {monthOptions.map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Year</label>
            <select
              name="year"
              value={dateRange.year}
              onChange={handleDateChange}
              className="border p-2 w-full rounded"
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          
          {selectedReport === 'category-breakdown' && (
            <div>
              <label className="block text-gray-700 mb-2">Transaction Type</label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                className="border p-2 w-full rounded"
              >
                <option value="expense">Expenses</option>
                <option value="income">Income</option>
              </select>
            </div>
          )}
        </div>
      </div>
      
      {/* Loading and Error States */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-black mb-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-gray-600">Loading report data...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Reports Content */}
      {!loading && !error && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          {/* Monthly Summary Report */}
          {selectedReport === 'monthly-summary' && monthlySummary && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Monthly Summary: {monthOptions.find(m => m.value === monthlySummary.month)?.label} {monthlySummary.year}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-1">Income</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(monthlySummary.income)}</p>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-1">Expenses</p>
                  <p className="text-xl font-bold text-red-600">{formatCurrency(monthlySummary.expenses)}</p>
                </div>
                
                <div className={`${monthlySummary.savings >= 0 ? 'bg-blue-50' : 'bg-red-50'} p-4 rounded-lg text-center`}>
                  <p className="text-sm text-gray-600 mb-1">Savings</p>
                  <p className={`text-xl font-bold ${monthlySummary.savings >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {formatCurrency(monthlySummary.savings)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {monthlySummary.income > 0 
                      ? `${monthlySummary.savingsRate.toFixed(1)}% of income` 
                      : 'No income recorded'}
                  </p>
                </div>
              </div>
              
              <div className="h-64">
                {getMonthlySummaryChartData() && <Bar 
                  data={getMonthlySummaryChartData()} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      },
                      title: {
                        display: true,
                        text: 'Monthly Financial Summary'
                      }
                    }
                  }}
                />}
              </div>
            </div>
          )}
          
          {/* Category Breakdown Report */}
          {selectedReport === 'category-breakdown' && categoryBreakdown && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Category Breakdown: {monthOptions.find(m => m.value === categoryBreakdown.month)?.label} {categoryBreakdown.year}
                {transactionType === 'expense' ? ' (Expenses)' : ' (Income)'}
              </h3>
              
              {categoryBreakdown.categories.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No {transactionType} data available for this period
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <div className="h-64">
                        {getCategoryBreakdownChartData() && <Pie 
                          data={getCategoryBreakdownChartData()} 
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'right'
                              }
                            }
                          }}
                        />}
                      </div>
                    </div>
                    
                    <div>
                      <div className="bg-gray-50 p-4 rounded-lg text-center mb-4">
                        <p className="text-sm text-gray-600 mb-1">Total {transactionType === 'expense' ? 'Expenses' : 'Income'}</p>
                        <p className="text-xl font-bold text-gray-800">{formatCurrency(categoryBreakdown.total)}</p>
                      </div>
                      
                      <div className="space-y-2">
                        {categoryBreakdown.categories.map((category, index) => (
                          <div key={index} className="flex justify-between items-center p-2 border-b">
                            <div>
                              <p className="font-medium">{category.category}</p>
                              <p className="text-xs text-gray-500">{category.count} transactions</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(category.amount)}</p>
                              <p className="text-xs text-gray-500">{category.percentage.toFixed(1)}% of total</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Monthly Trend Report */}
          {selectedReport === 'monthly-trend' && monthlyTrend && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Monthly Trend (Last 6 Months)
              </h3>
              
              <div className="h-80">
                {getMonthlyTrendChartData() && <Line 
                  data={getMonthlyTrendChartData()} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top'
                      },
                      title: {
                        display: true,
                        text: 'Income, Expenses and Savings Trend'
                      }
                    }
                  }}
                />}
              </div>
              
              <div className="mt-6 overflow-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b">Month</th>
                      <th className="py-2 px-4 border-b text-right">Income</th>
                      <th className="py-2 px-4 border-b text-right">Expenses</th>
                      <th className="py-2 px-4 border-b text-right">Savings</th>
                      <th className="py-2 px-4 border-b text-right">Savings Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyTrend.map((month, index) => {
                      const monthName = monthOptions.find(m => m.value === month.month)?.label;
                      const savingsRate = month.income > 0 
                        ? ((month.savings / month.income) * 100).toFixed(1) 
                        : 'N/A';
                      
                      return (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                          <td className="py-2 px-4 border-b">{monthName} {month.year}</td>
                          <td className="py-2 px-4 border-b text-right">{formatCurrency(month.income)}</td>
                          <td className="py-2 px-4 border-b text-right">{formatCurrency(month.expenses)}</td>
                          <td className="py-2 px-4 border-b text-right">{formatCurrency(month.savings)}</td>
                          <td className="py-2 px-4 border-b text-right">{savingsRate}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Budget Comparison Report */}
          {selectedReport === 'budget-comparison' && budgetComparison && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Budget vs. Actual: {monthOptions.find(m => m.value === budgetComparison.month)?.label} {budgetComparison.year}
              </h3>
              
              {budgetComparison.comparison.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No budget data available for this period
                </div>
              ) : (
                <div>
                  <div className="h-64 mb-6">
                    {getBudgetComparisonChartData() && <Bar 
                      data={getBudgetComparisonChartData()} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top'
                          },
                          title: {
                            display: true,
                            text: 'Budget vs. Actual Spending'
                          }
                        },
                        scales: {
                          x: {
                            stacked: false,
                          }
                        }
                      }}
                    />}
                  </div>
                  
                  <div className="overflow-auto">
                    <table className="min-w-full bg-white">
                      <thead>
                        <tr>
                          <th className="py-2 px-4 border-b">Category</th>
                          <th className="py-2 px-4 border-b text-right">Budget</th>
                          <th className="py-2 px-4 border-b text-right">Actual</th>
                          <th className="py-2 px-4 border-b text-right">Difference</th>
                          <th className="py-2 px-4 border-b text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {budgetComparison.comparison.map((item, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                            <td className="py-2 px-4 border-b">{item.category}</td>
                            <td className="py-2 px-4 border-b text-right">{formatCurrency(item.budgeted)}</td>
                            <td className="py-2 px-4 border-b text-right">{formatCurrency(item.actual)}</td>
                            <td className={`py-2 px-4 border-b text-right ${item.difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {item.difference >= 0 ? '+' : ''}{formatCurrency(item.difference)}
                            </td>
                            <td className="py-2 px-4 border-b text-center">
                              <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                                item.status === 'exceeded' ? 'bg-red-100 text-red-800' : 
                                item.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-green-100 text-green-800'
                              }`}>
                                {item.status === 'exceeded' ? 'Exceeded' : 
                                 item.status === 'warning' ? 'Warning' : 'On Budget'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Reports; 
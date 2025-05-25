import React, { useState, useEffect } from 'react';
import { Plus, DollarSign, TrendingUp, BarChart3, Eye, Users, PieChart } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const IncomeManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [incomeData, setIncomeData] = useState([]);
  const [incomeStats, setIncomeStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userRole, setUserRole] = useState('guest');
  
  // Form states
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: ''
  });

  // Mock user role - in real app, get from auth context/localStorage
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role') || 'guest';
    setUserRole(role);
  }, []);

  // API Base URL
  const API_BASE = 'https://api.ameyaaccountsonline.info'; // Adjust to your API URL

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Fetch all income records
  const fetchIncomeData = async () => {
    if (userRole !== 'admin') return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/income/all`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        setIncomeData(data.data);
        calculateIncomeStats(data.data);
      } else {
        setError(data.message || 'Failed to fetch income data');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Calculate income statistics
  const calculateIncomeStats = (data) => {
    if (!data || data.length === 0) {
      setIncomeStats(null);
      return;
    }

    const totalIncome = data.reduce((sum, record) => sum + record.amount, 0);
    const averageIncome = totalIncome / data.length;
    
    // Group income by category for pie chart
    const incomeByCategory = data.reduce((acc, record) => {
      const category = record.category || record.description.split(' ')[0] || 'Other';
      acc[category] = (acc[category] || 0) + record.amount;
      return acc;
    }, {});

    // Prepare pie chart data
    const pieChartData = Object.entries(incomeByCategory).map(([category, amount]) => ({
      name: category,
      value: amount,
      percentage: ((amount / totalIncome) * 100).toFixed(1)
    }));

    // Recent income (last 5 records)
    const recentIncome = data.slice(-5).reverse();

    setIncomeStats({
      totalIncome,
      averageIncome,
      totalRecords: data.length,
      incomeByCategory,
      pieChartData,
      recentIncome
    });
  };

  // Fetch income statistics
  const fetchIncomeStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/income/stats`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        setIncomeStats(data.data);
      } else {
        // If stats endpoint doesn't exist, calculate from income data
        fetchIncomeData();
      }
    } catch (err) {
      // Fallback to fetching income data
      fetchIncomeData();
    } finally {
      setLoading(false);
    }
  };

  // Create new income record
  const createIncomeRecord = async () => {
    if (userRole !== 'admin') {
      setError('Only admins can create income records');
      return;
    }

    if (!formData.description || !formData.amount) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/income`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          description: formData.description,
          amount: parseFloat(formData.amount),
          category: formData.category || formData.description.split(' ')[0]
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Income record created successfully!');
        setFormData({ description: '', amount: '', category: '' });
        fetchIncomeData();
        fetchIncomeStats();
      } else {
        setError(data.message || 'Failed to create income record');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and tab change
  useEffect(() => {
    fetchIncomeStats();
    if (userRole === 'admin') {
      fetchIncomeData();
    }
  }, [userRole]);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Colors for pie chart
  const pieChartColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Income Management Dashboard
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            {userRole === 'admin' ? 'Manage income and track financial performance' : 'View income overview'}
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex flex-wrap gap-2 md:gap-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-blue-50 shadow-md'
              }`}
            >
              <BarChart3 className="inline w-4 h-4 mr-2" />
              Overview
            </button>
            
            {userRole === 'admin' && (
              <>
                <button
                  onClick={() => setActiveTab('create')}
                  className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                    activeTab === 'create'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-green-50 shadow-md'
                  }`}
                >
                  <Plus className="inline w-4 h-4 mr-2" />
                  Add Income
                </button>
                
                <button
                  onClick={() => setActiveTab('records')}
                  className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                    activeTab === 'records'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-purple-50 shadow-md'
                  }`}
                >
                  <Eye className="inline w-4 h-4 mr-2" />
                  View Records
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Content Based on Active Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Income Summary Cards */}
            {incomeStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-gradient-to-br from-green-400 to-green-600 p-6 rounded-xl text-white shadow-lg transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Total Income</p>
                      <p className="text-2xl font-bold">{formatCurrency(incomeStats.totalIncome)}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-6 rounded-xl text-white shadow-lg transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Average Income</p>
                      <p className="text-2xl font-bold">{formatCurrency(incomeStats.averageIncome)}</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-blue-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-6 rounded-xl text-white shadow-lg transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Total Records</p>
                      <p className="text-2xl font-bold">{incomeStats.totalRecords}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-purple-200" />
                  </div>
                </div>
              </div>
            )}

            {/* Charts and Categories */}
            {incomeStats && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <PieChart className="w-5 h-5 mr-2" />
                    Income Distribution
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={incomeStats.pieChartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percentage }) => `${name}: ${percentage}%`}
                        >
                          {incomeStats.pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={pieChartColors[index % pieChartColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Income by Category */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Income by Category</h3>
                  <div className="space-y-3">
                    {Object.entries(incomeStats.incomeByCategory).map(([category, amount]) => (
                      <div key={category} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <span className="font-medium text-gray-700">{category}</span>
                        <span className="text-green-600 font-semibold">{formatCurrency(amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Recent Income */}
            {incomeStats && incomeStats.recentIncome && (
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Income</h3>
                <div className="space-y-3">
                  {incomeStats.recentIncome.map((record, index) => (
                    <div key={record.id || index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div>
                        <span className="font-medium text-gray-700">{record.description}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          {record.date_created ? formatDate(record.date_created) : 'Recent'}
                        </span>
                      </div>
                      <span className="text-green-600 font-semibold">{formatCurrency(record.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Create Income Tab (Admin Only) */}
        {activeTab === 'create' && userRole === 'admin' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Income Record</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter income description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter income category (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter amount"
                  />
                </div>

                <button
                  onClick={createIncomeRecord}
                  disabled={loading || !formData.description || !formData.amount}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium 
                           hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 
                           disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? 'Creating...' : 'Create Income Record'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Income Records Tab (Admin Only) */}
        {activeTab === 'records' && userRole === 'admin' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Income Records</h2>
              <p className="text-gray-600 mt-1">All income entries in the system</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {incomeData.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {record.description}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {record.category || 'Uncategorized'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        {formatCurrency(record.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(record.date_created)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {incomeData.length === 0 && !loading && (
                <div className="text-center py-12">
                  <DollarSign className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No income records found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Access Denied for Non-Admin Tabs */}
        {(activeTab === 'create' || activeTab === 'records') && userRole !== 'admin' && (
          <div className="text-center py-12">
            <Users className="mx-auto w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-600">Only administrators can access this section</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-2">Loading...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomeManagement;
import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faDollarSign,
  faPlus,
  faChartBar,
  faDownload,
  faExclamationTriangle,
  faCheckCircle,
  faSpinner,
  faCircle,
  faRupeeSign,
  faMoneyBillWave,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons'

const Expenses = () => {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Marketing',
    description: ''
  })
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      setLoading(true)
      setError('')
      const token = localStorage.getItem('access_token')
      
      const response = await fetch('https://api.ameyaaccountsonline.info/expenses/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch expenses')
      }

      const data = await response.json()
      setExpenses(data.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.amount || isNaN(formData.amount)) {
      newErrors.amount = 'Please enter a valid amount'
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select a category'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) return

    try {
      setLoading(true)
      setError('')
      const token = localStorage.getItem('access_token')
      
      const response = await fetch('https://api.ameyaaccountsonline.info/expenses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to add expense')
      }

      const data = await response.json()
      setExpenses([data.data, ...expenses])
      setFormData({
        amount: '',
        category: 'Marketing', 
        description: ''
      })
      setSuccess('Expense added successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // Download functionality - PDF instead of CSV
  const downloadExpenses = () => {
    if (expenses.length === 0) {
      setError('No expenses to download')
      setTimeout(() => setError(''), 3000)
      return
    }

    try {
      // Create PDF content using jsPDF (we'll use a simple HTML to PDF approach)
      const printWindow = window.open('', '', 'height=600,width=800')
      
      const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Expense Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4F46E5; padding-bottom: 20px; }
            .company-name { color: #4F46E5; font-size: 24px; font-weight: bold; margin-bottom: 5px; }
            .report-title { font-size: 18px; color: #666; }
            .summary { background: #F8FAFC; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .summary-item { display: inline-block; margin-right: 30px; }
            .summary-label { font-weight: bold; color: #374151; }
            .summary-value { color: #059669; font-size: 18px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #E5E7EB; padding: 12px; text-align: left; }
            th { background: #F9FAFB; font-weight: bold; color: #374151; }
            tr:nth-child(even) { background: #F9FAFB; }
            .amount { color: #059669; font-weight: bold; }
            .category { padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; }
            .marketing { background: #EDE9FE; color: #7C3AED; }
            .travel { background: #DBEAFE; color: #2563EB; }
            .food { background: #FEF3C7; color: #D97706; }
            .health { background: #D1FAE5; color: #059669; }
            .other { background: #F3F4F6; color: #374151; }
            .footer { margin-top: 30px; text-align: center; color: #6B7280; font-size: 12px; border-top: 1px solid #E5E7EB; padding-top: 20px; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">Amey Distribution</div>
            <div class="report-title">Expense Report</div>
            <div style="color: #6B7280; font-size: 14px; margin-top: 10px;">Generated on ${new Date().toLocaleDateString()}</div>
          </div>
          
          <div class="summary">
            <div class="summary-item">
              <div class="summary-label">Total Expenses:</div>
              <div class="summary-value">₹${totalAmount.toFixed(2)}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Number of Entries:</div>
              <div class="summary-value">${expenses.length}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Period:</div>
              <div class="summary-value">All Time</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Description</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${expenses.map(expense => {
                let categoryClass = 'other'
                if (expense.category === 'Marketing') categoryClass = 'marketing'
                if (expense.category === 'Travel') categoryClass = 'travel'
                if (expense.category === 'Food') categoryClass = 'food'
                if (expense.category === 'Health') categoryClass = 'health'
                
                return `
                  <tr>
                    <td>${expense.invoice_id}</td>
                    <td class="amount">₹${expense.amount.toFixed(2)}</td>
                    <td><span class="category ${categoryClass}">${expense.category}</span></td>
                    <td>${expense.description || 'N/A'}</td>
                    <td>${new Date(expense.date_created).toLocaleDateString()}</td>
                  </tr>
                `
              }).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <div>This report was generated automatically by TrackExpense system.</div>
            <div style="margin-top: 5px;">© ${new Date().getFullYear()} Amey Distribution. All rights reserved.</div>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 1000);
            }
          </script>
        </body>
        </html>
      `
      
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      
      setSuccess('PDF download initiated!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to generate PDF')
      setTimeout(() => setError(''), 3000)
    }
  }

  if (loading && expenses.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="mt-4 text-gray-700 font-medium">Loading expenses...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center mb-4 sm:mb-0">
            <span className="bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center mr-2">
              <FontAwesomeIcon icon={faRupeeSign} className="text-white text-sm" />
            </span>
            Expense Tracker
            <span className="ml-2 text-blue-500 text-lg">
              <span className="hidden sm:inline">| Manage Your Finances</span>
            </span>
          </h2>
          
          {expenses.length > 0 && (
            <button
              onClick={downloadExpenses}
              className="flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-md shadow-sm transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              <FontAwesomeIcon icon={faDownload} className="mr-2" />
              Download PDF
            </button>
          )}
        </div>
        
        {error && (
          <div className="p-4 mb-6 text-red-700 bg-red-100 rounded-lg border-l-4 border-red-500 animate-pulse">
            <p className="font-bold flex items-center">
              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2 text-red-500" />
              Error:
            </p>
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="p-4 mb-6 text-green-700 bg-green-100 rounded-lg border-l-4 border-green-500 animate-pulse">
            <p className="flex items-center">
              <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-green-500" />
              {success}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-200 hover:shadow-xl">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <h3 className="text-xl font-bold">
                  <FontAwesomeIcon icon={faMoneyBillWave} className="mr-2" />
                  Your Expenses
                </h3>
              </div>
              {expenses.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="inline-block rounded-full bg-blue-100 p-3 mb-4">
                    <FontAwesomeIcon icon={faChartBar} className="text-blue-500 text-2xl" />
                  </div>
                  <p className="text-gray-500 font-medium">No expenses found. Add your first expense.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <span className="flex items-center">
                            <FontAwesomeIcon icon={faCircle} className="text-gray-400 text-xs mr-2" />
                            Invoice ID
                          </span>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <span className="flex items-center">
                            <FontAwesomeIcon icon={faCircle} className="text-green-400 text-xs mr-2" />
                            Amount
                          </span>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <span className="flex items-center">
                            <FontAwesomeIcon icon={faCircle} className="text-blue-400 text-xs mr-2" />
                            Category
                          </span>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <span className="flex items-center">
                            <FontAwesomeIcon icon={faCircle} className="text-purple-400 text-xs mr-2" />
                            Date
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {expenses.map(expense => {
                        // Get category color
                        let categoryColor = "bg-gray-100 text-gray-800";
                        if (expense.category === "Marketing") categoryColor = "bg-purple-100 text-purple-800";
                        if (expense.category === "Travel") categoryColor = "bg-blue-100 text-blue-800";
                        if (expense.category === "Food") categoryColor = "bg-yellow-100 text-yellow-800";
                        if (expense.category === "Health") categoryColor = "bg-green-100 text-green-800";
                        if (expense.category === "Other") categoryColor = "bg-gray-100 text-gray-800";
                        
                        return (
                          <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              <span className="bg-gray-100 py-1 px-2 rounded">
                                {expense.invoice_id}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className="font-bold text-green-600">
                                ₹{expense.amount.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColor}`}>
                                {expense.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className="bg-gray-100 py-1 px-2 rounded-md">
                                {new Date(expense.date_created).toLocaleDateString()}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-200 hover:shadow-xl order-1 lg:order-2">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <h3 className="text-xl font-bold">
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Add New Expense
              </h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center">
                      <FontAwesomeIcon icon={faCircle} className="text-green-500 text-xs mr-2" />
                      Amount
                      {errors.amount && <span className="text-red-500 text-xs ml-1">({errors.amount})</span>}
                    </span>
                  </label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">₹</span>
                    </div>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className={`block w-full pl-7 pr-12 py-3 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.amount ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center">
                      <FontAwesomeIcon icon={faCircle} className="text-blue-500 text-xs mr-2" />
                      Category
                      {errors.category && <span className="text-red-500 text-xs ml-1">({errors.category})</span>}
                    </span>
                  </label>
                  <div className="relative">
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={`block w-full p-3 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <option value="Marketing">Marketing</option>
                      <option value="Travel">Travel</option>
                      <option value="Food">Food</option>
                      <option value="Health">Health</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center">
                      <FontAwesomeIcon icon={faCircle} className="text-purple-500 text-xs mr-2" />
                      Description
                    </span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter expense details..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3 text-white font-medium rounded-md shadow-sm transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                      Adding...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <FontAwesomeIcon icon={faPlus} className="mr-2" />
                      Add Expense
                    </span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Expenses

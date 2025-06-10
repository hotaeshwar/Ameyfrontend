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
  const [user, setUser] = useState(null) // Add user state
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([]) // Dynamic categories
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: ''
  })
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')

  // Get user from localStorage
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userRole = localStorage.getItem('user_role');
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          username: payload.sub,
          role: userRole || payload.role || 'guest'
        });
      } catch (error) {
        console.error('Token invalid:', error);
      }
    }
  }, []);

  useEffect(() => {
    fetchExpenses()
    fetchCategories() // Fetch categories from backend
  }, [])

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch('https://api.ameyaaccountsonline.info/categories/expense', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCategories(data.data || [])
        // Set default category if none selected
        if (!formData.category && data.data && data.data.length > 0) {
          setFormData(prev => ({
            ...prev,
            category: data.data[0] // Set first category as default
          }))
        }
      } else {
        console.error('Failed to fetch categories')
        // Fallback to hardcoded categories if API fails
        setCategories(['Marketing', 'Travel', 'Food', 'Health', 'Other'])
        setFormData(prev => ({
          ...prev,
          category: 'Marketing'
        }))
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
      // Fallback to hardcoded categories if API fails
      setCategories(['Marketing', 'Travel', 'Food', 'Health', 'Other'])
      setFormData(prev => ({
        ...prev,
        category: 'Marketing'
      }))
    }
  }

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
        category: categories[0] || 'Marketing', // Reset to first available category
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

  // Enhanced Expense PDF generation function with Amey Marketing and Distribution watermark
  // Fixed Expense PDF generation function with proper number formatting
// Fixed Expense PDF generation function with proper number formatting
// Fixed Expense PDF generation function with proper number formatting
const downloadExpenses = () => {
  if (expenses.length === 0) {
    setError('No expenses to download')
    setTimeout(() => setError(''), 3000)
    return
  }

  try {
    // Import jsPDF dynamically
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      // Add watermark function
      const addWatermark = (doc, pageNumber = 1) => {
        // Save current graphics state
        doc.saveGraphicsState();
        
        // Set transparency
        doc.setGState(doc.GState({opacity: 0.1}));
        
        // Set watermark text properties
        doc.setTextColor(128, 128, 128); // Gray color
        doc.setFontSize(40);
        doc.setFont(undefined, 'bold');
        
        // Calculate center position for watermark
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        // Rotate and position watermark diagonally
        const centerX = pageWidth / 2;
        const centerY = pageHeight / 2;
        
        // Add diagonal watermark text
        doc.text(
          'AMEY MARKETING',
          centerX,
          centerY - 10,
          {
            angle: -45,
            align: 'center'
          }
        );
        
        doc.text(
          '& DISTRIBUTION',
          centerX,
          centerY + 10,
          {
            angle: -45,
            align: 'center'
          }
        );
        
        // Add smaller watermark at bottom right
        doc.setFontSize(12);
        doc.setGState(doc.GState({opacity: 0.3}));
        doc.text(
          'Amey Marketing & Distribution',
          pageWidth - 20,
          pageHeight - 10,
          {
            align: 'right'
          }
        );
        
        // Restore graphics state
        doc.restoreGraphicsState();
      };
      
      // Add watermark to first page
      addWatermark(doc, 1);
      
      // Company Header with Logo placeholder
      doc.setFillColor(41, 98, 183); // Blue background
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), 50, 'F');
      
      // Company name in header
      doc.setTextColor(255, 255, 255); // White text
      doc.setFontSize(24);
      doc.setFont(undefined, 'bold');
      doc.text('AMEY MARKETING & DISTRIBUTION', 20, 25);
      
      // Subtitle
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text('Expense Management System', 20, 35);
      
      // Reset text color for content
      doc.setTextColor(40, 40, 40);
      
      // Add title
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text('Expense Report', 20, 70);
      
      // Add date and report info
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${currentDate.toLocaleDateString()}`, 20, 85);
      doc.text(`Report Period: ${month.toString().padStart(2, '0')}/${year}`, 20, 95);
      doc.text(`Generated by: ${user?.username || 'System'}`, 20, 105);
      
      // Calculate summary data
      const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      const categoryBreakdown = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      }, {});
      
      // Add summary section with better styling
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.setFont(undefined, 'bold');
      doc.text('Executive Summary', 20, 125);
      
      // Summary box
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(248, 249, 250);
      doc.roundedRect(20, 135, 170, 50, 3, 3, 'FD');
      
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(60, 60, 60);
      
      // Custom number formatting function for Indian currency
      const formatIndianCurrency = (amount) => {
        const num = parseFloat(amount);
        if (isNaN(num)) return '₹0.00';
        
        // Convert to string with 2 decimal places
        const numStr = num.toFixed(2);
        const [integerPart, decimalPart] = numStr.split('.');
        
        // Add commas in Indian format (last 3 digits, then every 2 digits)
        let formattedInteger = '';
        const reversed = integerPart.split('').reverse();
        
        for (let i = 0; i < reversed.length; i++) {
          if (i === 3 || (i > 3 && (i - 3) % 2 === 0)) {
            formattedInteger = ',' + formattedInteger;
          }
          formattedInteger = reversed[i] + formattedInteger;
        }
        
        return `₹${formattedInteger}.${decimalPart}`;
      };
      
      const formattedTotal = formatIndianCurrency(totalAmount);
      const mostExpensiveCategory = Object.keys(categoryBreakdown).length > 0 
        ? Object.keys(categoryBreakdown).reduce((a, b) => categoryBreakdown[a] > categoryBreakdown[b] ? a : b)
        : 'N/A';
      
      // Left column of summary
      doc.text('Total Expenses:', 30, 150);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(34, 197, 94); // Green for amount
      doc.text(formattedTotal, 30, 160);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(60, 60, 60); // Reset color
      doc.text(`Number of Entries: ${expenses.length}`, 30, 170);
      doc.text('Reporting Period: All Time', 30, 180);
      
      // Right column of summary
      doc.text('Most Expensive Category:', 120, 150);
      doc.setFont(undefined, 'bold');
      doc.text(mostExpensiveCategory, 120, 160);
      doc.setFont(undefined, 'normal');
      
      // Category breakdown (top 3)
      const topCategories = Object.entries(categoryBreakdown)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);
      
      if (topCategories.length > 0) {
        doc.text('Top Categories:', 120, 170);
        topCategories.forEach(([category, amount], index) => {
          const formattedAmount = formatIndianCurrency(amount);
          doc.text(`${index + 1}. ${category}:`, 125, 177 + (index * 7));
          doc.setTextColor(34, 197, 94); // Green for amount
          doc.text(formattedAmount, 125, 180 + (index * 7));
          doc.setTextColor(60, 60, 60); // Reset color
        });
      }
      
      // Add detailed table headers
      let yPosition = 210;
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(40, 40, 40);
      doc.text('Detailed Expense Records', 20, yPosition);
      
      yPosition += 15;
      
      // Table header background
      doc.setFillColor(240, 240, 240);
      doc.rect(20, yPosition - 5, 170, 12, 'F');
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(40, 40, 40);
      doc.text('Invoice ID', 25, yPosition);
      doc.text('Amount', 65, yPosition);
      doc.text('Category', 95, yPosition);
      doc.text('Description', 130, yPosition);
      doc.text('Date', 170, yPosition);
      
      // Add line under headers
      doc.setDrawColor(180, 180, 180);
      doc.line(20, yPosition + 2, 190, yPosition + 2);
      yPosition += 12;
      
      // Add data rows with alternating colors
      const maxEntriesPerPage = 15;
      let currentPageEntries = 0;
      
      expenses.forEach((expense, index) => {
        if (yPosition > 260 || currentPageEntries >= maxEntriesPerPage) {
          // Check if we need a new page
          doc.addPage();
          addWatermark(doc, Math.ceil((index + 1) / maxEntriesPerPage) + 1);
          yPosition = 30;
          currentPageEntries = 0;
          
          // Repeat headers on new page
          doc.setFillColor(240, 240, 240);
          doc.rect(20, yPosition - 5, 170, 12, 'F');
          doc.setFontSize(10);
          doc.setFont(undefined, 'bold');
          doc.setTextColor(40, 40, 40);
          doc.text('Invoice ID', 25, yPosition);
          doc.text('Amount', 65, yPosition);
          doc.text('Category', 95, yPosition);
          doc.text('Description', 130, yPosition);
          doc.text('Date', 170, yPosition);
          doc.line(20, yPosition + 2, 190, yPosition + 2);
          yPosition += 12;
        }
        
        // Alternating row colors
        if (currentPageEntries % 2 === 0) {
          doc.setFillColor(252, 252, 252);
          doc.rect(20, yPosition - 5, 170, 10, 'F');
        }
        
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(60, 60, 60);
        
        // Invoice ID - truncate if too long
        const invoiceId = (expense.invoice_id || '').substring(0, 15);
        doc.text(invoiceId, 25, yPosition);
        
        // Amount in green with proper formatting
        doc.setTextColor(34, 197, 94); // Green
        const formattedAmount = formatIndianCurrency(expense.amount);
        doc.text(formattedAmount, 65, yPosition);
        doc.setTextColor(60, 60, 60); // Reset color
        
        // Category with color coding - truncate if too long
        const category = (expense.category || '').substring(0, 12);
        const categoryLower = category.toLowerCase();
        
        // Set category color
        if (categoryLower.includes('marketing')) {
          doc.setTextColor(124, 58, 237); // Purple
        } else if (categoryLower.includes('travel')) {
          doc.setTextColor(37, 99, 235); // Blue
        } else if (categoryLower.includes('food')) {
          doc.setTextColor(217, 119, 6); // Orange
        } else if (categoryLower.includes('health')) {
          doc.setTextColor(5, 150, 105); // Green
        } else if (categoryLower.includes('salary')) {
          doc.setTextColor(5, 150, 105); // Green
        } else if (categoryLower.includes('electrician')) {
          doc.setTextColor(239, 68, 68); // Red
        } else {
          doc.setTextColor(107, 114, 128); // Gray
        }
        
        doc.text(category, 95, yPosition);
        doc.setTextColor(60, 60, 60); // Reset color
        
        // Description - truncate to fit
        const description = (expense.description || 'N/A').substring(0, 18);
        doc.text(description, 130, yPosition);
        
        // Date
        const dateStr = new Date(expense.date_created).toLocaleDateString('en-IN');
        doc.text(dateStr, 170, yPosition);
        
        yPosition += 10;
        currentPageEntries++;
      });
      
      // Add summary at the end if there are many entries
      if (expenses.length > 10) {
        yPosition += 10;
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(40, 40, 40);
        doc.text('Report Summary:', 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(60, 60, 60);
        doc.text(`Total Records Processed: ${expenses.length}`, 25, yPosition);
        yPosition += 8;
        doc.setTextColor(34, 197, 94); // Green for final total
        doc.setFont(undefined, 'bold');
        doc.text(`Grand Total: ${formattedTotal}`, 25, yPosition);
        doc.setTextColor(60, 60, 60); // Reset color
        doc.setFont(undefined, 'normal');
      }
      
      // Add footer with company info to all pages
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        const pageHeight = doc.internal.pageSize.getHeight();
        
        // Footer line
        doc.setDrawColor(200, 200, 200);
        doc.line(20, pageHeight - 25, 190, pageHeight - 25);
        
        // Footer text
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text('Amey Marketing & Distribution - Expense Management System', 20, pageHeight - 15);
        doc.text(`Generated: ${currentDate.toLocaleString('en-IN')}`, 20, pageHeight - 8);
        
        // Page numbers
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.getWidth() - 20,
          pageHeight - 8,
          { align: 'right' }
        );
      }
      
      // Generate filename with timestamp
      const timestamp = currentDate.toISOString().slice(0, 10);
      const filename = `Amey_Expense_Report_${timestamp}_${year}-${month.toString().padStart(2, '0')}.pdf`;
      
      // Save the PDF
      doc.save(filename);
      
      setSuccess('PDF expense report with company watermark downloaded successfully!');
      setTimeout(() => setSuccess(''), 4000);
    };
    
    script.onerror = () => {
      setError('Failed to load PDF library. Please check your internet connection and try again.');
      setTimeout(() => setError(''), 5000);
    };
    
    // Remove any existing script to avoid conflicts
    const existingScript = document.querySelector('script[src*="jspdf"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    document.head.appendChild(script);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    setError('Error generating expense PDF report. Please try again.');
    setTimeout(() => setError(''), 5000);
  }
};
  const getCategoryColor = (category) => {
    const categoryLower = category.toLowerCase()
    switch (categoryLower) {
      case 'marketing': return "bg-purple-100 text-purple-800"
      case 'travel': return "bg-blue-100 text-blue-800"
      case 'food': return "bg-yellow-100 text-yellow-800"
      case 'health': return "bg-green-100 text-green-800"
      case 'electrician gifts': return "bg-red-100 text-red-800"
      case 'salary': return "bg-emerald-100 text-emerald-800"
      case 'electrician meet': return "bg-indigo-100 text-indigo-800"
      default: return "bg-gray-100 text-gray-800"
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
                      {expenses.map(expense => (
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
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                              {expense.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="bg-gray-100 py-1 px-2 rounded-md">
                              {new Date(expense.date_created).toLocaleDateString()}
                            </span>
                          </td>
                        </tr>
                      ))}
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
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
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

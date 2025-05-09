import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faUsers, 
  faMoneyBillWave, 
  faPlane, 
  faChartBar, 
  faDownload, 
  faArchive,
  faExclamationCircle,
  faCheckCircle,
  faTimesCircle,
  faShieldAlt,
  faCheck,
  faTimes,
  faSpinner,
  faInfoCircle,
  faCalendarAlt,
  faFilter
} from '@fortawesome/free-solid-svg-icons'

const Admin = () => {
  const [activeTab, setActiveTab] = useState('travel')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [currentItem, setCurrentItem] = useState(null)
  const [recentOnly, setRecentOnly] = useState(true)
  const [viewCount, setViewCount] = useState(10)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    fetchData()
  }, [navigate, activeTab])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')
      const token = localStorage.getItem('token')
      
      let endpoint = ''
      if (activeTab === 'users') endpoint = 'https://api.ameyaaccountsonline.info/users/all'
      else if (activeTab === 'expenses') endpoint = 'https://api.ameyaaccountsonline.info/expenses/all'
      else if (activeTab === 'travel') endpoint = 'https://api.ameyaaccountsonline.info/travel/all'
      else if (activeTab === 'reports') endpoint = 'https://api.ameyaaccountsonline.info/daily-reports/all'
  
      const response = await fetch(endpoint, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
  
      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login')
          return
        }
        
        const errorData = await response.json()
        throw new Error(errorData.detail || `Failed to fetch ${activeTab}`)
      }
  
      const result = await response.json()
      if (result.success) {
        setData((result.data || []).sort((a, b) => 
          new Date(b.date_created) - new Date(a.date_created)
        ))
      } else {
        throw new Error(result.message || `Failed to fetch ${activeTab}`)
      }
    } catch (err) {
      setError(err.message)
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  // PART 1: Filter for recent entries
  const getFilteredData = () => {
    if (!recentOnly) return data
    
    // Get entries from the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    return data
      .filter(item => new Date(item.date_created) >= thirtyDaysAgo)
      .slice(0, viewCount)
  }

  const loadMoreEntries = () => {
    setViewCount(prevCount => prevCount + 10)
  }

  const handleStatusUpdate = async (type, id, status, reason = '') => {
    try {
      setIsProcessing(true)
      const token = localStorage.getItem('token')
      
      const endpoint = type === 'travel' 
        ? `https://api.ameyaaccountsonline.info/travel/update-status/${id}`
        : `https://api.ameyaaccountsonline.info/daily-report/update-status/${id}`

      const formData = new FormData()
      formData.append('status', status)
      if (status === 'Rejected') {
        formData.append('rejection_reason', reason || 'Rejected by admin')
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to update status`)
      }

      const result = await response.json()
      if (result.success) {
        setSuccess(`Status updated to ${status} successfully!`)
        setTimeout(() => setSuccess(''), 3000)
        fetchData()
      } else {
        throw new Error(result.message)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRejectClick = (type, id) => {
    setCurrentItem({ type, id })
    setShowRejectModal(true)
  }

  const confirmReject = () => {
    if (!rejectionReason.trim()) {
      setError('Please provide a rejection reason')
      return
    }
    handleStatusUpdate(currentItem.type, currentItem.id, 'Rejected', rejectionReason)
    setShowRejectModal(false)
    setRejectionReason('')
  }

  const handleExport = async (type) => {
    try {
      setIsProcessing(true)
      const token = localStorage.getItem('token')
      const currentDate = new Date()
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1

      const response = await fetch(`https://api.ameyaaccountsonline.info/export/${type}/${year}/${month}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new Error(`Failed to export ${type}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}_${year}_${month}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      setSuccess(`${type} export completed successfully!`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleArchive = async (type) => {
    if (!window.confirm(`Are you sure you want to archive all ${type} data for the current month?`)) {
      return
    }

    try {
      setIsProcessing(true)
      const token = localStorage.getItem('token')
      const currentDate = new Date()
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1

      const response = await fetch(`https://api.ameyaaccountsonline.info/archive/${year}/${month}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to archive ${type}`)
      }

      const result = await response.json()
      if (result.success) {
        setSuccess(`${type} archived successfully!`)
        setTimeout(() => setSuccess(''), 3000)
        fetchData()
      } else {
        throw new Error(result.message)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const confirmAction = (action, id, type) => {
    if (action === 'approve') {
      if (window.confirm(`Are you sure you want to approve this ${type}?`)) {
        handleStatusUpdate(type, id, 'Approved')
      }
    } else {
      handleRejectClick(type, id)
    }
  }

  const getStatusInfo = (item) => {
    const status = item.status || 'Pending'
    const statusClass = {
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Pending': 'bg-yellow-100 text-yellow-800'
    }[status] || 'bg-gray-100 text-gray-800'
    
    return { status, statusClass }
  }

  // PART 2: Enhanced responsive table with recent entries filtering
  const renderTable = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <FontAwesomeIcon 
            icon={faSpinner} 
            spin 
            className="text-4xl text-indigo-600" 
          />
        </div>
      )
    }

    if (error) {
      return (
        <div className="p-6 text-red-600 bg-red-50 rounded-lg border border-red-200 shadow-sm flex items-center">
          <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
          <span className="font-medium">{error}</span>
        </div>
      )
    }

    const filteredData = getFilteredData()

    if (!filteredData.length) {
      return (
        <div className="p-6 text-gray-600 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
          <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
          <span>{recentOnly ? "No recent data available" : "No data available"}</span>
        </div>
      )
    }

    switch (activeTab) {
      case 'users':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-indigo-600 to-indigo-700">
                <tr>
                  <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">ID</th>
                  <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Username</th>
                  <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Role</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 whitespace-nowrap">
                      <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs">
                        {user.id}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.username}
                    </td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {renderLoadMoreButton(filteredData)}
          </div>
        )

      case 'expenses':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-indigo-600 to-indigo-700">
                <tr>
                  <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Invoice</th>
                  <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Amount</th>
                  <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Category</th>
                  <th className="hidden sm:table-cell px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">User</th>
                  <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map(expense => (
                  <tr key={expense.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 whitespace-nowrap">
                      <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs">
                        {expense.invoice_id}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 whitespace-nowrap">
                      <span className="font-medium text-green-600">₹{expense.amount}</span>
                    </td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {expense.category}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell px-2 sm:px-4 md:px-6 py-2 sm:py-4 whitespace-nowrap text-sm">
                      <span className="font-medium">{expense.username}</span>
                      <span className="ml-1 text-xs text-gray-500">({expense.role})</span>
                    </td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(expense.date_created).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {renderLoadMoreButton(filteredData)}
          </div>
        )

      case 'travel':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-indigo-600 to-indigo-700">
                <tr>
                  <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Travel ID</th>
                  <th className="hidden sm:table-cell px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Mode</th>
                  <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Amount</th>
                  <th className="hidden md:table-cell px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">User</th>
                  <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Status</th>
                  <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map(travel => {
                  const { status, statusClass } = getStatusInfo(travel)
                  return (
                    <tr key={travel.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 whitespace-nowrap">
                        <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs">
                          {travel.travel_id}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell px-2 sm:px-4 md:px-6 py-2 sm:py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                          <FontAwesomeIcon icon={faPlane} className="mr-1" />
                          {travel.travel_mode}
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 whitespace-nowrap">
                        <span className="font-medium text-green-600">₹{travel.calculated_amount}</span>
                      </td>
                      <td className="hidden md:table-cell px-2 sm:px-4 md:px-6 py-2 sm:py-4 whitespace-nowrap text-sm">
                        <span className="font-medium">{travel.username}</span>
                        <span className="ml-1 text-xs text-gray-500">({travel.role})</span>
                      </td>
                      <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}>
                          <FontAwesomeIcon 
                            icon={
                              status === 'Approved' ? faCheckCircle :
                              status === 'Rejected' ? faTimesCircle :
                              faInfoCircle
                            } 
                            className="mr-1" 
                          />
                          {status}
                        </span>
                        {travel.rejection_reason && (
                          <div className="mt-1 text-xs text-gray-500 hidden sm:block">
                            Reason: {travel.rejection_reason}
                          </div>
                        )}
                      </td>
                      <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 whitespace-nowrap">
                        {status === 'Pending' && (
                          <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                            <button
                              onClick={() => confirmAction('approve', travel.travel_id, 'travel')}
                              disabled={isProcessing}
                              className="inline-flex items-center justify-center px-2 sm:px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white rounded text-xs hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-all duration-200"
                            >
                              <FontAwesomeIcon icon={faCheck} className="mr-1" />
                              <span className="hidden sm:inline">{isProcessing ? 'Processing...' : 'Approve'}</span>
                              <span className="sm:hidden">OK</span>
                            </button>
                            <button
                              onClick={() => handleRejectClick('travel', travel.travel_id)}
                              disabled={isProcessing}
                              className="inline-flex items-center justify-center px-2 sm:px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded text-xs hover:from-red-600 hover:to-red-700 disabled:opacity-50 transition-all duration-200"
                            >
                              <FontAwesomeIcon icon={faTimes} className="mr-1" />
                              <span className="hidden sm:inline">{isProcessing ? 'Processing...' : 'Reject'}</span>
                              <span className="sm:hidden">No</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {renderLoadMoreButton(filteredData)}
          </div>
        )

      case 'reports':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-indigo-600 to-indigo-700">
                <tr>
                  <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Report ID</th>
                  <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Dealer</th>
                  <th className="hidden md:table-cell px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Location</th>
                  <th className="hidden lg:table-cell px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">User</th>
                  <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Status</th>
                  <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map(report => {
                  const { status, statusClass } = getStatusInfo(report)
                  return (
                    <tr key={report.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 whitespace-nowrap">
                        <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs">
                          {report.report_id}
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 whitespace-nowrap text-sm">
                        <span className="font-medium">{report.dealer_name}</span>
                        <span className="ml-1 text-xs text-gray-500 hidden sm:inline">({report.dealer_type})</span>
                      </td>
                      <td className="hidden md:table-cell px-2 sm:px-4 md:px-6 py-2 sm:py-4 whitespace-nowrap text-sm">
                        <span className="text-gray-700">{report.location}</span>
                        <span className="text-gray-500">, {report.city}</span>
                        <span className="text-gray-400 hidden lg:inline">, {report.state}</span>
                      </td>
                      <td className="hidden lg:table-cell px-2 sm:px-4 md:px-6 py-2 sm:py-4 whitespace-nowrap text-sm">
                        <span className="font-medium">{report.username}</span>
                        <span className="ml-1 text-xs text-gray-500">({report.role})</span>
                      </td>
                      <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}>
                          <FontAwesomeIcon 
                            icon={
                              status === 'Approved' ? faCheckCircle :
                              status === 'Rejected' ? faTimesCircle :
                              faInfoCircle
                            } 
                            className="mr-1" 
                          />
                          {status}
                        </span>
                        {report.rejection_reason && (
                          <div className="mt-1 text-xs text-gray-500 hidden sm:block">
                            Reason: {report.rejection_reason}
                          </div>
                        )}
                      </td>
                      <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 whitespace-nowrap">
                        {status === 'Pending' && (
                          <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                            <button
                              onClick={() => confirmAction('approve', report.report_id, 'report')}
                              disabled={isProcessing}
                              className="inline-flex items-center justify-center px-2 sm:px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white rounded text-xs hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-all duration-200"
                            >
                              <FontAwesomeIcon icon={faCheck} className="mr-1" />
                              <span className="hidden sm:inline">{isProcessing ? 'Processing...' : 'Approve'}</span>
                              <span className="sm:hidden">OK</span>
                            </button>
                            <button
                              onClick={() => handleRejectClick('report', report.report_id)}
                              disabled={isProcessing}
                              className="inline-flex items-center justify-center px-2 sm:px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded text-xs hover:from-red-600 hover:to-red-700 disabled:opacity-50 transition-all duration-200"
                            >
                              <FontAwesomeIcon icon={faTimes} className="mr-1" />
                              <span className="hidden sm:inline">{isProcessing ? 'Processing...' : 'Reject'}</span>
                              <span className="sm:hidden">No</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {renderLoadMoreButton(filteredData)}
          </div>
        )

      default:
        return null
    }
  }

  // Load more button helper function
  const renderLoadMoreButton = (filteredData) => {
    // Only show load more if we're filtering to recent entries
    // and there are more entries to show
    if (recentOnly && filteredData.length === viewCount && data.length > viewCount) {
      return (
        <div className="flex justify-center mt-4">
          <button 
            onClick={loadMoreEntries}
            className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faSpinner} className="mr-2" />
            Load More Entries
          </button>
        </div>
      )
    }
    return null
  }

  // PART 3: Enhanced responsive layout for main dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6 mb-4 sm:mb-8 border border-indigo-100 backdrop-filter backdrop-blur-lg bg-opacity-90">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-indigo-800 flex items-center">
            <FontAwesomeIcon icon={faShieldAlt} className="mr-2 sm:mr-3 text-indigo-600" />
            Admin Dashboard
          </h2>

          {success && (
            <div className="p-3 sm:p-4 mb-4 sm:mb-6 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mr-2" />
              <span className="text-green-700">{success}</span>
            </div>
          )}

          {/* Responsive Tab Navigation */}
          <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-8 overflow-x-auto">
            {[
              { id: 'users', icon: faUsers, label: 'Users' },
              { id: 'expenses', icon: faMoneyBillWave, label: 'Expenses' },
              { id: 'travel', icon: faPlane, label: 'Travel' },
              { id: 'reports', icon: faChartBar, label: 'Reports' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <FontAwesomeIcon icon={tab.icon} className="mr-1 sm:mr-2" />
                <span className="capitalize text-xs sm:text-sm">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Recent Entries Filter Toggle */}
          <div className="flex flex-wrap justify-between items-center mb-4">
            <div className="flex items-center mb-2 sm:mb-0">
              <button
                onClick={() => setRecentOnly(!recentOnly)}
                className={`mr-3 inline-flex items-center px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 ${
                  recentOnly 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                <span className="text-xs sm:text-sm">{recentOnly ? 'Recent Entries Only' : 'All Entries'}</span>
              </button>
              
              <span className="text-xs text-gray-500">
                {recentOnly ? 'Showing entries from the last 30 days' : 'Showing all entries'}
              </span>
            </div>

            {activeTab !== 'users' && (
              <div className="flex flex-wrap gap-2 sm:gap-4">
                <button
                  onClick={() => handleExport(activeTab)}
                  disabled={isProcessing}
                  className="inline-flex items-center px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm"
                >
                  <FontAwesomeIcon icon={faDownload} className="mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">{isProcessing ? 'Exporting...' : `Export ${activeTab}`}</span>
                  <span className="xs:hidden">Export</span>
                </button>
                <button
                  onClick={() => handleArchive(activeTab)}
                  disabled={isProcessing}
                  className="inline-flex items-center px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm"
                >
                  <FontAwesomeIcon icon={faArchive} className="mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">{isProcessing ? 'Archiving...' : `Archive ${activeTab}`}</span>
                  <span className="xs:hidden">Archive</span>
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 sm:p-4 mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <FontAwesomeIcon icon={faExclamationCircle} className="text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            {renderTable()}
          </div>
        </div>
      </div>

      {/* Responsive rejection modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-auto transform transition-all duration-300 scale-100">
            <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4 flex items-center">
              <FontAwesomeIcon icon={faTimesCircle} className="text-red-500 mr-2" />
              Provide Rejection Reason
            </h3>
            <textarea
              className="w-full p-2 sm:p-3 border rounded-lg mb-3 sm:mb-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              rows="3"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter reason for rejection..."
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectionReason('')
                }}
                className="px-3 sm:px-4 py-1 sm:py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-xs sm:text-sm"
              >
                <FontAwesomeIcon icon={faTimes} className="mr-1 sm:mr-2" />
                Cancel
              </button>
              <button
                onClick={confirmReject}
                className="px-3 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 text-xs sm:text-sm"
              >
                <FontAwesomeIcon icon={faCheck} className="mr-1 sm:mr-2" />
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin
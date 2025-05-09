import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faStore, 
  faMapMarkerAlt, 
  faCity, 
  faLocationDot, 
  faFileAlt, 
  faComment, 
  faPlus, 
  faClipboardCheck, 
  faHourglassHalf, 
  faFilter,
  faCalendarAlt,
  faTimes,
  faUser,
  faChartLine,
  faStoreAlt,
  faEye,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons'

const Reports = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [states, setStates] = useState([])
  const [cities, setCities] = useState([])
  const [locations, setLocations] = useState([])
  const [activeTab, setActiveTab] = useState('reports') // 'reports' or 'add'
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [formData, setFormData] = useState({
    dealer_name: '',
    dealer_type: '0-1L',
    state: '',
    city: '',
    location: '',
    remarks: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchReports()
    fetchStates()
  }, [])

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('https://api.ameyaaccountsonline.info/daily-reports/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch daily reports')
      }

      const data = await response.json()
      setReports(data.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchStates = async () => {
    try {
      const response = await fetch('https://api.ameyaaccountsonline.info/locations/states')
      if (!response.ok) {
        throw new Error('Failed to fetch states')
      }
      const data = await response.json()
      setStates(data.data || [])
    } catch (err) {
      console.error('Error fetching states:', err)
    }
  }

  const fetchCities = async (state) => {
    try {
      const response = await fetch(`https://api.ameyaaccountsonline.info/locations/cities/${state}`)
      if (!response.ok) {
        throw new Error('Failed to fetch cities')
      }
      const data = await response.json()
      setCities(data.data || [])
    } catch (err) {
      console.error('Error fetching cities:', err)
    }
  }

  const fetchLocations = async (state, city) => {
    try {
      const response = await fetch(`https://api.ameyaaccountsonline.info/locations/locations/${state}/${city}`)
      if (!response.ok) {
        throw new Error('Failed to fetch locations')
      }
      const data = await response.json()
      setLocations(data.data || [])
    } catch (err) {
      console.error('Error fetching locations:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('https://api.ameyaaccountsonline.info/daily-reports', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dealer_name: formData.dealer_name,
          dealer_type: formData.dealer_type,
          state: formData.state,
          city: formData.city,
          location: formData.location,
          remarks: formData.remarks
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to add daily report')
      }

      const data = await response.json()
      setReports([...reports, data.data])
      setFormData({
        dealer_name: '',
        dealer_type: '0-1L',
        state: '',
        city: '',
        location: '',
        remarks: ''
      })
      setSuccessMessage('Report added successfully!')
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)
      
      // Switch to reports tab on mobile after successful submission
      if (window.innerWidth < 768) {
        setActiveTab('reports')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    if (name === 'state') {
      fetchCities(value)
      setFormData(prev => ({
        ...prev,
        city: '',
        location: ''
      }))
    }

    if (name === 'city') {
      fetchLocations(formData.state, value)
      setFormData(prev => ({
        ...prev,
        location: ''
      }))
    }
  }

  // Count reports by status
  const countByStatus = (status) => {
    return reports.filter(report => report.status === status).length
  }

  // Count pending reports
  const pendingCount = reports.filter(report => !report.status || report.status === 'Pending').length

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-purple-700 animate-spin"></div>
          <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
            <FontAwesomeIcon icon={faClipboardCheck} className="text-2xl text-purple-700 animate-pulse" />
          </div>
        </div>
        <div className="ml-6 flex flex-col">
          <span className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Loading Reports
          </span>
          <span className="text-gray-500">Please wait while we fetch your data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 min-h-screen">
      {/* Animated Background Elements */}
      <div className="fixed top-20 right-20 -z-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="fixed bottom-20 left-20 -z-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="fixed top-60 -left-20 -z-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      
      {/* Page Header */}
      <div className="relative mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 pb-2 inline-block">
          Daily Reports Management
        </h2>
        <div className="h-1 w-24 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-full"></div>
        <p className="mt-2 text-gray-600">Track dealer visits and manage your daily reports</p>
      </div>
      
      {/* Error Alert */}
      {error && (
        <div className="p-4 mb-6 rounded-xl shadow-lg bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center">
            <div className="bg-red-100 rounded-full p-2 mr-3">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-red-800">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
          <button
            onClick={() => setError('')}
            className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-200"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      )}
      
      {/* Success Message */}
      {showSuccess && (
        <div className="p-4 mb-6 rounded-xl shadow-lg bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-2 mr-3">
              <FontAwesomeIcon icon={faClipboardCheck} className="text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-800">Success</h3>
              <p className="text-green-700">{successMessage}</p>
            </div>
          </div>
          <button
            onClick={() => setShowSuccess(false)}
            className="text-green-500 hover:text-green-700 transition-colors p-1 rounded-full hover:bg-green-200"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      )}
      
      {/* Stats Cards */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-5 border-l-4 border-purple-500 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
            </div>
            <div className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <FontAwesomeIcon icon={faClipboardCheck} className="text-white text-xl" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-purple-600">
            <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
            <span>All time reports</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-5 border-l-4 border-green-500 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{countByStatus('Approved')}</p>
            </div>
            <div className="h-14 w-14 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
              <FontAwesomeIcon icon={faClipboardCheck} className="text-white text-xl" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-green-600">
            <FontAwesomeIcon icon={faChartLine} className="mr-1" />
            <span>Verified reports</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-5 border-l-4 border-yellow-500 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
            </div>
            <div className="h-14 w-14 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 flex items-center justify-center shadow-lg">
              <FontAwesomeIcon icon={faHourglassHalf} className="text-white text-xl" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-yellow-600">
            <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
            <span>Awaiting approval</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-5 border-l-4 border-blue-500 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Dealers</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(reports.map(r => r.dealer_name)).size}
              </p>
            </div>
            <div className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <FontAwesomeIcon icon={faStoreAlt} className="text-white text-xl" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-blue-600">
            <FontAwesomeIcon icon={faStore} className="mr-1" />
            <span>Unique dealers visited</span>
          </div>
        </div>
      </div>
      
      {/* Mobile Tab Navigation */}
      <div className="md:hidden mb-6 flex bg-white rounded-full p-1 shadow-md">
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex-1 py-2 px-4 rounded-full flex items-center justify-center ${
            activeTab === 'reports' 
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' 
              : 'text-gray-600'
          }`}
        >
          <FontAwesomeIcon icon={faClipboardCheck} className={activeTab === 'reports' ? 'mr-2' : ''} />
          {activeTab === 'reports' && <span>Reports</span>}
        </button>
        <button
          onClick={() => setActiveTab('add')}
          className={`flex-1 py-2 px-4 rounded-full flex items-center justify-center ${
            activeTab === 'add' 
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' 
              : 'text-gray-600'
          }`}
        >
          <FontAwesomeIcon icon={faPlus} className={activeTab === 'add' ? 'mr-2' : ''} />
          {activeTab === 'add' && <span>Add New</span>}
        </button>
      </div>
      
      {/* Mobile Stats Summary */}
      <div className="md:hidden grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-lg shadow p-3 border-l-4 border-purple-500 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-lg font-bold text-gray-900">{reports.length}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
            <FontAwesomeIcon icon={faClipboardCheck} className="text-white" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-3 border-l-4 border-yellow-500 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Pending</p>
            <p className="text-lg font-bold text-gray-900">{pendingCount}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 flex items-center justify-center">
            <FontAwesomeIcon icon={faHourglassHalf} className="text-white" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Reports Table Section */}
        <div className={`lg:col-span-2 ${activeTab === 'reports' ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl relative">
            <div className="p-5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center">
                  <div className="bg-white bg-opacity-20 rounded-full p-2 mr-3">
                    <FontAwesomeIcon icon={faClipboardCheck} />
                  </div>
                  Recent Reports
                </h3>
                <div className="hidden md:flex items-center bg-white bg-opacity-20 rounded-full px-3 py-1">
                  <FontAwesomeIcon icon={faFilter} className="mr-2" />
                  <span className="text-sm">{reports.length} Reports</span>
                </div>
              </div>
            </div>
            
            {/* Desktop/Tablet Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faFileAlt} className="mr-2" /> Report
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faStore} className="mr-2" /> Dealer
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faLocationDot} className="mr-2" /> Location
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faClipboardCheck} className="mr-2" /> Status
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faEye} className="mr-2" /> Action
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {reports.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center">
                          <div className="rounded-full bg-indigo-100 p-4 mb-4">
                            <FontAwesomeIcon icon={faClipboardCheck} className="text-4xl text-indigo-400" />
                          </div>
                          <p className="text-lg font-medium text-gray-600">No reports found</p>
                          <p className="text-sm mt-1 text-gray-500">Create your first report to get started!</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    reports.map((report, index) => (
                      <tr key={report.id || index} className="hover:bg-indigo-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-1.5 rounded-lg">
                            #{report.report_id}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">{report.dealer_name}</span>
                            <span className="text-xs text-indigo-600 mt-1 bg-indigo-50 px-2 py-0.5 rounded w-fit">
                              {report.dealer_type}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <div className="flex items-start max-w-xs">
                            <FontAwesomeIcon icon={faLocationDot} className="mr-2 text-indigo-400 mt-1" />
                            <span className="truncate">
                              {report.location}, {report.city}, {report.state}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {report.status === 'Approved' ? (
                            <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center w-fit">
                              <FontAwesomeIcon icon={faClipboardCheck} className="mr-1.5" />
                              Approved
                            </span>
                          ) : report.status === 'Rejected' ? (
                            <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center w-fit">
                              <FontAwesomeIcon icon={faTimes} className="mr-1.5" />
                              Rejected
                            </span>
                          ) : (
                            <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center w-fit">
                              <FontAwesomeIcon icon={faHourglassHalf} className="mr-1.5" />
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 py-1.5 px-3 rounded-lg flex items-center transition-colors text-sm">
                            <FontAwesomeIcon icon={faEye} className="mr-1.5" />
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Mobile Card View */}
            <div className="md:hidden">
              {reports.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="rounded-full bg-indigo-100 p-4 mx-auto w-16 h-16 flex items-center justify-center mb-4">
                    <FontAwesomeIcon icon={faClipboardCheck} className="text-3xl text-indigo-400" />
                  </div>
                  <p className="text-lg font-medium text-gray-600">No reports found</p>
                  <p className="text-sm mt-1 text-gray-500">Create your first report to get started!</p>
                  <button 
                    onClick={() => setActiveTab('add')}
                    className="mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-4 rounded-lg flex items-center mx-auto"
                  >
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    <span>Add New Report</span>
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {reports.map((report, index) => (
                    <div key={report.id || index} className="p-4 hover:bg-indigo-50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-1 rounded-lg">
                          #{report.report_id}
                        </span>
                        {report.status === 'Approved' ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center">
                            <FontAwesomeIcon icon={faClipboardCheck} className="mr-1" />
                            Approved
                          </span>
                        ) : report.status === 'Rejected' ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center">
                            <FontAwesomeIcon icon={faTimes} className="mr-1" />
                            Rejected
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center">
                            <FontAwesomeIcon icon={faHourglassHalf} className="mr-1" />
                            Pending
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center mb-2">
                        <div className="bg-purple-100 rounded-full p-2 mr-2">
                          <FontAwesomeIcon icon={faStore} className="text-purple-600" />
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">{report.dealer_name}</span>
                          <span className="text-xs text-indigo-600 ml-2 bg-indigo-50 px-2 py-0.5 rounded">
                            {report.dealer_type}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-start text-sm text-gray-600 mb-3 bg-blue-50 p-2 rounded-lg">
                        <FontAwesomeIcon icon={faLocationDot} className="text-blue-500 mr-1.5 mt-0.5" />
                        <span className="flex-1">
                          {report.location}, {report.city}, {report.state}
                        </span>
                      </div>
                      
                      {report.remarks && (
                        <div className="text-sm text-gray-600 mb-3 bg-gray-50 p-2 rounded-lg flex items-start">
                          <FontAwesomeIcon icon={faComment} className="text-gray-500 mr-1.5 mt-0.5" />
                          <span className="flex-1 line-clamp-2">{report.remarks}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-end mt-2">
                        <button className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 py-1.5 px-3 rounded-lg flex items-center transition-colors text-sm">
                          <FontAwesomeIcon icon={faEye} className="mr-1.5" />
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Report Form */}
        <div className={`${activeTab === 'add' ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl">
            <div className="mb-6 flex items-center">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center shadow-md mr-4">
                <FontAwesomeIcon icon={faPlus} className="text-white text-lg" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Add New Report</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Dealer Information */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl mb-5">
                <h4 className="text-sm uppercase font-semibold text-indigo-800 mb-3 border-b border-indigo-100 pb-2 flex items-center">
                  <FontAwesomeIcon icon={faStoreAlt} className="mr-2" /> Dealer Information
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="dealer_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Dealer Name*
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FontAwesomeIcon icon={faStore} className="text-indigo-500" />
                      </div>
                      <input
                        type="text"
                        id="dealer_name"
                        name="dealer_name"
                        value={formData.dealer_name}
                        onChange={handleChange}
                        required
                        placeholder="Enter dealer name"
                        className="pl-10 w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white shadow-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="dealer_type" className="block text-sm font-medium text-gray-700 mb-1">
                      Dealer Type*
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FontAwesomeIcon icon={faChartLine} className="text-indigo-500" />
                      </div>
                      <select
                        id="dealer_type"
                        name="dealer_type"
                        value={formData.dealer_type}
                        onChange={handleChange}
                        className="pl-10 w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 appearance-none bg-white shadow-sm"
                      >
                        <option value="0-1L">0-1L</option>
                        <option value="1L-2.5L">1L-2.5L</option>
                        <option value="2.5L above">2.5L above</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Location Information */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl mb-5">
                <h4 className="text-sm uppercase font-semibold text-blue-800 mb-3 border-b border-blue-100 pb-2 flex items-center">
                  <FontAwesomeIcon icon={faLocationDot} className="mr-2" /> Location Details
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      State*
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-500" />
                      </div>
                      <select
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        className="pl-10 w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-white shadow-sm"
                      >
                        <option value="">Select State</option>
                        {states.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        City*
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FontAwesomeIcon icon={faCity} className="text-blue-500" />
                        </div>
                        <select
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          required
                          disabled={!formData.state}
                          className={`pl-10 w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none shadow-sm ${
                            !formData.state ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                          }`}
                        >
                          <option value="">Select City</option>
                          {cities.map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                        Location*
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FontAwesomeIcon icon={faLocationDot} className="text-blue-500" />
                        </div>
                        <select
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          required
                          disabled={!formData.city}
                          className={`pl-10 w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none shadow-sm ${
                            !formData.city ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                          }`}
                        >
                          <option value="">Select Location</option>
                          {locations.map(location => (
                            <option key={location} value={location}>{location}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Additional Information */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl">
                <h4 className="text-sm uppercase font-semibold text-purple-800 mb-3 border-b border-purple-100 pb-2 flex items-center">
                  <FontAwesomeIcon icon={faComment} className="mr-2" /> Additional Information
                </h4>
                
                <div>
                  <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">
                    Remarks
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                      <FontAwesomeIcon icon={faComment} className="text-purple-500" />
                    </div>
                    <textarea
                      id="remarks"
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Enter any additional remarks here..."
                      className="pl-10 w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white shadow-sm"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    <FontAwesomeIcon icon={faUser} className="mr-1" />
                    Include any relevant details about the dealer visit
                  </p>
                </div>
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-6 px-6 py-4 text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-xl font-medium transform transition-all duration-300 hover:scale-[1.01] hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting Report...
                  </span>
                ) : (
                  <span className="flex items-center justify-center text-lg">
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Submit Report
                  </span>
                )}
              </button>
            </form>
          </div>
          
          {/* Tips Card - Desktop Only */}
          <div className="hidden lg:block mt-6 bg-white p-5 rounded-xl shadow-lg border-l-4 border-yellow-500">
            <h4 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500 mr-2" />
              Tips for Dealer Reports
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <div className="h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center mr-2 mt-0.5">
                  <span className="text-xs font-bold text-indigo-600">1</span>
                </div>
                <span>Always verify dealer details before submitting your report</span>
              </li>
              <li className="flex items-start">
                <div className="h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center mr-2 mt-0.5">
                  <span className="text-xs font-bold text-indigo-600">2</span>
                </div>
                <span>Include specific details in remarks for better tracking</span>
              </li>
              <li className="flex items-start">
                <div className="h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center mr-2 mt-0.5">
                  <span className="text-xs font-bold text-indigo-600">3</span>
                </div>
                <span>Submit reports promptly after dealer visits</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Mobile Floating Action Button */}
      <div className="fixed bottom-6 right-6 md:hidden z-50">
        <button
          onClick={() => setActiveTab('add')}
          className={`h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg flex items-center justify-center ${
            activeTab === 'add' ? 'hidden' : 'flex'
          }`}
          aria-label="Add new report"
        >
          <FontAwesomeIcon icon={faPlus} className="text-xl" />
        </button>
      </div>
    </div>
  )
}

export default Reports
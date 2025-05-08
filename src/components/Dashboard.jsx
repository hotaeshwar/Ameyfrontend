import { useState, useEffect } from 'react'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('http://localhost:8000/profit-loss/current-month', {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.message || 'Failed to fetch dashboard data')
        }

        const data = await response.json()
        
        // Ensure travel_by_mode exists and has all required modes
        const defaultTravelModes = {
          'Two Wheeler': 0,
          'Four Wheeler': 0,
          'Bus': 0,
          'Train': 0,
          'Flight': 0
        }
        
        // Merge with actual data
        const travelData = {
          ...defaultTravelModes,
          ...(data.data?.travel_by_mode || {})
        }
        
        setStats({
          ...data.data,
          travel_by_mode: travelData
        })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-2"></div>
          <span className="text-indigo-700 font-medium">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-red-600 bg-red-50 rounded-lg border border-red-200 shadow-sm flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-medium">{error}</span>
      </div>
    )
  }

  // Default values if stats is null
  const {
    total_income = 0,
    total_expenses = 0,
    net_profit_loss = 0,
    expenses_by_category = {},
    travel_by_mode = {
      'Two Wheeler': 0,
      'Four Wheeler': 0,
      'Bus': 0,
      'Train': 0,
      'Flight': 0
    }
  } = stats || {}

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-br from-gray-50 to-indigo-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-indigo-100">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-indigo-800 flex items-center">
          <span className="mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </span>
          Financial Dashboard
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Income Card */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg shadow-md border border-green-200 transition-transform duration-300 transform hover:scale-105">
            <h3 className="text-lg font-medium text-green-700 flex items-center mb-2">
              <span className="bg-green-200 p-2 rounded-full mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-700" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
              </span>
              <span>Total Income</span>
            </h3>
            <p className="text-3xl font-bold text-green-600">
              <span className="text-lg font-normal text-green-500">₹</span>
              {total_income.toFixed(2)}
            </p>
            <p className="text-green-500 text-sm mt-2">For current month</p>
          </div>

          {/* Expenses Card */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg shadow-md border border-red-200 transition-transform duration-300 transform hover:scale-105">
            <h3 className="text-lg font-medium text-red-700 flex items-center mb-2">
              <span className="bg-red-200 p-2 rounded-full mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-700" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z" clipRule="evenodd" />
                </svg>
              </span>
              <span>Total Expenses</span>
            </h3>
            <p className="text-3xl font-bold text-red-600">
              <span className="text-lg font-normal text-red-500">₹</span>
              {total_expenses.toFixed(2)}
            </p>
            <p className="text-red-500 text-sm mt-2">For current month</p>
          </div>

          {/* Net Profit/Loss Card */}
          <div className={`bg-gradient-to-br ${net_profit_loss >= 0 ? 'from-indigo-50 to-indigo-100 border-indigo-200' : 'from-orange-50 to-orange-100 border-orange-200'} p-6 rounded-lg shadow-md border transition-transform duration-300 transform hover:scale-105`}>
            <h3 className="text-lg font-medium flex items-center mb-2 text-indigo-700">
              <span className={`${net_profit_loss >= 0 ? 'bg-indigo-200' : 'bg-orange-200'} p-2 rounded-full mr-2`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${net_profit_loss >= 0 ? 'text-indigo-700' : 'text-orange-700'}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 2a1 1 0 011 1v1a1 1 0 11-2 0V5a1 1 0 011-1zm0 10a1 1 0 100 2 1 1 0 000-2zm-1-8a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </span>
              <span>Net Profit/Loss</span>
            </h3>
            <p className={`text-3xl font-bold ${net_profit_loss >= 0 ? 'text-indigo-600' : 'text-orange-600'}`}>
              <span className={`text-lg font-normal ${net_profit_loss >= 0 ? 'text-indigo-500' : 'text-orange-500'}`}>₹</span>
              {net_profit_loss.toFixed(2)}
            </p>
            <p className={`${net_profit_loss >= 0 ? 'text-indigo-500' : 'text-orange-500'} text-sm mt-2`}>For current month</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          {/* Expenses by Category */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-medium mb-4 text-gray-800 flex items-center">
              <span className="bg-blue-100 p-2 rounded-full mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                  <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                  <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
                </svg>
              </span>
              <span>Expenses by Category</span>
            </h3>
            <ul className="space-y-3">
              {Object.entries(expenses_by_category).map(([category, amount]) => (
                <li key={category} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="flex items-center">
                    <span className="h-3 w-3 rounded-full bg-blue-500 mr-2"></span>
                    <span className="text-gray-700">{category}</span>
                  </span>
                  <span className="font-medium text-gray-900">
                    <span className="text-sm text-gray-500">₹</span>
                    {amount.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Travel by Mode */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-medium mb-4 text-gray-800 flex items-center">
              <span className="bg-purple-100 p-2 rounded-full mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-700" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-5h2a2 2 0 011.732 1H14a2 2 0 012 2v2h.05a2.5 2.5 0 014.9 0H20a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0018 5h-1c0-.34-.085-.658-.232-.95L18 2.292A1 1 0 0017.293 2H7.707a1 1 0 00-.707.293L5.232 4.05A2 2 0 005 5H4a1 1 0 00-1 1z" />
                </svg>
              </span>
              <span>Travel by Mode</span>
            </h3>
            <ul className="space-y-3">
              {Object.entries(travel_by_mode).map(([mode, amount], index) => {
                const colors = ['bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-blue-500', 'bg-green-500'];
                return (
                  <li key={mode} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="flex items-center">
                      <span className={`h-3 w-3 rounded-full ${colors[index % colors.length]} mr-2`}></span>
                      <span className="text-gray-700">{mode}</span>
                    </span>
                    <span className="font-medium text-gray-900">
                      <span className="text-sm text-gray-500">₹</span>
                      {amount.toFixed(2)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
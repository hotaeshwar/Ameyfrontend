import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Expenses from './components/Expenses'
import Travel from './components/Travel'
import Reports from './components/Reports'
import Admin from './components/Admin'
import IncomeManagement from './components/IncomeManagement'
import Login from './components/Login'
import Register from './components/Register'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const token = localStorage.getItem('access_token') // Updated to match your API
    const userRole = localStorage.getItem('user_role')
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser({
          username: payload.sub,
          role: userRole || payload.role || 'guest' // Use stored role or token role
        })
        setIsLoggedIn(true)
      } catch (error) {
        console.error('Token invalid:', error)
        localStorage.removeItem('access_token')
        localStorage.removeItem('user_role')
      }
    }
    setLoading(false)
  }, [])
  
  const handleLogin = (token, username, role) => {
    localStorage.setItem('access_token', token) // Updated to match your API
    localStorage.setItem('user_role', role)
    setUser({ username, role: role || 'guest' })
    setIsLoggedIn(true)
  }
  
  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_role')
    setUser(null)
    setIsLoggedIn(false)
  }
  
  const handleRegister = () => {
    return true
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
  
  return (
    <Router>
      {!isLoggedIn ? (
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onRegister={handleRegister} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <div className="flex flex-col h-screen">
          <Header user={user} onLogout={handleLogout} />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar role={user.role} />
            <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/travel" element={<Travel />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/income" element={<IncomeManagement />} />
                <Route 
                  path="/admin" 
                  element={
                    user.role === 'admin' ? 
                      <Admin /> : 
                      <Navigate to="/" replace />
                  } 
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      )}
    </Router>
  )
}

export default App
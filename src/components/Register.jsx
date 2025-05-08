import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faLock, faEye, faEyeSlash, faUserShield } from '@fortawesome/free-solid-svg-icons'

const Register = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'guest',
    admin_key: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [adminExists, setAdminExists] = useState(false)
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showAdminKey, setShowAdminKey] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const checkAdminExists = async () => {
      try {
        const response = await fetch('http://localhost:8000/register', {
          method: 'GET'
        })
        const data = await response.json()
        setAdminExists(data.admin_exists || false)
      } catch (err) {
        console.error('Error checking admin status:', err)
      }
    }
    checkAdminExists()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      // Show success message
      setSuccess('Registration successful! Redirecting to login...')
      
      // Call the onRegister function from parent component
      onRegister()
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate('/login')
      }, 1500)
      
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
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleAdminKeyVisibility = () => {
    setShowAdminKey(!showAdminKey)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg backdrop-blur-sm border border-gray-200 transform transition duration-300 hover:shadow-xl">
        <h2 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Register</h2>
        {error && <div className="p-3 text-red-700 bg-red-100 rounded-lg border-l-4 border-red-500 animate-pulse">{error}</div>}
        {success && <div className="p-3 text-green-700 bg-green-100 rounded-lg border-l-4 border-green-500 animate-pulse">{success}</div>}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <FontAwesomeIcon icon={faUser} />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  placeholder="Enter your username"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <FontAwesomeIcon icon={faLock} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  placeholder="Enter your password"
                />
                <button 
                  type="button" 
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600 hover:text-blue-600 transition-colors duration-200"
                  onClick={togglePasswordVisibility}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>
            
            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-1">
                Role
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <FontAwesomeIcon icon={faUserShield} />
                </div>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 appearance-none bg-white"
                >
                  <option value="guest">Guest</option>
                  <option value="admin">Admin</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>
            </div>
            
            {formData.role === 'admin' && (
              <div className="animate-fadeIn">
                <label htmlFor="admin_key" className="block text-sm font-semibold text-gray-700 mb-1">
                  Admin Key
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <FontAwesomeIcon icon={faLock} />
                  </div>
                  <input
                    id="admin_key"
                    name="admin_key"
                    type={showAdminKey ? "text" : "password"}
                    required={formData.role === 'admin'}
                    value={formData.admin_key}
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    placeholder="Enter admin key"
                  />
                  <button 
                    type="button" 
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600 hover:text-blue-600 transition-colors duration-200"
                    onClick={toggleAdminKeyVisibility}
                  >
                    <FontAwesomeIcon icon={showAdminKey ? faEyeSlash : faEye} />
                  </button>
                </div>
                {adminExists && (
                  <p className="text-sm text-red-500 mt-1 font-medium">
                    Admin already exists. Only one admin allowed.
                  </p>
                )}
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading || (formData.role === 'admin' && adminExists)}
              className="w-full px-4 py-3 text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-medium transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering...
                </span>
              ) : (
                'Register'
              )}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full px-4 py-3 text-gray-700 bg-gray-100 rounded-lg font-medium border border-gray-300 transform transition-all duration-300 hover:bg-white hover:shadow hover:border-gray-400"
            >
              Already have an account? Login
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faUserCircle, faUser, faLock, faKey, faPaperPlane, 
  faArrowLeft, faCheckCircle, faExclamationCircle, 
  faSpinner, faSignInAlt, faEye, faEyeSlash, 
  faShieldAlt, faUserTie
} from '@fortawesome/free-solid-svg-icons'

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetCode, setResetCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('') // Added confirm password
  const [resetStep, setResetStep] = useState(1)
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()
  
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false) // Added confirm password visibility
  const [formErrors, setFormErrors] = useState({})

  // Password validation
  const validatePassword = (password) => {
    return password.length >= 6; // Changed to match backend requirement
  }

  // Form validation
  const validateForm = () => {
    const errors = {}
    
    if (!username.trim()) {
      errors.username = 'Username is required'
    }
    
    if (!password) {
      errors.password = 'Password is required'
    } else if (!validatePassword(password)) {
      errors.password = 'Password must be at least 6 characters'
    }
    
    if (!['user', 'admin'].includes(role)) {
      errors.role = 'Please select a valid role'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    setError('')

    try {
      const response = await fetch('https://api.ameyaaccountsonline.info/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Login failed')
      }

      const data = await response.json()
      onLogin(data.data.access_token, username, role)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const validateResetForm = () => {
    const errors = {}
    
    if (!resetEmail.trim()) {
      errors.resetEmail = 'Username is required'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateNewPasswordForm = () => {
    const errors = {}
    
    if (!newPassword) {
      errors.newPassword = 'New password is required'
    } else if (!validatePassword(newPassword)) {
      errors.newPassword = 'Password must be at least 6 characters'
    }
    
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Updated to match your backend API endpoints
  const handleResetRequest = async (e) => {
    e.preventDefault()
    
    if (!validateResetForm()) {
      return
    }
    
    setLoading(true)
    setError('')

    try {
      const response = await fetch('https://api.ameyaaccountsonline.info/password-reset-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: resetEmail }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Reset request failed')
      }

      const data = await response.json()
      if (data.reset_token) {
        setResetCode(data.reset_token)
        setResetStep(2)
        setSuccess('Reset token received successfully')
      } else {
        throw new Error('No reset token received')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Updated to match your backend API endpoints
  const handleResetVerify = async (e) => {
    e.preventDefault()
    
    if (!validateNewPasswordForm()) {
      return
    }
    
    setLoading(true)
    setError('')

    try {
      const response = await fetch('https://api.ameyaaccountsonline.info/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: resetCode,
          new_password: newPassword,
          confirm_password: confirmPassword
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Password reset failed')
      }

      setSuccess('Password reset successfully!')
      setTimeout(() => {
        setShowReset(false)
        setResetStep(1)
        setResetEmail('')
        setResetCode('')
        setNewPassword('')
        setConfirmPassword('')
        setSuccess('')
        setError('')
        setFormErrors({})
      }, 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 p-4 sm:p-6 md:p-8">
      <div className="absolute inset-0 bg-pattern opacity-10"></div>
      
      {showReset ? (
        <div className="w-full max-w-md p-6 sm:p-8 space-y-6 sm:space-y-8 bg-white rounded-2xl shadow-2xl transform transition-all duration-500 hover:shadow-2xl backdrop-blur-lg bg-opacity-95 animate-fadeIn relative z-10">
          <div className="text-center">
            <span className="inline-block p-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white mb-6 shadow-lg transform transition-transform duration-300 hover:scale-110">
              <FontAwesomeIcon icon={faKey} className="text-2xl" />
            </span>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Password Reset</h2>
            <p className="mt-2 text-gray-600 text-sm">
              {resetStep === 1 ? 'Enter your account username to reset your password' : 'Enter your new password details'}
            </p>
          </div>
          
          {error && (
            <div className="p-4 text-red-700 bg-red-100 rounded-lg border-l-4 border-red-500 animate-pulse flex items-center shadow-md">
              <span className="mr-2"><FontAwesomeIcon icon={faExclamationCircle} /></span>
              {error}
            </div>
          )}
          
          {success && (
            <div className="p-4 text-green-700 bg-green-100 rounded-lg border-l-4 border-green-500 animate-pulse flex items-center shadow-md">
              <span className="mr-2"><FontAwesomeIcon icon={faCheckCircle} /></span>
              {success}
            </div>
          )}
          
          {resetStep === 1 ? (
            <form className="mt-6 sm:mt-8 space-y-6" onSubmit={handleResetRequest}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 flex items-center mb-2">
                    <span className="mr-2"><FontAwesomeIcon icon={faUser} /></span>
                    Username
                  </label>
                  <div className="relative group">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200">
                      <FontAwesomeIcon icon={faUser} />
                    </span>
                    <div className="relative">
                      <input
                        id="resetEmail"
                        type="text"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border-2 ${formErrors.resetEmail ? 'border-red-500' : 'border-gray-200'} rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 group-hover:border-blue-300`}
                        placeholder="Enter your username"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 hidden sm:block">Account username</div>
                    </div>
                  </div>
                  {formErrors.resetEmail && <p className="mt-1 text-sm text-red-600">{formErrors.resetEmail}</p>}
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-70 transform transition-all duration-300 hover:scale-105 hover:shadow-lg flex justify-center items-center"
              >
                {loading ? (
                  <span className="flex items-center">
                    <FontAwesomeIcon icon={faSpinner} spin className="mr-2" /> Processing...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <FontAwesomeIcon icon={faPaperPlane} className="mr-2" /> Request Reset
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReset(false);
                  setResetEmail('');
                  setError('');
                  setSuccess('');
                  setFormErrors({});
                }}
                className="w-full px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transform transition-all duration-300 hover:scale-105 flex justify-center items-center"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Back to Login
              </button>
            </form>
          ) : (
            <form className="mt-6 sm:mt-8 space-y-6" onSubmit={handleResetVerify}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="resetCode" className="block text-sm font-medium text-gray-700 flex items-center mb-2">
                    <span className="mr-2"><FontAwesomeIcon icon={faShieldAlt} /></span>
                    Reset Token
                  </label>
                  <div className="relative group">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200">
                      <FontAwesomeIcon icon={faShieldAlt} />
                    </span>
                    <input
                      id="resetCode"
                      type="text"
                      required
                      value={resetCode}
                      disabled={true}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 group-hover:border-blue-300 bg-gray-100"
                      placeholder="Reset token auto-filled"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 flex items-center mb-2">
                    <span className="mr-2"><FontAwesomeIcon icon={faLock} /></span>
                    New Password
                  </label>
                  <div className="relative group">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200">
                      <FontAwesomeIcon icon={faLock} />
                    </span>
                    <div className="relative">
                      <input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={`w-full pl-10 pr-12 py-3 border-2 ${formErrors.newPassword ? 'border-red-500' : 'border-gray-200'} rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 group-hover:border-blue-300`}
                        placeholder="Enter your new password"
                      />
                      <div className="absolute right-12 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 hidden sm:block">6+ chars</div>
                    </div>
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-blue-600 focus:outline-none transition-colors duration-200"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} className="transform transition-transform duration-300 hover:scale-110" />
                    </button>
                  </div>
                  {formErrors.newPassword && <p className="mt-1 text-sm text-red-600">{formErrors.newPassword}</p>}
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 flex items-center mb-2">
                    <span className="mr-2"><FontAwesomeIcon icon={faLock} /></span>
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200">
                      <FontAwesomeIcon icon={faLock} />
                    </span>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full pl-10 pr-12 py-3 border-2 ${formErrors.confirmPassword ? 'border-red-500' : 'border-gray-200'} rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 group-hover:border-blue-300`}
                        placeholder="Confirm your new password"
                      />
                      <div className="absolute right-12 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 hidden sm:block">Match above</div>
                    </div>
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-blue-600 focus:outline-none transition-colors duration-200"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} className="transform transition-transform duration-300 hover:scale-110" />
                    </button>
                  </div>
                  {formErrors.confirmPassword && <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>}
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-70 transform transition-all duration-300 hover:scale-105 hover:shadow-lg flex justify-center items-center"
              >
                {loading ? (
                  <span className="flex items-center">
                    <FontAwesomeIcon icon={faSpinner} spin className="mr-2" /> Resetting...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <FontAwesomeIcon icon={faCheckCircle} className="mr-2" /> Reset Password
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setResetStep(1);
                  setNewPassword('');
                  setConfirmPassword('');
                  setError('');
                  setSuccess('');
                  setFormErrors({});
                }}
                className="w-full px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transform transition-all duration-300 hover:scale-105 flex justify-center items-center"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Back
              </button>
            </form>
          )}
        </div>
      ) : (
        <div className="w-full max-w-md p-6 sm:p-8 space-y-6 sm:space-y-8 bg-white rounded-2xl shadow-2xl transform transition-all duration-500 hover:shadow-2xl animate-fadeIn backdrop-blur-lg bg-opacity-95 relative z-10">
          <div className="text-center">
            <span className="inline-block p-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white mb-6 shadow-lg transform transition-transform duration-300 hover:scale-110">
              <FontAwesomeIcon icon={faUserCircle} className="text-2xl" />
            </span>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Login to Your Account</h2>
            <p className="mt-2 text-gray-600 text-sm">Welcome back! Please enter your credentials</p>
          </div>
          
          {error && (
            <div className="p-4 text-red-700 bg-red-100 rounded-lg border-l-4 border-red-500 animate-pulse flex items-center shadow-md">
              <span className="mr-2"><FontAwesomeIcon icon={faExclamationCircle} /></span>
              {error}
            </div>
          )}
          
          <form className="mt-6 sm:mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 flex items-center mb-2">
                  <span className="mr-2"><FontAwesomeIcon icon={faUser} /></span>
                  Username
                </label>
                <div className="relative group">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200">
                    <FontAwesomeIcon icon={faUser} />
                  </span>
                  <input
                    id="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border-2 ${formErrors.username ? 'border-red-500' : 'border-gray-200'} rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 group-hover:border-blue-300`}
                    placeholder="Enter your username"
                  />
                </div>
                {formErrors.username && <p className="mt-1 text-sm text-red-600">{formErrors.username}</p>}
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 flex items-center mb-2">
                  <span className="mr-2"><FontAwesomeIcon icon={faLock} /></span>
                  Password
                </label>
                <div className="relative group">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200">
                    <FontAwesomeIcon icon={faLock} />
                  </span>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)} 
                      className={`w-full pl-10 pr-12 py-3 border-2 ${formErrors.password ? 'border-red-500' : 'border-gray-200'} rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 group-hover:border-blue-300`}
                      placeholder="Enter your password"
                    />
                    <div className="absolute right-12 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 hidden sm:block">6+ chars</div>
                  </div>
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-blue-600 focus:outline-none transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="transform transition-transform duration-300 hover:scale-110" />
                  </button>
                </div>
                {formErrors.password && <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>}
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 flex items-center mb-2">
                  <span className="mr-2"><FontAwesomeIcon icon={faUserTie} /></span>
                  Role
                </label>
                <div className="relative group">
                  <div className="relative">
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className={`w-full pl-10 pr-10 py-3 border-2 ${formErrors.role ? 'border-red-500' : 'border-gray-200'} rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 group-hover:border-blue-300 appearance-none`}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                    <div className="absolute right-10 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 hidden sm:block">Select access</div>
                  </div>
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200">
                    <FontAwesomeIcon icon={faUserTie} />
                  </span>
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                </div>
                {formErrors.role && <p className="mt-1 text-sm text-red-600">{formErrors.role}</p>}
              </div>
            </div>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowReset(true);
                  setError('');
                  setSuccess('');
                  setFormErrors({});
                }}
                className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline transition-all duration-200"
              >
                Forgot password?
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-70 transform transition-all duration-300 hover:scale-105 hover:shadow-lg flex justify-center items-center"
            >
              {loading ? (
                <span className="flex items-center">
                  <FontAwesomeIcon icon={faSpinner} spin className="mr-2" /> Logging in...
                </span>
              ) : (
                <span className="flex items-center">
                  <FontAwesomeIcon icon={faSignInAlt} className="mr-2" /> Login
                </span>
              )}
            </button>
          </form>
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <a href="/register" className="font-medium text-blue-600 hover:text-blue-500 hover:underline transition-all duration-200">
                Sign up now
              </a>
            </p>
          </div>
        </div>
      )}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .bg-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        
        @media (max-width: 640px) {
          .from-blue-600 {
            --tw-gradient-from: #3182ce;
          }
          .to-purple-700 {
            --tw-gradient-to: #6b46c1;
          }
        }
      `}</style>
    </div>
  )
}

export default Login
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faPowerOff } from '@fortawesome/free-solid-svg-icons';

const Header = ({ user, onLogout }) => {
  return (
    <header className="bg-gradient-to-r from-white to-gray-100 shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-6 py-4">
        <div className="flex items-center mb-2 sm:mb-0">
          <span className="text-blue-500 mr-2">
            <FontAwesomeIcon icon={faChartLine} />
          </span>
          <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400/80 to-blue-500/80 p-1 rounded-lg backdrop-blur-sm border border-white/20 shadow-sm">
            Amey Marketing and Distributors
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <p className="font-medium">
              <span className="text-purple-600 bg-purple-100 px-2 py-1 rounded-lg shadow-sm hover:shadow-md transition-all">{user.username}</span>
            </p>
            <p className="text-sm mt-1">
              <span className="text-emerald-600 bg-emerald-100 px-2 py-1 rounded-lg capitalize shadow-sm">{user.role}</span>
            </p>
          </div>
          <div className="flex items-center bg-gray-100 px-3 py-2 rounded-full shadow-sm sm:hidden">
            <span className="text-purple-600 font-medium">{user.username}</span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center px-3 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition transform hover:scale-105 shadow-sm hover:shadow-md"
            aria-label="Logout"
          >
            <FontAwesomeIcon icon={faPowerOff} className="mr-1" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
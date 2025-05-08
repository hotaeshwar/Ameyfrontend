import { useState, useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faChartLine, 
  faReceipt, 
  faRoute, 
  faClipboardList, 
  faUserCog, 
  faBars, 
  faChevronRight,
  faChevronLeft
} from '@fortawesome/free-solid-svg-icons'

const Sidebar = ({ role }) => {
  const [expanded, setExpanded] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [hoverTimeout, setHoverTimeout] = useState(null)
  const sidebarRef = useRef(null)
  
  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth < 768
      setIsMobile(isMobileView)
      
      // Auto-collapse sidebar on mobile
      if (isMobileView) {
        setExpanded(false)
      } else if (window.innerWidth >= 1024) {
        setExpanded(true)
      }
    }
    
    // Set initial state
    handleResize()
    
    // Add event listener
    window.addEventListener('resize', handleResize)
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize)
      if (hoverTimeout) clearTimeout(hoverTimeout)
    }
  }, [hoverTimeout])
  
  const toggleSidebar = () => {
    setExpanded(!expanded)
  }

  const handleMouseEnter = () => {
    if (isMobile) return // Don't auto-expand on mobile
    
    // Clear any existing timeout
    if (hoverTimeout) clearTimeout(hoverTimeout)
    
    // Expand the sidebar on hover
    if (!expanded) {
      setExpanded(true)
    }
  }

  const handleMouseLeave = () => {
    if (isMobile) return // Don't auto-collapse on mobile
    
    // Clear any existing timeout
    if (hoverTimeout) clearTimeout(hoverTimeout)
    
    // Set a small delay before collapsing to make the interaction feel smoother
    const timeout = setTimeout(() => {
      setExpanded(false)
    }, 300) // 300ms delay
    
    setHoverTimeout(timeout)
  }

  // Define menu items with their respective icons and paths
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: faChartLine, exact: true },
    { name: 'Expenses', path: '/expenses', icon: faReceipt },
    { name: 'Travel', path: '/travel', icon: faRoute },
    { name: 'Daily Reports', path: '/reports', icon: faClipboardList },
  ]

  // Admin menu item
  const adminMenuItem = { name: 'Admin Panel', path: '/admin', icon: faUserCog }

  return (
    <div 
      ref={sidebarRef}
      className={`${expanded ? 'w-64 md:w-72' : 'w-20'} fixed md:relative z-50 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 text-white h-screen transition-all duration-300 shadow-xl overflow-hidden`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Overlay for mobile when sidebar is expanded */}
      {isMobile && expanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40" 
          onClick={toggleSidebar}
        />
      )}
      
      <div className="p-4 flex items-center space-x-3 border-b border-indigo-700 relative">
        <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-purple-400 ring-opacity-30">
          <span className="font-bold text-white text-lg">TE</span>
        </div>
        <span className={`font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-200 transition-opacity duration-300 ${expanded ? 'opacity-100' : 'opacity-0'}`}>
          TrackExpense
        </span>
        {/* We keep the manual toggle button for accessibility and mobile */}
        <button 
          onClick={toggleSidebar}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-300 hover:text-white transition-colors duration-200 focus:outline-none"
          aria-label="Toggle sidebar"
        >
          <FontAwesomeIcon icon={expanded ? faChevronLeft : faChevronRight} className="text-sm" />
        </button>
      </div>
      
      <nav className="mt-6 px-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) => 
              `flex items-center px-4 py-4 my-2 rounded-xl ${isActive 
                ? 'bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 text-white shadow-md' 
                : 'hover:bg-indigo-800/50 text-gray-200'} transition-all duration-200 relative overflow-hidden group`
            }
          >
            <div className="min-w-[32px] flex justify-center">
              <FontAwesomeIcon 
                icon={item.icon} 
                className={`text-lg transition-all duration-300 group-hover:scale-110 ${expanded ? '' : 'text-xl'}`}
              />
            </div>
            <span className={`transition-all duration-300 font-medium ${expanded ? 'ml-3 opacity-100' : 'opacity-0 translate-x-8 absolute'}`}>
              {item.name}
            </span>
            
            {/* Enhanced hover effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
          </NavLink>
        ))}
        
        {/* Divider before admin section */}
        {role === 'admin' && (
          <div className="my-4 border-t border-indigo-700/50 pt-4">
            <div className={`px-4 text-xs uppercase text-indigo-300 font-semibold mb-2 transition-opacity duration-300 ${expanded ? 'opacity-100' : 'opacity-0'}`}>
              Administration
            </div>
          </div>
        )}
        
        {/* Conditionally render admin menu item */}
        {role === 'admin' && (
          <NavLink
            to="/admin"
            className={({ isActive }) => 
              `flex items-center px-4 py-4 my-2 rounded-xl ${isActive 
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md' 
                : 'hover:bg-indigo-800/50 text-gray-200'} transition-all duration-200 relative overflow-hidden group`
            }
          >
            <div className="min-w-[32px] flex justify-center">
              <FontAwesomeIcon 
                icon={adminMenuItem.icon} 
                className={`text-lg transition-all duration-300 group-hover:scale-110 ${expanded ? '' : 'text-xl'}`}
              />
            </div>
            <span className={`transition-all duration-300 font-medium ${expanded ? 'ml-3 opacity-100' : 'opacity-0 translate-x-8 absolute'}`}>
              {adminMenuItem.name}
            </span>
            
            {/* Enhanced hover effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
          </NavLink>
        )}
      </nav>
      
      {/* Bottom section with toggle button - we keep this for mobile and accessibility */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center px-4">
        {/* Mobile toggle button that's always visible on mobile */}
        {isMobile && (
          <button 
            onClick={toggleSidebar}
            className="p-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:from-blue-700 hover:to-purple-700 transition-colors duration-200 focus:outline-none"
            aria-label="Toggle sidebar"
          >
            <FontAwesomeIcon icon={expanded ? faChevronLeft : faBars} />
          </button>
        )}
        
        {/* Visible only when collapsed on desktop/tablet - for keyboard accessibility */}
        {!isMobile && !expanded && (
          <button 
            onClick={toggleSidebar}
            className="p-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:from-blue-700 hover:to-purple-700 transition-colors duration-200 focus:outline-none"
            aria-label="Expand sidebar"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        )}
      </div>
    </div>
  )
}

export default Sidebar
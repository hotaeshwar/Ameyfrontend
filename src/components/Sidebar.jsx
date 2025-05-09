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
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      
      if (width < 768) {
        setExpanded(false)
      } else if (width >= 1024) {
        setExpanded(true)
      }
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      if (hoverTimeout) clearTimeout(hoverTimeout)
    }
  }, [hoverTimeout])
  
  const toggleSidebar = () => {
    setExpanded(!expanded)
  }

  const handleMouseEnter = () => {
    if (isMobile) return
    
    if (hoverTimeout) clearTimeout(hoverTimeout)
    
    if (!expanded) {
      setExpanded(true)
    }
  }

  const handleMouseLeave = () => {
    if (isMobile) return
    
    if (hoverTimeout) clearTimeout(hoverTimeout)
    
    const timeout = setTimeout(() => {
      setExpanded(false)
    }, 300)
    
    setHoverTimeout(timeout)
  }

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: faChartLine, exact: true },
    { name: 'Expenses', path: '/expenses', icon: faReceipt },
    { name: 'Travel', path: '/travel', icon: faRoute },
    { name: 'Daily Reports', path: '/reports', icon: faClipboardList },
  ]

  const adminMenuItem = { name: 'Admin Panel', path: '/admin', icon: faUserCog }

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && expanded && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Main sidebar container */}
      <div 
        ref={sidebarRef}
        className={`
          fixed top-0 left-0 h-screen z-40
          transition-all duration-300 ease-in-out
          ${expanded ? 'w-72' : 'w-20'}
          ${isMobile && !expanded ? '-translate-x-full' : 'translate-x-0'}
          md:relative md:translate-x-0
          bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 
          text-white shadow-xl
        `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Header section */}
        <div className="p-4 flex items-center space-x-3 border-b border-indigo-700 relative">
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-purple-400 ring-opacity-30">
            <span className="font-bold text-white text-lg">TE</span>
          </div>
          <span className={`font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-200 transition-opacity duration-300 
            ${expanded ? 'opacity-100 visible' : 'opacity-0 invisible md:hidden'}
          `}>
            TrackExpense
          </span>
          
          <button 
            onClick={toggleSidebar}
            className={`
              absolute right-3 top-1/2 transform -translate-y-1/2 
              text-indigo-300 hover:text-white transition-colors duration-200 
              focus:outline-none
              ${isMobile ? 'md:hidden' : ''}
            `}
            aria-label="Toggle sidebar"
          >
            <FontAwesomeIcon icon={expanded ? faChevronLeft : faChevronRight} className="text-sm" />
          </button>
        </div>

        {/* Navigation section */}
        <nav className={`
          mt-6 px-2
          ${isMobile && !expanded ? 'invisible' : 'visible'}
        `}>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) => `
                flex items-center px-4 py-4 my-2 rounded-xl
                ${isActive 
                  ? 'bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 text-white shadow-md' 
                  : 'hover:bg-indigo-800/50 text-gray-200'} 
                transition-all duration-200 relative overflow-hidden group
              `}
            >
              <div className="min-w-[32px] flex justify-center">
                <FontAwesomeIcon 
                  icon={item.icon} 
                  className={`text-lg transition-all duration-300 group-hover:scale-110 ${expanded ? '' : 'text-xl'}`}
                />
              </div>
              <span className={`transition-all duration-300 font-medium 
                ${expanded ? 'ml-3 opacity-100' : 'opacity-0 translate-x-8 absolute'}
              `}>
                {item.name}
              </span>
              
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </NavLink>
          ))}
          
          {role === 'admin' && (
            <div className="my-4 border-t border-indigo-700/50 pt-4">
              <div className={`px-4 text-xs uppercase text-indigo-300 font-semibold mb-2 transition-opacity duration-300 
                ${expanded ? 'opacity-100' : 'opacity-0'}
              `}>
                Administration
              </div>
              
              <NavLink
                to="/admin"
                className={({ isActive }) => `
                  flex items-center px-4 py-4 my-2 rounded-xl
                  ${isActive 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md' 
                    : 'hover:bg-indigo-800/50 text-gray-200'} 
                  transition-all duration-200 relative overflow-hidden group
                `}
              >
                <div className="min-w-[32px] flex justify-center">
                  <FontAwesomeIcon 
                    icon={adminMenuItem.icon} 
                    className={`text-lg transition-all duration-300 group-hover:scale-110 ${expanded ? '' : 'text-xl'}`}
                  />
                </div>
                <span className={`transition-all duration-300 font-medium 
                  ${expanded ? 'ml-3 opacity-100' : 'opacity-0 translate-x-8 absolute'}
                `}>
                  {adminMenuItem.name}
                </span>
                
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </NavLink>
            </div>
          )}
        </nav>

        {/* Bottom toggle buttons */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center px-4">
          {isMobile && (
            <button 
              onClick={toggleSidebar}
              className={`
                p-3 rounded-full 
                bg-gradient-to-r from-blue-600 to-purple-600 
                text-white shadow-lg 
                hover:from-blue-700 hover:to-purple-700 
                transition-colors duration-200 
                focus:outline-none
                ${expanded ? 'opacity-0' : 'opacity-100'}
              `}
              aria-label="Toggle sidebar"
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
          )}
          
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

      {/* Mobile toggle button (always visible when closed) */}
      {isMobile && !expanded && (
        <button 
          onClick={toggleSidebar}
          className="fixed bottom-8 left-4 z-50 
            p-3 rounded-full 
            bg-gradient-to-r from-blue-600 to-purple-600 
            text-white shadow-lg 
            hover:from-blue-700 hover:to-purple-700 
            transition-colors duration-200 
            focus:outline-none"
          aria-label="Open sidebar"
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
      )}
    </>
  )
}

export default Sidebar

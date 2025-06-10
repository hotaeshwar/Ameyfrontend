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
  faChevronLeft,
  faDollarSign,
  faTachometerAlt,
  faCreditCard,
  faMapMarkedAlt,
  faFileInvoiceDollar,
  faChartPie,
  faUserShield,
  faAngleDoubleRight,
  faAngleDoubleLeft
} from '@fortawesome/free-solid-svg-icons'

const Sidebar = ({ role }) => {
  const [expanded, setExpanded] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [hoverTimeout, setHoverTimeout] = useState(null)
  const [isHovering, setIsHovering] = useState(false)
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
    
    setIsHovering(true)
    if (hoverTimeout) clearTimeout(hoverTimeout)
    
    if (!expanded) {
      setExpanded(true)
    }
  }

  const handleMouseLeave = () => {
    if (isMobile) return
    
    setIsHovering(false)
    if (hoverTimeout) clearTimeout(hoverTimeout)
    
    const timeout = setTimeout(() => {
      setExpanded(false)
    }, 300)
    
    setHoverTimeout(timeout)
  }

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: faTachometerAlt, exact: true, color: 'from-blue-600 to-indigo-600' },
    { name: 'Expenses', path: '/expenses', icon: faCreditCard, color: 'from-red-600 to-pink-600' },
    { name: 'Travel', path: '/travel', icon: faMapMarkedAlt, color: 'from-green-600 to-emerald-600' },
    { name: 'Daily Reports', path: '/reports', icon: faFileInvoiceDollar, color: 'from-orange-600 to-amber-600' },
    // Income & Profit tab is now conditionally included based on role
    ...(role === 'admin' ? [{ name: 'Income & Profit', path: '/income', icon: faChartPie, color: 'from-emerald-600 to-green-600' }] : [])
  ]

  const adminMenuItem = { name: 'Admin Panel', path: '/admin', icon: faUserShield, color: 'from-purple-600 to-violet-600' }

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
          transition-all duration-500 ease-out
          ${expanded ? 'w-72' : 'w-20'}
          ${isMobile && !expanded ? '-translate-x-full' : 'translate-x-0'}
          md:relative md:translate-x-0
          bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 
          text-white shadow-2xl border-r border-indigo-700/50
          ${isHovering ? 'scale-[1.02] shadow-3xl ring-2 ring-cyan-400/30' : 'scale-100'}
          before:absolute before:inset-0 before:bg-gradient-to-r before:from-cyan-500/10 before:to-purple-500/10 
          before:opacity-0 before:transition-opacity before:duration-500
          ${isHovering ? 'before:opacity-100' : ''}
          overflow-hidden
        `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Animated background particles */}
        <div className={`absolute inset-0 transition-opacity duration-500 ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 left-1/3 w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
        </div>

        {/* Sliding edge indicator */}
        <div className={`absolute top-0 right-0 w-1 h-full transition-all duration-500 ${isHovering ? 'bg-gradient-to-b from-cyan-400 to-purple-400 opacity-100' : 'opacity-0'}`}></div>

        {/* Header section without logo */}
        <div className="p-4 flex items-center justify-between border-b border-indigo-700/50 relative bg-gradient-to-r from-indigo-800/50 to-purple-800/50">
          <div className={`transition-all duration-500 ${expanded ? 'opacity-100 visible transform translate-x-0' : 'opacity-0 invisible md:hidden transform -translate-x-4'}`}>
            <span className={`font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-200 block leading-tight transition-all duration-500 ${isHovering ? 'animate-pulse' : ''}`}>
              TrackExpense
            </span>
            <span className="text-xs text-indigo-300 font-medium">
              Amey Distribution
            </span>
          </div>
          
          <button 
            onClick={toggleSidebar}
            className={`
              text-indigo-300 hover:text-white transition-all duration-300 
              focus:outline-none hover:bg-indigo-700/50 rounded-full p-2
              ${isMobile ? 'md:hidden' : ''}
              transform hover:rotate-180 hover:scale-110
            `}
            aria-label="Toggle sidebar"
          >
            <FontAwesomeIcon icon={expanded ? faAngleDoubleLeft : faAngleDoubleRight} className="text-sm" />
          </button>
        </div>

        {/* Navigation section */}
        <nav className={`
          mt-6 px-3 space-y-2
          ${isMobile && !expanded ? 'invisible' : 'visible'}
        `}>
          {menuItems.map((item, index) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) => `
                flex items-center px-4 py-3 rounded-xl
                ${isActive 
                  ? `bg-gradient-to-r ${item.color} text-white shadow-lg ring-2 ring-white/20 animate-pulse`
                  : 'hover:bg-indigo-800/50 text-gray-200 hover:text-white'} 
                transition-all duration-500 relative overflow-hidden group
                hover:scale-110 hover:shadow-2xl hover:ring-2 hover:ring-cyan-400/30
                transform hover:-translate-y-1
                ${expanded ? `animate-[slideIn_0.5s_ease-out_${index * 0.1}s_both]` : ''}
              `}
              style={{
                animationDelay: expanded ? `${index * 0.1}s` : '0s'
              }}
            >
              {/* Glowing background effect */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-gradient-to-r ${item.color}/30 blur-xl transform scale-150`} />
              
              {/* Icon with enhanced animations */}
              <div className="min-w-[32px] flex justify-center relative z-10">
                <FontAwesomeIcon 
                  icon={item.icon} 
                  className={`text-lg transition-all duration-500 
                    group-hover:rotate-[360deg] group-hover:scale-125 
                    ${expanded ? '' : 'text-xl'}
                    ${isHovering ? 'drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]' : ''}
                  `}
                />
              </div>
              
              {/* Text with staggered animation */}
              <span className={`transition-all duration-500 font-medium relative z-10
                ${expanded ? 'ml-3 opacity-100 transform translate-x-0' : 'opacity-0 translate-x-8 absolute'}
                group-hover:text-shadow-lg
              `}>
                {item.name}
              </span>
              
              {/* Sliding border effect */}
              <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${item.color} w-0 group-hover:w-full transition-all duration-500`} />
              
              {/* Floating arrow */}
              <span className={`absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 text-sm
                animate-bounce group-hover:translate-x-1`}>
                →
              </span>
              
              {/* Ripple effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute top-1/2 left-1/2 w-0 h-0 rounded-full bg-white/20 group-hover:w-full group-hover:h-full group-hover:-translate-x-1/2 group-hover:-translate-y-1/2 transition-all duration-500"></div>
              </div>
            </NavLink>
          ))}
        </nav>

        {/* Footer section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900/80 to-transparent">
          <div className={`text-center text-xs text-indigo-300 transition-all duration-500 mb-4
            ${expanded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}
          `}>
            <div className="flex items-center justify-center space-x-1 mb-1">
              <span className={`w-2 h-2 bg-green-400 rounded-full transition-all duration-300 ${isHovering ? 'animate-ping scale-150' : 'animate-pulse'}`}></span>
              <span className={`transition-all duration-300 ${isHovering ? 'text-green-300' : ''}`}>System Online</span>
            </div>
            <span className={`transition-all duration-300 ${isHovering ? 'text-cyan-300' : ''}`}>v2.1.0</span>
          </div>

          {/* Bottom toggle buttons */}
          <div className="flex justify-center">
            {isMobile && (
              <button 
                onClick={toggleSidebar}
                className={`
                  p-3 rounded-full 
                  bg-gradient-to-r from-blue-600 to-purple-600 
                  text-white shadow-lg 
                  hover:from-blue-700 hover:to-purple-700 
                  transition-all duration-300 
                  focus:outline-none transform hover:scale-110 hover:rotate-12
                  ${expanded ? 'opacity-0' : 'opacity-100'}
                  hover:shadow-2xl hover:ring-4 hover:ring-blue-400/30
                `}
                aria-label="Toggle sidebar"
              >
                <FontAwesomeIcon icon={faBars} />
              </button>
            )}
            
            {!isMobile && !expanded && (
              <button 
                onClick={toggleSidebar}
                className="p-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg 
                  hover:from-blue-700 hover:to-purple-700 transition-all duration-300 focus:outline-none 
                  transform hover:scale-110 hover:rotate-12 hover:shadow-2xl hover:ring-4 hover:ring-blue-400/30
                  animate-pulse"
                aria-label="Expand sidebar"
              >
                <FontAwesomeIcon icon={faAngleDoubleRight} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile toggle button (always visible when closed) */}
      {isMobile && !expanded && (
        <button 
          onClick={toggleSidebar}
          className="fixed bottom-8 left-4 z-50 
            p-4 rounded-full 
            bg-gradient-to-r from-blue-600 to-purple-600 
            text-white shadow-xl 
            hover:from-blue-700 hover:to-purple-700 
            transition-all duration-300 
            focus:outline-none transform hover:scale-110 hover:rotate-12
            ring-4 ring-blue-600/20 hover:ring-cyan-400/40
            animate-bounce hover:animate-none"
          aria-label="Open sidebar"
        >
          <FontAwesomeIcon icon={faBars} className="text-lg" />
        </button>
      )}

      {/* Custom CSS animations */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.5s ease-out forwards;
        }
      `}</style>
    </>
  )
}

export default Sidebar
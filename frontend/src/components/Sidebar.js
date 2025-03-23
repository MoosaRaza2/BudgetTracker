import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTachometerAlt, faExchangeAlt, faList, faChartPie, 
  faChartBar, faBullseye, faCog, faDatabase, faSignOutAlt, 
  faQuestionCircle
} from '@fortawesome/free-solid-svg-icons';

function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();

  const linkClasses = (path) => (
    `flex items-center w-full py-2.5 px-4 rounded-lg transition-colors ${
      location.pathname === path 
        ? 'bg-black text-white font-medium'
        : 'text-gray-700 hover:bg-gray-200'
    }`
  );

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <aside 
      className={`bg-white min-h-screen shadow-lg fixed md:static transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out md:translate-x-0 z-30`} 
      style={{ width: '280px' }}
    >
      <div className="flex flex-col h-full">
        {/* App Logo/Title */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-center">Finance Tracker</h1>
        </div>

        {/* Main Navigation */}
        <nav className="flex-grow p-4 overflow-y-auto">
          <div className="mb-6">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 px-4">Main</p>
            <ul className="space-y-1">
              <li>
                <Link to="/dashboard" className={linkClasses('/dashboard')} onClick={toggleSidebar}>
                  <FontAwesomeIcon icon={faTachometerAlt} className="w-5 h-5 mr-3" />
                  <span>Overview</span>
                </Link>
              </li>
              <li>
                <Link to="/transactions" className={linkClasses('/transactions')} onClick={toggleSidebar}>
                  <FontAwesomeIcon icon={faExchangeAlt} className="w-5 h-5 mr-3" />
                  <span>Transactions</span>
                </Link>
              </li>
              <li>
                <Link to="/categories" className={linkClasses('/categories')} onClick={toggleSidebar}>
                  <FontAwesomeIcon icon={faList} className="w-5 h-5 mr-3" />
                  <span>Categories</span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="mb-6">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 px-4">Planning</p>
            <ul className="space-y-1">
              <li>
                <Link to="/budgeting" className={linkClasses('/budgeting')} onClick={toggleSidebar}>
                  <FontAwesomeIcon icon={faChartPie} className="w-5 h-5 mr-3" />
                  <span>Budgeting</span>
                </Link>
              </li>
              <li>
                <Link to="/goals" className={linkClasses('/goals')} onClick={toggleSidebar}>
                  <FontAwesomeIcon icon={faBullseye} className="w-5 h-5 mr-3" />
                  <span>Goals</span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="mb-6">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 px-4">Insights</p>
            <ul className="space-y-1">
              <li>
                <Link to="/reports" className={linkClasses('/reports')} onClick={toggleSidebar}>
                  <FontAwesomeIcon icon={faChartBar} className="w-5 h-5 mr-3" />
                  <span>Reports & Analytics</span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="mb-6">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 px-4">Settings</p>
            <ul className="space-y-1">
              <li>
                <Link to="/settings" className={linkClasses('/settings')} onClick={toggleSidebar}>
                  <FontAwesomeIcon icon={faCog} className="w-5 h-5 mr-3" />
                  <span>User Settings</span>
                </Link>
              </li>
              <li>
                <Link to="/data" className={linkClasses('/data')} onClick={toggleSidebar}>
                  <FontAwesomeIcon icon={faDatabase} className="w-5 h-5 mr-3" />
                  <span>Data Export</span>
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        {/* Footer with Support & Logout */}
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center mb-2">
              <FontAwesomeIcon icon={faQuestionCircle} className="text-gray-600 mr-2" />
              <p className="text-sm font-medium text-gray-700">Need Help?</p>
            </div>
            <a 
              href="mailto:hello@gmail.com" 
              className="text-sm text-black hover:underline block"
            >
              hello@gmail.com
            </a>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar; 
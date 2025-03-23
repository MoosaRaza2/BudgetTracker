import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import Login from './components/Login';
import Signup from './components/SignUp';
import ForgotPassword from './components/ForgotPassword';
import Overview from './components/pages/Overview';
import Transactions from './components/pages/Transactions';
import Categories from './components/pages/Categories';
import Budgeting from './components/pages/Budgeting';
import Reports from './components/pages/Reports';
import Goals from './components/pages/Goals';
import Notifications from './components/pages/Notifications';
import Settings from './components/pages/Settings';
import Data from './components/pages/Data';
import Support from './components/pages/Support';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const location = useLocation();

  // Check authentication on app load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  }, []);

  // Determine if the current path is a login, signup, or password reset page
  const isAuthPage = ['/login', '/signup', '/password-reset'].includes(location.pathname);

  // If user is not authenticated and trying to access a protected route, redirect to login
  if (!isAuthenticated && !isAuthPage && location.pathname !== '/') {
    return <Navigate to="/login" />;
  }

  // Root path redirects to login if not authenticated, or dashboard if authenticated
  if (location.pathname === '/') {
    return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} />;
  }

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {!isAuthPage && <Header toggleSidebar={toggleSidebar} />}
      <div className="flex flex-grow" style={{ width: '100%' }}>
        {!isAuthPage && <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />}
        {!isAuthPage && (
          <div className="flex-grow p-10 w-full">
            <Routes>
              <Route path="/dashboard" element={<Overview />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/budgeting" element={<Budgeting />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/data" element={<Data />} />
              <Route path="/support" element={<Support />} />
            </Routes>
          </div>
        )}
        
        {isAuthPage && (
          <div className="flex-grow w-full">
            <Header toggleSidebar={toggleSidebar} />
            <Routes>
              <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/password-reset" element={<ForgotPassword />} />
            </Routes>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;
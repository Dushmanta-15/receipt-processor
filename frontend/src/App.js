import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ReceiptList from './components/ReceiptList';
import ReceiptUpload from './components/ReceiptUpload';
import Analytics from './components/Analytics';
import './App.css';

const NavigationBar = () => {
  const location = useLocation();

  const navItems = [
    { 
      path: '/', 
      name: 'Dashboard', 
      icon: '📊',
      gradient: 'from-blue-500 to-blue-600'
    },
    { 
      path: '/receipts', 
      name: 'Receipts', 
      icon: '🧾',
      gradient: 'from-emerald-500 to-emerald-600'
    },
    { 
      path: '/upload', 
      name: 'Upload', 
      icon: '⬆️',
      gradient: 'from-purple-500 to-purple-600'
    },
    { 
      path: '/analytics', 
      name: 'Analytics', 
      icon: '📈',
      gradient: 'from-amber-500 to-amber-600'
    }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl font-bold">₹</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Receipt Processor
              </h1>
              <p className="text-xs text-gray-500">Smart Expense Tracking</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex space-x-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`relative group px-4 py-2 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-r ' + item.gradient + ' text-white shadow-lg' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                  )}
                  
                  {/* Hover effect */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-bold">👤</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <NavigationBar />
        
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/receipts" element={<ReceiptList />} />
            <Route path="/upload" element={<ReceiptUpload />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import { receiptAPI } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentReceipts, setRecentReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsResponse, receiptsResponse] = await Promise.all([
        receiptAPI.getAnalytics(),
        receiptAPI.getReceipts({ ordering: '-created_at', limit: 5 })
      ]);
      
      setStats(analyticsResponse.data.statistics);
      setRecentReceipts(receiptsResponse.data.results || receiptsResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex justify-center items-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-purple-400 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="space-y-8 p-6">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            📊 Dashboard Overview
          </h1>
          <p className="text-gray-600 text-lg">Track your spending with intelligent insights</p>
        </div>

        {/* Statistics Cards with Glassmorphism */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Spend Card */}
          <div className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/80 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl">💰</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Spend</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats ? formatCurrency(stats.total_spend) : '₹0.00'}
                    </p>
                  </div>
                </div>
                <div className="text-blue-500">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Total Receipts Card */}
          <div className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/80 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl">🧾</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Receipts</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats ? stats.count : 0}
                    </p>
                  </div>
                </div>
                <div className="text-emerald-500">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Average Spend Card */}
          <div className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/80 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl">📊</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Spend</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats ? formatCurrency(stats.mean_spend) : '₹0.00'}
                    </p>
                  </div>
                </div>
                <div className="text-amber-500">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Highest Spend Card */}
          <div className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/80 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl">🚀</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Highest Spend</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats ? formatCurrency(stats.max_spend) : '₹0.00'}
                    </p>
                  </div>
                </div>
                <div className="text-purple-500">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Receipts Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-3xl blur opacity-50"></div>
          <div className="relative bg-white/80 backdrop-blur-lg border border-white/30 rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-b border-white/20">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📋</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Recent Receipts</h3>
                  <p className="text-gray-600">Your latest transactions</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {recentReceipts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-4xl">🏪</span>
                  </div>
                  <p className="text-gray-500 text-lg">No receipts uploaded yet</p>
                  <p className="text-gray-400 text-sm mt-2">Start by uploading your first receipt!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentReceipts.map((receipt, index) => (
                    <div key={receipt.id} className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-center justify-between p-4 hover:bg-white/50 rounded-xl transition-all duration-300">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-lg">
                              {receipt.vendor.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 text-lg">{receipt.vendor}</h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span>{formatDate(receipt.transaction_date)}</span>
                              <span>•</span>
                              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                                {receipt.category}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">
                            {formatCurrency(receipt.amount)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(receipt.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
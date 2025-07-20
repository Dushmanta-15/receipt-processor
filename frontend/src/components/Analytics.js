import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { receiptAPI } from '../services/api';
import { formatCurrency, formatIndianCurrency } from '../utils/formatters';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await receiptAPI.getAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics(null);
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

  // Check if analytics data exists and has valid structure
  if (!analytics || !analytics.statistics || analytics.statistics.count === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex justify-center items-center">
        <div className="text-center max-w-md mx-auto">
          <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
            <span className="text-6xl">📊</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">No Analytics Data Available</h3>
          <p className="text-gray-600 text-lg mb-6">
            Upload some receipts to see your spending insights and analytics!
          </p>
          <a 
            href="/upload" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:scale-105 transition-all duration-300 shadow-lg"
          >
            <span className="mr-2">📤</span>
            Upload Your First Receipt
          </a>
        </div>
      </div>
    );
  }

  // Safe data extraction with default values
  const safeStatistics = analytics.statistics || {};
  const safeCategoryDistribution = analytics.category_distribution || {};
  const safeTopVendors = analytics.top_vendors || [];
  const safeVendorFrequency = analytics.vendor_frequency || {};
  const safeTimeSeries = analytics.time_series || { dates: [], amounts: [], moving_avg: [] };

  // Prepare chart data with safe checks
  const categoryData = {
    labels: Object.keys(safeCategoryDistribution),
    datasets: [
      {
        data: Object.values(safeCategoryDistribution).map(cat => cat?.total || 0),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',   // Blue
          'rgba(16, 185, 129, 0.8)',   // Emerald
          'rgba(245, 158, 11, 0.8)',   // Amber
          'rgba(139, 92, 246, 0.8)',   // Purple
          'rgba(239, 68, 68, 0.8)',    // Red
          'rgba(236, 72, 153, 0.8)',   // Pink
          'rgba(14, 165, 233, 0.8)',   // Sky
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(14, 165, 233, 1)',
        ],
        borderWidth: 2,
        hoverOffset: 10,
      },
    ],
  };

  const vendorData = {
    labels: safeTopVendors.slice(0, 10).map(v => v?.vendor || 'Unknown'),
    datasets: [
      {
        label: 'Total Spend (₹)',
        data: safeTopVendors.slice(0, 10).map(v => v?.total_spend || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const timeSeriesData = {
    labels: safeTimeSeries.dates || [],
    datasets: [
      {
        label: 'Daily Spend (₹)',
        data: safeTimeSeries.amounts || [],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
      },
      {
        label: 'Moving Average (₹)',
        data: safeTimeSeries.moving_avg || [],
        borderColor: 'rgba(139, 92, 246, 1)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgba(139, 92, 246, 1)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '600',
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 10,
        callbacks: {
          label: function(context) {
            const value = context.parsed.y || context.parsed;
            return `${context.dataset.label}: ${formatCurrency(value)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function(value) {
            return formatIndianCurrency(value);
          },
          font: {
            size: 11,
          },
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '600',
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 10,
        callbacks: {
          label: function(context) {
            const value = context.parsed;
            return `${context.label}: ${formatCurrency(value)}`;
          }
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            📈 Analytics Dashboard
          </h1>
          <p className="text-gray-600 text-lg">Discover insights from your spending patterns</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5 mb-8">
          {[
            { 
              title: 'Total Spend', 
              value: formatCurrency(safeStatistics.total_spend || 0),
              icon: '💰',
              gradient: 'from-blue-500 to-blue-600',
              bg: 'from-blue-50 to-blue-100'
            },
            { 
              title: 'Average Spend', 
              value: formatCurrency(safeStatistics.mean_spend || 0),
              icon: '📊',
              gradient: 'from-emerald-500 to-emerald-600',
              bg: 'from-emerald-50 to-emerald-100'
            },
            { 
              title: 'Median Spend', 
              value: formatCurrency(safeStatistics.median_spend || 0),
              icon: '📈',
              gradient: 'from-amber-500 to-amber-600',
              bg: 'from-amber-50 to-amber-100'
            },
            { 
              title: 'Highest Spend', 
              value: formatCurrency(safeStatistics.max_spend || 0),
              icon: '🚀',
              gradient: 'from-purple-500 to-purple-600',
              bg: 'from-purple-50 to-purple-100'
            },
            { 
              title: 'Total Receipts', 
              value: (safeStatistics.count || 0).toString(),
              icon: '🧾',
              gradient: 'from-pink-500 to-pink-600',
              bg: 'from-pink-50 to-pink-100'
            }
          ].map((stat, index) => (
            <div key={index} className="group relative">
              <div className={`absolute inset-0 bg-gradient-to-r ${stat.bg} rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300`}></div>
              <div className="relative bg-white/80 backdrop-blur-lg border border-white/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 bg-gradient-to-r ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                    <span className="text-xl">{stat.icon}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Category Distribution */}
          {Object.keys(safeCategoryDistribution).length > 0 && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-3xl blur opacity-50"></div>
              <div className="relative bg-white/80 backdrop-blur-lg border border-white/30 rounded-3xl shadow-2xl overflow-hidden">
                <div className="px-8 py-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-white/20">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🥧</span>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Spending by Category</h3>
                      <p className="text-gray-600">Distribution of expenses</p>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="h-80">
                    <Pie data={categoryData} options={pieOptions} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Top Vendors */}
          {safeTopVendors.length > 0 && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-3xl blur opacity-50"></div>
              <div className="relative bg-white/80 backdrop-blur-lg border border-white/30 rounded-3xl shadow-2xl overflow-hidden">
                <div className="px-8 py-6 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border-b border-white/20">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📊</span>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Top Vendors</h3>
                      <p className="text-gray-600">Highest spending merchants</p>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="h-80">
                    <Bar data={vendorData} options={chartOptions} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Time Series Chart */}
        {safeTimeSeries.dates && safeTimeSeries.dates.length > 0 && (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl blur opacity-50"></div>
            <div className="relative bg-white/80 backdrop-blur-lg border border-white/30 rounded-3xl shadow-2xl overflow-hidden">
              <div className="px-8 py-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-white/20">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📈</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Spending Trends</h3>
                    <p className="text-gray-600">Daily spending with moving average</p>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <div className="h-80">
                  <Line data={timeSeriesData} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vendor Frequency Table */}
        {safeTopVendors.length > 0 && (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-100 to-orange-100 rounded-3xl blur opacity-50"></div>
            <div className="relative bg-white/80 backdrop-blur-lg border border-white/30 rounded-3xl shadow-2xl overflow-hidden">
              <div className="px-8 py-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-white/20">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📋</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Vendor Analysis</h3>
                    <p className="text-gray-600">Detailed spending breakdown by merchant</p>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Vendor</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Frequency</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Total Spend</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Avg per Visit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {safeTopVendors.slice(0, 10).map((vendor, index) => {
                        const vendorName = vendor?.vendor || 'Unknown';
                        const vendorFreq = safeVendorFrequency[vendorName] || 1;
                        const totalSpend = vendor?.total_spend || 0;
                        return (
                          <tr key={index} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200">
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                  <span className="text-white font-bold text-sm">
                                    {vendorName.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <span className="font-semibold text-gray-900">{vendorName}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                {vendorFreq} receipts
                              </span>
                            </td>
                            <td className="px-6 py-4 font-semibold text-gray-900">
                              {formatCurrency(totalSpend)}
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                              {formatCurrency(totalSpend / vendorFreq)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
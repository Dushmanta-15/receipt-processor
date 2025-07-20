import React, { useState, useEffect } from 'react';
import { receiptAPI } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import ReceiptEditModal from './ReceiptEditModal';

const ReceiptList = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    vendor: '',
    min_amount: '',
    max_amount: '',
    start_date: '',
    end_date: '',
    sort_by: '-transaction_date'
  });
  const [editingReceipt, setEditingReceipt] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(null);

  useEffect(() => {
    fetchReceipts();
  }, [filters]);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const response = await receiptAPI.getReceipts(filters);
      setReceipts(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      vendor: '',
      min_amount: '',
      max_amount: '',
      start_date: '',
      end_date: '',
      sort_by: '-transaction_date'
    });
  };

  const handleEdit = (receipt) => {
    setEditingReceipt(receipt);
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this receipt?')) {
      try {
        await receiptAPI.deleteReceipt(id);
        fetchReceipts();
      } catch (error) {
        console.error('Error deleting receipt:', error);
      }
    }
  };

  const handleExport = async (format) => {
    try {
      setExportLoading(format);
      
      // Clean filters for API call
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );

      const response = await receiptAPI.exportReceipts(format, cleanFilters);
      
      // Create blob and download
      const blob = new Blob([response.data], {
        type: format === 'csv' ? 'text/csv' : 'application/json'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipts_${new Date().toISOString().split('T')[0]}.${format}`;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error exporting receipts:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExportLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex justify-center items-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="text-center lg:text-left mb-4 lg:mb-0">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              🧾 Receipts Manager
            </h1>
            <p className="text-gray-600 text-lg">Organize and manage your digital receipts</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => handleExport('csv')}
              disabled={exportLoading === 'csv'}
              className="relative overflow-hidden rounded-xl px-6 py-3 font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50"
              style={{background: 'linear-gradient(45deg, #10B981, #059669)'}}
            >
              <span className="relative z-10 flex items-center justify-center space-x-2">
                {exportLoading === 'csv' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <span>📊</span>
                    <span>Export CSV</span>
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
            </button>
            
            <button
              onClick={() => handleExport('json')}
              disabled={exportLoading === 'json'}
              className="relative overflow-hidden rounded-xl px-6 py-3 font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50"
              style={{background: 'linear-gradient(45deg, #3B82F6, #1D4ED8)'}}
            >
              <span className="relative z-10 flex items-center justify-center space-x-2">
                {exportLoading === 'json' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <span>📄</span>
                    <span>Export JSON</span>
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-3xl blur opacity-50"></div>
          <div className="relative bg-white/80 backdrop-blur-lg border border-white/30 rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🔍</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Smart Filters</h3>
                    <p className="text-gray-600">Find exactly what you're looking for</p>
                  </div>
                </div>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  Clear All
                </button>
              </div>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {/* Search */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Search</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      placeholder="Search vendor or text..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-white/80 text-gray-900 transition-all duration-300 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <span className="text-gray-400">🔍</span>
                    </div>
                  </div>
                </div>
                
                {/* Category */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white/80 text-gray-900 transition-all duration-300 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                  >
                    <option value="">All Categories</option>
                    <option value="electricity">⚡ Electricity</option>
                    <option value="internet">🌐 Internet</option>
                    <option value="groceries">🛒 Groceries</option>
                    <option value="restaurant">🍽️ Restaurant</option>
                    <option value="shopping">🛍️ Shopping</option>
                    <option value="transportation">🚗 Transportation</option>
                    <option value="other">📦 Other</option>
                  </select>
                </div>

                {/* Amount Range */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Min Amount</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={filters.min_amount}
                      onChange={(e) => handleFilterChange('min_amount', e.target.value)}
                      placeholder="₹0"
                      className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-white/80 text-gray-900 transition-all duration-300 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <span className="text-gray-400">₹</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Max Amount</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={filters.max_amount}
                      onChange={(e) => handleFilterChange('max_amount', e.target.value)}
                      placeholder="₹999999"
                      className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-white/80 text-gray-900 transition-all duration-300 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <span className="text-gray-400">₹</span>
                    </div>
                  </div>
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Start Date</label>
                  <input
                    type="date"
                    value={filters.start_date}
                    onChange={(e) => handleFilterChange('start_date', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white/80 text-gray-900 transition-all duration-300 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">End Date</label>
                  <input
                    type="date"
                    value={filters.end_date}
                    onChange={(e) => handleFilterChange('end_date', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white/80 text-gray-900 transition-all duration-300 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                  />
                </div>

                {/* Sort Options */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Sort By</label>
                  <select
                    value={filters.sort_by}
                    onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white/80 text-gray-900 transition-all duration-300 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                  >
                    <option value="-transaction_date">📅 Date (Newest First)</option>
                    <option value="transaction_date">📅 Date (Oldest First)</option>
                    <option value="-amount">💰 Amount (High to Low)</option>
                    <option value="amount">💰 Amount (Low to High)</option>
                    <option value="vendor">🏪 Vendor (A-Z)</option>
                    <option value="-vendor">🏪 Vendor (Z-A)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Receipts Grid */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-3xl blur opacity-50"></div>
          <div className="relative bg-white/80 backdrop-blur-lg border border-white/30 rounded-3xl shadow-2xl overflow-hidden">
            {receipts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-4xl">📄</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No receipts found</h3>
                <p className="text-gray-600">Try adjusting your filters or upload some receipts to get started</p>
              </div>
            ) : (
              <div className="p-8">
                <div className="grid grid-cols-1 gap-6">
                  {receipts.map((receipt, index) => (
                    <div key={receipt.id} className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-white/50 to-blue-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                      <div className="relative bg-white/60 backdrop-blur-sm border border-white/40 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {/* Vendor Icon */}
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                              <span className="text-white font-bold text-xl">
                                {receipt.vendor.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            
                            {/* Receipt Details */}
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="text-xl font-bold text-gray-900">{receipt.vendor}</h4>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  receipt.category === 'groceries' ? 'bg-green-100 text-green-800' :
                                  receipt.category === 'restaurant' ? 'bg-orange-100 text-orange-800' :
                                  receipt.category === 'shopping' ? 'bg-purple-100 text-purple-800' :
                                  receipt.category === 'transportation' ? 'bg-blue-100 text-blue-800' :
                                  receipt.category === 'internet' ? 'bg-indigo-100 text-indigo-800' :
                                  receipt.category === 'electricity' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {receipt.category}
                                </span>
                              </div>
                              
                              <div className="flex items-center space-x-6 text-sm text-gray-600">
                                <div className="flex items-center space-x-1">
                                  <span>📅</span>
                                  <span>{formatDate(receipt.transaction_date)}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <span>🎯</span>
                                  <span>Confidence: {(receipt.confidence_score * 100).toFixed(1)}%</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <span>⏰</span>
                                  <span>Added {formatDate(receipt.created_at)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Amount and Actions */}
                          <div className="flex items-center space-x-6">
                            <div className="text-right">
                              <p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(receipt.amount)}
                              </p>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(receipt)}
                                className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-lg"
                                title="Edit Receipt"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDelete(receipt.id)}
                                className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-lg"
                                title="Delete Receipt"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary Footer */}
        {receipts.length > 0 && (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl blur opacity-50"></div>
            <div className="relative bg-white/80 backdrop-blur-lg border border-white/30 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">📊</span>
                  <span>Showing {receipts.length} receipts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">💰</span>
                  <span>Total: {formatCurrency(receipts.reduce((sum, r) => sum + parseFloat(r.amount), 0))}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">📈</span>
                  <span>Average: {formatCurrency(receipts.reduce((sum, r) => sum + parseFloat(r.amount), 0) / receipts.length)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <ReceiptEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingReceipt(null);
        }}
        receipt={editingReceipt}
        onSave={() => {
          fetchReceipts();
          setShowEditModal(false);
          setEditingReceipt(null);
        }}
      />
    </div>
  );
};

export default ReceiptList;
import React, { useState, useEffect } from 'react';
import { receiptAPI } from '../services/api';

const ReceiptEditModal = ({ isOpen, onClose, receipt, onSave }) => {
  const [formData, setFormData] = useState({
    vendor: '',
    transaction_date: '',
    amount: '',
    category: 'other'
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (receipt) {
      setFormData({
        vendor: receipt.vendor || '',
        transaction_date: receipt.transaction_date || '',
        amount: receipt.amount || '',
        category: receipt.category || 'other'
      });
    }
  }, [receipt]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!receipt) return;

    try {
      setSaving(true);
      setError(null);
      
      await receiptAPI.updateReceipt(receipt.id, formData);
      onSave();
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-8 py-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold">✏️</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Edit Receipt</h3>
                  <p className="text-gray-600 text-sm">Update receipt information</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors duration-200"
              >
                ❌
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Vendor */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Vendor Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="vendor"
                  value={formData.vendor}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-white/80 text-gray-900 transition-all duration-300 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                  placeholder="Enter vendor name"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <span className="text-gray-400">🏪</span>
                </div>
              </div>
            </div>

            {/* Transaction Date */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Transaction Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="transaction_date"
                  value={formData.transaction_date}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-white/80 text-gray-900 transition-all duration-300 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <span className="text-gray-400">📅</span>
                </div>
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Amount (₹)
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-white/80 text-gray-900 transition-all duration-300 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                  placeholder="0.00"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <span className="text-gray-400">₹</span>
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Category
              </label>
              <div className="relative">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-white/80 text-gray-900 transition-all duration-300 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                >
                  <option value="electricity">⚡ Electricity</option>
                  <option value="internet">🌐 Internet</option>
                  <option value="groceries">🛒 Groceries</option>
                  <option value="restaurant">🍽️ Restaurant</option>
                  <option value="shopping">🛍️ Shopping</option>
                  <option value="transportation">🚗 Transportation</option>
                  <option value="other">📦 Other</option>
                </select>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <span className="text-gray-400">🏷️</span>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center space-x-2">
                  <span className="text-red-500">❌</span>
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-300 hover:scale-105"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {saving ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReceiptEditModal;
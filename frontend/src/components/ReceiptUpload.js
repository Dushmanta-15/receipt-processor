import React, { useState } from 'react';
import { receiptAPI } from '../services/api';

const ReceiptUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError(null);
    setResult(null);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
      setResult(null);
    }
  };

  const simulateProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
    return interval;
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setUploadProgress(0);
      
      const progressInterval = simulateProgress();
      
      const response = await receiptAPI.uploadReceipt(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setResult(response.data);
        setFile(null);
        setUploadProgress(0);
        
        // Reset file input
        const fileInput = document.getElementById('file-upload');
        if (fileInput) fileInput.value = '';
      }, 500);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
      setUploadProgress(0);
    } finally {
      setTimeout(() => setUploading(false), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            📤 Upload Receipt
          </h1>
          <p className="text-gray-600 text-lg">
            Transform your receipts into digital insights with AI-powered processing
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-3xl blur opacity-50"></div>
            <div className="relative bg-white/80 backdrop-blur-lg border border-white/30 rounded-3xl shadow-2xl overflow-hidden">
              <div className="px-8 py-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-white/20">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📁</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">File Upload</h3>
                    <p className="text-gray-600">Support PDF, PNG, JPG, TXT up to 10MB</p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                {/* File Upload Area */}
                <div
                  className={`relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-500 ${
                    dragActive
                      ? 'border-blue-400 bg-blue-50 scale-105 shadow-xl'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative p-12 text-center">
                    {/* Upload Icon with Animation */}
                    <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-10 h-10 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>

                    <div className="space-y-4">
                      <div className="text-xl font-semibold text-gray-900">
                        Drop your receipt here
                      </div>
                      <div className="text-gray-600">
                        or{' '}
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-200"
                        >
                          browse files
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept=".pdf,.jpg,.jpeg,.png,.txt"
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                      <div className="text-sm text-gray-500">
                        PDF, PNG, JPG, TXT up to 10MB
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selected File Display */}
                {file && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-600">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setFile(null)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-200"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Progress Bar */}
                {uploading && (
                  <div className="mt-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Processing...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                <button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="mt-6 w-full relative overflow-hidden rounded-2xl py-4 px-6 font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:shadow-xl"
                  style={{
                    background: uploading 
                      ? 'linear-gradient(45deg, #9CA3AF, #6B7280)' 
                      : 'linear-gradient(45deg, #3B82F6, #8B5CF6)',
                  }}
                >
                  <span className="relative z-10 flex items-center justify-center space-x-2">
                    {uploading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing Receipt...</span>
                      </>
                    ) : (
                      <>
                        <span>🚀</span>
                        <span>Upload and Process</span>
                      </>
                    )}
                  </span>
                  
                  {/* Button shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
                </button>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Error Display */}
            {error && (
              <div className="relative overflow-hidden rounded-2xl bg-red-50 border border-red-200 p-6">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-600"></div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">❌</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-900 mb-1">Upload Failed</h4>
                    <p className="text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Display */}
            {result && (
              <div className="relative overflow-hidden rounded-2xl bg-green-50 border border-green-200 p-6">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-600"></div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">✅</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900 mb-3">Receipt Processed Successfully!</h4>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="bg-white/60 rounded-xl p-3">
                        <div className="text-sm text-green-700 font-medium">Vendor</div>
                        <div className="text-lg font-semibold text-green-900">{result.vendor}</div>
                      </div>
                      <div className="bg-white/60 rounded-xl p-3">
                        <div className="text-sm text-green-700 font-medium">Amount</div>
                        <div className="text-lg font-semibold text-green-900">₹{result.amount}</div>
                      </div>
                      <div className="bg-white/60 rounded-xl p-3">
                        <div className="text-sm text-green-700 font-medium">Date</div>
                        <div className="text-lg font-semibold text-green-900">{result.transaction_date}</div>
                      </div>
                      <div className="bg-white/60 rounded-xl p-3">
                        <div className="text-sm text-green-700 font-medium">Category</div>
                        <div className="text-lg font-semibold text-green-900 capitalize">{result.category}</div>
                      </div>
                      <div className="bg-white/60 rounded-xl p-3">
                        <div className="text-sm text-green-700 font-medium">Confidence</div>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-green-200 rounded-full h-2">
                            <div 
                              className="h-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-1000"
                              style={{ width: `${result.confidence_score * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-lg font-semibold text-green-900">
                            {(result.confidence_score * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tips Section */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl blur opacity-50"></div>
              <div className="relative bg-white/80 backdrop-blur-lg border border-white/30 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-2xl">💡</span>
                  <h3 className="text-lg font-bold text-gray-900">Processing Tips</h3>
                </div>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Ensure receipt text is clearly visible and not blurred</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Higher resolution images provide better accuracy</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>PDF files are processed with highest precision</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Indian store receipts are automatically categorized</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptUpload;
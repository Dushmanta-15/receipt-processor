export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString) => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(dateString));
};

// Indian number formatting without currency symbol
export const formatIndianNumber = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);
};

// Format currency for input fields (without symbol)
export const formatCurrencyInput = (amount) => {
  if (!amount) return '';
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);
};

// Parse currency input (remove commas)
export const parseCurrencyInput = (value) => {
  if (!value) return 0;
  return parseFloat(value.replace(/,/g, '')) || 0;
};

// Format large amounts in Indian system (Lakhs, Crores)
export const formatIndianCurrency = (amount) => {
  const num = parseFloat(amount);
  
  if (num >= 10000000) { // 1 Crore
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) { // 1 Lakh
    return `₹${(num / 100000).toFixed(2)} L`;
  } else if (num >= 1000) { // 1 Thousand
    return `₹${(num / 1000).toFixed(2)} K`;
  } else {
    return formatCurrency(num);
  }
};

// Format date in Indian format (DD/MM/YYYY)
export const formatIndianDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};
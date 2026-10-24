const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const environment = {
  production: !isLocal,
  apiUrl: isLocal ? 'http://localhost:5001/api' : 'https://rdo-pgrs-backend.onrender.com/api'
};


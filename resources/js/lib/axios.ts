import axios from 'axios';

// Create an Axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Axios automatically handles the XSRF-TOKEN cookie when making requests to the same origin,
// which works perfectly with Laravel Sanctum's built-in CSRF protection.

export default axiosInstance;

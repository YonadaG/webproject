/**
 * API base URL - points to the backend server
 * @type {string}
 */
const API_BASE_URL = 'http://localhost:8000/';

/**
 * Gets the CSRF token by first fetching the CSRF cookie if needed
 * @returns {Promise<string>} - The CSRF token
 */
const getCsrfToken = async () => {
  // First, get the CSRF cookie
  const csrfResponse = await fetch(`${API_BASE_URL}sanctum/csrf-cookie`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
    }
  });

  if (!csrfResponse.ok) {
    throw new Error('Failed to get CSRF token');
  }

  // Get the CSRF token from cookies
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };
  
  const csrfToken = getCookie('XSRF-TOKEN');
  if (!csrfToken) {
    throw new Error('CSRF token not found in cookies');
  }
  
  return decodeURIComponent(csrfToken);
};

/**
 * Sends a login request to the server
 * @param {FormData} formData - Form data containing email and password
 * @returns {Promise<Object>} - Response data with token and user
 */
/**
 * Logs in a user with the provided credentials
 * @param {FormData} formData - Form data containing email and password
 * @returns {Promise<Object>} - Response data with token and user
 */
const login = async (formData) => {
  console.group('🔐 Login Process');
  try {
    console.log('1️⃣ Starting login process...');
    
    // Step 1: Get CSRF Token
    console.log('2️⃣ Getting CSRF token...');
    const csrfToken = await getCsrfToken();
    console.log('✅ CSRF token retrieved:', csrfToken ? '***' : 'No token received');

    // Get form data
    const email = formData.get('email');
    const password = formData.get('password');

    // Create login data object
    const loginData = {
      email: email,
      password: password,
    };
    
    // Log the request details
    console.log('3️⃣ Preparing login request:', {
      url: `${API_BASE_URL}api/admin/login`,
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-XSRF-TOKEN': csrfToken ? '***' : 'none',
      },
      credentials: 'include',
      body: {
        email: email ? `${email.substring(0, 2)}...` : 'empty',
        password: password ? '***' : 'empty',
      }
    });

    // Make the login request
    console.log('4️⃣ Sending login request...');
    const response = await fetch(`${API_BASE_URL}api/admin/login`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-XSRF-TOKEN': csrfToken ? decodeURIComponent(csrfToken) : '',
      },
      credentials: 'include',
      body: JSON.stringify(loginData)
    });

    console.log('5️⃣ Received response, status:', response.status);
    
    // Read the response body only once
    const responseText = await response.text();
    console.log('6️⃣ Raw response text:', responseText);
    
    let data;
    try {
      // Try to parse as JSON
      data = JSON.parse(responseText);
    } catch (jsonError) {
      console.error('❌ Error parsing JSON response:', jsonError);
      console.error('Response text that failed to parse:', responseText);
      throw new Error('Invalid JSON response from server');
    }
    
    console.log('7️⃣ Parsed response data:', data);

    if (!response.ok) {
      console.error('❌ Login failed:', data?.message || 'No error message');
      throw new Error(data?.message || `Login failed with status ${response.status}`);
    }

    // Store the token and user data
    if (!data.token) {
      console.warn('⚠️ No token received in login response');
      throw new Error('No authentication token received from server');
    }
    
    if (!data.user) {
      console.warn('⚠️ No user data received in login response');
      throw new Error('No user data received from server');
    }
    
    console.log('8️⃣ Storing auth data...');
    console.log('Token received:', data.token ? '***' : 'No token');
    
    try {
      // Store in both localStorage (persists across tabs) and sessionStorage (current tab only)
      localStorage.setItem('authToken', data.token);
      sessionStorage.setItem('authToken', data.token);
      console.log('✅ Auth tokens stored in localStorage and sessionStorage');
      
      const userData = JSON.stringify(data.user);
      localStorage.setItem('currentUser', userData);
      console.log('✅ User data stored in localStorage:', data.user);
      
      // Store a flag to indicate we've processed this login
      sessionStorage.setItem('authInitialized', 'true');
      console.log('✅ Auth initialized flag set to true');
      
      // Debug: Verify what's in storage
      console.log('Storage after login:', {
        localStorage: {
          authToken: localStorage.getItem('authToken') ? '***' : 'null',
          currentUser: localStorage.getItem('currentUser') ? 'exists' : 'null'
        },
        sessionStorage: {
          authToken: sessionStorage.getItem('authToken') ? '***' : 'null',
          authInitialized: sessionStorage.getItem('authInitialized')
        }
      });
      
      console.log('✅ Login successful');
      return data;
    } catch (storageError) {
      console.error('❌ Error storing auth data:', storageError);
      // Clear any partial data that might have been stored
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      throw new Error('Failed to store authentication data');
    }
  } catch (error) {
    console.error('❌ Login process failed:', error);
    throw error;
  } finally {
    console.groupEnd();
  }
};

/**
 * Logs out the current user
 * @returns {Promise<Object>} - Response data
 */
const logout = async () => {
  // Store the current token before removing it
  const currentToken = localStorage.getItem('authToken');
  
  // Clear all auth data from storage first
  const clearAuthData = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('authToken');
    console.log('Cleared all authentication data from storage');
  };

  try {
    if (!currentToken) {
      console.log('No auth token found, skipping server logout');
      clearAuthData();
      return { success: true, message: 'Already logged out' };
    }

    // Get a fresh CSRF token before logout
    console.log('Getting fresh CSRF token for logout...');
    const csrfToken = await getCsrfToken();
    console.log('Using CSRF token for logout:', csrfToken ? '***' : 'none');

    const response = await fetch(`${API_BASE_URL}api/admin/logout`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`,
        'X-Requested-With': 'XMLHttpRequest',
        'X-XSRF-TOKEN': csrfToken || ''
      },
      credentials: 'include'
    });

    // Clear local storage regardless of the response
    clearAuthData();

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || `Logout failed with status ${response.status}`);
    }

    return await response.json().catch(() => ({
      success: true,
      message: 'Logged out successfully (no response body)'
    }));
  } catch (error) {
    // Still clear auth data even if the request fails
    clearAuthData();
    console.error('Logout error:', error);
    throw error;
  }
};

/**
 * Checks if the user is authenticated
 * @returns {boolean} - True if authenticated, false otherwise
 */
const isAuthenticated = () => {
  try {
    // First check sessionStorage for the token
    let token = sessionStorage.getItem('authToken');
    
    // If not in sessionStorage, check localStorage
    if (!token) {
      token = localStorage.getItem('authToken');
      // If found in localStorage, copy to sessionStorage
      if (token) {
        sessionStorage.setItem('authToken', token);
      }
    }
    
    const userData = localStorage.getItem('currentUser');
    
    // Check if token exists and has minimum length
    if (!token || token.length < 10) {
      console.log('No valid token found');
      return false;
    }
    
    // Check if user data exists and is valid JSON
    if (!userData) {
      console.log('No user data found');
      return false;
    }
    
    try {
      const user = JSON.parse(userData);
      if (!user || typeof user !== 'object') {
        console.log('Invalid user data format');
        return false;
      }
    } catch (e) {
      console.log('Error parsing user data:', e);
      return false;
    }
    
    // If we get here, everything checks out
    console.log('User is authenticated');
    return true;
    
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

/**
 * Gets the authentication token
 * @returns {string|null} - The auth token or null if not authenticated
 */
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Gets the current authenticated user
 * @returns {Object|null} - The current user or null if not authenticated
 */
const getCurrentUser = () => {
  try {
    if (!isAuthenticated()) {
      return null;
    }
    
    const userData = localStorage.getItem('currentUser');
    if (!userData) {
      console.log('No user data found in localStorage');
      return null;
    }
    
    const user = JSON.parse(userData);
    
    // Basic validation of user object
    if (!user || typeof user !== 'object' || !user.id) {
      console.warn('Invalid user data in localStorage');
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Generic API request function
async function apiRequest(endpoint, options = {}) {
  const { method = 'GET', data, headers = {}, ...rest } = options;
  
  try {
    // Get CSRF token for non-GET requests
    const token = method !== 'GET' ? await getCsrfToken() : null;
    
    if (method !== 'GET' && !token) {
      throw new Error('CSRF token is required but not available');
    }
    
    const requestOptions = {
      method,
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(token && { 'X-XSRF-TOKEN': token }),
        ...(localStorage.getItem('authToken') && { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }),
        ...headers
      },
      ...rest,
    };
    
    if (method !== 'GET' && data) {
      requestOptions.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${API_BASE_URL}api${endpoint}`, requestOptions);
    
    // Handle 204 No Content responses
    if (response.status === 204) {
      return null;
    }
    
    const responseData = await response.json();
    
    if (!response.ok) {
      const error = new Error(responseData.message || 'Something went wrong');
      error.status = response.status;
      error.data = responseData;
      throw error;
    }
    
    return responseData;
  } catch (error) {
    console.error('API request failed:', error);
    
    // If it's a 401 Unauthorized, clear the token and redirect to login
    if (error.status === 401) {
      localStorage.removeItem('authToken');
      if (window.location.pathname !== '/admin-login.html') {
        window.location.href = '/admin-login.html';
      }
    }
    
    throw error;
  }
}

// Specific API methods
const api = {
  get: (endpoint, options) => apiRequest(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, data, options) => apiRequest(endpoint, { ...options, method: 'POST', data }),
  /**
   * Makes a PUT request to the API
   * @param {string} endpoint - The API endpoint
   * @param {Object} data - Request data
   * @param {Object} options - Request options
   * @returns {Promise<Object>} - Response data
   */
  put: (endpoint, data, options) => apiRequest(endpoint, { ...options, method: 'PUT', data }),
  /**
   * Makes a DELETE request to the API
   * @param {string} endpoint - The API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<Object>} - Response data
   */
  delete: (endpoint, options) => apiRequest(endpoint, { ...options, method: 'DELETE' }),
};

/**
 * Shows a temporary alert message to the user
 * @param {string} message - The message to display
 * @param {string} type - The type of alert (success, error, warning, info)
 * @param {number} [duration=5000] - How long to show the alert in milliseconds
 */
function showAlert(message, type = 'info', duration = 5000) {
    // Create alert container if it doesn't exist
    let alertContainer = document.getElementById('alert-container');
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'alert-container';
        alertContainer.className = 'fixed top-4 right-4 z-50 space-y-2 w-80';
        document.body.appendChild(alertContainer);
    }

    // Create alert element
    const alert = document.createElement('div');
    const typeClasses = {
        success: 'bg-green-50 border-green-400 text-green-800',
        error: 'bg-red-50 border-red-400 text-red-800',
        warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
        info: 'bg-blue-50 border-blue-400 text-blue-800'
    };

    alert.className = `rounded-md p-4 border ${typeClasses[type] || typeClasses.info} shadow-lg transform transition-all duration-300 translate-x-0`;
    alert.role = 'alert';
    
    alert.innerHTML = `
        <div class="flex">
            <div class="flex-shrink-0">
                ${type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ℹ'}
            </div>
            <div class="ml-3">
                <p class="text-sm font-medium">${message}</p>
            </div>
            <div class="ml-auto pl-3">
                <div class="-mx-1.5 -my-1.5">
                    <button type="button" class="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${type === 'success' ? 'bg-green-50 text-green-500 hover:bg-green-100 focus:ring-offset-green-50 focus:ring-green-600' : ''}${type === 'error' ? 'bg-red-50 text-red-500 hover:bg-red-100 focus:ring-offset-red-50 focus:ring-red-600' : ''}${type === 'warning' ? 'bg-yellow-50 text-yellow-500 hover:bg-yellow-100 focus:ring-offset-yellow-50 focus:ring-yellow-600' : 'bg-blue-50 text-blue-500 hover:bg-blue-100 focus:ring-offset-blue-50 focus:ring-blue-600'}">
                        <span class="sr-only">Dismiss</span>
                        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;

    // Add to container
    alertContainer.appendChild(alert);

    // Auto-remove after duration
    const timer = setTimeout(() => {
        alert.style.transform = 'translateX(100%)';
        setTimeout(() => alert.remove(), 300);
    }, duration);

    // Add click handler to dismiss
    const dismissBtn = alert.querySelector('button');
    dismissBtn.addEventListener('click', () => {
        clearTimeout(timer);
        alert.style.transform = 'translateX(100%)';
        setTimeout(() => alert.remove(), 300);
    });
}

// Export the API functions
export {
  API_BASE_URL,
  getCsrfToken,
  login,
  logout,
  isAuthenticated,
  getAuthToken,
  getCurrentUser,
  apiRequest,
  api,
  showAlert
};

export default {
  API_BASE_URL,
  getCsrfToken,
  login,
  logout,
  isAuthenticated,
  getAuthToken,
  getCurrentUser,
  apiRequest,
  api,
  showAlert
};

import axios from 'axios';

// Port fallback list - will try these in sequence if the main one fails
const API_PORTS = [3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009];

// Function to check if a port is available
const checkServerPort = async (port) => {
  try {
    const response = await axios.get(`http://localhost:${port}/api/status`, { timeout: 1000 });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

// Create an Axios instance with default config
const apiClient = axios.create({
  baseURL: 'http://localhost:3002/api',  // Default port
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // Extended to 15 seconds
});

// Try to find an active server port
const findActiveServerPort = async () => {
  for (const port of API_PORTS) {
    const isAvailable = await checkServerPort(port);
    if (isAvailable) {
      console.log(`Found active server on port ${port}`);
      apiClient.defaults.baseURL = `http://localhost:${port}/api`;
      return true;
    }
  }
  console.error('Could not connect to server on any port');
  return false;
};

// Initial port discovery
findActiveServerPort()
  .then(found => {
    if (!found) {
      console.warn('No active server port found. Using default port.');
    }
  })
  .catch(err => {
    console.error('Error during port discovery:', err);
  });

// Add a request interceptor to attach auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // If connection error (ECONNREFUSED), try to find another port
    if (!error.response && error.code === 'ECONNREFUSED') {
      const found = await findActiveServerPort();
      if (found) {
        // Retry the request with the new baseURL
        const config = error.config;
        // Make sure we don't enter an infinite loop
        config._retry = true;
        return apiClient(config);
      }
    }
    
    console.error('API Error:', error.response?.data || error.message);
    
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      // Redirect to login page if not already there
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        window.location.href = '/login';
      }
    }
    
    // Log detailed error information for debugging
    if (error.response) {
      console.error('API Error Details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      console.error('API Request Error (No Response):', error.request);
    } else {
      console.error('API Setup Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 
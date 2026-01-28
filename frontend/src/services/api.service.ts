import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const apiService = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const initializeApiKey = async () => {
  let apiKey = localStorage.getItem('bolt_api_key');

  if (!apiKey) {
    try {
      console.log('🔑 Generating new API key...');
      const response = await axios.post(`${API_BASE_URL}/generate-key`);
      apiKey = response.data.apiKey;
      localStorage.setItem('bolt_api_key', apiKey);
      console.log('✅ API key generated and saved:', apiKey);
    } catch (error: any) {
      console.error(
        '❌ Failed to generate API key:',
        error?.response?.data?.error || error.message,
      );
      // Return null if key generation fails - let the middleware handle it
      return null;
    }
  } else {
    console.log('✅ API key found in localStorage:', apiKey);
  }

  return apiKey;
};

let apiKeyPromise = initializeApiKey();

apiService.interceptors.request.use(
  async (config) => {
    try {
      const apiKey = await apiKeyPromise;
      // If we have an API key, always use it (even if old/invalid)
      if (apiKey) {
        config.headers['x-api-key'] = apiKey;
      }
    } catch (error) {
      console.error('Error initializing API key:', error);
    }

    // Try JWT token first (for authenticated users)
    const authToken = localStorage.getItem('auth_token');
    if (authToken) {
      config.headers['Authorization'] = `Bearer ${authToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - invalid or expired API key
    if (error.response?.status === 401 || error.response?.status === 403) {
      const errorMsg = error.response?.data?.error || 'Authentication failed';

      // If it's an API key issue, try to generate a new one
      if (errorMsg.includes('API Key') || errorMsg.includes('Invalid')) {
        console.log('🔄 Regenerating API key due to:', errorMsg);
        localStorage.removeItem('bolt_api_key');
        apiKeyPromise = initializeApiKey();
      }

      // Also clear auth tokens
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');

      if (typeof window !== 'undefined') {
        console.error('❌ ' + errorMsg);
      }
    } else if (error.code === 'ERR_NETWORK') {
      console.error(
        '❌ Network error - backend may not be running on localhost:5000',
      );
    }

    return Promise.reject(error);
  },
);

export default apiService;

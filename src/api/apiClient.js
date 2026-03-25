import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5209/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the Auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    // Return data as per ServiceResult structure
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        // Call refresh token endpoint directly via axios to avoid apiClient interceptors loop
        // Match backend RefreshTokenRequestDto: { refreshToken: string }
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5209/api'}/Auth/refresh-token`, 
          { refreshToken }
        );
        
        const { success, data } = response.data;
        
        if (success && data.token) {
          // Save new tokens
          localStorage.setItem('token', data.token);
          if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken);
          }
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${data.token}`;
          return apiClient(originalRequest);
        } else {
          throw new Error('Refresh failed');
        }
        
      } catch (refreshError) {
        // Refresh token failed or expired -> forces logout
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Redirect to login page immediately
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    const message = error.response?.data?.message || 'Something went wrong';
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

export default apiClient;

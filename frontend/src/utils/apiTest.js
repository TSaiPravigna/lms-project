import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const testApiConnection = async () => {
    try {
        console.log('Testing API connection to:', API_URL);
        
        // First try a simple GET request to the root
        const response = await axios.get(API_URL);
        console.log('API root response:', response);
        
        return {
            success: true,
            message: 'API connection successful',
            data: response.data
        };
    } catch (error) {
        console.error('API connection test failed:', error);
        
        let errorMessage = 'Unknown error';
        
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            errorMessage = `Server responded with status ${error.response.status}: ${error.response.data?.message || 'Unknown error'}`;
        } else if (error.request) {
            // The request was made but no response was received
            errorMessage = 'No response from server. The backend might not be running.';
        } else {
            // Something happened in setting up the request that triggered an Error
            errorMessage = error.message;
        }
        
        return {
            success: false,
            message: errorMessage,
            error: error
        };
    }
};

export const checkBackendStatus = async () => {
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            return {
                success: false,
                message: 'No authentication token found. Please login first.'
            };
        }
        
        const config = {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };
        
        // Try to access a simple endpoint
        const response = await axios.get(`${API_URL}/api/auth/me`, config);
        
        return {
            success: true,
            message: 'Backend is running and accessible',
            data: response.data
        };
    } catch (error) {
        console.error('Backend status check failed:', error);
        
        let errorMessage = 'Unknown error';
        
        if (error.response) {
            errorMessage = `Server responded with status ${error.response.status}: ${error.response.data?.message || 'Unknown error'}`;
        } else if (error.request) {
            errorMessage = 'No response from server. The backend might not be running.';
        } else {
            errorMessage = error.message;
        }
        
        return {
            success: false,
            message: errorMessage,
            error: error
        };
    }
}; 
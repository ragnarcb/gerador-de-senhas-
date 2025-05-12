import axios from 'axios';
import { getAuthToken } from '../../utils/authUtils';

// API base URL
const API_URL = 'http://10.0.2.2:5000'; // Use 10.0.2.2 for Android emulator to connect to localhost

// Create instance with base URL
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Generate a password using the API
export const generatePassword = async (options = {}) => {
  try {
    const response = await api.post('/api/generate', {
      length: options.length || 12,
      include_uppercase: options.includeUppercase ?? true,
      include_lowercase: options.includeLowercase ?? true,
      include_numbers: options.includeNumbers ?? true,
      include_symbols: options.includeSymbols ?? true
    });
    return response.data.password;
  } catch (error) {
    console.error('Error generating password:', error);
    throw error;
  }
};

// Get saved passwords from the API
export const getSavedPasswords = async () => {
  try {
    const response = await api.get('/api/passwords');
    return response.data.passwords;
  } catch (error) {
    console.error('Error getting saved passwords:', error);
    throw error;
  }
};

// Save a password to the API
export const savePassword = async (name, password) => {
  try {
    const response = await api.post('/api/passwords', {
      name,
      password
    });
    return response.data;
  } catch (error) {
    console.error('Error saving password:', error);
    throw error;
  }
};

// Delete a password
export const deletePassword = async (passwordId) => {
  try {
    const response = await api.delete(`/api/passwords/${passwordId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting password:', error);
    throw error;
  }
}; 
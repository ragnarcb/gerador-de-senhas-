import axios from 'axios';
import { getAuthToken } from '../../utils/authUtils';
import { Platform } from 'react-native';

// API base URL dinâmico baseado na plataforma
// 10.0.2.2 para Android emulator, 127.0.0.1 para web, e o IP real para iOS/outros
const getApiUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://127.0.0.1:5000'; // Web
  } else if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000'; // Android emulator
  } else {
    return 'http://127.0.0.1:5000'; // iOS e outros
  }
};

const API_URL = getApiUrl();
console.log(`Usando API URL: ${API_URL} em plataforma: ${Platform.OS}`);

// Create instance with base URL
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 segundos
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
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para respostas
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} para ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      // Resposta do servidor com código de erro
      console.error(`API Error ${error.response.status}: ${error.response.data.message || 'Erro desconhecido'}`);
    } else if (error.request) {
      // Sem resposta do servidor
      console.error('API Error: Sem resposta do servidor', error.request);
    } else {
      // Algo deu errado na configuração da requisição
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Generate a password using the API (apenas fallback)
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
    console.log('Saving password to API...', { name, passwordLength: password.length });
    const response = await api.post('/api/passwords', {
      name,
      password
    });
    console.log('Password saved successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error saving password:', error);
    
    // Se o erro for de timeout ou conexão, tente uma alternativa
    if (error.code === 'ECONNABORTED' || !error.response) {
      console.log('Erro de conexão, tentando salvar em storage local...');
      // Aqui você pode adicionar um fallback para salvar localmente
      throw new Error('Servidor indisponível. Verifique se o backend está rodando.');
    }
    
    // Se for um erro de validação do nome único
    if (error.response && error.response.status === 400 && 
        error.response.data.message && 
        error.response.data.message.includes('nome')) {
      throw new Error(error.response.data.message);
    }
    
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
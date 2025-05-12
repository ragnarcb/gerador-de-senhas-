import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

class ApiService {
  constructor() {
    // Para web em desenvolvimento, usar localhost
    // Em um ambiente de produção real, isto seria uma URL de API
    const baseURL = 'http://localhost:5000';
                    
    console.log(`Inicializando ApiService com baseURL: ${baseURL}`);
    
    this.api = axios.create({
      baseURL: baseURL,
      timeout: 5000, // Reduzir o timeout para falhar mais rápido
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para requisições - adiciona token de autenticação
    this.api.interceptors.request.use(
      async (config) => {
        console.log(`Requisição para: ${config.method?.toUpperCase()} ${config.url}`);
        console.log('Dados enviados:', config.data);
        
        // Adiciona token de autenticação se disponível
        const token = await AsyncStorage.getItem('@auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('Token de autenticação adicionado');
        } else {
          console.log('Sem token de autenticação');
        }
        
        return config;
      },
      (error) => {
        console.error('Erro ao fazer requisição:', error);
        return Promise.reject(error);
      }
    );

    // Interceptor para respostas
    this.api.interceptors.response.use(
      (response) => {
        console.log(`Resposta recebida de: ${response.config.url}`);
        console.log('Status:', response.status);
        console.log('Dados recebidos:', response.data);
        return response;
      },
      (error) => {
        // Tratamento global de erros
        if (error.response) {
          // Erro do servidor
          console.error('Erro na API:', error.response.status, error.response.data);
          console.error('URL que falhou:', error.config.url);
          console.error('Método:', error.config.method);
          console.error('Dados enviados:', error.config.data);
          
          // Se for erro 401 (não autorizado), limpar token e redirecionar para login
          if (error.response.status === 401) {
            console.log('Erro 401: Removendo token de autenticação');
            AsyncStorage.removeItem('@auth_token');
            // O redirecionamento precisará ser tratado no componente
          }
        } else if (error.request) {
          // Erro na requisição
          console.error('Erro na requisição - sem resposta do servidor');
          console.error('Detalhes:', error.request);
          console.error('URL que falhou:', error.config.url);
          console.error('Método:', error.config.method);
        } else {
          // Erro na configuração
          console.error('Erro na configuração:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  // Método auxiliar para permitir testes de conexão
  async testConnection() {
    try {
      const response = await this.api.get('/');
      console.log('Teste de conexão bem-sucedido:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Teste de conexão falhou:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Métodos HTTP básicos
  async get(url, params = {}) {
    try {
      const response = await this.api.get(url, { params });
      return response;
    } catch (error) {
      console.error(`GET ${url} falhou:`, error.message);
      throw error;
    }
  }

  async post(url, data = {}) {
    try {
      console.log(`Enviando POST para ${url}`, data);
      const response = await this.api.post(url, data);
      return response;
    } catch (error) {
      console.error(`POST ${url} falhou:`, error.message);
      throw error;
    }
  }

  async put(url, data = {}) {
    try {
      const response = await this.api.put(url, data);
      return response;
    } catch (error) {
      console.error(`PUT ${url} falhou:`, error.message);
      throw error;
    }
  }

  async delete(url) {
    try {
      const response = await this.api.delete(url);
      return response;
    } catch (error) {
      console.error(`DELETE ${url} falhou:`, error.message);
      throw error;
    }
  }
}

// Exporta uma instância única (Singleton)
const apiService = new ApiService();
export default apiService;

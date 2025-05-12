import AsyncStorage from '@react-native-async-storage/async-storage';

// Chaves de armazenamento
const TOKEN_KEY = '@auth_token';
const USER_ID_KEY = '@user_id';
const USER_DATA_KEY = '@user_data';

/**
 * Salva o token de autenticação no AsyncStorage
 * @param {string} token Token JWT
 */
export const setAuthToken = async (token) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.error('Erro ao salvar token de autenticação:', error);
    return false;
  }
};

/**
 * Obtém o token de autenticação do AsyncStorage
 * @returns {Promise<string|null>} Token de autenticação ou null
 */
export const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Erro ao obter token de autenticação:', error);
    return null;
  }
};

/**
 * Salva o ID do usuário no AsyncStorage
 * @param {string} userId ID do usuário
 */
export const setUserId = async (userId) => {
  try {
    await AsyncStorage.setItem(USER_ID_KEY, userId.toString());
    return true;
  } catch (error) {
    console.error('Erro ao salvar ID do usuário:', error);
    return false;
  }
};

/**
 * Obtém o ID do usuário do AsyncStorage
 * @returns {Promise<string|null>} ID do usuário ou null
 */
export const getUserId = async () => {
  try {
    return await AsyncStorage.getItem(USER_ID_KEY);
  } catch (error) {
    console.error('Erro ao obter ID do usuário:', error);
    return null;
  }
};

/**
 * Salva os dados do usuário no AsyncStorage
 * @param {Object} userData Dados do usuário
 */
export const setUserData = async (userData) => {
  try {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    return true;
  } catch (error) {
    console.error('Erro ao salvar dados do usuário:', error);
    return false;
  }
};

/**
 * Obtém os dados do usuário do AsyncStorage
 * @returns {Promise<Object|null>} Dados do usuário ou null
 */
export const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Erro ao obter dados do usuário:', error);
    return null;
  }
};

/**
 * Verifica se o usuário está autenticado
 * @returns {Promise<boolean>} True se autenticado, false caso contrário
 */
export const isAuthenticated = async () => {
  try {
    const token = await getAuthToken();
    return !!token;
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    return false;
  }
};

/**
 * Salva os dados de autenticação completos
 * @param {Object} authData Dados de autenticação (token, userId, userData)
 */
export const setAuthData = async (authData) => {
  try {
    const { token, userId, userData } = authData;
    
    // Utilizamos Promise.all para executar todas as operações em paralelo
    await Promise.all([
      token && setAuthToken(token),
      userId && setUserId(userId),
      userData && setUserData(userData)
    ]);
    
    return true;
  } catch (error) {
    console.error('Erro ao salvar dados de autenticação:', error);
    return false;
  }
};

/**
 * Realiza o logout do usuário, removendo todos os dados de autenticação
 */
export const clearAuthData = async () => {
  try {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_ID_KEY, USER_DATA_KEY]);
    return true;
  } catch (error) {
    console.error('Erro ao limpar dados de autenticação:', error);
    return false;
  }
};

/**
 * Formata um erro de autenticação para exibição
 * @param {Error} error Objeto de erro
 * @returns {string} Mensagem de erro formatada
 */
export const formatAuthError = (error) => {
  if (error.response) {
    // Erro com resposta do servidor
    if (error.response.status === 401) {
      return 'Credenciais inválidas. Por favor, verifique seu nome de usuário e senha.';
    } else if (error.response.status === 403) {
      return 'Você não tem permissão para acessar este recurso.';
    } else if (error.response.status === 404) {
      return 'Recurso não encontrado. Por favor, tente novamente mais tarde.';
    } else if (error.response.data && error.response.data.message) {
      return error.response.data.message;
    }
  }
  
  if (error.request) {
    // Erro sem resposta do servidor
    return 'Não foi possível conectar ao servidor. Verifique sua conexão de internet.';
  }
  
  // Erro genérico
  return error.message || 'Ocorreu um erro. Por favor, tente novamente mais tarde.';
}; 
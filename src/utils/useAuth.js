import { useState, useEffect, useCallback } from 'react';
import * as authUtils from './authUtils';

/**
 * Hook personalizado para gerenciar o estado de autenticação do usuário
 * 
 * @returns {Object} Objeto com funções e estados relacionados à autenticação
 */
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Inicialização - verificar se o usuário já está autenticado
  useEffect(() => {
    const checkAuthStatus = async () => {
      setLoading(true);
      try {
        const isAuth = await authUtils.isAuthenticated();
        setIsLoggedIn(isAuth);

        if (isAuth) {
          const userData = await authUtils.getUserData();
          setUser(userData);
        }
      } catch (error) {
        console.error('Erro ao verificar status de autenticação:', error);
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  /**
   * Função para realizar login
   * @param {Object} data Dados da resposta do login (token, user_id, etc)
   */
  const login = useCallback(async (data) => {
    setLoading(true);
    try {
      const { access_token, user_id, username, email } = data;
      
      // Salvar dados de autenticação
      await authUtils.setAuthData({
        token: access_token,
        userId: user_id,
        userData: { id: user_id, username, email }
      });
      
      // Atualizar estado
      setUser({ id: user_id, username, email });
      setIsLoggedIn(true);
      return true;
    } catch (error) {
      console.error('Erro ao realizar login:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Função para realizar logout
   */
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authUtils.clearAuthData();
      setUser(null);
      setIsLoggedIn(false);
      return true;
    } catch (error) {
      console.error('Erro ao realizar logout:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Função para atualizar dados do usuário
   * @param {Object} userData Novos dados do usuário
   */
  const updateUserData = useCallback(async (userData) => {
    try {
      await authUtils.setUserData(userData);
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
      return false;
    }
  }, []);

  return {
    user,          // Dados do usuário autenticado
    loading,       // Estado de carregamento
    isLoggedIn,    // Se o usuário está autenticado
    login,         // Função para fazer login
    logout,        // Função para fazer logout
    updateUserData // Função para atualizar dados do usuário
  };
};

export default useAuth; 
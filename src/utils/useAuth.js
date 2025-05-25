import { useState, useEffect, useCallback } from 'react';
import * as authUtils from './authUtils';
import { Platform } from 'react-native';

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
        console.log('useAuth: Verificando status de autenticação inicial');
        const isAuth = await authUtils.isAuthenticated();
        console.log(`useAuth: Usuário está autenticado? ${isAuth}`);
        setIsLoggedIn(isAuth);

        if (isAuth) {
          const userData = await authUtils.getUserData();
          console.log('useAuth: Dados do usuário carregados:', userData);
          
          if (!userData) {
            console.log('useAuth: Dados do usuário não encontrados, tentando recuperar do userId');
            // Tentar obter pelo menos o ID do usuário
            const userId = await authUtils.getUserId();
            if (userId) {
              console.log(`useAuth: ID do usuário encontrado: ${userId}`);
              setUser({ id: userId, username: 'usuário' });
            } else {
              console.log('useAuth: Nenhum dado de usuário encontrado');
              setUser(null);
            }
          } else {
            setUser(userData);
          }
        } else {
          console.log('useAuth: Usuário não está autenticado');
          setUser(null);
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
      console.log('useAuth: Salvando dados de autenticação...', { 
        hasToken: !!access_token, 
        hasUserId: !!user_id, 
        username: username || 'não fornecido', 
        email: email || 'não fornecido' 
      });
      
      // Garantir que temos um username, mesmo que seja um valor padrão
      const userData = { 
        id: user_id, 
        username: username || `usuário_${user_id}`, 
        email: email || '' 
      };
      
      // Salvar dados de autenticação
      await authUtils.setAuthData({
        token: access_token,
        userId: user_id,
        userData: userData
      });
      
      // Atualizar estado
      setUser(userData);
      setIsLoggedIn(true);
      console.log('useAuth: Login concluído com sucesso, dados de usuário:', userData);
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
    console.log('useAuth: Iniciando logout...');
    setLoading(true);
    
    try {
      // Limpar estado local imediatamente
      setUser(null);
      setIsLoggedIn(false);
      
      // Limpar AsyncStorage
      console.log('useAuth: Limpando AsyncStorage...');
      await authUtils.clearAuthData();
      
      // Não usar AsyncStorage.clear() diretamente no iOS
      if (Platform.OS !== 'ios') {
        console.log('useAuth: Verificação final do AsyncStorage');
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        try {
          await AsyncStorage.clear();
        } catch (clearError) {
          console.log('Erro ao limpar AsyncStorage, mas continuando:', clearError);
        }
      }
      
      console.log('useAuth: Logout completo, todos os dados limpos');
      return true;
    } catch (error) {
      console.error('Erro no processo de logout:', error);
      // Mesmo com erro, consideramos que o logout foi realizado
      // pois já limpamos o estado local
      return true;
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

  // Adicionar verificação periódica de autenticação
  useEffect(() => {
    if (isLoggedIn) {
      const interval = setInterval(async () => {
        try {
          const isAuth = await authUtils.isAuthenticated();
          if (!isAuth) {
            console.log('useAuth: Sessão encerrada, realizando logout');
            await logout();
          }
        } catch (error) {
          console.error('Erro ao verificar status de autenticação periódica:', error);
        }
      }, 60000); // Verificar a cada 1 minuto
      
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, logout]);

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
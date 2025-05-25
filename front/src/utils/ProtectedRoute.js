import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { isAuthenticated, getAuthToken } from './authUtils';
import { CommonActions } from '@react-navigation/native';

/**
 * Componente de proteção de rota
 * Verifica se o usuário está autenticado antes de renderizar o componente filho
 * Se não estiver autenticado, redireciona para a tela de login
 * 
 * @param {Object} props Propriedades do componente
 * @param {React.Component} props.component Componente a ser renderizado se autenticado
 * @param {Object} props.navigation Objeto de navegação
 * @param {Object} props.route Objeto de rota
 * @returns {React.Component} Componente renderizado
 */
const ProtectedRoute = ({ component: Component, navigation, ...rest }) => {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    // Verificar autenticação ao montar o componente
    checkAuth();

    // Adicionar listener para quando a tela entrar em foco
    const unsubscribe = navigation.addListener('focus', () => {
      // Verificar autenticação novamente quando a tela entrar em foco
      checkAuth();
    });

    // Remover listener ao desmontar o componente
    return unsubscribe;
  }, [navigation]);

  const checkAuth = async () => {
    setLoading(true);
    try {
      console.log('ProtectedRoute: Verificando autenticação...');
      const token = await getAuthToken();
      console.log(`ProtectedRoute: Token presente? ${!!token}`);
      
      const auth = await isAuthenticated();
      console.log(`ProtectedRoute: Autenticado? ${auth}`);
      
      if (!auth) {
        console.log('ProtectedRoute: Não autenticado, redirecionando para Login');
        // Atualizar estado antes de redirecionar
        setIsAuth(false);
        setLoading(false);
        
        // Usar CommonActions para garantir que a navegação reset corretamente o histórico
        // e evitar loops de navegação
        setTimeout(() => {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            })
          );
        }, 0);
        return;
      }
      
      // Se chegou aqui, está autenticado
      setIsAuth(auth);
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      setIsAuth(false);
      
      console.log('ProtectedRoute: Erro na autenticação, redirecionando para Login');
      setTimeout(() => {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          })
        );
      }, 0);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4A86E8" />
        <Text style={styles.text}>Verificando autenticação...</Text>
      </View>
    );
  }

  // Só renderiza o componente se estiver autenticado
  return isAuth ? <Component navigation={navigation} {...rest} /> : null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
});

export default ProtectedRoute; 
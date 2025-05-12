import React, { createContext, useContext } from 'react';
import useAuth from './useAuth';

// Criação do contexto de autenticação
const AuthContext = createContext(null);

/**
 * Provider do contexto de autenticação
 * @param {Object} props Propriedades do componente
 * @returns {React.Component} Provider do contexto
 */
export const AuthProvider = ({ children }) => {
  // Uso do hook personalizado para obter o estado e funções de autenticação
  const auth = useAuth();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook para acessar o contexto de autenticação
 * @returns {Object} Objeto com estado e funções de autenticação
 */
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuthContext deve ser usado dentro de um AuthProvider');
  }
  
  return context;
}; 
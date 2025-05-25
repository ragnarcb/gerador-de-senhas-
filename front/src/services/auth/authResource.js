import api from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Função para registro de usuário
export const register = (data) => {
    return api.post('/auth/register', data);
};

// Função para login
export const login = async (data) => {
    try {
        console.log('Tentando login com:', data);
        const response = await api.post('/auth/login', data);
        console.log('Resposta de login:', response.data);
        
        // Se houver um token ou identificador na resposta, salve-o
        if (response.data && response.data.access_token) {
            await AsyncStorage.setItem('@auth_token', response.data.access_token);
            await AsyncStorage.setItem('@user_id', response.data.user_id.toString());
            console.log('Token e ID do usuário salvos com sucesso');
            return response;
        } else {
            console.error('Resposta de login não contém token de acesso:', response.data);
            throw new Error('Resposta de autenticação inválida');
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        throw error;
    }
};

// Aliases para manter compatibilidade com código legado
export const signin = login;

// Função para logout
export const logout = async () => {
    try {
        // Limpa os dados de autenticação no storage local
        await AsyncStorage.removeItem('@auth_token');
        await AsyncStorage.removeItem('@user_id');
        console.log('Dados de autenticação removidos localmente');
        
        // Não precisamos mais chamar o endpoint de logout no backend
        // já que agora usamos JWTs. O logout é apenas local.
        return { success: true, message: 'Logout realizado com sucesso' };
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
        throw error;
    }
};

// Função para verificar se o usuário está autenticado
export const isAuthenticated = async () => {
    try {
        const token = await AsyncStorage.getItem('@auth_token');
        console.log('Verificando autenticação, token existe:', !!token);
        return !!token;
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        return false;
    }
};

// Função para obter o ID do usuário atual
export const getCurrentUserId = async () => {
    try {
        const userId = await AsyncStorage.getItem('@user_id');
        console.log('ID do usuário atual:', userId);
        return userId;
    } catch (error) {
        console.error('Erro ao obter ID do usuário:', error);
        return null;
    }
};


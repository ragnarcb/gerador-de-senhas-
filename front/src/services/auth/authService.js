import * as authResource from './authResource';

/**
 * Serviço para registro de usuário
 * @param {Object} data Dados de registro (username, email, password)
 * @returns {Promise} Promessa com o resultado da operação
 */
export const register = async (data) => {
    console.log('authService.register - Iniciando registro');
    
    if (data.password !== data.confirmPassword) {
        console.error('Erro: Senhas não coincidem');
        throw new Error('As senhas não coincidem');
    }
    
    try {
        console.log('Enviando dados para API de registro');
        const response = await authResource.register({
            username: data.username,
            email: data.email,
            password: data.password
        });
        console.log('Registro concluído com sucesso');
        return response.data;
    } catch (error) {
        console.error('authService.register - Erro no registro:', error);
        throw error;
    }
};

/**
 * Serviço para autenticação de usuário
 * @param {Object} data Dados de login (username, password)
 * @returns {Promise} Promessa com o resultado da operação
 */
export const login = async (data) => {
    console.log('authService.login - Iniciando login');
    try {
        if (!data.username || !data.password) {
            console.error('Erro: Credenciais incompletas');
            throw new Error('Nome de usuário e senha são obrigatórios');
        }
        
        console.log('Enviando credenciais para API');
        const response = await authResource.login(data);
        console.log('Login concluído com sucesso');
        return response.data;
    } catch (error) {
        console.error('authService.login - Erro no login:', error);
        throw error;
    }
};

/**
 * Alias para login (compatibilidade)
 */
export const signin = login;

/**
 * Serviço para logout do usuário
 * @returns {Promise} Promessa com o resultado da operação
 */
export const logout = async () => {
    console.log('authService.logout - Iniciando logout');
    try {
    const response = await authResource.logout();
        console.log('Logout concluído com sucesso');
        return response;
    } catch (error) {
        console.error('authService.logout - Erro no logout:', error);
        // Mesmo que o logout na API falhe, limpe os dados locais
        return { success: true };
    }
};

/**
 * Verifica se o usuário está autenticado
 * @returns {Promise<boolean>} Promessa com o status de autenticação
 */
export const isAuthenticated = async () => {
    console.log('authService.isAuthenticated - Verificando autenticação');
    return authResource.isAuthenticated();
};

/**
 * Obtém o ID do usuário atual
 * @returns {Promise<string>} Promessa com o ID do usuário ou null
 */
export const getCurrentUserId = async () => {
    console.log('authService.getCurrentUserId - Obtendo ID do usuário');
    return authResource.getCurrentUserId();
};


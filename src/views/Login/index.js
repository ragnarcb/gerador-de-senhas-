import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5 } from '@expo/vector-icons';
import apiService from '../../services/api';
import * as authService from '../../services/auth/authService';
import { useAuthContext } from '../../utils/AuthContext';
import { formatAuthError } from '../../utils/authUtils';
import styles from './styles';

const Login = ({ navigation }) => {
  const { login, isLoggedIn, loading: authLoading } = useAuthContext();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // Verificar se o usuário já está autenticado
    if (isLoggedIn && !authLoading) {
      navigation.replace('Home');
    }
    
    // Testar a conexão automaticamente
    testConnection();
  }, [isLoggedIn, authLoading, navigation]);

  const testConnection = async () => {
    setConnectionStatus('testing');
    try {
      const result = await apiService.testConnection();
      if (result.success) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('failed');
      }
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      setConnectionStatus('failed');
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const { username, email, password, confirmPassword } = formData;

    if (isLogin) {
      if (!username || !password) {
        Alert.alert('Erro', 'Por favor, preencha todos os campos');
        return false;
      }
    } else {
      if (!username || !email || !password || !confirmPassword) {
        Alert.alert('Erro', 'Por favor, preencha todos os campos');
        return false;
      }
      
      if (password !== confirmPassword) {
        Alert.alert('Erro', 'As senhas não coincidem');
        return false;
      }

      // Validação básica de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Alert.alert('Erro', 'Por favor, insira um email válido');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    console.log(`Iniciando ${isLogin ? 'login' : 'registro'}...`);
    
    try {
      if (isLogin) {
        // Login
        console.log('Dados de login:', { username: formData.username, password: '***' });
        const result = await authService.login({
          username: formData.username,
          password: formData.password
        });
        
        // Garantir que o username está incluído no resultado
        if (!result.username && formData.username) {
          result.username = formData.username;
        }
        
        console.log('Resultado do login com username:', result);
        
        // Usar o contexto de autenticação para fazer login
        await login(result);
        console.log('Login bem-sucedido!');
        
        // Redirecionamento será automático pelo useEffect que monitora isLoggedIn
      } else {
        // Registro
        console.log('Dados de registro:', { 
          username: formData.username, 
          email: formData.email, 
          password: '***' 
        });
        const result = await authService.register(formData);
        console.log('Registro bem-sucedido:', result);
        
        Alert.alert(
          'Sucesso', 
          'Conta criada com sucesso! Faça login para continuar.',
          [{ text: 'OK', onPress: () => setIsLogin(true) }]
        );
        setFormData(prev => ({
          ...prev,
          confirmPassword: ''
        }));
      }
    } catch (error) {
      console.error(`Erro no ${isLogin ? 'login' : 'registro'}:`, error);
      
      // Usar o utilitário para formatar erros
      const errorMessage = formatAuthError(error);
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    // Limpa os campos ao alternar entre modos
    setFormData({
      username: formData.username, // mantém o username
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  // Renderiza o status da conexão
  const renderConnectionStatus = () => {
    if (connectionStatus === null) return null;
    
    let color = '#999999';
    let text = 'Verificando conexão...';
    let icon = 'spinner';
    
    if (connectionStatus === 'testing') {
      color = '#FFA500';  // laranja
    } else if (connectionStatus === 'success') {
      color = '#4CAF50';  // verde
      text = 'Conectado ao servidor';
      icon = 'check-circle';
    } else if (connectionStatus === 'failed') {
      color = '#F44336';  // vermelho
      text = 'Falha na conexão com o servidor';
      icon = 'times-circle';
    }
    
    return (
      <View style={styles.connectionStatus}>
        <FontAwesome5 name={icon} size={16} color={color} style={{marginRight: 6}} />
        <Text style={[styles.connectionStatusText, {color}]}>{text}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={testConnection}
        >
          <Text style={styles.retryText}>Testar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{flexGrow: 1}}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
            {/* Logo e título */}
            <View style={styles.logoContainer}>
              <FontAwesome5 name="shield-alt" size={30} color="#4A86E8" />
              <Text style={styles.logoText}>SENHAS SEGURAS</Text>
            </View>
            
            {/* Status da conexão */}
            {renderConnectionStatus()}
            
            <Text style={styles.welcomeText}>
              {isLogin ? 'Bem-vindo(a)' : 'Criar Conta'}
            </Text>
            <Text style={styles.subtitleText}>
              {isLogin 
                ? 'Faça login para acessar o gerador de senhas' 
                : 'Preencha os dados para criar sua conta'}
            </Text>
            
            {/* Formulário */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <FontAwesome5 name="user" size={16} color="#4A86E8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nome de usuário"
                  value={formData.username}
                  onChangeText={(value) => handleChange('username', value)}
                  autoCapitalize="none"
                />
              </View>
              
              {!isLogin && (
                <View style={styles.inputContainer}>
                  <FontAwesome5 name="envelope" size={16} color="#4A86E8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={formData.email}
                    onChangeText={(value) => handleChange('email', value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              )}
              
              <View style={styles.inputContainer}>
                <FontAwesome5 name="lock" size={16} color="#4A86E8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Senha"
                  value={formData.password}
                  onChangeText={(value) => handleChange('password', value)}
                  secureTextEntry
                />
              </View>
              
              {!isLogin && (
                <View style={styles.inputContainer}>
                  <FontAwesome5 name="lock" size={16} color="#4A86E8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirme a senha"
                    value={formData.confirmPassword}
                    onChangeText={(value) => handleChange('confirmPassword', value)}
                    secureTextEntry
                  />
                </View>
              )}
              
              <TouchableOpacity
                style={styles.loginButton}
                activeOpacity={0.7}
                onPress={handleSubmit}
                disabled={loading || authLoading}
              >
                {loading || authLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>
                    {isLogin ? 'ENTRAR' : 'CADASTRAR'}
                  </Text>
                )}
              </TouchableOpacity>
              
              {isLogin && (
                <TouchableOpacity
                  style={styles.forgotPassword}
                  onPress={() => Alert.alert('Info', 'Função de recuperação de senha')}
                >
                  <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={styles.toggleAuth}
                onPress={toggleAuthMode}
              >
                <Text style={styles.toggleAuthText}>
                  {isLogin 
                    ? 'Não tem uma conta? Cadastre-se' 
                    : 'Já tem uma conta? Faça login'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
      
      {/* Rodapé da aplicação */}
      <View style={styles.footer}>
        <Text style={styles.versionText}>v1.1.0</Text>
      </View>
    </SafeAreaView>
  );
};

export default Login; 
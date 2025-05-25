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
  const [errors, setErrors] = useState({});
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
  }, [isLoggedIn, authLoading, navigation]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Limpa o erro do campo quando o usuário começa a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const { username, email, password, confirmPassword } = formData;
    const newErrors = {};

    if (isLogin) {
      if (!username) {
        newErrors.username = 'Nome de usuário é obrigatório';
      }
      if (!password) {
        newErrors.password = 'Senha é obrigatória';
      }
    } else {
      if (!username) {
        newErrors.username = 'Nome de usuário é obrigatório';
      } else if (username.length < 3) {
        newErrors.username = 'Nome de usuário deve ter pelo menos 3 caracteres';
      }
      
      if (!email) {
        newErrors.email = 'Email é obrigatório';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          newErrors.email = 'Por favor, insira um email válido';
        }
      }
      
      if (!password) {
        newErrors.password = 'Senha é obrigatória';
      }
      
      if (!confirmPassword) {
        newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'As senhas não coincidem';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
          'Conta criada com sucesso! Redirecionando para login.',
          [{ text: 'OK', onPress: () => setIsLogin(true) }]
        );
        setFormData(prev => ({
          ...prev,
          confirmPassword: ''
        }));
        setTimeout(() => setIsLogin(true), 500);
      }
    } catch (error) {
      console.error(`Erro no ${isLogin ? 'login' : 'registro'}:`, error);
      
      // Tratamento específico de erros
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 401) {
          setErrors({
            username: 'Nome de usuário ou senha incorretos',
            password: 'Nome de usuário ou senha incorretos'
          });
        } else if (status === 400) {
          if (data.message.includes('username')) {
            setErrors({ username: 'Este nome de usuário já está em uso' });
          } else if (data.message.includes('email')) {
            setErrors({ email: 'Este email já está em uso' });
          } else {
            setErrors({ general: data.message || 'Dados inválidos' });
          }
        } else {
          setErrors({ general: 'Erro ao processar sua solicitação. Tente novamente.' });
        }
      } else {
        setErrors({ general: 'Não foi possível conectar ao servidor. Verifique sua conexão de internet.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setErrors({}); // Limpa os erros ao trocar de modo
    // Limpa os campos ao alternar entre modos
    setFormData({
      username: formData.username, // mantém o username
      email: '',
      password: '',
      confirmPassword: ''
    });
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
            
            <Text style={styles.welcomeText}>
              {isLogin ? 'Bem-vindo(a)' : 'Criar Conta'}
            </Text>
            <Text style={styles.subtitleText}>
              {isLogin 
                ? 'Faça login para acessar o gerador de senhas' 
                : 'Preencha os dados para criar sua conta'}
            </Text>
            
            {/* Mensagem de erro geral */}
            {errors.general && (
              <View style={styles.generalErrorContainer}>
                <Text style={styles.generalErrorText}>{errors.general}</Text>
              </View>
            )}
            
            {/* Formulário */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <FontAwesome5 name="user" size={16} color="#4A86E8" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, errors.username && styles.inputError]}
                  placeholder="Nome de usuário"
                  value={formData.username}
                  onChangeText={(value) => handleChange('username', value)}
                  autoCapitalize="none"
                />
              </View>
              {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
              
              {!isLogin && (
                <>
                  <View style={styles.inputContainer}>
                    <FontAwesome5 name="envelope" size={16} color="#4A86E8" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, errors.email && styles.inputError]}
                      placeholder="Email"
                      value={formData.email}
                      onChangeText={(value) => handleChange('email', value)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                </>
              )}
              
              <View style={styles.inputContainer}>
                <FontAwesome5 name="lock" size={16} color="#4A86E8" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, errors.password && styles.inputError]}
                  placeholder="Senha"
                  value={formData.password}
                  onChangeText={(value) => handleChange('password', value)}
                  secureTextEntry
                />
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              
              {!isLogin && (
                <>
                  <View style={styles.inputContainer}>
                    <FontAwesome5 name="lock" size={16} color="#4A86E8" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, errors.confirmPassword && styles.inputError]}
                      placeholder="Confirme a senha"
                      value={formData.confirmPassword}
                      onChangeText={(value) => handleChange('confirmPassword', value)}
                      secureTextEntry
                    />
                  </View>
                  {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                </>
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
        <Text style={styles.footerText}>
          Desenvolvido por Raganar
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default Login; 
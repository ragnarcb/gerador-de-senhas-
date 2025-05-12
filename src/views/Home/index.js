import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5 } from '@expo/vector-icons';
import PasswordGenerator from '../../components/PasswordGenerator';
import { useAuthContext } from '../../utils/AuthContext';
import styles from './styles';

const APP_VERSION = '1.1.0';

const Home = ({ navigation }) => {
  // Usar o contexto de autenticação para acessar o usuário e função de logout
  const { user, logout } = useAuthContext();

  const handleLogout = useCallback(async () => {
    Alert.alert(
      'Logout',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          onPress: async () => {
            await logout();
            // O redirecionamento será automático pelo ProtectedRoute
          },
          style: 'destructive'
        }
      ]
    );
  }, [logout]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style="dark" />
      
      {/* Cabeçalho com informações do usuário e botão de logout */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <FontAwesome5 name="user-circle" size={20} color="#4A86E8" style={styles.userIcon} />
          <Text style={styles.username}>
            Olá, {user?.username || 'usuário'}
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <FontAwesome5 name="sign-out-alt" size={18} color="#666666" />
        </TouchableOpacity>
      </View>
      
      <View style={{ flex: 1 }}>
        <PasswordGenerator navigation={navigation} />
      </View>
      
      {/* Rodapé da aplicação */}
      <View style={styles.footer}>
        <View style={styles.logoContainer}>
          <FontAwesome5 name="shield-alt" size={14} color="#4A86E8" />
          <Text style={styles.logoText}>SENHAS SEGURAS</Text>
        </View>
        <Text style={styles.versionText}>v{APP_VERSION}</Text>
      </View>
    </SafeAreaView>
  );
};

export default Home; 
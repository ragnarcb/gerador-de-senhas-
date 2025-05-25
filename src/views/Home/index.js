import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert, ToastAndroid, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5 } from '@expo/vector-icons';
import PasswordGenerator from '../../components/PasswordGenerator';
import { useAuthContext } from '../../utils/AuthContext';
import styles from './styles';

const APP_VERSION = '1.1.0';

const Home = ({ navigation }) => {
  // Usar o contexto de autenticação para acessar o usuário e função de logout
  const { user } = useAuthContext();

  // Função auxiliar para mostrar mensagens curtas
  const showMessage = (msg) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      console.log(msg); // No iOS, apenas log (poderia usar Alert se preferir)
    }
  };

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Logout',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          onPress: () => {
            console.log("Home: Redirecionando para tela de logout...");
            showMessage("Saindo...");
            
            // Navegar para a tela dedicada de logout que tratará todo o processo
            navigation.navigate('Logout');
          },
          style: 'destructive'
        }
      ]
    );
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style="dark" />
      
      {/* Cabeçalho com informações do usuário e botão de logout */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <FontAwesome5 name="user-circle" size={20} color="#4A86E8" style={styles.userIcon} />
          <Text style={styles.username}>
            Olá, {user && user.username ? user.username : 'usuário'}
          </Text>
        </View>
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
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Logout')}
            style={{marginRight: 10}}
          >
            <Text style={{fontSize: 12, color: '#F44336'}}>Forçar Logout</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>v{APP_VERSION}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Home; 
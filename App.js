import React from 'react';
import { StyleSheet, Platform, StatusBar as RNStatusBar, LogBox, View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';

import Home from './src/views/Home';
import History from './src/views/History';
import Login from './src/views/Login';
import ProtectedRoute from './src/utils/ProtectedRoute';
import { AuthProvider, useAuthContext } from './src/utils/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ignorar logs específicos se necessário
LogBox.ignoreLogs([
  'Warning: ...',  // adicione warnings específicos se souber quais são
  'AsyncStorage has been extracted from react-native core', // Ignore AsyncStorage warning
]);

const Stack = createNativeStackNavigator();

// Componentes protegidos que requerem autenticação
const ProtectedHome = (props) => <ProtectedRoute component={Home} {...props} />;
const ProtectedHistory = (props) => <ProtectedRoute component={History} {...props} />;

// Componente dedicado para logout
const LogoutScreen = ({ navigation }) => {
  const { logout } = useAuthContext();
  
  React.useEffect(() => {
    const performLogout = async () => {
      console.log('LogoutScreen: Iniciando processo de logout completo');
      
      try {
        // Primeiro, tentar o logout normal
        await logout();
        
        // Independentemente do resultado, forçar limpeza do AsyncStorage
        console.log('LogoutScreen: Forçando limpeza do AsyncStorage');
        await AsyncStorage.clear();
        
        // Forçar navegação para a tela de login
        console.log('LogoutScreen: Navegando para a tela de login');
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          })
        );
      } catch (error) {
        console.error('LogoutScreen: Erro durante o logout', error);
        // Mesmo com erro, forçar navegação para login
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          })
        );
      }
    };
    
    performLogout();
  }, [logout, navigation]);
  
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#4A86E8" />
      <Text style={styles.loadingText}>Saindo...</Text>
    </View>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
      <NavigationContainer fallback={<DebugScreen />}>
        <Stack.Navigator
            initialRouteName="Login"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: '#FFFFFF' }
          }}
        >
            {/* Tela pública */}
            <Stack.Screen name="Login" component={Login} />
            
            {/* Telas protegidas que requerem autenticação */}
            <Stack.Screen name="Home" component={ProtectedHome} />
            <Stack.Screen name="History" component={ProtectedHistory} />
            
            {/* Tela dedicada de logout */}
            <Stack.Screen name="Logout" component={LogoutScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

// Tela de debug simples para mostrar quando a navegação está carregando
const DebugScreen = () => (
  <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
    <Text>Carregando...</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  loadingContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#FFFFFF'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666'
  }
});


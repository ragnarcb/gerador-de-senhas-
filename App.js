import React from 'react';
import { StyleSheet, Platform, StatusBar as RNStatusBar, LogBox, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Home from './src/views/Home';
import History from './src/views/History';
import Login from './src/views/Login';
import ProtectedRoute from './src/utils/ProtectedRoute';
import { AuthProvider } from './src/utils/AuthContext';

// Ignorar logs específicos se necessário
LogBox.ignoreLogs([
  'Warning: ...',  // adicione warnings específicos se souber quais são
  'AsyncStorage has been extracted from react-native core', // Ignore AsyncStorage warning
]);

const Stack = createNativeStackNavigator();

// Componentes protegidos que requerem autenticação
const ProtectedHome = (props) => <ProtectedRoute component={Home} {...props} />;
const ProtectedHistory = (props) => <ProtectedRoute component={History} {...props} />;

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
});


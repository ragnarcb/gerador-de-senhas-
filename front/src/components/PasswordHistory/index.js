import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Header from './Header';
import PasswordList from './PasswordList';
import EmptyState from './EmptyState';
import styles from './styles';

const PasswordHistory = ({ navigation, route }) => {
  console.log('Parâmetros recebidos:', route.params);
  const { passwordHistory = [], clearPasswordHistory } = route.params || {};

  const handleClearHistory = () => {
    if (clearPasswordHistory) {
      clearPasswordHistory();
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <Header onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <Text style={styles.title}>SUAS SENHAS ANTERIORES</Text>
        
        {passwordHistory.length > 0 ? (
          <PasswordList 
            passwords={passwordHistory}
            onClearHistory={handleClearHistory}
          />
        ) : (
          <EmptyState />
        )}
      </View>
    </SafeAreaView>
  );
};

export default PasswordHistory; 
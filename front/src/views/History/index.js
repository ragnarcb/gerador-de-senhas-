import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import PasswordHistory from '../../components/PasswordHistory';
import styles from './styles';

const History = ({ navigation, route }) => {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <PasswordHistory navigation={navigation} route={route} />
    </SafeAreaView>
  );
};

export default History; 
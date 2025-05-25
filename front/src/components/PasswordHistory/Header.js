import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import styles from './styles';

const Header = ({ onBack }) => (
  <View style={styles.header}>
    <TouchableOpacity 
      style={styles.backButtonContainer}
      onPress={onBack}
    >
      <FontAwesome5 name="arrow-left" size={20} color="#4A86E8" />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Histórico de Senhas</Text>
    <View style={{ width: 24 }} />
  </View>
);

export default Header; 
import React from 'react';
import { View, Text, Platform } from 'react-native';
import styles from './styles';

const PasswordDisplay = ({ password }) => (
  <View style={styles.passwordContainer}>
    <Text style={styles.passwordText}>{password}</Text>
  </View>
);

export default PasswordDisplay; 
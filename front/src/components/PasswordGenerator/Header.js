import React from 'react';
import { View, Text } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import styles from './styles';

const Header = () => (
  <>
    <Text style={styles.title}>GERADOR DE SENHA</Text>
    <View style={styles.imageContainer}>
      <View style={styles.iconCircle}>
        <FontAwesome5 name="lock" size={60} color="#4A86E8" />
      </View>
    </View>
  </>
);

export default Header; 
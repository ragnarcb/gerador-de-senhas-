import React from 'react';
import { View, Text } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import styles from './styles';

const EmptyState = () => (
  <View style={styles.emptyContainer}>
    <FontAwesome5 name="history" size={40} color="#CCCCCC" />
    <Text style={styles.emptyText}>Nenhuma senha no histórico</Text>
    <Text style={styles.emptySubText}>As senhas geradas aparecerão aqui</Text>
  </View>
);

export default EmptyState; 
import React from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import styles from './styles';

const PasswordList = ({ passwords, onClearHistory }) => {
  const copyPasswordToClipboard = async (password) => {
    await Clipboard.setStringAsync(password);
    Alert.alert('Copiado!', 'Senha copiada para a área de transferência.');
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Confirmar ação',
      'Tem certeza de que deseja limpar todo o histórico de senhas?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Limpar',
          onPress: onClearHistory,
          style: 'destructive',
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.passwordItemContainer}>
      <Text style={styles.passwordItem}>{item}</Text>
      <TouchableOpacity 
        style={styles.copyButton}
        onPress={() => copyPasswordToClipboard(item)}
      >
        <FontAwesome5 name="copy" size={16} color="#4A86E8" />
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <FlatList
        data={passwords}
        renderItem={renderItem}
        keyExtractor={(item, index) => `password-${index}`}
        style={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
      />
      
      <TouchableOpacity
        style={styles.clearButton}
        onPress={handleClearHistory}
      >
        <FontAwesome5 name="trash-alt" size={16} color="#FFFFFF" style={styles.buttonIcon} />
        <Text style={styles.clearButtonText}>LIMPAR HISTÓRICO</Text>
      </TouchableOpacity>
    </>
  );
};

export default PasswordList; 
import React from 'react';
import { TouchableOpacity, Text, Alert, ActivityIndicator } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import styles from './styles';

const ActionButtons = ({ onGenerate, password, isGenerating, onClear }) => {
  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(password);
    Alert.alert('Sucesso!', 'Senha copiada para a área de transferência.');
  };

  return (
    <>
      <TouchableOpacity
        style={styles.button}
        onPress={onGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <FontAwesome5 name="sync-alt" size={16} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>GERAR NOVA</Text>
          </>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.button}
        onPress={copyToClipboard}
        disabled={!password}
      >
        <FontAwesome5 name="copy" size={16} color="#FFFFFF" style={styles.buttonIcon} />
        <Text style={styles.buttonText}>COPIAR</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.button}
        onPress={onClear}
        disabled={!password || isGenerating}
      >
        <FontAwesome5 name="trash-alt" size={16} color="#FFFFFF" style={styles.buttonIcon} />
        <Text style={styles.buttonText}>LIMPAR</Text>
      </TouchableOpacity>
    </>
  );
};

export default ActionButtons; 
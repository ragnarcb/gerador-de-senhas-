import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5 } from '@expo/vector-icons';
import { evaluatePasswordStrength } from '../../services/passwordGenerator';
import { saveToHistory, getPasswordHistory } from '../../services/storageService';
import * as passwordApi from '../../services/api/passwordApi';
import Header from './Header';
import PasswordDisplay from './PasswordDisplay';
import StrengthIndicator from './StrengthIndicator';
import ActionButtons from './ActionButtons';
import styles from './styles';

const PasswordGenerator = ({ navigation }) => {
  const [password, setPassword] = useState('');
  const [passwordName, setPasswordName] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [activeTab, setActiveTab] = useState('generator'); // 'generator', 'history', 'saved'
  const [passwordHistory, setPasswordHistory] = useState([]);
  const [savedPasswords, setSavedPasswords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Carregar o histórico e senhas salvas ao iniciar
  useEffect(() => {
    loadData();
  }, []);

  // Avaliar a força da senha quando ela mudar
  useEffect(() => {
    if (password) {
      const strength = evaluatePasswordStrength(password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [password]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load local history
      const history = await getPasswordHistory();
      setPasswordHistory(history);
      
      // Load saved passwords from API
      const apiSavedPasswords = await passwordApi.getSavedPasswords();
      setSavedPasswords(apiSavedPasswords || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      if (error.response && error.response.status === 401) {
        Alert.alert('Sessão expirada', 'Sua sessão expirou. Por favor, faça login novamente.');
        // O ProtectedRoute irá redirecionar para a tela de login
      } else {
        Alert.alert('Erro', 'Não foi possível carregar as senhas.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewPassword = async () => {
    setIsGenerating(true);
    try {
      // Generate password from API
      const newPassword = await passwordApi.generatePassword({ length: 12 });
      setPassword(newPassword);
      
      // Save to local history
      await saveToHistory(newPassword);
      
      // Reload history
      const history = await getPasswordHistory();
      setPasswordHistory(history);
    } catch (error) {
      console.error('Erro ao gerar senha:', error);
      Alert.alert('Erro', 'Não foi possível gerar uma nova senha.');
    } finally {
      setIsGenerating(false);
    }
  };

  const savePassword = async () => {
    if (!password) {
      Alert.alert('Erro', 'Nenhuma senha gerada para salvar.');
      return;
    }

    if (!passwordName.trim()) {
      Alert.alert('Erro', 'Dê um nome para sua senha.');
      return;
    }

    setIsSaving(true);
    try {
      // Save password to API
      await passwordApi.savePassword(passwordName.trim(), password);
      Alert.alert('Sucesso', 'Senha salva com sucesso!');
      setPasswordName('');
      
      // Reload saved passwords
      const apiSavedPasswords = await passwordApi.getSavedPasswords();
      setSavedPasswords(apiSavedPasswords || []);
    } catch (error) {
      console.error('Erro ao salvar senha:', error);
      if (error.response && error.response.status === 401) {
        Alert.alert('Sessão expirada', 'Sua sessão expirou. Por favor, faça login novamente.');
      } else {
        Alert.alert('Erro', 'Não foi possível salvar a senha.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSavedPassword = (id, name) => {
    Alert.alert(
      'Confirmação',
      `Tem certeza que deseja excluir a senha "${name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          onPress: async () => {
            try {
              await passwordApi.deletePassword(id);
              
              // Reload saved passwords
              const apiSavedPasswords = await passwordApi.getSavedPasswords();
              setSavedPasswords(apiSavedPasswords || []);
              
              Alert.alert('Sucesso', 'Senha excluída com sucesso.');
            } catch (error) {
              console.error('Erro ao excluir senha:', error);
              Alert.alert('Erro', 'Não foi possível excluir a senha.');
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'generator' && styles.activeTab]}
        onPress={() => setActiveTab('generator')}
      >
        <FontAwesome5 name="key" size={16} color={activeTab === 'generator' ? '#4A86E8' : '#666666'} />
        <Text style={[styles.tabText, activeTab === 'generator' && styles.activeTabText]}>Gerador</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'history' && styles.activeTab]}
        onPress={() => setActiveTab('history')}
      >
        <FontAwesome5 name="history" size={16} color={activeTab === 'history' ? '#4A86E8' : '#666666'} />
        <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>Histórico</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'saved' && styles.activeTab]}
        onPress={() => setActiveTab('saved')}
      >
        <FontAwesome5 name="save" size={16} color={activeTab === 'saved' ? '#4A86E8' : '#666666'} />
        <Text style={[styles.tabText, activeTab === 'saved' && styles.activeTabText]}>Salvas</Text>
      </TouchableOpacity>
    </View>
  );

  const renderGeneratorTab = () => (
    <View style={styles.tabContent}>
      <Header />
      <PasswordDisplay password={password} />
      <StrengthIndicator strength={passwordStrength} />
      
      <View style={styles.saveContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nome da senha (ex: Email trabalho)"
          value={passwordName}
          onChangeText={setPasswordName}
        />
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={savePassword}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <FontAwesome5 name="save" size={16} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>SALVAR</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      
      <ActionButtons 
        onGenerate={generateNewPassword}
        password={password}
        isGenerating={isGenerating}
      />
    </View>
  );

  const renderHistoryTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Histórico de Senhas Geradas</Text>
      {passwordHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome5 name="history" size={32} color="#CCCCCC" />
          <Text style={styles.emptyText}>Nenhuma senha no histórico</Text>
          <Text style={styles.emptySubText}>As senhas geradas aparecerão aqui</Text>
        </View>
      ) : (
        passwordHistory.map((item) => (
          <View key={item.id} style={styles.passwordItemContainer}>
            <Text style={styles.passwordItem}>{item.password}</Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => {
                setPassword(item.password);
                setActiveTab('generator');
              }}
            >
              <FontAwesome5 name="arrow-circle-right" size={20} color="#4A86E8" />
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderSavedTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Senhas Salvas</Text>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A86E8" />
          <Text style={styles.loadingText}>Carregando senhas...</Text>
        </View>
      ) : savedPasswords.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome5 name="save" size={32} color="#CCCCCC" />
          <Text style={styles.emptyText}>Nenhuma senha salva</Text>
          <Text style={styles.emptySubText}>Salve senhas com um nome para acessá-las facilmente</Text>
        </View>
      ) : (
        savedPasswords.map((item) => (
          <View key={item.id} style={styles.savedPasswordContainer}>
            <View style={styles.savedPasswordHeader}>
              <Text style={styles.savedPasswordName}>{item.name}</Text>
              <TouchableOpacity
                onPress={() => handleDeleteSavedPassword(item.id, item.name)}
              >
                <FontAwesome5 name="trash-alt" size={16} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
            <View style={styles.savedPasswordContent}>
              <Text style={styles.savedPasswordText}>{item.password}</Text>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => {
                  setPassword(item.password);
                  setPasswordName(item.name);
                  setActiveTab('generator');
                }}
              >
                <FontAwesome5 name="arrow-circle-right" size={20} color="#4A86E8" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {renderTabs()}
      
      {activeTab === 'generator' && renderGeneratorTab()}
      {activeTab === 'history' && renderHistoryTab()}
      {activeTab === 'saved' && renderSavedTab()}
    </View>
  );
};

export default PasswordGenerator; 
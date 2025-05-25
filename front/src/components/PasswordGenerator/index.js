import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Modal, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, ToastAndroid } from 'react-native';
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
import * as Clipboard from 'expo-clipboard';

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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [visibleIndexesHistory, setVisibleIndexesHistory] = useState([]);
  const [visibleIndexesSaved, setVisibleIndexesSaved] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalPassword, setModalPassword] = useState('');
  const [modalPasswordName, setModalPasswordName] = useState('');
  const [modalPasswordVisible, setModalPasswordVisible] = useState(false);

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
      console.log('PasswordGenerator: Carregando dados...');
      
      // Load local history
      const history = await getPasswordHistory();
      setPasswordHistory(history);
      console.log(`PasswordGenerator: ${history.length} itens no histórico local carregados`);
      
      try {
        // Verificar autenticação antes de carregar senhas do servidor
        const isAuth = await import('../../utils/authUtils').then(module => {
          return module.isAuthenticated();
        });
        
        if (!isAuth) {
          console.log('PasswordGenerator: Usuário não está autenticado, pulando carregamento de senhas do servidor');
          return;
        }
        
        // Load saved passwords from API
        const apiSavedPasswords = await passwordApi.getSavedPasswords();
        setSavedPasswords(apiSavedPasswords || []);
        console.log(`PasswordGenerator: ${apiSavedPasswords?.length || 0} senhas carregadas do servidor`);
      } catch (error) {
        console.error('Erro ao carregar senhas do servidor:', error);
        // Mostra mensagem somente se for erro de autenticação
        if (error.response && error.response.status === 401) {
          Alert.alert('Sessão expirada', 'Sua sessão expirou. Por favor, faça login novamente.');
        } else {
          // Para outros erros, mantenha as senhas locais que já estão carregadas
          // e apenas mostre um aviso
          console.log('PasswordGenerator: Usando apenas senhas locais devido a erro de conexão');
          setTimeout(() => {
            Alert.alert(
              'Modo offline', 
              'Não foi possível conectar ao servidor. Algumas funcionalidades podem estar limitadas.',
              [{ text: 'OK' }]
            );
          }, 500);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar o histórico de senhas.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewPassword = async () => {
    setIsGenerating(true);
    try {
      // Gerar senha localmente em vez de chamar a API
      const newPassword = await import('../../services/passwordGenerator').then(module => {
        return module.generatePassword(12, true, true, true, true);
      });
      
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

  const clearPassword = () => {
    setPassword('');
    setPasswordName('');
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
      
      // Verifica se é um erro de nome duplicado
      if (error.message && error.message.includes('nome')) {
        Alert.alert(
          'Nome duplicado', 
          'Já existe uma senha com este nome. Escolha um nome diferente.',
          [{ text: 'OK' }]
        );
      } else if (error.response && error.response.status === 401) {
        Alert.alert('Sessão expirada', 'Sua sessão expirou. Por favor, faça login novamente.');
      } else if (error.message && error.message.includes('indisponível')) {
        // Se o backend estiver indisponível, salve localmente
        try {
          const localSavedPassword = {
            id: Date.now(),
            name: passwordName.trim(),
            password: password,
            created_at: new Date().toISOString(),
            isLocal: true // Marca que é salvo localmente
          };
          
          // Adiciona aos savedPasswords
          const updatedSavedPasswords = [localSavedPassword, ...savedPasswords];
          setSavedPasswords(updatedSavedPasswords);
          
          // Também salva no histórico
          await saveToHistory(password);
          
          Alert.alert(
            'Salvo localmente', 
            'O servidor está indisponível. A senha foi salva apenas neste dispositivo.',
            [{ text: 'OK' }]
          );
          
          setPasswordName('');
        } catch (localError) {
          console.error('Erro ao salvar localmente:', localError);
          Alert.alert('Erro', 'Não foi possível salvar a senha localmente.');
        }
      } else {
        Alert.alert('Erro', 'Não foi possível salvar a senha.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSavedPassword = (id, name, isLocal = false) => {
    Alert.alert(
      'Confirmação',
      `Tem certeza que deseja excluir a senha "${name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          onPress: async () => {
            try {
              if (isLocal) {
                // Se for uma senha local, apenas remova da lista local
                const updatedPasswords = savedPasswords.filter(item => item.id !== id);
                setSavedPasswords(updatedPasswords);
                Alert.alert('Sucesso', 'Senha local excluída com sucesso.');
              } else {
                // Se for uma senha do servidor, exclua pela API
                await passwordApi.deletePassword(id);
                
                // Reload saved passwords
                const apiSavedPasswords = await passwordApi.getSavedPasswords();
                setSavedPasswords(apiSavedPasswords || []);
                
                Alert.alert('Sucesso', 'Senha excluída com sucesso.');
              }
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

  // Função para fechar o teclado ao clicar em qualquer lugar da tela
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };
  
  // Função para abrir o modal de salvar senha
  const openSaveModal = () => {
    setModalPassword(password);
    setModalPasswordName(passwordName);
    setModalPasswordVisible(isPasswordVisible);
    setIsModalVisible(true);
  };
  
  // Função para fechar o modal
  const closeSaveModal = () => {
    setIsModalVisible(false);
  };
  
  // Função atualizada para salvar a senha do modal
  const saveModalPassword = async () => {
    if (!modalPassword) {
      Alert.alert('Erro', 'Nenhuma senha gerada para salvar.');
      return;
    }

    if (!modalPasswordName.trim()) {
      Alert.alert('Erro', 'Dê um nome para sua senha.');
      return;
    }

    setIsSaving(true);
    try {
      // Save password to API
      await passwordApi.savePassword(modalPasswordName.trim(), modalPassword);
      Alert.alert('Sucesso', 'Senha salva com sucesso!');
      setPasswordName('');
      setModalPasswordName('');
      closeSaveModal();
      
      // Reload saved passwords
      const apiSavedPasswords = await passwordApi.getSavedPasswords();
      setSavedPasswords(apiSavedPasswords || []);
    } catch (error) {
      console.error('Erro ao salvar senha:', error);
      
      // Verifica se é um erro de nome duplicado
      if (error.message && error.message.includes('nome')) {
        Alert.alert(
          'Nome duplicado', 
          'Já existe uma senha com este nome. Escolha um nome diferente.',
          [{ text: 'OK' }]
        );
      } else if (error.response && error.response.status === 401) {
        Alert.alert('Sessão expirada', 'Sua sessão expirou. Por favor, faça login novamente.');
      } else if (error.message && error.message.includes('indisponível')) {
        // Se o backend estiver indisponível, salve localmente
        try {
          const localSavedPassword = {
            id: Date.now(),
            name: modalPasswordName.trim(),
            password: modalPassword,
            created_at: new Date().toISOString(),
            isLocal: true // Marca que é salvo localmente
          };
          
          // Adiciona aos savedPasswords
          const updatedSavedPasswords = [localSavedPassword, ...savedPasswords];
          setSavedPasswords(updatedSavedPasswords);
          
          // Também salva no histórico
          await saveToHistory(modalPassword);
          
          Alert.alert(
            'Salvo localmente', 
            'O servidor está indisponível. A senha foi salva apenas neste dispositivo.',
            [{ text: 'OK' }]
          );
          
          setPasswordName('');
          setModalPasswordName('');
          closeSaveModal();
        } catch (localError) {
          console.error('Erro ao salvar localmente:', localError);
          Alert.alert('Erro', 'Não foi possível salvar a senha localmente.');
        }
      } else {
        Alert.alert('Erro', 'Não foi possível salvar a senha.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const renderGeneratorTab = () => (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.tabContent}>
        <Header />
        <PasswordDisplay password={password} setPassword={setPassword} isVisible={isPasswordVisible} setIsVisible={setIsPasswordVisible} />
        <StrengthIndicator strength={passwordStrength} />
        
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={openSaveModal}
        >
          <FontAwesome5 name="save" size={16} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>SALVAR SENHA</Text>
        </TouchableOpacity>
        
        <ActionButtons 
          onGenerate={generateNewPassword}
          password={password}
          isGenerating={isGenerating}
          onClear={clearPassword}
        />
        
        {/* Modal para salvar senha */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={closeSaveModal}
        >
          <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <View style={styles.modalOverlay}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalContainer}
              >
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Salvar Senha</Text>
                  
                  <View style={styles.passwordDisplayModal}>
                    <TextInput
                      style={styles.modalPasswordInput}
                      value={modalPassword}
                      onChangeText={setModalPassword}
                      secureTextEntry={!modalPasswordVisible}
                      editable={true}
                      selectTextOnFocus={true}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity onPress={() => setModalPasswordVisible(!modalPasswordVisible)} style={styles.eyeButton}>
                      <FontAwesome5 name={modalPasswordVisible ? 'eye' : 'eye-slash'} size={22} color="#4A86E8" />
                    </TouchableOpacity>
                  </View>
                  
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Nome da senha (ex: Email trabalho)"
                    placeholderTextColor="#BBBBBB"
                    value={modalPasswordName}
                    onChangeText={setModalPasswordName}
                  />
                  
                  <View style={styles.modalButtonsContainer}>
                    <TouchableOpacity 
                      style={styles.modalCancelButton}
                      onPress={closeSaveModal}
                    >
                      <Text style={styles.modalCancelButtonText}>CANCELAR</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.modalSaveButton}
                      onPress={saveModalPassword}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.modalSaveButtonText}>SALVAR</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </KeyboardAvoidingView>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );

  const toggleVisibilityHistory = (idx) => {
    setVisibleIndexesHistory((prev) => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  const copyPassword = async (password) => {
    await Clipboard.setStringAsync(password);
    if (Platform.OS === 'android') {
      ToastAndroid.show('Senha copiada!', ToastAndroid.SHORT);
    } else {
      Alert.alert('Copiado', 'Senha copiada para a área de transferência!');
    }
  };

  const renderHistoryTab = () => (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <ScrollView style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Histórico de Senhas Geradas</Text>
        {passwordHistory.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="history" size={32} color="#CCCCCC" />
            <Text style={styles.emptyText}>Nenhuma senha no histórico</Text>
            <Text style={styles.emptySubText}>As senhas geradas aparecerão aqui</Text>
          </View>
        ) : (
          passwordHistory.map((item, idx) => (
            <View key={item.id} style={styles.passwordItemContainer}>
              <TextInput
                style={styles.passwordItem}
                value={item.password}
                secureTextEntry={!visibleIndexesHistory.includes(idx)}
                editable={false}
              />
              <TouchableOpacity onPress={() => toggleVisibilityHistory(idx)} style={styles.copyButton}>
                <FontAwesome5 name={visibleIndexesHistory.includes(idx) ? 'eye' : 'eye-slash'} size={20} color="#4A86E8" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => {
                  setPassword(item.password);
                  setActiveTab('generator');
                }}
              >
                <FontAwesome5 name="arrow-circle-right" size={20} color="#4A86E8" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => copyPassword(item.password)}
              >
                <FontAwesome5 name="copy" size={20} color="#4A86E8" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </TouchableWithoutFeedback>
  );

  const toggleVisibilitySaved = (idx) => {
    setVisibleIndexesSaved((prev) => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  const renderSavedTab = () => (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
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
          savedPasswords.map((item, idx) => (
            <View key={item.id} style={styles.savedPasswordContainer}>
              <View style={styles.savedPasswordHeader}>
                <Text style={styles.savedPasswordName}>
                  {item.name}
                  {item.isLocal && (
                    <Text style={styles.localBadge}> (Local)</Text>
                  )}
                </Text>
                <TouchableOpacity
                  onPress={() => handleDeleteSavedPassword(item.id, item.name, item.isLocal)}
                >
                  <FontAwesome5 name="trash-alt" size={16} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
              <View style={styles.savedPasswordContent}>
                <TextInput
                  style={styles.savedPasswordText}
                  value={item.password}
                  secureTextEntry={!visibleIndexesSaved.includes(idx)}
                  editable={false}
                />
                <TouchableOpacity onPress={() => toggleVisibilitySaved(idx)} style={styles.copyButton}>
                  <FontAwesome5 name={visibleIndexesSaved.includes(idx) ? 'eye' : 'eye-slash'} size={20} color="#4A86E8" />
                </TouchableOpacity>
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
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={() => copyPassword(item.password)}
                >
                  <FontAwesome5 name="copy" size={20} color="#4A86E8" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        {/* Botão para atualizar manualmente as senhas */}
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadData}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <FontAwesome5 name="sync" size={16} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>ATUALIZAR SENHAS</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </TouchableWithoutFeedback>
  );

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        <StatusBar style="dark" />
        
        {renderTabs()}
        
        {activeTab === 'generator' && renderGeneratorTab()}
        {activeTab === 'history' && renderHistoryTab()}
        {activeTab === 'saved' && renderSavedTab()}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default PasswordGenerator; 
import { ToastAndroid, Platform, Alert } from 'react-native';
import ToastService from './ToastService';

/**
 * Implementação do serviço Toast para dispositivos móveis
 * Usa ToastAndroid no Android e Alert no iOS
 */
class MobileToastService extends ToastService {
  /**
   * Exibe uma mensagem toast no dispositivo móvel
   * @param {string} message - Mensagem a ser exibida
   * @param {string} type - Tipo de toast (success, error, info, warning)
   * @param {number} duration - Duração em ms
   */
  show(message, type = 'info', duration = 2000) {
    if (Platform.OS === 'android') {
      // Android usa ToastAndroid nativo
      const androidDuration = duration > 2000 
        ? ToastAndroid.LONG 
        : ToastAndroid.SHORT;
      
      ToastAndroid.show(message, androidDuration);
    } else if (Platform.OS === 'ios') {
      // iOS não tem toast nativo, então usamos Alert
      // Alert é uma implementação simples, em prod você provavelmente usaria
      // uma lib mais sofisticada como react-native-toast-message
      
      // Apenas para mensagens curtas de sucesso/info, usa Alert sem botões
      // que some automaticamente após um curto período
      if (['success', 'info'].includes(type) && message.length < 60) {
        const timer = 1500; // Tempo para mostrar o Alert
        Alert.alert(
          type === 'success' ? 'Sucesso' : 'Informação',
          message,
          [], // Sem botões
          { cancelable: true }
        );
        
        // Fechar o Alert automaticamente
        setTimeout(() => {
          // Este hack tenta fechar o Alert programaticamente
          // Não é ideal, mas funciona para casos simples
          Alert.alert('', '', [], { cancelable: true });
        }, timer);
      } else {
        // Para mensagens mais longas ou importantes, mostra um Alert com botão de OK
        const title = 
          type === 'success' ? 'Sucesso' :
          type === 'error' ? 'Erro' :
          type === 'warning' ? 'Atenção' : 'Informação';
          
        Alert.alert(
          title,
          message,
          [{ text: 'OK' }],
          { cancelable: true }
        );
      }
    }
  }
}

export default MobileToastService; 
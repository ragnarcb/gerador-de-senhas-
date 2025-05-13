/**
 * Classe base para serviço de toast
 * Esta é uma interface que será implementada por plataformas específicas
 */
class ToastService {
  /**
   * Exibe uma mensagem toast
   * @param {string} message - Mensagem a ser exibida
   * @param {string} type - Tipo de toast (success, error, info, warning)
   * @param {number} duration - Duração em ms (padrão: 2000ms)
   */
  show(message, type = 'info', duration = 2000) {
    throw new Error('Método show() deve ser implementado pela plataforma específica');
  }
  
  /**
   * Exibe uma mensagem de sucesso
   * @param {string} message - Mensagem a ser exibida
   * @param {number} duration - Duração em ms (padrão: 2000ms)
   */
  success(message, duration = 2000) {
    this.show(message, 'success', duration);
  }
  
  /**
   * Exibe uma mensagem de erro
   * @param {string} message - Mensagem a ser exibida
   * @param {number} duration - Duração em ms (padrão: 3000ms)
   */
  error(message, duration = 3000) {
    this.show(message, 'error', duration);
  }
  
  /**
   * Exibe uma mensagem de informação
   * @param {string} message - Mensagem a ser exibida
   * @param {number} duration - Duração em ms (padrão: 2000ms)
   */
  info(message, duration = 2000) {
    this.show(message, 'info', duration);
  }
  
  /**
   * Exibe uma mensagem de alerta
   * @param {string} message - Mensagem a ser exibida
   * @param {number} duration - Duração em ms (padrão: 2500ms)
   */
  warning(message, duration = 2500) {
    this.show(message, 'warning', duration);
  }
}

export default ToastService; 
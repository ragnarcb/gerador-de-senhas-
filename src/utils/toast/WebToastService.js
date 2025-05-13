import ToastService from './ToastService';

/**
 * Implementação do serviço Toast para ambiente web
 * Cria elementos DOM temporários para simular toasts
 */
class WebToastService extends ToastService {
  constructor() {
    super();
    this.container = null;
    this.createContainer();
  }
  
  /**
   * Cria o container para os toasts se ainda não existir
   */
  createContainer() {
    // Em um ambiente React puro, precisamos verificar se estamos no navegador
    if (typeof document !== 'undefined' && !this.container) {
      // Verifica se o container já existe
      let container = document.getElementById('toast-container');
      
      if (!container) {
        // Cria um novo container
        container = document.createElement('div');
        container.id = 'toast-container';
        
        // Estiliza o container
        Object.assign(container.style, {
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: '9999',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end'
        });
        
        // Adiciona ao body
        document.body.appendChild(container);
      }
      
      this.container = container;
    }
  }
  
  /**
   * Exibe uma mensagem toast no ambiente web
   * @param {string} message - Mensagem a ser exibida
   * @param {string} type - Tipo de toast (success, error, info, warning)
   * @param {number} duration - Duração em ms
   */
  show(message, type = 'info', duration = 2000) {
    // Se não estamos em um ambiente web, apenas loga a mensagem
    if (typeof document === 'undefined') {
      console.log(`[${type.toUpperCase()}] ${message}`);
      return;
    }
    
    // Garante que temos um container
    this.createContainer();
    
    // Cria o elemento toast
    const toast = document.createElement('div');
    
    // Define as cores baseadas no tipo
    let backgroundColor, textColor, borderColor;
    switch (type) {
      case 'success':
        backgroundColor = '#4CAF50';
        borderColor = '#43A047';
        textColor = '#FFFFFF';
        break;
      case 'error':
        backgroundColor = '#F44336';
        borderColor = '#E53935';
        textColor = '#FFFFFF';
        break;
      case 'warning':
        backgroundColor = '#FF9800';
        borderColor = '#FB8C00';
        textColor = '#FFFFFF';
        break;
      case 'info':
      default:
        backgroundColor = '#4A86E8';
        borderColor = '#3367D6';
        textColor = '#FFFFFF';
    }
    
    // Estiliza o toast
    Object.assign(toast.style, {
      padding: '10px 20px',
      margin: '5px 0',
      backgroundColor,
      color: textColor,
      borderRadius: '4px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
      opacity: '0',
      transition: 'opacity 0.3s, transform 0.3s',
      transform: 'translateX(50px)',
      maxWidth: '300px',
      wordWrap: 'break-word',
      borderLeft: `5px solid ${borderColor}`
    });
    
    // Define o conteúdo
    toast.textContent = message;
    
    // Adiciona ao container
    this.container.appendChild(toast);
    
    // Anima a entrada
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove após a duração especificada
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      
      // Remove o elemento após a animação
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duration);
  }
}

export default WebToastService; 
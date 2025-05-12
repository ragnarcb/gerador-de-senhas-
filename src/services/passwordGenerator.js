/**
 * Serviço para geração de senhas seguras e avaliação de força
 */

/**
 * Gera uma senha aleatória com base nas opções fornecidas
 * @param {number} length - Comprimento da senha (entre 6-32)
 * @param {boolean} includeUppercase - Incluir letras maiúsculas
 * @param {boolean} includeLowercase - Incluir letras minúsculas
 * @param {boolean} includeNumbers - Incluir números
 * @param {boolean} includeSymbols - Incluir símbolos especiais
 * @returns {string} Senha gerada
 */
export const generatePassword = (
  length = 12,
  includeUppercase = true,
  includeLowercase = true,
  includeNumbers = true,
  includeSymbols = true
) => {
  // Caracteres disponíveis para cada categoria
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = '0123456789';
  const symbolChars = '!@#$%^&*()_-+={}[]|:;<>,.?/~`"\'\\';

  // Garantir pelo menos um comprimento mínimo e máximo de senha
  const safeLength = Math.max(6, Math.min(32, length));
  
  // Construir o conjunto de caracteres disponíveis
  let availableChars = '';
  if (includeUppercase) availableChars += uppercaseChars;
  if (includeLowercase) availableChars += lowercaseChars;
  if (includeNumbers) availableChars += numberChars;
  if (includeSymbols) availableChars += symbolChars;
  
  // Se nenhuma opção foi selecionada, usar letras minúsculas por padrão
  if (!availableChars) availableChars = lowercaseChars;

  // Gerar senha
  let password = '';
  
  // Garantir que pelo menos um caracter de cada tipo selecionado esteja presente
  if (includeUppercase) {
    const randomChar = uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
    password += randomChar;
  }
  
  if (includeLowercase) {
    const randomChar = lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
    password += randomChar;
  }
  
  if (includeNumbers) {
    const randomChar = numberChars[Math.floor(Math.random() * numberChars.length)];
    password += randomChar;
  }
  
  if (includeSymbols) {
    const randomChar = symbolChars[Math.floor(Math.random() * symbolChars.length)];
    password += randomChar;
  }
  
  // Completar o restante da senha com caracteres aleatórios
  while (password.length < safeLength) {
    const randomIndex = Math.floor(Math.random() * availableChars.length);
    password += availableChars[randomIndex];
  }
  
  // Embaralhar a senha para melhor aleatoriedade
  password = password.split('').sort(() => 0.5 - Math.random()).join('');

  return password;
};

/**
 * Avalia a força da senha
 * @param {string} password - Senha para avaliar
 * @returns {number} Pontuação da força (0-100)
 */
export const evaluatePasswordStrength = (password) => {
  if (!password) return 0;
  
  let score = 0;
  
  // Comprimento (até 35 pontos)
  score += Math.min(35, password.length * 3);
  
  // Variedade de caracteres (até 65 pontos)
  if (/[A-Z]/.test(password)) score += 15; // Maiúsculas
  if (/[a-z]/.test(password)) score += 10; // Minúsculas
  if (/[0-9]/.test(password)) score += 15; // Números
  if (/[^A-Za-z0-9]/.test(password)) score += 20; // Símbolos
  
  // Complexidade adicional
  if (/[A-Z].*[A-Z]/.test(password)) score += 2; // Mais de uma maiúscula
  if (/[a-z].*[a-z]/.test(password)) score += 2; // Mais de uma minúscula
  if (/[0-9].*[0-9]/.test(password)) score += 2; // Mais de um número
  if (/[^A-Za-z0-9].*[^A-Za-z0-9]/.test(password)) score += 4; // Mais de um símbolo
  
  return Math.min(100, Math.round(score));
}; 
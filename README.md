# 🔐 Gerador de Senhas Seguras

Um aplicativo moderno para geração de senhas seguras e aleatórias, desenvolvido com React Native (Expo) para o frontend e Node.js para o backend. Ideal para criar e gerenciar senhas fortes para suas contas online.

---

## ✨ Funcionalidades

- **Geração de senhas robustas**: Algoritmo avançado que garante senhas aleatórias e seguras
- **Análise de força**: Indicador visual que avalia a qualidade da sua senha em tempo real
- **Personalização**: Opções para incluir letras maiúsculas, minúsculas, números e símbolos especiais
- **Histórico de senhas**: Armazena as últimas 15 senhas geradas para fácil recuperação
- **Cópia rápida**: Copie senhas para a área de transferência com apenas um toque
- **Interface intuitiva**: Design moderno e fácil de usar, com feedback visual para todas as ações
- **Login e cadastro de usuários**


---

## 🚀 Como Rodar o Projeto

### 1. Pré-requisitos

- Node.js (versão 14.0 ou superior)
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- SQLite (banco de dados local)
- Extensão [SQLite](https://marketplace.visualstudio.com/items?itemName=alexcvzz.vscode-sqlite) para VSCode (opcional, mas recomendada para visualizar e editar o banco)
- Smartphone com Expo Go ou emulador Android/iOS

### 2. Rodando o Backend (API)

1. Acesse a pasta do backend (ex: `cd backend`)
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor:
   ```bash
   npm start
   # ou
   node index.js
   ```
4. O backend irá rodar por padrão em `http://localhost:8089` e utiliza um banco SQLite (`database.sqlite`) na raiz do projeto backend.

> **Dica:** Use a extensão do VSCode para abrir e visualizar o arquivo `database.sqlite` facilmente.

### 3. Rodando o Frontend (App Mobile)

1. Acesse a pasta do frontend (ex: `cd frontend` ou `cd gerador-de-senhas-`)
2. Instale as dependências:
   ```bash
   npm install
   # ou
   yarn
   ```
3. Inicie o projeto Expo:
   ```bash
   expo start
   ```
4. Abra o app Expo Go no seu celular e escaneie o QR Code, ou rode em um emulador.

> **Importante:**
> - Certifique-se de que o backend está rodando **antes** de usar o app.
> - Se estiver usando emulador Android, o endereço do backend pode precisar ser `http://10.0.2.2:8089`.
> - Para web, use `http://127.0.0.1:8089`.

---

## 🔍 Avaliação de Segurança

O aplicativo utiliza um sofisticado sistema de avaliação de senhas que analisa:

- **Comprimento**: Senhas mais longas recebem pontuações mais altas
- **Diversidade de caracteres**: Uso de maiúsculas, minúsculas, números e símbolos especiais
- **Complexidade**: Bonificação para senhas com múltiplos tipos de caracteres
- **Classificação visual**: Indicador colorido (vermelho, amarelo, verde claro e verde escuro)

---

## 🗄️ Banco de Dados SQLite

- O backend utiliza SQLite para armazenar usuários e senhas salvas.
- O arquivo do banco é criado automaticamente na raiz do backend (`database.sqlite`).
- Para visualizar, editar ou exportar dados, utilize a extensão [SQLite](https://marketplace.visualstudio.com/items?itemName=alexcvzz.vscode-sqlite) no VSCode.

---

## ❓ Dúvidas



---

Desenvolvido por [Raganar] (https://github.com/ragnarcb).

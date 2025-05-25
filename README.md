# 🔐 Gerador de Senhas Seguras

Um aplicativo completo para geração e gerenciamento de senhas seguras, desenvolvido com React Native (Expo) para o frontend e Flask (Python) para o backend. Ideal para criar, avaliar e armazenar senhas fortes para suas contas online.

## 📋 Índice
- [Funcionalidades](#-funcionalidades)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Requisitos](#-requisitos)
- [Instalação e Configuração](#-instalação-e-configuração)
  - [Backend (Python/Flask)](#backend-pythonflask)
  - [Frontend (React Native/Expo)](#frontend-react-nativeexpo)
- [Executando o Projeto](#-executando-o-projeto)
- [Endpoints da API](#-endpoints-da-api)
- [Banco de Dados](#-banco-de-dados)
- [Testes e Depuração](#-testes-e-depuração)
- [Contribuição](#-contribuição)
- [Licença](#-licença)

## ✨ Funcionalidades

- **Geração de senhas robustas**: Algoritmo avançado que garante senhas aleatórias e seguras
- **Análise de força**: Indicador visual que avalia a qualidade da sua senha em tempo real
- **Personalização**: Opções para incluir letras maiúsculas, minúsculas, números e símbolos especiais
- **Histórico de senhas**: Armazena as últimas senhas geradas para fácil recuperação
- **Cópia rápida**: Copie senhas para a área de transferência com apenas um toque
- **Interface intuitiva**: Design moderno e fácil de usar, com feedback visual para todas as ações
- **Sistema de autenticação**: Login e cadastro de usuários para armazenar senhas com segurança

## 🔧 Tecnologias Utilizadas

### Backend:
- **Python 3.8+**
- **Flask**: Framework web
- **SQLAlchemy**: ORM para banco de dados
- **Flask-Login**: Gerenciamento de autenticação
- **SQLite**: Banco de dados relacional

### Frontend:
- **React Native**: Framework para desenvolvimento mobile
- **Expo**: Plataforma para simplificar o desenvolvimento React Native
- **Axios**: Cliente HTTP para requisições à API
- **AsyncStorage**: Armazenamento local de dados
- **React Navigation**: Navegação entre telas

## 📁 Estrutura do Projeto

O projeto está dividido em duas partes principais:

### `/backpy` - Backend Python/Flask
```
backpy/
│
├── app/                  # Código principal da aplicação Flask
│   ├── models/           # Modelos do banco de dados
│   ├── routes/           # Rotas da API
│   ├── templates/        # Templates HTML (se houver)
│   ├── forms/            # Formulários (se usados)
│   └── __init__.py       # Configuração da aplicação Flask
│
├── instance/             # Instância do banco de dados SQLite
├── venv/                 # Ambiente virtual Python (criado durante a instalação)
├── requirements.txt      # Dependências do projeto
├── migrate_db.bat        # Script para recriar o banco de dados
└── run.py                # Script para iniciar o servidor Flask
```

### `/front` - Frontend React Native/Expo
```
front/
│
├── src/
│   ├── components/       # Componentes reutilizáveis
│   ├── services/         # Serviços para comunicação com a API
│   ├── utils/            # Utilitários e contextos
│   └── views/            # Telas da aplicação
│
├── assets/               # Recursos estáticos (imagens, fontes, etc.)
├── App.js                # Componente principal da aplicação
├── app.json              # Configurações do Expo
├── package.json          # Dependências e scripts npm
└── index.js              # Ponto de entrada da aplicação
```

## 📋 Requisitos

### Backend (Python/Flask):
- Python 3.8 ou superior
- pip (gerenciador de pacotes Python)
- SQLite

### Frontend (React Native/Expo):
- Node.js 14.0 ou superior
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Smartphone com Expo Go instalado ou emulador Android/iOS

## 🚀 Instalação e Configuração

### Backend (Python/Flask)

1. Clone o repositório:
   ```bash
   git clone https://github.com/ragnarcb/gerador-de-senhas-.git
   cd gerador-de-senhas-
   ```

2. Acesse a pasta do backend:
   ```bash
   cd backpy
   ```

3. Crie e ative um ambiente virtual, se quiser pode apenas executar pip install -r requirements.txt:
   - No Windows:
     ```bash
     python -m venv venv
     venv\Scripts\activate
     ```
   - No macOS/Linux:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

4. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```

### Banco de Dados

O projeto utiliza SQLite como banco de dados, que é um banco de dados leve e não requer instalação de servidor. O banco de dados já está criado e configurado com alguns dados de exemplo para facilitar os testes.

#### Dados de Exemplo
O banco já contém um usuário de teste que pode ser usado para login:
- **Usuário**: teste
- **Senha**: 1234

#### Localização do Banco de Dados
O arquivo do banco de dados está localizado em:
```
backpy/instance/database.db
```

#### Recriando o Banco de Dados
Se você precisar recriar o banco de dados do zero, siga as instruções abaixo de acordo com seu sistema operacional:

##### Windows
1. Abra o Prompt de Comando (CMD) ou PowerShell
2. Navegue até a pasta do backend:
   ```bash
   cd backpy
   ```
3. Execute o script de migração:
   ```bash
   python migrate_db.py
   ```

##### macOS/Linux
1. Abra o Terminal
2. Navegue até a pasta do backend:
   ```bash
   cd backpy
   ```
3. Execute o script de migração:
   ```bash
   python3 migrate_db.py
   ```

#### Visualizando o Banco de Dados
Para visualizar e gerenciar o banco de dados, você pode usar:

1. **DB Browser for SQLite** (Recomendado):
   - Download: [https://sqlitebrowser.org/](https://sqlitebrowser.org/)
   - Instruções:
     1. Instale o DB Browser for SQLite
     2. Abra o programa
     3. Clique em "Abrir Banco de Dados"
     4. Navegue até `backpy/instance/database.db`

2. **Extensão SQLite para VSCode**:
   - Instale a extensão "SQLite" do VSCode
   - Clique com o botão direito no arquivo `database.db`
   - Selecione "Open Database"

#### Estrutura do Banco de Dados
O banco de dados contém as seguintes tabelas:

1. **users**
   - id (INTEGER, PRIMARY KEY)
   - username (TEXT, UNIQUE)
   - email (TEXT, UNIQUE)
   - password_hash (TEXT)
   - created_at (DATETIME)

2. **passwords**
   - id (INTEGER, PRIMARY KEY)
   - user_id (INTEGER, FOREIGN KEY)
   - password (TEXT)
   - created_at (DATETIME)

> **Nota**: Ao recriar o banco de dados, todos os dados existentes serão perdidos. Faça backup se necessário.

### Frontend (React Native/Expo)

1. Acesse a pasta do frontend:
   ```bash
   cd front
   ```

2. Instale as dependências:
   ```bash
   npm install
   # ou
   yarn install
   ```

3. Verifique a configuração do arquivo API:
   - Abra o arquivo de configuração da API (geralmente em `src/services/api.js`)
   - Certifique-se de que o endereço da API está apontando corretamente para o backend

## 🖥️ Executando o Projeto

### 1. Inicie o Backend (API)

1. Na pasta `backpy`, com o ambiente virtual ativado:
   ```bash
   python run.py
   ```

2. O servidor Flask será iniciado em `http://0.0.0.0:8089` (acessível em `http://localhost:8089`)

### 2. Inicie o Frontend (App)

1. Na pasta `front`:
   ```bash
   npx expo start
   # ou
   npm start
   # ou 
   yarn start
   ```

2. Será exibido um QR Code no terminal.

3. Para testar no seu dispositivo:
   - Escaneie o QR Code com o aplicativo Expo Go (disponível na Play Store ou App Store)
   - Certifique-se de que seu dispositivo e o computador estão na mesma rede Wi-Fi

4. Para testar em um emulador:
   - Pressione `a` no terminal para abrir no emulador Android

> **Importante para Conexão com Backend:**
> - Se estiver usando um dispositivo físico, o endereço da API deverá ser o IP da sua máquina na rede local (ex: `http://192.168.1.100:8089`)
> - Para emulador Android, use `http://10.0.2.2:8089`
> - Para web, use `http://localhost:8089`
> - Esse projeto pode ter interferencias do firewall, se isso ocorrer, desative o firewall ou adicione uma exceção para a porta 8089.

## 🔌 Endpoints da API

O backend disponibiliza os seguintes endpoints:

- **`GET /`**: Verificação de status da API
- **`POST /auth/login`**: Login de usuário
- **`POST /auth/register`**: Registro de novo usuário
- **`POST /api/generate`**: Gerar nova senha
- **`GET /api/passwords`**: Listar senhas salvas (requer autenticação)
- **`POST /api/passwords`**: Salvar senha (requer autenticação)
- **`DELETE /api/passwords/id`**: Excluir senha (requer autenticação)

### Visualização do Banco de Dados

Para visualizar o banco de dados SQLite, você pode usar:
- Extensão [SQLite](https://marketplace.visualstudio.com/items?itemName=alexcvzz.vscode-sqlite) para VSCode
- Ferramenta [DB Browser for SQLite](https://sqlitebrowser.org/)


### Testando o Backend
1. Com o servidor Flask em execução, acesse `http://localhost:8089` em seu navegador ou use ferramentas como Postman para testar os endpoints da API.

---

Desenvolvido por [☠︎︎Ragnarcb☠︎︎](https://github.com/ragnarcb).

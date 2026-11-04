# Prospecção Inteligente de Clientes

<p align="center">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=js,react,nodejs,express,mongodb,figma" alt="Tecnologias Utilizadas" />
  </a>
</p>

> **Nota:** Projeto de Caráter Acadêmico<br>
> Desenvolvido para fins de estudo, pesquisa e demonstração prática de integração de sistemas, arquitetura de software móvel, consumo de APIs públicas governamentais e aplicação de Inteligência Artificial Generativa com Function Calling no contexto de negócios.

---

## 1. Objetivo e Problema de Negócio

Pequenas e médias empresas frequentemente enfrentam desafios na gestão de suas oportunidades comerciais. O controle de clientes e potenciais compradores (leads) costuma ser realizado de forma descentralizada e manual (planilhas soltas, blocos de notas ou mensagens em aplicativos), acarretando:
* Ausência de histórico consolidado e perda de contatos comerciais.
* Dificuldade em priorizar quais clientes possuem maior potencial de compra.
* Desperdício de tempo na digitação manual de dados cadastrais públicos.

Este projeto propõe uma aplicação móvel funcional conectada a um Backend BFF (Backend for Frontend) capaz de:
1. Centralizar o cadastro e o gerenciamento de empresas e oportunidades.
2. Agilizar o preenchimento cadastral consultando dados em tempo real nas APIs públicas BrasilAPI (CNPJ) e ViaCEP (endereçamento).
3. Utilizar a Google Gemini API com Function Calling para analisar os registros persistidos e auxiliar o vendedor na tomada de decisão comercial.
4. Manter padrões visuais e fluxo de navegação planejados previamente no Figma.

---

## 2. Tecnologias Utilizadas

### Design e Prototipagem
* **Figma:** Prototipação visual da interface, definição da paleta de cores institucional, tipografia e fluxo de navegação entre telas.

### Frontend (Mobile)
* **Framework:** React Native com Expo (SDK 58).
* **Linguagem:** JavaScript (ES6+).
* **Navegação:** React Navigation (Native Stack).
* **Gerenciamento de Estado e Sessão:** React Context API e AsyncStorage.
* **Cliente HTTP:** Axios com interceptors para token JWT e tratamento de erros de autenticação (HTTP 401).
* **Interface e Mídia:** `react-native-svg` (vetores), `@expo/vector-icons`, `@expo-google-fonts/inter`, `expo-image-picker`.

### Backend BFF
* **Ambiente de Execução:** Node.js com Express.
* **Banco de Dados:** MongoDB gerenciado via Mongoose.
* **Autenticação:** JSON Web Tokens (JWT) com senhas criptografadas via bcrypt / bcryptjs.
* **Inteligência Artificial:** SDK oficial `@google/genai` (modelo Gemini 2.5 Flash) configurado com ferramentas declaradas (Function Calling).
* **APIs Externas Integradas:** BrasilAPI (dados cadastrais de CNPJ) e ViaCEP (dados de logradouro).

---

## 3. Estrutura do Projeto

O projeto adota a arquitetura de monorepo, organizando o código em diretórios bem delimitados:

```text
prospeccao-clientes/
├── mobile/                      # Aplicação Móvel (React Native + Expo)
│   ├── assets/                  # Ícones, imagens e logotipos em SVG
│   ├── components/              # Componentes visuais reutilizáveis (Button, Input, Logo, AvatarPicker)
│   ├── hooks/                   # Hooks e provedores de contexto (useAuth.js)
│   ├── routes/                  # Configuração das rotas (index, auth e app)
│   ├── screens/                 # Telas da aplicação
│   │   ├── auth/                # Telas públicas (LoginScreen, RegisterScreen)
│   │   └── app/                 # Telas protegidas (Dashboard, ClientsList, ClientForm, etc.)
│   ├── services/                # Conexão HTTP centralizada (api.js com Axios)
│   ├── .env.example             # Modelo de variáveis de ambiente do app
│   └── package.json
│
├── backend/                     # Backend BFF (Node.js + Express)
│   ├── src/
│   │   ├── config/              # Conexão com banco de dados e ambiente
│   │   ├── controllers/         # Regras de negócio e manipuladores de rotas
│   │   ├── middlewares/         # Middleware de verificação de token JWT
│   │   ├── models/              # Modelos de dados do Mongoose (Usuário, Cliente)
│   │   ├── routes/              # Definição dos endpoints REST
│   │   ├── services/            # Módulos de integração (BrasilAPI, ViaCEP e Gemini IA)
│   │   └── utils/               # Declaração de ferramentas para Function Calling
│   ├── .env.example             # Modelo de credenciais do backend
│   └── package.json
│
├── escopo.md                    # Requisitos formais do projeto
├── README.md                    # Documentação técnica do projeto
└── .gitignore                   # Exclusão de arquivos locais e credenciais
```

---

## 4. Endpoints da API (Backend BFF)

O backend centraliza todas as operações de persistência e comunicação com terceiros:

| Método | Endpoint | Descrição | Autenticação JWT |
| :--- | :--- | :--- | :---: |
| POST | `/auth/register` | Cria uma nova conta de vendedor | Não |
| POST | `/auth/login` | Autentica o usuário e devolve o token JWT | Não |
| GET | `/dashboard` | Retorna os 5 indicadores comerciais calculados | Sim |
| GET | `/clients` | Lista clientes (com suporte a filtros e busca) | Sim |
| POST | `/clients` | Cadastra um novo cliente | Sim |
| GET | `/clients/:id` | Consulta os dados detalhados de um cliente | Sim |
| PUT | `/clients/:id` | Atualiza o registro de um cliente | Sim |
| DELETE | `/clients/:id` | Remove um cliente do sistema | Sim |
| GET | `/integrations/cnpj/:cnpj` | Consulta a BrasilAPI e extrai dados corporativos | Sim |
| GET | `/integrations/cep/:cep` | Consulta a ViaCEP e extrai dados de endereço | Sim |
| POST | `/ai/chat` | Processa perguntas comerciais via Gemini com Function Calling | Sim |

---

## 5. Inteligência Artificial e Function Calling

O projeto utiliza Function Calling através do SDK `@google/genai`. Ao invés de responder perguntas com dados estáticos, o modelo avalia a intenção da pergunta, aciona funções do backend para consultar o MongoDB do usuário e então formula a análise comercial.

### Fluxo de Execução:
1. O vendedor envia uma pergunta no aplicativo (ex.: "Quais clientes possuem maior potencial comercial?").
2. O Backend repassa a mensagem ao Gemini acompanhada da declaração das ferramentas disponíveis.
3. O modelo identifica a necessidade de consultar os dados e solicita a execução de uma função (ex.: `listarClientes`).
4. O Backend executa a busca real no MongoDB, respeitando o isolamento dos dados do usuário logado.
5. O resultado da consulta é devolvido ao modelo, que gera o parecer final.

### Funções Declaradas:
* `listarClientes`: Recebe filtros opcionais (nome, situação comercial, potencial de compra) e consulta o banco de dados.
* `consultarCliente`: Retorna os dados comerciais autorizados de um determinado cliente.
* `analisarOportunidades`: Avalia registros com base em critérios como score manual, potencial estimado e data do último contato.

> **Importante:** A chave secreta `GEMINI_API_KEY` permanece restrita ao backend. O frontend mobile nunca recebe ou armazena chaves privadas.

---

## 6. Variáveis de Ambiente e Configurações Manuais

Antes de iniciar a aplicação, é necessário gerar os arquivos `.env` a partir dos exemplos:

### A. Backend (`backend/.env`)
Execute no terminal:
```powershell
Copy-Item backend\.env.example backend\.env
```
Preencha as seguintes chaves:
* `PORT`: Porta de execução (exemplo: `3000`).
* `MONGODB_URI`: String de conexão local (`mongodb://127.0.0.1:27017/prospeccao_clientes`) ou Atlas.
* `JWT_SECRET`: Segredo criptográfico longo para assinatura dos tokens.
* `GEMINI_API_KEY`: Chave gerada no Google AI Studio (https://aistudio.google.com/apikey).
* `GEMINI_MODEL`: Identificador do modelo compatível (exemplo: `gemini-2.5-flash`).

### B. Mobile (`mobile/.env`)
Execute no terminal:
```powershell
Copy-Item mobile\.env.example mobile\.env
```
Ajuste a variável `EXPO_PUBLIC_API_URL` conforme o ambiente:
* **Expo Web:** `http://localhost:3000`
* **Emulador Android:** `http://10.0.2.2:3000`
* **Dispositivo Físico (Expo Go):** `http://<IP_DO_COMPUTADOR>:3000` (exemplo: `http://192.168.1.15:3000`).

---

## 7. Instruções de Execução (Windows / PowerShell)

Abra duas sessões do PowerShell:

### Sessão 1: Backend
```powershell
cd backend
npm install
npm run dev
```

### Sessão 2: Mobile
```powershell
cd mobile
npm install
npx expo start
```
* Digite `w` para abrir no navegador.
* Digite `a` para rodar no emulador Android conectado.
* Ou escaneie o QR Code no aplicativo Expo Go no celular físico.

---

## 8. Roteiro de Demonstração Acadêmica

1. **Autenticação e Segurança:**
   * Criar uma nova conta de vendedor na tela de registro.
   * Realizar o login e demonstrar o armazenamento do token JWT e redirecionamento automático para o painel restrito.
2. **Dashboard Comercial:**
   * Apresentar os 5 indicadores computados a partir dos dados do banco.
3. **Cadastro com Autopreenchimento:**
   * Acessar o formulário de cliente.
   * Informar um CNPJ válido e disparar a consulta para preenchimento de Razão Social, Nome Fantasia e Atividade Econômica via BrasilAPI.
   * Informar o CEP e demonstrar o preenchimento de endereço via ViaCEP.
   * Salvar e confirmar a presença do registro na listagem.
4. **Assistente de Prospecção (Gemini):**
   * Acessar o assistente de IA e realizar perguntas de priorização comercial.
   * Exibir no terminal do backend a execução real do Function Calling consultando o MongoDB.
5. **Encerramento de Sessão:**
   * Efetuar o logout e demonstrar o descarte do token e bloqueio das rotas protegidas.

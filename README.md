# Prospeccao Inteligente de Clientes

<p align="center">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=js,react,nodejs,express,mongodb,figma" alt="Tecnologias Utilizadas" />
  </a>
</p>

> **Nota:** Projeto de Carater Academico  
> Desenvolvido para fins de estudo, pesquisa e demonstracao pratica de integracao de sistemas, arquitetura de software movel, consumo de APIs publicas governamentais e aplicacao de Inteligencia Artificial Generativa com Function Calling no contexto de negocios.

---

## 1. Objetivo e Problema de Negocio

Pequenas e medias empresas frequentemente enfrentam desafios na gestao de suas oportunidades comerciais. O controle de clientes e potenciais compradores (leads) costuma ser realizado de forma descentralizada e manual (planilhas soltas, blocos de notas ou mensagens em aplicativos), acarretando:
* Ausencia de historico consolidado e perda de contatos comerciais.
* Dificuldade em priorizar quais clientes possuem maior potencial de compra.
* Desperdicio de tempo na digitacao manual de dados cadastrais publicos.

Este projeto propoe uma aplicacao movel funcional conectada a um Backend BFF (Backend for Frontend) capaz de:
1. Centralizar o cadastro e o gerenciamento de empresas e oportunidades.
2. Agilizar o preenchimento cadastral consultando dados em tempo real nas APIs publicas BrasilAPI (CNPJ) e ViaCEP (enderecamento).
3. Utilizar a Google Gemini API com Function Calling para analisar os registros persistidos e auxiliar o vendedor na tomada de decisao comercial.
4. Manter padroes visuais e fluxo de navegacao planejados previamente no Figma.

---

## 2. Tecnologias Utilizadas

### Design e Prototipagem
* **Figma:** Prototipacao visual da interface, definicao da paleta de cores institucional, tipografia e fluxo de navegacao entre telas.

### Frontend (Mobile)
* **Framework:** React Native com Expo (SDK 58).
* **Linguagem:** JavaScript (ES6+).
* **Navegacao:** React Navigation (Native Stack).
* **Gerenciamento de Estado e Sessao:** React Context API e AsyncStorage.
* **Cliente HTTP:** Axios com interceptors para token JWT e tratamento de erros de autenticacao (HTTP 401).
* **Interface e Midia:** `react-native-svg` (vetores), `@expo/vector-icons`, `@expo-google-fonts/inter`, `expo-image-picker`.

### Backend BFF
* **Ambiente de Execucao:** Node.js com Express.
* **Banco de Dados:** MongoDB gerenciado via Mongoose.
* **Autenticacao:** JSON Web Tokens (JWT) com senhas criptografadas via bcrypt / bcryptjs.
* **Inteligencia Artificial:** SDK oficial `@google/genai` (modelo Gemini 2.5 Flash) configurado com ferramentas declaradas (Function Calling).
* **APIs Externas Integradas:** BrasilAPI (dados cadastrais de CNPJ) e ViaCEP (dados de logradouro).

---

## 3. Estrutura do Projeto

O projeto adota a arquitetura de monorepo, organizando o codigo em diretorios bem delimitados:

```text
prospeccao-clientes/
├── mobile/                      # Aplicacao Movel (React Native + Expo)
│   ├── assets/                  # Icones, imagens e logotipos em SVG
│   ├── components/              # Componentes visuais reutilizaveis (Button, Input, Logo, AvatarPicker)
│   ├── hooks/                   # Hooks e Provedores de contexto (useAuth.js)
│   ├── routes/                  # Configuracao das rotas (index, auth e app)
│   ├── screens/                 # Telas da aplicacao
│   │   ├── auth/                # Telas publicas (LoginScreen, RegisterScreen)
│   │   └── app/                 # Telas protegidas (Dashboard, ClientsList, ClientForm, etc.)
│   ├── services/                # Conexao HTTP centralizada (api.js com Axios)
│   ├── .env.example             # Modelo de variaveis de ambiente do app
│   └── package.json
│
├── backend/                     # Backend BFF (Node.js + Express)
│   ├── src/
│   │   ├── config/              # Conexao com banco de dados e ambiente
│   │   ├── controllers/         # Regras de negocio e manipuladores de rotas
│   │   ├── middlewares/         # Middleware de verificacao de token JWT
│   │   ├── models/              # Modelos de dados do Mongoose (Usuario, Cliente)
│   │   ├── routes/              # Definicao dos endpoints REST
│   │   ├── services/            # Modulos de integracao (BrasilAPI, ViaCEP e Gemini IA)
│   │   └── utils/               # Declaracao de ferramentas para Function Calling
│   ├── .env.example             # Modelo de credenciais do backend
│   └── package.json
│
├── escopo.md                    # Requisitos formais do projeto
├── README.md                    # Documentacao tecnica do projeto
└── .gitignore                   # Exclusao de arquivos locais e credenciais
```

---

## 4. Endpoints da API (Backend BFF)

O backend centraliza todas as operacoes de persistencia e comunicacao com terceiros:

| Metodo | Endpoint | Descricao | Autenticacao JWT |
| :--- | :--- | :--- | :---: |
| POST | `/auth/register` | Cria uma nova conta de vendedor | Nao |
| POST | `/auth/login` | Autentica o usuario e devolve o token JWT | Nao |
| GET | `/dashboard` | Retorna os 5 indicadores comerciais calculados | Sim |
| GET | `/clients` | Lista clientes (com suporte a filtros e busca) | Sim |
| POST | `/clients` | Cadastra um novo cliente | Sim |
| GET | `/clients/:id` | Consulta os dados detalhados de um cliente | Sim |
| PUT | `/clients/:id` | Atualiza o registro de um cliente | Sim |
| DELETE | `/clients/:id` | Remove um cliente do sistema | Sim |
| GET | `/integrations/cnpj/:cnpj` | Consulta a BrasilAPI e extrai dados corporativos | Sim |
| GET | `/integrations/cep/:cep` | Consulta a ViaCEP e extrai dados de endereco | Sim |
| POST | `/ai/chat` | Processa perguntas comerciais via Gemini com Function Calling | Sim |

---

## 5. Inteligencia Artificial e Function Calling

O projeto utiliza Function Calling atraves do SDK `@google/genai`. Ao inves de responder perguntas com dados estaticos, o modelo avalia a intencao da pergunta, aciona funcoes do backend para consultar o MongoDB do usuario e entao formula a analise comercial.

### Fluxo de Execucao:
1. O vendedor envia uma pergunta no aplicativo (ex.: "Quais clientes possuem maior potencial comercial?").
2. O Backend repassa a mensagem ao Gemini acompanhada da declaracao das ferramentas disponiveis.
3. O modelo identifica a necessidade de consultar os dados e solicita a execucao de uma funcao (ex.: `listarClientes`).
4. O Backend executa a busca real no MongoDB, respeitando o isolamento dos dados do usuario logado.
5. O resultado da consulta e devolvido ao modelo, que gera o parecer final.

### Funcoes Declaradas:
* `listarClientes`: Recebe filtros opcionais (nome, situacao comercial, potencial de compra) e consulta o banco de dados.
* `consultarCliente`: Retorna os dados comerciais autorizados de um determinado cliente.
* `analisarOportunidades`: Avalia registros com base em criterios como score manual, potencial estimado e data do ultimo contato.

> **Importante:** A chave secreta `GEMINI_API_KEY` permanece restrita ao backend. O frontend mobile nunca recebe ou armazena chaves privadas.

---

## 6. Variaveis de Ambiente e Configuracoes Manuais

Antes de iniciar a aplicacao, e necessario gerar os arquivos `.env` a partir dos exemplos:

### A. Backend (`backend/.env`)
Execute no terminal:
```powershell
Copy-Item backend\.env.example backend\.env
```
Preencha as seguintes chaves:
* `PORT`: Porta de execucao (exemplo: `3000`).
* `MONGODB_URI`: String de conexao local (`mongodb://127.0.0.1:27017/prospeccao_clientes`) ou Atlas.
* `JWT_SECRET`: Segredo criptografico longo para assinatura dos tokens.
* `GEMINI_API_KEY`: Chave gerada no Google AI Studio (https://aistudio.google.com/apikey).
* `GEMINI_MODEL`: Identificador do modelo compativel (exemplo: `gemini-2.5-flash`).

### B. Mobile (`mobile/.env`)
Execute no terminal:
```powershell
Copy-Item mobile\.env.example mobile\.env
```
Ajuste a variavel `EXPO_PUBLIC_API_URL` conforme o ambiente:
* **Expo Web:** `http://localhost:3000`
* **Emulador Android:** `http://10.0.2.2:3000`
* **Dispositivo Fisico (Expo Go):** `http://<IP_DO_COMPUTADOR>:3000` (exemplo: `http://192.168.1.15:3000`).

---

## 7. Instrucoes de Execucao (Windows / PowerShell)

Abra duas sessoes do PowerShell:

### Sessao 1: Backend
```powershell
cd backend
npm install
npm run dev
```

### Sessao 2: Mobile
```powershell
cd mobile
npm install
npx expo start
```
* Digite `w` para abrir no navegador.
* Digite `a` para rodar no emulador Android conectado.
* Ou escaneie o QR Code no aplicativo Expo Go no celular fisico.

---

## 8. Roteiro de Demonstracao Academica

1. **Autenticacao e Seguranca:**
   * Criar uma nova conta de vendedor na tela de registro.
   * Realizar o login e demonstrar o armazenamento do token JWT e redirecionamento automatico para o painel restrito.
2. **Dashboard Comercial:**
   * Apresentar os 5 indicadores computados a partir dos dados do banco.
3. **Cadastro com Auto-preenchimento:**
   * Acessar o formulario de cliente.
   * Informar um CNPJ valido e disparar a consulta para preenchimento de Razao Social, Nome Fantasia e Atividade Economica via BrasilAPI.
   * Informar o CEP e demonstrar o preenchimento de endereco via ViaCEP.
   * Salvar e confirmar a presenca do registro na listagem.
4. **Assistente de Prospeccao (Gemini):**
   * Acessar o assistente de IA e realizar perguntas de priorizacao comercial.
   * Exibir no terminal do backend a execucao real do Function Calling consultando o MongoDB.
5. **Encerramento de Sessao:**
   * Efetuar o logout e demonstrar o descarte do token e bloqueio das rotas protegidas.

# Projeto Mobile: Cadastro e Prospecção Inteligente de Clientes

## 1. Objetivo do projeto
Desenvolva uma aplicação mobile funcional utilizando React Native com Expo, destinada ao cadastro, gerenciamento e prospecção de clientes empresariais.

O objetivo é solucionar um problema de negócio: pequenas empresas precisam organizar seus clientes e identificar quais oportunidades comerciais merecem maior atenção, mas muitas vezes fazem isso manualmente, sem centralização dos dados ou apoio à análise comercial.

A aplicação deverá permitir que um vendedor cadastre empresas, consulte informações empresariais por APIs externas, gerencie os registros e utilize inteligência artificial para analisar as oportunidades comerciais.

O projeto será utilizado em um trabalho acadêmico. Portanto, desenvolva uma solução simples, funcional, organizada e fácil de demonstrar. Não crie funcionalidades desnecessárias nem uma interface excessivamente elaborada.

**Importante:** implemente o projeto completo no workspace atual. Não entregue somente explicações, protótipos ou exemplos isolados de código.

Antes de começar, examine os arquivos existentes e preserve qualquer conteúdo relevante do projeto.

---

## 2. Tecnologias obrigatórias
Utilize as seguintes tecnologias:
- **Frontend:** React Native com Expo.
- **Linguagem principal:** JavaScript.
- **Backend BFF:** Node.js com Express.
- **Banco de dados:** MongoDB, utilizando Mongoose.
- **Autenticação:** JWT.
- **Criptografia de senhas:** bcrypt ou bcryptjs.
- **Inteligência artificial:** Gemini API, utilizando o SDK oficial `@google/genai`.
- **APIs externas:** BrasilAPI e ViaCEP.

Use versões compatíveis e estáveis das bibliotecas disponíveis no momento do desenvolvimento.

---

## Estrutura do projeto
Organize o projeto, preferencialmente, da seguinte maneira:
```text
prospeccao-clientes/
├── mobile/
│   ├── app/
│   ├── components/
│   ├── services/
│   ├── hooks/
│   ├── .env.example
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── middlewares/
│   │   ├── services/
│   │   └── utils/
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
└── README.md
```
Ajuste a estrutura conforme a necessidade, mantendo uma separação clara entre frontend, backend e persistência.

---

## 3. Autenticação de usuários
Implemente:
- Tela de login com e-mail e senha.
- Tela de cadastro de usuário, para permitir a criação da primeira conta.
- Validação dos campos obrigatórios.
- Autenticação utilizando JWT.
- Armazenamento seguro da sessão no dispositivo, utilizando uma solução compatível com Expo.
- Logout.
- Redirecionamento para o login quando o usuário não estiver autenticado.
- Proteção das rotas do backend por middleware de autenticação.

As senhas deverão ser armazenadas com hash, nunca em texto puro. Cada usuário deverá visualizar e manipular somente os registros aos quais possui acesso. Para simplificar o projeto, associe inicialmente cada cliente ao usuário responsável pelo cadastro. Não utilize usuários ou senhas fixos diretamente no código como mecanismo de autenticação.

---

## 4. Dashboard
Após o login, apresente um dashboard com os seguintes indicadores:
- Total de clientes cadastrados.
- Novos clientes cadastrados.
- Clientes com alto potencial comercial.
- Oportunidades que precisam de acompanhamento.
- Quantidade de clientes convertidos em vendas.

Os indicadores deverão ser calculados com base nos dados persistidos no MongoDB, e não apenas em valores fixos ou simulados.
Inclua atalhos para cadastrar clientes, consultar a lista de clientes e abrir o assistente de inteligência artificial.

---

## 5. Cadastro e gerenciamento de clientes
Implemente o CRUD completo: cadastrar, consultar, editar e excluir clientes.

O formulário deverá conter:
- Razão social.
- Nome fantasia, quando disponível.
- CNPJ.
- Situação cadastral da empresa.
- Atividade econômica principal, quando disponível.
- Telefone.
- E-mail comercial.
- CEP.
- Rua, número e complemento.
- Bairro, cidade e estado.
- Potencial de compra estimado.
- Score informado manualmente pelo usuário, quando disponível.
- Data da última interação comercial.
- Observações.
- Situação da prospecção.

Utilize as seguintes situações comerciais:
- Novo.
- Em prospecção.
- Em negociação.
- Convertido.
- Descartado.

O score deve ser um campo manual, com identificação da fonte e da data da informação, quando possível. Não implemente uma consulta fictícia à Serasa e não afirme que a aplicação possui integração com seus serviços.
Permita pesquisar clientes por nome, razão social ou CNPJ e filtrar registros pela situação comercial.
Antes de excluir um cliente, solicite confirmação ao usuário.

---

## 6. Integração com a BrasilAPI
Utilize a BrasilAPI para consultar informações empresariais a partir do CNPJ informado no cadastro.
- **Documentação:** https://brasilapi.com.br/docs
- **Endpoint:** `GET https://brasilapi.com.br/api/cnpj/v1/{cnpj}`

**Funcionamento esperado:**
1. O usuário informa o CNPJ.
2. A aplicação envia a solicitação ao backend.
3. O backend valida o formato e consulta a BrasilAPI.
4. O backend retorna apenas os dados necessários para o formulário.
5. O formulário preenche automaticamente as informações disponíveis.
6. O usuário confere os dados e completa os campos restantes antes de salvar.

Trate erros e indisponibilidade com mensagens compreensíveis.

---

## 7. Integração com a ViaCEP
Utilize a ViaCEP para consultar endereços brasileiros.
- **Documentação:** https://viacep.com.br/
- **Endpoint:** `GET https://viacep.com.br/ws/{cep}/json/`

**Funcionamento esperado:**
1. O usuário digita o CEP.
2. A aplicação solicita ao backend a consulta do CEP.
3. O backend consulta a ViaCEP.
4. A resposta preenche automaticamente rua, bairro, cidade e estado.
5. O usuário pode corrigir ou completar os dados antes de salvar.

As chamadas a essas APIs deverão ser centralizadas no backend, evitando espalhar URLs e regras de integração pelo código mobile.

---

## 8. Integração com a Gemini API e Function Calling
Integre o Gemini para criar um assistente de prospecção comercial.
- SDK oficial `@google/genai`, com chave de API exclusivamente no backend.
- Responde a perguntas sobre potencial comercial, acompanhamento, priorização e resumo geral.
- Tela simples de assistente (chat/campo de pergunta, botão enviar, área de respostas).

**Implementação obrigatória de Function Calling:**
1. `listarClientes`: Recebe filtros opcionais (nome, situação comercial, potencial de compra). Consulta banco de dados real do usuário autenticado.
2. `consultarCliente`: Recebe identificador de um cliente e retorna dados comerciais.
3. `analisarOportunidades`: Consulta registros e aplica critérios comerciais objetivos documentados no backend.

---

## 9. Backend BFF e persistência
O backend será o único responsável pelo acesso ao banco de dados e comunicação com serviços externos.

Endpoints:
```text
POST   /auth/register
POST   /auth/login

GET    /clients
POST   /clients
GET    /clients/:id
PUT    /clients/:id
DELETE /clients/:id

GET    /dashboard

GET    /integrations/cnpj/:cnpj
GET    /integrations/cep/:cep

POST   /ai/chat
```
Não implemente comunicação direta do aplicativo mobile com o MongoDB.

---

## 10. Variáveis de ambiente
- **Backend:**
  - `PORT=3000`
  - `MONGODB_URI=mongodb://127.0.0.1:27017/prospeccao_clientes`
  - `JWT_SECRET=...`
  - `GEMINI_API_KEY=...`
  - `GEMINI_MODEL=gemini-2.5-flash` (ou modelo compatível)
- **Frontend (Mobile):**
  - `EXPO_PUBLIC_API_URL=http://localhost:3000` (ou IP da máquina local para Expo Go)

Nunca exponha chaves secretas no mobile.

---

## 11. Interface e experiência do usuário (Mobile)
- Toda a interface em Português do Brasil.
- Simples, organizada e responsiva.
- Navegação clara entre: Dashboard, Clientes e Assistente de IA.
- Indicadores de carregamento (loaders).
- Mensagens de feedback (sucesso e erro compreensíveis).
- Confirmação antes de excluir registros.
- Validação de campos antes de submeter.


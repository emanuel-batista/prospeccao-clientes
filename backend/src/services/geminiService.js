const mongoose = require('mongoose');
const { GoogleGenAI } = require('@google/genai');
const geminiTools = require('../utils/geminiTools');

/**
 * Dados de exemplo usados apenas quando o banco MongoDB estiver desligado em teste local.
 */
const CLIENTES_EXEMPLO = [
  {
    _id: 'cli_1',
    razao_social: 'Tech Soluções Digitais Ltda',
    nomeFantasia: 'Tech Soluções',
    cnpj: '12.345.678/0001-90',
    situacao: 'Em Negociação',
    potencial_compra: 'Alto',
    score: 85,
    cep: '01310-100',
    rua: 'Avenida Paulista',
    numero: '1000',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    estado: 'SP',
    ultimaInteracao: '2026-10-20',
    observacoes: 'Cliente interessado no plano anual, aguardando proposta.',
  },
  {
    _id: 'cli_2',
    razao_social: 'Comércio de Alimentos Bom Sabor S.A.',
    nomeFantasia: 'Bom Sabor',
    cnpj: '98.765.432/0001-10',
    situacao: 'Novo',
    potencial_compra: 'Alto',
    score: 78,
    cep: '30130-110',
    rua: 'Praça Sete de Setembro',
    numero: '100',
    bairro: 'Centro',
    cidade: 'Belo Horizonte',
    estado: 'MG',
    ultimaInteracao: '2026-11-01',
    observacoes: 'Acabou de ser cadastrado via BrasilAPI.',
  },
  {
    _id: 'cli_3',
    razao_social: 'Logística Rápida Transportes Ltda',
    nomeFantasia: 'Logística Rápida',
    cnpj: '45.678.901/0001-22',
    situacao: 'Fechado',
    potencial_compra: 'Médio',
    score: 65,
    cep: '80010-000',
    rua: 'Rua XV de Novembro',
    numero: '500',
    bairro: 'Centro',
    cidade: 'Curitiba',
    estado: 'PR',
    ultimaInteracao: '2026-10-28',
    observacoes: 'Contrato fechado na semana passada.',
  },
];

/**
 * Busca somente os clientes pertencentes ao usuário autenticado.
 * Compatível com usuario_id (do Cliente.js do Paulo) e com userId/usuario.
 */
async function obterClientesDoUsuario(userId) {
  try {
    const Cliente = require('../models/Cliente');

    if (mongoose.connection.readyState === 1 && userId && userId !== 'usuario_teste_local') {
      const filtroUsuario = {
        $or: [
          { usuario_id: userId },
          { userId },
          { usuario: userId },
          { usuarioId: userId },
        ],
      };
      const clientes = await Cliente.find(filtroUsuario).lean();
      return clientes;
    }
  } catch (err) {
    // Caso o banco não esteja conectado, segue para os exemplos locais
  }

  return CLIENTES_EXEMPLO;
}

/**
 * Função 1 do Function Calling: listarClientes
 */
async function listarClientes(filtros = {}, userId) {
  const clientes = await obterClientesDoUsuario(userId);

  return clientes.filter((c) => {
    const nomeCliente = `${c.razao_social || c.razaoSocial || ''} ${c.nomeFantasia || ''}`.toLowerCase();
    const situacao = (c.situacao || c.situacaoComercial || c.status || '').toLowerCase();
    const potencial = (c.potencial_compra || c.potencialCompra || c.potencial || '').toLowerCase();

    if (filtros.nome && !nomeCliente.includes(filtros.nome.toLowerCase())) {
      return false;
    }
    if (filtros.situacaoComercial && !situacao.includes(filtros.situacaoComercial.toLowerCase())) {
      return false;
    }
    if (filtros.potencialCompra && !potencial.includes(filtros.potencialCompra.toLowerCase())) {
      return false;
    }
    return true;
  });
}

/**
 * Função 2 do Function Calling: consultarCliente
 */
async function consultarCliente({ identificador } = {}, userId) {
  const clientes = await obterClientesDoUsuario(userId);
  const termo = String(identificador || '').toLowerCase().trim();

  const encontrado = clientes.find((c) => {
    const id = String(c._id || c.id || '').toLowerCase();
    const cnpj = String(c.cnpj || '').replace(/\D/g, '');
    const termoNumerico = termo.replace(/\D/g, '');
    const razao = (c.razao_social || c.razaoSocial || '').toLowerCase();
    const fantasia = (c.nomeFantasia || '').toLowerCase();

    return (
      id === termo ||
      (termoNumerico && cnpj.includes(termoNumerico)) ||
      razao.includes(termo) ||
      fantasia.includes(termo)
    );
  });

  if (!encontrado) {
    return { encontrado: false, mensagem: 'Cliente não encontrado na carteira deste vendedor.' };
  }

  return { encontrado: true, cliente: encontrado };
}

/**
 * Função 3 do Function Calling: analisarOportunidades
 * Aplica critérios comerciais objetivos para priorizar clientes.
 */
async function analisarOportunidades(userId) {
  const clientes = await obterClientesDoUsuario(userId);

  // Filtra apenas clientes ativos (ignora Convertidos/Fechados e Descartados/Perdidos)
  const oportunidadesAtivas = clientes.filter((c) => {
    const status = (c.situacao || c.situacaoComercial || c.status || '').toLowerCase();
    return (
      !status.includes('convertid') &&
      !status.includes('fechad') &&
      !status.includes('descartad') &&
      !status.includes('perdid')
    );
  });

  const avaliadas = oportunidadesAtivas.map((c) => {
    let pontosPrioridade = 0;
    const motivos = [];

    const potencial = (c.potencial_compra || c.potencialCompra || c.potencial || '').toLowerCase();
    const score = Number(c.score || 0);
    const status = c.situacao || c.situacaoComercial || c.status || '';

    if (potencial === 'alto') {
      pontosPrioridade += 40;
      motivos.push('Potencial de compra Alto');
    } else if (potencial === 'médio' || potencial === 'medio') {
      pontosPrioridade += 20;
    }

    if (score >= 70) {
      pontosPrioridade += 30;
      motivos.push(`Score comercial elevado (${score})`);
    }

    if (status.toLowerCase().includes('negocia')) {
      pontosPrioridade += 20;
      motivos.push('Já está em fase de negociação');
    } else if (status.toLowerCase() === 'novo') {
      pontosPrioridade += 10;
      motivos.push('Cliente novo aguardando primeiro contato');
    }

    return {
      id: c._id,
      empresa: c.nomeFantasia || c.razao_social || c.razaoSocial,
      situacaoComercial: status,
      potencialCompra: c.potencial_compra || c.potencialCompra || c.potencial,
      score: score,
      ultimaInteracao: c.ultimaInteracao || c.updatedAt || 'Não informada',
      pontosPrioridade,
      motivosPriorizacao: motivos,
    };
  });

  avaliadas.sort((a, b) => b.pontosPrioridade - a.pontosPrioridade);

  return {
    totalClientesNaCarteira: clientes.length,
    totalOportunidadesAtivas: avaliadas.length,
    rankingPrioridade: avaliadas,
  };
}

/**
 * Executa a conversa com o Gemini utilizando Function Calling e contexto de histórico
 */
async function conversarComIA(mensagemUsuario, userId, historico = [], clientContext = null) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'coloque_sua_chave_do_google_ai_studio_aqui') {
    const erro = new Error(
      'A chave GEMINI_API_KEY não foi configurada no arquivo backend/.env.'
    );
    erro.statusCode = 500;
    throw erro;
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  let systemInstruction =
    'Você é um assistente comercial inteligente de prospecção de clientes B2B. ' +
    'Responda sempre em Português do Brasil, de forma objetiva, clara e útil para o vendedor. ' +
    'Sempre que o vendedor perguntar sobre seus clientes, oportunidades ou carteira, ' +
    'utilize as ferramentas disponíveis (listarClientes, consultarCliente, analisarOportunidades) ' +
    'para consultar os dados reais antes de responder.';

  if (clientContext) {
    const nomeCliente = typeof clientContext === 'string'
      ? clientContext
      : (clientContext.nomeFantasia || clientContext.razao_social || clientContext.razaoSocial || clientContext.name || '');
    if (nomeCliente) {
      systemInstruction += ` Contexto atual da tela: O vendedor está consultando o cliente "${nomeCliente}". Se o usuário fizer perguntas contextuais como "qual o CNPJ dele?", "qual a situação dele?" ou similares, assuma prioritariamente que ele se refere a "${nomeCliente}".`;
    }
  }

  // Monta histórico de conteúdos para o Gemini respeitando a ordem e roles ('user' e 'model')
  const contents = [];

  if (Array.isArray(historico)) {
    // Aplica janela deslizante com as últimas 10 mensagens para economizar tokens
    const historicoRecente = historico.slice(-10);

    for (const item of historicoRecente) {
      const role = (item.role === 'assistant' || item.role === 'model') ? 'model' : 'user';
      const text = String(item.text || item.content || '').trim();

      if (!text) continue;

      // O Gemini exige que a primeira mensagem do histórico venha do 'user'
      if (contents.length === 0 && role !== 'user') {
        continue;
      }

      // Se mensagens consecutivas tiverem o mesmo role, agrupa o texto
      const ultimo = contents[contents.length - 1];
      if (ultimo && ultimo.role === role) {
        ultimo.parts[0].text += `\n${text}`;
      } else {
        contents.push({
          role,
          parts: [{ text }],
        });
      }
    }
  }

  // Adiciona a pergunta atual do usuário no final do histórico
  const ultimo = contents[contents.length - 1];
  if (ultimo && ultimo.role === 'user') {
    ultimo.parts[0].text += `\n${mensagemUsuario}`;
  } else {
    contents.push({
      role: 'user',
      parts: [{ text: mensagemUsuario }],
    });
  }

  let response = await ai.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction,
      tools: [{ functionDeclarations: geminiTools }],
    },
  });

  if (response.functionCalls && response.functionCalls.length > 0) {
    const functionCall = response.functionCalls[0];
    const { name, args } = functionCall;

    console.log(`🤖 [Function Calling] Gemini acionou a função: ${name}`, args || {});

    let resultadoFuncao;
    if (name === 'listarClientes') {
      resultadoFuncao = await listarClientes(args, userId);
    } else if (name === 'consultarCliente') {
      resultadoFuncao = await consultarCliente(args, userId);
    } else if (name === 'analisarOportunidades') {
      resultadoFuncao = await analisarOportunidades(userId);
    } else {
      resultadoFuncao = { erro: 'Função desconhecida' };
    }

    contents.push(response.candidates[0].content);
    contents.push({
      role: 'user',
      parts: [
        {
          functionResponse: {
            name,
            response: { resultado: resultadoFuncao },
          },
        },
      ],
    });

    response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: geminiTools }],
      },
    });
  }

  return response.text || 'Não consegui gerar uma análise no momento.';
}

module.exports = {
  obterClientesDoUsuario,
  listarClientes,
  consultarCliente,
  analisarOportunidades,
  conversarComIA,
};

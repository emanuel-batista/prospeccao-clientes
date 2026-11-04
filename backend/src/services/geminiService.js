const mongoose = require('mongoose');
const { GoogleGenAI } = require('@google/genai');
const geminiTools = require('../utils/geminiTools');

/**
 * Dados de exemplo usados APENAS enquanto ainda não existe o models/Cliente.js
 * ou quando estiver testando sem o MongoDB ligado.
 * Assim que o models/Cliente.js existir e o banco conectar, o sistema usa o banco real!
 */
const CLIENTES_EXEMPLO = [
  {
    _id: 'cli_1',
    razaoSocial: 'Tech Soluções Digitais Ltda',
    nomeFantasia: 'Tech Soluções',
    cnpj: '12.345.678/0001-90',
    situacaoComercial: 'Em negociação',
    potencialCompra: 'Alto',
    score: 85,
    ultimaInteracao: '2026-10-20',
    observacoes: 'Cliente interessado no plano anual, aguardando proposta.',
  },
  {
    _id: 'cli_2',
    razaoSocial: 'Comércio de Alimentos Bom Sabor S.A.',
    nomeFantasia: 'Bom Sabor',
    cnpj: '98.765.432/0001-10',
    situacaoComercial: 'Novo',
    potencialCompra: 'Alto',
    score: 78,
    ultimaInteracao: '2026-11-01',
    observacoes: 'Acabou de ser cadastrado via BrasilAPI.',
  },
  {
    _id: 'cli_3',
    razaoSocial: 'Logística Rápida Transportes Ltda',
    nomeFantasia: 'Logística Rápida',
    cnpj: '45.678.901/0001-22',
    situacaoComercial: 'Convertido',
    potencialCompra: 'Médio',
    score: 65,
    ultimaInteracao: '2026-10-28',
    observacoes: 'Contrato fechado na semana passada.',
  },
];

/**
 * Busca somente os clientes pertencentes ao usuário autenticado.
 * Funciona independente de como nomeou o campo de dono (userId, usuario ou usuarioId).
 */
async function obterClientesDoUsuario(userId) {
  try {
    // Tenta carregar o modelo Cliente
    const Cliente = require('../models/Cliente');

    // Se o MongoDB estiver conectado, busca os registros reais do usuário logado
    if (mongoose.connection.readyState === 1 && userId && userId !== 'usuario_teste_local') {
      const filtroUsuario = {
        $or: [{ userId }, { usuario: userId }, { usuarioId: userId }, { user: userId }],
      };
      const clientes = await Cliente.find(filtroUsuario).lean();
      return clientes;
    }
  } catch (err) {
    // Se "../models/Cliente" ainda não foi criado, usa os exemplos locais para teste
  }

  return CLIENTES_EXEMPLO;
}

/**
 * Função 1 do Function Calling: listarClientes
 */
async function listarClientes(filtros = {}, userId) {
  const clientes = await obterClientesDoUsuario(userId);

  return clientes.filter((c) => {
    const nomeCliente = `${c.razaoSocial || ''} ${c.nomeFantasia || ''}`.toLowerCase();
    const situacao = (c.situacaoComercial || c.status || '').toLowerCase();
    const potencial = (c.potencialCompra || c.potencial || '').toLowerCase();

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
    const razao = (c.razaoSocial || '').toLowerCase();
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

  // Filtra apenas clientes ativos (ignora Convertidos e Descartados na fila de prospecção)
  const oportunidadesAtivas = clientes.filter((c) => {
    const status = (c.situacaoComercial || c.status || '').toLowerCase();
    return !status.includes('convertid') && !status.includes('descartad');
  });

  const avaliadas = oportunidadesAtivas.map((c) => {
    let pontosPrioridade = 0;
    const motivos = [];

    const potencial = (c.potencialCompra || c.potencial || '').toLowerCase();
    const score = Number(c.score || 0);
    const status = (c.situacaoComercial || c.status || '');

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
      empresa: c.nomeFantasia || c.razaoSocial,
      situacaoComercial: status,
      potencialCompra: c.potencialCompra || c.potencial,
      score: score,
      ultimaInteracao: c.ultimaInteracao || c.dataUltimaInteracao || 'Não informada',
      pontosPrioridade,
      motivosPriorizacao: motivos,
    };
  });

  // Ordena da maior prioridade para a menor
  avaliadas.sort((a, b) => b.pontosPrioridade - a.pontosPrioridade);

  return {
    totalClientesNaCarteira: clientes.length,
    totalOportunidadesAtivas: avaliadas.length,
    rankingPrioridade: avaliadas,
  };
}

/**
 * Executa a conversa com o Gemini utilizando Function Calling
 */
async function conversarComIA(mensagemUsuario, userId) {
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

  const systemInstruction =
    'Você é um assistente comercial inteligente de prospecção de clientes B2B. ' +
    'Responda sempre em Português do Brasil, de forma objetiva, clara e útil para o vendedor. ' +
    'Sempre que o vendedor perguntar sobre seus clientes, oportunidades ou carteira, ' +
    'utilize as ferramentas disponíveis (listarClientes, consultarCliente, analisarOportunidades) ' +
    'para consultar os dados reais antes de responder.';

  // Histórico da conversa desta requisição
  const contents = [{ role: 'user', parts: [{ text: mensagemUsuario }] }];

  // 1ª chamada ao Gemini: envia a pergunta + declaração das ferramentas
  let response = await ai.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction,
      tools: [{ functionDeclarations: geminiTools }],
    },
  });

  // Se o Gemini solicitar a execução de alguma função (Function Calling)
  if (response.functionCalls && response.functionCalls.length > 0) {
    const functionCall = response.functionCalls[0];
    const { name, args } = functionCall;

    console.log(`[Function Calling] Gemini acionou a função: ${name}`, args || {});

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

    // Adiciona o pedido do modelo e o resultado da função no histórico
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

    // 2ª chamada ao Gemini: entrega os dados do banco para ele montar a resposta final
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


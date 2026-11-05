/**
 * Cache em memória para consultas de CNPJ para evitar excesso de requisições e rate-limiting (HTTP 429)
 */
const cnpjCache = new Map();

/**
 * Serviço de integração com a BrasilAPI para consulta de CNPJ
 * Documentação: https://brasilapi.com.br/docs#tag/CNPJ
 */
async function consultarCnpj(cnpjBruto) {
  // 1. Deixa apenas os números (remove pontos, barra e traço)
  const cnpj = String(cnpjBruto || '').replace(/\D/g, '');

  // 2. Valida se o CNPJ tem 14 números
  if (cnpj.length !== 14) {
    const erro = new Error('CNPJ inválido. O CNPJ deve conter 14 números.');
    erro.statusCode = 400;
    throw erro;
  }

  // Se já consultado recentemente nesta sessão, devolve direto do cache
  if (cnpjCache.has(cnpj)) {
    return cnpjCache.get(cnpj);
  }

  // Cabeçalhos para evitar bloqueio do Cloudflare da BrasilAPI contra o User-Agent padrão do Node.js
  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    Accept: 'application/json',
  };

  // 3. Consulta a BrasilAPI
  const resposta = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, {
    headers,
  });

  if (resposta.status === 404 || resposta.status === 400) {
    const erroJson = await resposta.json().catch(() => ({}));
    const erro = new Error(
      erroJson.message || 'CNPJ não encontrado ou inválido na Receita Federal.'
    );
    erro.statusCode = 404;
    throw erro;
  }

  if (!resposta.ok) {
    console.warn(`BrasilAPI retornou status ${resposta.status}. Tentando espelho público de CNPJ...`);
    // Fallback de segurança caso o Cloudflare/servidor da BrasilAPI bloqueie ou caia durante a apresentação
    const respFallback = await fetch(`https://receitaws.com.br/v1/cnpj/${cnpj}`, { headers });
    if (respFallback.ok) {
      const fb = await respFallback.json();
      if (fb && fb.status !== 'ERROR') {
        const resultadoFallback = {
          cnpj: (fb.cnpj || cnpj).replace(/\D/g, ''),
          razaoSocial: fb.nome || '',
          nomeFantasia: fb.fantasia || '',
          situacaoCadastral: fb.situacao || '',
          atividadePrincipal: fb.atividade_principal?.[0]?.text || '',
          telefone: fb.telefone || '',
          email: fb.email || '',
          cep: (fb.cep || '').replace(/\D/g, ''),
          rua: fb.logradouro || '',
          numero: fb.numero || '',
          complemento: fb.complemento || '',
          bairro: fb.bairro || '',
          cidade: fb.municipio || '',
          estado: fb.uf || '',
        };
        cnpjCache.set(cnpj, resultadoFallback);
        return resultadoFallback;
      }
    }

    const erro = new Error(`Não foi possível consultar a BrasilAPI no momento (HTTP ${resposta.status}).`);
    erro.statusCode = 502;
    throw erro;
  }

  const dados = await resposta.json();

  // 4. Devolve apenas os dados limpos que o formulário do aplicativo usa
  const resultado = {
    cnpj: dados.cnpj || cnpj,
    razaoSocial: dados.razao_social || '',
    nomeFantasia: dados.nome_fantasia || '',
    situacaoCadastral: dados.descricao_situacao_cadastral || '',
    atividadePrincipal: dados.cnae_fiscal_descricao || '',
    telefone: dados.ddd_telefone_1 || '',
    email: dados.email || '',
    cep: dados.cep || '',
    rua: dados.logradouro || '',
    numero: dados.numero || '',
    complemento: dados.complemento || '',
    bairro: dados.bairro || '',
    cidade: dados.municipio || '',
    estado: dados.uf || '',
  };
  cnpjCache.set(cnpj, resultado);
  return resultado;
}

module.exports = { consultarCnpj };

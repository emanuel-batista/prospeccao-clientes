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

  // 3. Consulta a BrasilAPI
  const resposta = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);

  if (resposta.status === 404) {
    const erro = new Error('CNPJ não encontrado na base de dados.');
    erro.statusCode = 404;
    throw erro;
  }

  if (!resposta.ok) {
    const erro = new Error('Não foi possível consultar a BrasilAPI no momento.');
    erro.statusCode = 502;
    throw erro;
  }

  const dados = await resposta.json();

  // 4. Devolve apenas os dados limpos que o formulário do aplicativo usa
  return {
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
}

module.exports = { consultarCnpj };


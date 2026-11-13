/**
 * Cache em memória para consultas de CEP para evitar requisições repetidas e rate limiting.
 */
const cepCache = new Map();

/**
 * Serviço de integração com a ViaCEP e fallback para BrasilAPI (CEP)
 * Documentação ViaCEP: https://viacep.com.br/
 * Documentação BrasilAPI: https://brasilapi.com.br/docs#tag/CEP-V2
 */
async function consultarCep(cepBruto) {
  // 1. Deixa apenas os números (remove traços, pontos e espaços)
  const cep = String(cepBruto || '').replace(/\D/g, '');

  // 2. Valida se o CEP tem exatamente 8 números
  if (cep.length !== 8) {
    const erro = new Error('CEP inválido. O CEP deve conter 8 números.');
    erro.statusCode = 400;
    throw erro;
  }

  // Se já consultado nesta sessão, devolve direto do cache
  if (cepCache.has(cep)) {
    return cepCache.get(cep);
  }

  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    Accept: 'application/json',
  };

  try {
    // 3. Consulta a API pública do ViaCEP
    const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`, { headers });

    if (resposta.ok) {
      const dados = await resposta.json();

      // O ViaCEP retorna { erro: true } ou { erro: "true" } quando o CEP não existe
      if (dados.erro) {
        const erro = new Error('CEP não encontrado.');
        erro.statusCode = 404;
        throw erro;
      }

      // 4. Devolve apenas os campos padronizados que o formulário do app precisa
      const resultado = {
        cep: dados.cep || cep,
        rua: dados.logradouro || '',
        complemento: dados.complemento || '',
        bairro: dados.bairro || '',
        cidade: dados.localidade || '',
        estado: dados.uf || '',
      };

      cepCache.set(cep, resultado);
      return resultado;
    }
  } catch (errViaCep) {
    if (errViaCep.statusCode === 404) {
      throw errViaCep;
    }
    console.warn(`ViaCEP falhou (${errViaCep.message}). Tentando fallback BrasilAPI para CEP...`);
  }

  // Fallback para BrasilAPI caso o ViaCEP falhe ou esteja fora
  try {
    const respostaBrasilApi = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`, { headers });

    if (respostaBrasilApi.ok) {
      const dados = await respostaBrasilApi.json();
      const resultado = {
        cep: dados.cep || cep,
        rua: dados.street || '',
        complemento: '',
        bairro: dados.neighborhood || '',
        cidade: dados.city || '',
        estado: dados.state || '',
      };
      cepCache.set(cep, resultado);
      return resultado;
    }

    if (respostaBrasilApi.status === 404) {
      const erro = new Error('CEP não encontrado.');
      erro.statusCode = 404;
      throw erro;
    }
  } catch (errFallback) {
    if (errFallback.statusCode === 404) {
      throw errFallback;
    }
  }

  const erroFinal = new Error('Serviço de consulta de CEP indisponível no momento.');
  erroFinal.statusCode = 502;
  throw erroFinal;
}

module.exports = { consultarCep };

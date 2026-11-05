/**
 * Serviço de integração com a ViaCEP
 * Documentação: https://viacep.com.br/
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

  // 3. Consulta a API pública do ViaCEP
  const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

  if (!resposta.ok) {
    const erro = new Error('Serviço ViaCEP indisponível no momento.');
    erro.statusCode = 502;
    throw erro;
  }

  const dados = await resposta.json();

  // O ViaCEP retorna { erro: true } quando o CEP não existe
  if (dados.erro) {
    const erro = new Error('CEP não encontrado.');
    erro.statusCode = 404;
    throw erro;
  }

  // 4. Devolve apenas os campos que o formulário do app precisa
  return {
    cep: dados.cep || cep,
    rua: dados.logradouro || '',
    complemento: dados.complemento || '',
    bairro: dados.bairro || '',
    cidade: dados.localidade || '',
    estado: dados.uf || '',
  };
}

module.exports = { consultarCep };


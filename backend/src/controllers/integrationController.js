const { consultarCnpj } = require('../services/brasilApiService');
const { consultarCep } = require('../services/viaCepService');

/**
 * Controller das integrações externas: BrasilAPI (CNPJ) e ViaCEP (CEP)
 */
async function buscarCnpj(req, res) {
  try {
    const { cnpj } = req.params;
    const dadosEmpresa = await consultarCnpj(cnpj);
    return res.status(200).json(dadosEmpresa);
  } catch (error) {
    console.error('Erro ao consultar CNPJ:', error.message, error.cause || '');
    const status = error.statusCode || 500;
    return res.status(status).json({
      message: error.message || 'Erro ao consultar CNPJ.',
    });
  }
}

async function buscarCep(req, res) {
  try {
    const { cep } = req.params;
    const dadosEndereco = await consultarCep(cep);
    return res.status(200).json(dadosEndereco);
  } catch (error) {
    console.error('Erro ao consultar CEP:', error.message, error.cause || '');
    const status = error.statusCode || 500;
    return res.status(status).json({
      message: error.message || 'Erro ao consultar CEP.',
    });
  }
}

module.exports = {
  buscarCnpj,
  buscarCep,
};


const { obterClientesDoUsuario } = require('../services/geminiService');

/**
 * Controller do Dashboard Comercial com os 5 indicadores — [PESSOA 2]
 * Calcula as métricas em cima dos clientes do vendedor logado (compatível com Cliente.js do Paulo).
 */
async function obterIndicadores(req, res) {
  try {
    const userId = req.userId || req.user?.id || req.user?._id || 'usuario_teste_local';

    const clientes = await obterClientesDoUsuario(userId);

    // 1. Total de clientes cadastrados
    const total = clientes.length;

    // 2. Novos clientes cadastrados
    const novos = clientes.filter((c) => {
      const status = (c.situacao || c.situacaoComercial || c.status || '').toLowerCase();
      return status === 'novo';
    }).length;

    // 3. Clientes com alto potencial comercial (potencial "Alto" ou score >= 70)
    const altoPotencial = clientes.filter((c) => {
      const pot = (c.potencial_compra || c.potencialCompra || c.potencial || '').toLowerCase();
      const score = Number(c.score || 0);
      return pot === 'alto' || score >= 70;
    }).length;

    // 4. Oportunidades que precisam de acompanhamento (Em Contato, Em prospecção ou Em negociação)
    const acompanhamento = clientes.filter((c) => {
      const status = (c.situacao || c.situacaoComercial || c.status || '').toLowerCase();
      return (
        status.includes('contato') ||
        status.includes('prospec') ||
        status.includes('negocia') ||
        status.includes('acompanh')
      );
    }).length;

    // 5. Quantidade de clientes convertidos em vendas (Convertido ou Fechado)
    const convertidos = clientes.filter((c) => {
      const status = (c.situacao || c.situacaoComercial || c.status || '').toLowerCase();
      return status.includes('convertid') || status.includes('fechad');
    }).length;

    return res.status(200).json({
      total,
      novos,
      altoPotencial,
      acompanhamento,
      convertidos,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao carregar os indicadores do dashboard.',
      error: error.message,
    });
  }
}

module.exports = {
  obterIndicadores,
};

const { conversarComIA } = require('../services/geminiService');

/**
 * Controller do Assistente Comercial com IA (Gemini + Function Calling)
 */
async function chatComIA(req, res) {
  try {
    // Aceita "message", "pergunta" ou "prompt" enviados pelo frontend
    const mensagem = req.body.message || req.body.pergunta || req.body.prompt;

    if (!mensagem || !String(mensagem).trim()) {
      return res.status(400).json({
        message: 'Por favor, envie uma pergunta para o assistente.',
      });
    }

    // Garante que a IA consulte apenas os dados do usuário autenticado
    const userId = req.userId || req.user?.id || req.user?._id || 'usuario_teste_local';

    const resposta = await conversarComIA(String(mensagem).trim(), userId);

    return res.status(200).json({
      reply: resposta,
      response: resposta,
      message: resposta,
    });
  } catch (error) {
    console.error('Erro no /ai/chat:', error.message, error.cause || '');
    const status = error.statusCode || 500;
    const detalheCausa = error.cause ? ` (Detalhe: ${error.cause.code || error.cause.message || error.cause})` : '';
    return res.status(status).json({
      message: `${error.message || 'Erro ao processar sua pergunta na IA.'}${detalheCausa}`,
    });
  }
}

module.exports = {
  chatComIA,
};


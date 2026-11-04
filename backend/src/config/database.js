const mongoose = require('mongoose');

async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('MONGODB_URI não definida no .env. Rodando em modo de teste local.');
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log('Conectado ao MongoDB com sucesso!');
  } catch (error) {
    console.warn('Não foi possível conectar ao MongoDB agora:', error.message);
    console.warn('Dica: Suas rotas de CEP, CNPJ, Dashboard (modo teste) e IA continuarão funcionando para você testar!');
  }
}

module.exports = connectDatabase;


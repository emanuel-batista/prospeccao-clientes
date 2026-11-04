const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.warn('MONGODB_URI não definida no .env. Rodando em modo de teste local.');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB conectado com sucesso!');
  } catch (error) {
    console.warn('Não foi possível conectar ao MongoDB agora:', error.message);
  }
};

module.exports = connectDB;

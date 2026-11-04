const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB conectado com sucesso!');
    } catch (error) {
        console.error('Erro na conexão com o MongoDB:', error);
        process.exit(1);
    }
};

module.exports = connectDB;
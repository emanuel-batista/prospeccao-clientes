require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const integrationRoutes = require('./routes/integrationRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// Rota básica para testar se o servidor está no ar
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'API Prospecção de Clientes funcionando!' });
});

// Rotas da Pessoa 1 (Paulo)
app.use('/auth', authRoutes);
app.use('/clients', clientRoutes);

// Rotas da Pessoa 2 (Otávio)
app.use('/dashboard', dashboardRoutes);
app.use('/integrations', integrationRoutes);
app.use('/ai', aiRoutes);

module.exports = app;

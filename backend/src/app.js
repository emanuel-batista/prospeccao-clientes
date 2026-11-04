const express = require('express');
const cors = require('cors');

const dashboardRoutes = require('./routes/dashboardRoutes');
const integrationRoutes = require('./routes/integrationRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// Permite que o app mobile envie e receba JSON
app.use(cors());
app.use(express.json());

// Rota básica para testar se o servidor está no ar
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'API Prospecção de Clientes funcionando!' });
});

// Rotas (carregadas automaticamente assim que criar os arquivos)
try {
  const authRoutes = require('./routes/authRoutes');
  app.use('/auth', authRoutes);
} catch (err) {
  // authRoutes ainda não criado
}

try {
  const clientRoutes = require('./routes/clientRoutes');
  app.use('/clients', clientRoutes);
} catch (err) {
  // clientRoutes ainda não criado
}

// Rotas (Dashboard, Integrações e IA)
app.use('/dashboard', dashboardRoutes);
app.use('/integrations', integrationRoutes);
app.use('/ai', aiRoutes);

module.exports = app;


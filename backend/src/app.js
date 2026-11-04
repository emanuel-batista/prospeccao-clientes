require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/clients', clientRoutes);

// Aqui você montará as rotas da Pessoa 2 depois
// app.use('/dashboard', require('./routes/dashboardRoutes'));
// app.use('/integrations', require('./routes/integrationRoutes'));
// app.use('/ai', require('./routes/aiRoutes'));

module.exports = app;
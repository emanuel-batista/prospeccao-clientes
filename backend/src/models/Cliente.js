const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
    usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    cnpj: { type: String, required: true },
    razao_social: { type: String, required: true },
    potencial_compra: { type: String, enum: ['Alto', 'Médio', 'Baixo'], default: 'Médio' },
    score: { type: Number, default: 0 },
    situacao: { type: String, enum: ['Novo', 'Em Contato', 'Em Negociação', 'Fechado', 'Perdido'], default: 'Novo' },
    // Campos de Endereço integrados via CEP/ViaCEP
    cep: { type: String, default: '' },
    rua: { type: String, default: '' },
    numero: { type: String, default: '' },
    complemento: { type: String, default: '' },
    bairro: { type: String, default: '' },
    cidade: { type: String, default: '' },
    estado: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Cliente', clienteSchema);
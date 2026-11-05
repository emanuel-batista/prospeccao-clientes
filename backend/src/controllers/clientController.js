const Cliente = require('../models/Cliente');

exports.listar = async (req, res) => {
    const clientes = await Cliente.find({ usuario_id: req.userId });
    res.json(clientes);
};

exports.consultar = async (req, res) => {
    const cliente = await Cliente.findOne({ _id: req.params.id, usuario_id: req.userId });
    if (!cliente) return res.status(404).json({ erro: 'Cliente não encontrado' });
    res.json(cliente);
};

exports.cadastrar = async (req, res) => {
    try {
        const novoCliente = await Cliente.create({ ...req.body, usuario_id: req.userId });
        res.status(201).json(novoCliente);
    } catch (error) {
        res.status(400).json({ erro: 'Erro ao cadastrar cliente' });
    }
};

exports.editar = async (req, res) => {
    const cliente = await Cliente.findOneAndUpdate(
        { _id: req.params.id, usuario_id: req.userId }, 
        req.body, 
        { new: true }
    );
    if (!cliente) return res.status(404).json({ erro: 'Cliente não encontrado' });
    res.json(cliente);
};

exports.excluir = async (req, res) => {
    const cliente = await Cliente.findOneAndDelete({ _id: req.params.id, usuario_id: req.userId });
    if (!cliente) return res.status(404).json({ erro: 'Cliente não encontrado' });
    res.json({ mensagem: 'Cliente removido' });
};
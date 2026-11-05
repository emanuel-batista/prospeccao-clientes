const Usuario = require('../models/Usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { nome, email, senha } = req.body;
        const hashSenha = await bcrypt.hash(senha, 10);
        
        const novoUsuario = await Usuario.create({ nome, email, senha: hashSenha });
        res.status(201).json({ mensagem: 'Usuário criado com sucesso', id: novoUsuario._id });
    } catch (error) {
    console.error("ERRO NO REGISTRO:", error);
    res.status(400).json({ erro: 'Erro ao registrar usuário', detalhes: error.message });
}
};

exports.login = async (req, res) => {
    try {
        const { email, senha } = req.body;
        const usuario = await Usuario.findOne({ email });
        
        if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
            return res.status(401).json({ erro: 'Credenciais inválidas' });
        }

        const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, usuario: { id: usuario._id, nome: usuario.nome } });
    } catch (error) {
    console.error("ERRO REAL DETETADO:", error);
    res.status(500).json({ erro: 'Erro no login' });
}
};
const Usuario = require('../models/Usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const {
            name,
            nome,
            email,
            password,
            senha,
            companyName,
            empresa,
            document,
            documento,
        } = req.body;

        const userName = (name || nome || '').trim();
        const userEmail = (email || '').trim().toLowerCase();
        const userPassword = password || senha;
        const userCompany = (companyName || empresa || '').trim();
        const userDocument = (document || documento || '').trim();
        let userAvatar = req.file ? `/uploads/${req.file.filename}` : (req.body.avatarUri || req.body.foto || null);

        if (!userName) {
            return res.status(400).json({ message: 'Nome completo é obrigatório.', erro: 'Nome é obrigatório.' });
        }

        if (!userEmail || !userEmail.includes('@')) {
            return res.status(400).json({ message: 'E-mail válido é obrigatório.', erro: 'E-mail inválido.' });
        }

        if (!userPassword || userPassword.length < 6) {
            return res.status(400).json({ message: 'A senha deve conter no mínimo 6 caracteres.', erro: 'Senha fraca.' });
        }

        const existingUser = await Usuario.findOne({ email: userEmail });
        if (existingUser) {
            return res.status(400).json({ message: 'Este endereço de e-mail já está cadastrado.', erro: 'E-mail já cadastrado.' });
        }

        const hashedPassword = await bcrypt.hash(userPassword, 10);

        const newUser = await Usuario.create({
            name: userName,
            nome: userName,
            email: userEmail,
            password: hashedPassword,
            senha: hashedPassword,
            companyName: userCompany,
            document: userDocument,
            avatarUri: userAvatar,
        });

        const userPayload = {
            id: newUser._id,
            name: newUser.name || newUser.nome,
            email: newUser.email,
            companyName: newUser.companyName || '',
            document: newUser.document || '',
            avatarUri: newUser.avatarUri || null,
        };

        return res.status(201).json({
            message: 'Usuário criado com sucesso',
            mensagem: 'Usuário criado com sucesso',
            id: newUser._id,
            user: userPayload,
            usuario: userPayload,
        });
    } catch (error) {
        console.error('ERRO NO REGISTRO:', error);
        return res.status(400).json({
            message: error.message || 'Erro ao registrar usuário.',
            erro: error.message || 'Erro ao registrar usuário.',
        });
    }
};

exports.login = async (req, res) => {
    try {
        const email = (req.body.email || '').trim().toLowerCase();
        const password = req.body.password || req.body.senha;

        if (!email || !password) {
            return res.status(400).json({
                message: 'E-mail e senha são obrigatórios.',
                erro: 'E-mail e senha são obrigatórios.',
            });
        }

        const user = await Usuario.findOne({ email });
        const userStoredPassword = user ? (user.password || user.senha) : null;

        if (!user || !userStoredPassword || !(await bcrypt.compare(password, userStoredPassword))) {
            return res.status(401).json({
                message: 'Credenciais inválidas',
                erro: 'Credenciais inválidas',
            });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        const userPayload = {
            id: user._id,
            name: user.name || user.nome,
            email: user.email,
            companyName: user.companyName || '',
            document: user.document || '',
            avatarUri: user.avatarUri || null,
        };

        return res.json({
            token,
            user: userPayload,
            usuario: userPayload,
        });
    } catch (error) {
        console.error('ERRO REAL DETECTADO:', error);
        return res.status(500).json({
            message: 'Erro no login',
            erro: 'Erro no login',
        });
    }
};
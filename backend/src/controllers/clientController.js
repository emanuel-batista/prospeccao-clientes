const Cliente = require('../models/Cliente');
const { consultarCep } = require('../services/viaCepService');

exports.listar = async (req, res) => {
    try {
        const clientes = await Cliente.find({ usuario_id: req.userId }).sort({ createdAt: -1 });
        res.json(clientes);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao listar clientes' });
    }
};

exports.consultar = async (req, res) => {
    try {
        const cliente = await Cliente.findOne({ _id: req.params.id, usuario_id: req.userId });
        if (!cliente) return res.status(404).json({ erro: 'Cliente não encontrado' });
        res.json(cliente);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao consultar cliente' });
    }
};

exports.cadastrar = async (req, res) => {
    try {
        const dados = { ...req.body, usuario_id: req.userId };

        // Se o CEP foi informado mas rua ou cidade não foram preenchidos,
        // o backend consulta a API de CEP para auto-completar o endereço antes de salvar
        if (dados.cep) {
            const cepLimpo = String(dados.cep).replace(/\D/g, '');
            if (cepLimpo.length === 8 && (!dados.rua || !dados.cidade)) {
                try {
                    const infoCep = await consultarCep(cepLimpo);
                    if (infoCep) {
                        dados.rua = dados.rua || infoCep.rua || '';
                        dados.bairro = dados.bairro || infoCep.bairro || '';
                        dados.cidade = dados.cidade || infoCep.cidade || '';
                        dados.estado = dados.estado || infoCep.estado || '';
                        dados.complemento = dados.complemento || infoCep.complemento || '';
                    }
                } catch (errCep) {
                    // Falha não-bloqueante: salva os dados enviados sem interromper o cadastro
                    console.warn('Auto-enriquecimento de CEP falhou no cadastro:', errCep.message);
                }
            }
        }

        const novoCliente = await Cliente.create(dados);
        res.status(201).json(novoCliente);
    } catch (error) {
        res.status(400).json({ erro: 'Erro ao cadastrar cliente', detalhe: error.message });
    }
};

exports.editar = async (req, res) => {
    try {
        const dados = { ...req.body };

        // Se alterou o CEP e não forneceu rua/cidade, enriquece via CEP
        if (dados.cep) {
            const cepLimpo = String(dados.cep).replace(/\D/g, '');
            if (cepLimpo.length === 8 && (!dados.rua || !dados.cidade)) {
                try {
                    const infoCep = await consultarCep(cepLimpo);
                    if (infoCep) {
                        dados.rua = dados.rua || infoCep.rua || '';
                        dados.bairro = dados.bairro || infoCep.bairro || '';
                        dados.cidade = dados.cidade || infoCep.cidade || '';
                        dados.estado = dados.estado || infoCep.estado || '';
                        dados.complemento = dados.complemento || infoCep.complemento || '';
                    }
                } catch (errCep) {
                    console.warn('Auto-enriquecimento de CEP falhou na edição:', errCep.message);
                }
            }
        }

        const cliente = await Cliente.findOneAndUpdate(
            { _id: req.params.id, usuario_id: req.userId }, 
            dados, 
            { new: true }
        );
        if (!cliente) return res.status(404).json({ erro: 'Cliente não encontrado' });
        res.json(cliente);
    } catch (error) {
        res.status(400).json({ erro: 'Erro ao atualizar cliente', detalhe: error.message });
    }
};

exports.excluir = async (req, res) => {
    try {
        const cliente = await Cliente.findOneAndDelete({ _id: req.params.id, usuario_id: req.userId });
        if (!cliente) return res.status(404).json({ erro: 'Cliente não encontrado' });
        res.json({ mensagem: 'Cliente removido' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao excluir cliente' });
    }
};

const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware); // Protege todas as rotas de clientes abaixo

router.get('/', clientController.listar);
router.post('/', clientController.cadastrar);
router.get('/:id', clientController.consultar);
router.put('/:id', clientController.editar);
router.delete('/:id', clientController.excluir);

module.exports = router;
const express = require('express');
const router = express.Router();
const { obterIndicadores } = require('../controllers/dashboardController');

// Tenta usar o authMiddleware; se ainda não existir, usa um temporário para teste
let protegerRota = (req, res, next) => {
  req.userId = 'usuario_teste_local';
  next();
};

try {
  const middlewarePessoa1 = require('../middlewares/authMiddleware');
  protegerRota =
    typeof middlewarePessoa1 === 'function'
      ? middlewarePessoa1
      : middlewarePessoa1.authMiddleware || protegerRota;
} catch (err) {
  // Middleware ainda não foi criado; segue com o modo de teste
}

// GET /dashboard
router.get('/', protegerRota, obterIndicadores);

module.exports = router;


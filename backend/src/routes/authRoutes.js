const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const multer = require('multer');

// Configuração simples do Multer para guardar na pasta 'uploads/'
const upload = multer({ dest: 'uploads/' }); 

// O middleware upload.single('foto') vai procurar um arquivo enviado com a chave 'foto'
router.post('/register', upload.single('foto'), authController.register);
router.post('/login', authController.login);

module.exports = router;
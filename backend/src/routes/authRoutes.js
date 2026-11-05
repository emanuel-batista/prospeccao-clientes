const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Garante que o diretório 'uploads' exista
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Armazenamento com preservação de extensão
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname || '') || '.jpg';
        cb(null, `avatar-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Limite defensivo de 5MB
});

// Middleware tolerante que aceita upload multipart nos campos 'avatar' ou 'foto', ou requisições JSON puras
const handleAvatarUpload = (req, res, next) => {
    upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'foto', maxCount: 1 }])(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: 'Erro no processamento da imagem.', erro: err.message });
        }
        if (req.files) {
            req.file = req.files['avatar']?.[0] || req.files['foto']?.[0] || null;
        }
        next();
    });
};

router.post('/register', handleAvatarUpload, authController.register);
router.post('/login', authController.login);

module.exports = router;
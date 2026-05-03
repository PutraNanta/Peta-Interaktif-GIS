const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const pointController = require('../controllers/pointController');
const masterController = require('../controllers/masterController');
const authMiddleware = require('../middleware/authMiddleware');

// === Public Endpoints ===
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/points', pointController.getAllPoints);
router.get('/tipe', masterController.getAllMasterTipes);

// === Private Endpoints (Wajib Login) ===
router.post('/points', authMiddleware, pointController.createPoint);
router.put('/points/:id', authMiddleware, pointController.updatePoint);
router.delete('/points/:id', authMiddleware, pointController.deletePoint);

module.exports = router;

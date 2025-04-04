const express = require('express');
const { uploadFile } = require('../controllers/uploadController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

const router = express.Router();

// Protected routes for file uploads
router.post('/:type', auth, checkRole(['instructor', 'admin']), uploadFile);

module.exports = router; 
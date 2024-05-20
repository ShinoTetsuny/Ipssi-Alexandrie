const express = require('express');
const router = express.Router();
const ResgristrationController = require('../controllers/registration');

router.post('/register', ResgristrationController.register);
router.post('/login', ResgristrationController.login);

module.exports = router;
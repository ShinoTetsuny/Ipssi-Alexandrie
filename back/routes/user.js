const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user');
const { verifyUser, checkAdmin } = require('../middleware/middleware.js')

router.post('/', UserController.createUser);
router.get('/', UserController.getAllUsers);
router.get('/:id', verifyUser ,UserController.getUser);
router.get('/email/:email', UserController.getUserByEmail);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

module.exports = router;
const express = require('express');
const UserController = require('../controllers/UserController');

const router = express.Router();

router.post('/login', UserController.loginUser);
router.get('/getAll', UserController.getAllUser);

module.exports = router;

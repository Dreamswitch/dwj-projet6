const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');
const requestLimiter = require('../modules/requestLimiter');


router.post('/signup', userCtrl.signup);
router.post('/login',requestLimiter, userCtrl.login);

module.exports = router;
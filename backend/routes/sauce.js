const express = require('express');
const router = express.Router();
const sauceControler = require('../controllers/sauce');
const requestLimiter = require('../modules/requestLimiter');
const auth = require('../modules/auth');
const multer = require('../modules/multer-configuration');

router.post('/', auth, multer,requestLimiter, sauceControler.createSauce);
router.post('/:id/like',/* requestLimiter, */ sauceControler.likeSauce);
router.get('/', auth, sauceControler.getAllSauce);
router.get('/:id', auth, sauceControler.getOneSauce);
router.put('/:id', auth, multer,requestLimiter, sauceControler.modifySauce);
router.delete('/:id', auth, sauceControler.deleteSauce);

module.exports = router;
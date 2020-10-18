const express = require('express');
const router = express.Router();
const sauceControler = require('../controllers/sauce');
const auth = require('../modules/auth');
const multer = require('../modules/multer-configuration');

router.post('/', auth, multer, sauceControler.createSauce);
router.post('/:id/like', sauceControler.likeSauce);
router.get('/', auth, sauceControler.getAllSauce);
router.get('/:id', auth, sauceControler.getOneSauce);
router.put('/:id', auth, multer, sauceControler.modifySauce);
router.delete('/:id', auth, sauceControler.deleteSauce);

module.exports = router;
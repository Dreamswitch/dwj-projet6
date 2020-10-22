const multer = require('multer');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

const storage = multer.diskStorage({
/*   fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'image/jpg' || file.mimetype !== 'image/jpeg' || file.mimetype !== 'image/png') {
      req.fileValidationError = 'goes wrong on the mimetype';
      return cb(null, false, new Error('goes wrong on the mimetype'));
    } else {
      cb(null, true);
    }
  }, */
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  }

});

module.exports = multer({ storage: storage }).single('image');
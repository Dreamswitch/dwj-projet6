const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const signInValidationSchema = require('../modules/SignInValidationSchema');

exports.signup = async (req, res, next) => {
    try {
        const isValid = await signInValidationSchema.validateAsync(req.body);
        if (isValid) {
          bcrypt.hash(req.body.password, 10)
          .then(hash => {
            const user = new User({
              email: req.body.email,
              password: hash
            });
            user.save()
              .then(() => res.status(201).json({ message: 'user registred' }))
              .catch(error => res.status(400).json({ error }));
          })
          .catch(error => res.status(500).json({ error }));
    
        } else {
            throw 'Invalid user ID';
        }
    } catch {
        res.status(401).json({error: 'Invalid request!'});
    }
};

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
      }
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
          }
          console.log('user connected');
          res.status(200).json({
            userId: user._id,
            token: jwt.sign( //appel de la methode sign() de jsonWebToken
              { userId: user._id },//objet que l'on va encoder
              'RANDOM_TOKEN_SECRET',//ce qui va servir à encoder l'objet
              { expiresIn: '24h' } //expiration du token
            )
          });

        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};
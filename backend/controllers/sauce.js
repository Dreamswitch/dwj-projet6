const Sauce = require('../models/Sauce');
const fs = require('fs');
const safeSauceControl = require('../modules/safeSauceControl');


exports.createSauce = async (req, res, next) => {

    const save = newSauce => {
        newSauce.save()
            .then(newSauce => res.status(201).json({ message: "sauce créée" }))
            .catch(error => res.status(400).json({ error }));
    }
    if (req.body.sauce) {
        try {
            if (req.file.mimetype !== 'image/jpg' && req.file.mimetype !== 'image/jpeg' && req.file.mimetype !== 'image/png') {
                console.log(req.file.mimetype)
                res.status(401).json({ error: 'invalid file format uploaded' });
            }
            const sauceObject = JSON.parse(req.body.sauce);
            const isValid = await safeSauceControl.validateAsync(sauceObject);
            if (isValid) {
                delete sauceObject._id;
                const sauce = new Sauce({
                    ...sauceObject,
                    likes: 0,
                    dislikes: 0,
                    usersLiked: [],
                    usersDisliked: [],
                    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
                });
                save(sauce);
            } else {
                throw new Error('invalid data syntax');
            }

        } catch (error) {
            res.status(401).json({ error });
        }
    } else {
        res.status(400);
    }
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

exports.modifySauce = async (req, res, next) => {
    try {
        let sauceObject;
        if (req.file) {
            if (req.file.mimetype === 'image/jpg' || req.file.mimetype === 'image/jpeg' || req.file.mimetype === 'image/png') {

                console.log(req.file)
                const sauce = await Sauce.findOne({ _id: req.params.id });
                //ici on supprime l'ancienne image
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    console.log('old image deleted & replaced');
                });
                //ici on injecte la nouvelle image dans sauceObject
                sauceObject = { ...JSON.parse(req.body.sauce), imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` };
            } else {
                res.status(400).json({ error: 'non mais oh' });
            }
        } else {
            const isValid = await safeSauceControl.validateAsync({...req.body});
            if (isValid) {
                sauceObject = { ...req.body };
            } else {
                throw new Error(':p')
            }
        }
        Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'modified' }))
            .catch(error => res.status(400).json({ error }));
    } catch (error) {
        res.status(400).json({ error });
    }
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'sauce deleted !' }))
                    .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
};

exports.getAllSauce = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json(error));
};

exports.likeSauce = async (req, res, next) => {
    const sauce = await Sauce.findOne({ _id: req.params.id });
    const user = { id: `${req.body.userId}` };
    const isUserLiked = await sauce.usersLiked.filter(user => { return user.id === req.body.userId });
    const isUserDisliked = await sauce.usersDisliked.filter(user => { return user.id === req.body.userId });
    if (isUserLiked.length) { // if user has already like the sauce
        if (req.body.like === 0) { // if 0, user unvoted
            sauce.likes--;
            const alreadyVoted = await sauce.usersLiked.filter(user => { return user.id !== req.body.userId });
            sauce.usersLiked = alreadyVoted;
        } else if (req.body.like === -1) { // if -1 , user has changed his point of view and now dislike
            sauce.likes--;
            sauce.dislikes++;
            const alreadyVoted = await sauce.usersLiked.filter(user => { return user.id !== req.body.userId });
            sauce.usersLiked = alreadyVoted;
            sauce.usersDisliked.push(user);
        } else {
            console.log('you have already liked');
            res.status(200);
        }
    } else if (isUserDisliked.length) { // if user has already dislike the sauce
        if (req.body.like === 0) { // if 0, user unvoted
            sauce.dislikes--;
            const alreadyVoted = await sauce.usersDisliked.filter(user => { return user.id !== req.body.userId });
            sauce.usersDisliked = alreadyVoted;
        } else if (req.body.like === 1) { // if +1 , user has changed his point of view and now like
            sauce.dislikes--;
            sauce.likes++;
            const alreadyVoted = await sauce.usersDisliked.filter(user => { return user.id !== req.body.userId });
            sauce.usersDisliked = alreadyVoted;
            sauce.usersLiked.push(user);
        } else {
            console.log('you have already disliked');
            res.status(200);
        }
    } else {
        if (req.body.like === 1) {
            sauce.likes++;
            sauce.usersLiked.push(user);
        } else {
            sauce.dislikes++;
            sauce.usersDisliked.push(user);
        }
    }
    sauce.save()
        .then(() => res.status(201).json({ message: "sauce liked" }))
        .catch(error => res.status(400).json({ error }));
};

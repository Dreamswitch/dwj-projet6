const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {

    const save = newSauce => {
        newSauce.save()
            .then(newSauce => res.status(201).json({ message: "sauce créée" }))
            .catch(error => res.status(400).json({ error }));
    }

    if (req.body.sauce) {
        const sauceObject = JSON.parse(req.body.sauce);
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
        const sauceObject = req.body;
        delete sauceObject._id;
        const sauce = new Sauce({
            userId: sauceObject.userId,
            name: sauceObject.name,
            manufacturer: sauceObject.manufacturer,
            description: sauceObject.description,
            mainPepper: sauceObject.mainPepper,
            heat: sauceObject.heat,
            imageUrl: "",
            likes: 0,
            dislikes: 0,
            usersLiked: [],
            usersDisliked: [],
        });
        save(sauce);
    }
};


exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

exports.modifySauce = async (req, res, next) => {
    let sauceObject;
    if (req.file) {
        const sauce = await Sauce.findOne({ _id: req.params.id });
        //ici on supprime l'ancienne image
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
            console.log('contenu effacé');
        });
        //ici on injecte la nouvelle image dans sauceObject
        sauceObject = { ...JSON.parse(req.body.sauce), imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` };

    } else {
        sauceObject = { ...req.body };
    }
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'sauce modifié' }))
        .catch(error => res.status(400).json({ error }));
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

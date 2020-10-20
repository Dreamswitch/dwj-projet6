const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');
const path = require('path');
const helmet = require("helmet");
const dotenv = require('dotenv').config();



mongoose.connect(process.env.DB_USER_PROD, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex : true
})
    .then(() => { console.log('connexion db ok') })
    .catch(() => { console.log('db not connected') });


const app = express();
app.use(bodyParser.json());
app.use(helmet());


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});



app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

app.use('/images', express.static(path.join(__dirname, 'images')));


module.exports = app;
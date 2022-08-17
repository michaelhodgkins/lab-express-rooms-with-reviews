const { Router } = require('express');
const router = new Router();
const User = require('../models/User.model');
const { isLoggedIn, isLoggedOut } = require('../middleware/route-guard.js');

const bcryptjs = require('bcryptjs');
const saltRounds = 10;

router.get('/signup', (req, res) => res.render('auth/signup'));

router.get('/userProfile', (req, res) => { res.render('users/user-profiles', { userInSession: req.session.currentUser });
});

router.post('/signup', (req, res, next) => {
    const { username, password } = req.body;

    bcryptjs
    .genSalt(saltRounds)
    .then(salt => bcryptjs.hash(password, salt))
    .then(hashedPassword => {
        return User.create({
            username,
            passwordHash: hashedPassword
        });
    })
    .then(userFromDB => {
        res.redirect('/userProfile');
    })
    .catch(error => next(error));
});

router.get('/login', (req, res) => res.render('auth/login'));

router.post('/login', (req, res, next) => {
    console.log('SESSION =====> ', req.session);
    const { username, password } = req.body;

    if (username === '' || password === ''){
        res.render('auth/login',{
            errorMessage: 'Please enter both.'
        });
        return;
    }

    User.findOne({ username })
    .then(user => {
        if(!user) {
            res.render('auth/login', { errorMessage: 'Email is not registered'});
            return;
        } else if (bcryptjs.compareSync(password, user.passwordHash)) {
            req.session.currentUser = user;
            res.redirect('userProfile');
          } else {
            res.render('auth/login', { errorMessage: 'Incorrect password.' });
          }
        })
        .catch(error => next(error));
    });

    router.post('/logout', (req, res, next) => {
        req.session.destroy(err => {
            if (err) next(err);
            res.redirect('/');
        });
    });
module.exports = router;
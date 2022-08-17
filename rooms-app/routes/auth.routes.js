const { Router } = require('express');
const router = new Router();
const User = require('../models/User.model');
const { isLoggedIn, isLoggedOut } = require('../middleware/route-guard.js');

const bcryptjs = require('bcryptjs');
const saltRounds = 10;

router.get('/signup', isLoggedOut, (req, res) => res.render('auth/signup'));

router.get('/userProfile', isLoggedIn, (req, res) => { res.render('users/user-profiles', { userInSession: req.session.currentUser });
});

router.post('/signup', isLoggedOut, (req, res, next) => {
    const { email, password, fullname} = req.body;

    bcryptjs
    .genSalt(saltRounds)
    .then(salt => bcryptjs.hash(password, salt))
    .then(hashedPassword => {
        return User.create({
            email,
            password: hashedPassword,
            fullname
        });
    })
    .then(userFromDB => {
        req.session.currentUser = userFromDB;
        res.redirect('/userProfile');
    })
    .catch(error => next(error));
});

router.get('/login', isLoggedOut, (req, res) => res.render('auth/login'));

router.post('/login', isLoggedOut, (req, res, next) => {
    console.log('SESSION =====> ', req.session);
    const { email, password } = req.body;

    if (email === '' || password === ''){
        res.render('auth/login',{
            errorMessage: 'Please enter both.'
        });
        return;
    }

    User.findOne({ email })
    .then(user => {
        if(!user) {
            res.render('auth/login', { errorMessage: 'Email is not registered'});
            return;
        } else if (bcryptjs.compareSync(password, user.password)) {
            req.session.currentUser = user;
            res.redirect('userProfile');
          } else {
            res.render('auth/login', { errorMessage: 'Incorrect password.' });
          }
        })
        .catch(error => next(error));
    });

    router.post('/logout', isLoggedIn, (req, res, next) => {
        req.session.destroy(err => {
            if (err) next(err);
            res.redirect('/');
        });
    });
module.exports = router;
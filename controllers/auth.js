const User = require('../models/user');
const bcrypt = require('bcryptjs');

exports.getLogin = (req, res, next) => {
    if (req.session.user) {
        res.redirect('/')
    }
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: req.session.isLoggedIn,
        error: ''
    })
}

exports.getSignup = (req, res, next) => {
    if (req.session.user) {
        res.redirect('/')
    }
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        isAuthenticated: req.session.isLoggedIn,
        error: ''
    })
}

exports.postLogin = (req, res, next) => {
    const email = req.body.email.trim(),
          password = req.body.password.trim();

    const redirectOnAuthFailure = () => {
        return res.render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            isAuthenticated: req.session.isLoggedIn,
            error: 'Invalid email or password'
        })
    }

    User.findOne({ email })
        .then(user => {
            if (user) {
                bcrypt.compare(password, user.password)
                .then(match => {
                    if (match) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        req.session.save((err) => {
                            res.redirect('/');
                        })
                    } else {
                        redirectOnAuthFailure()
                    }
                })
                .catch(e => { redirectOnAuthFailure() })
            } else {
                redirectOnAuthFailure() 
            }

        })
        .catch(e => {
            redirectOnAuthFailure()
        });
}

exports.postSignup = (req, res, next) => {
    const email = req.body.email,
          password = req.body.password,
          confirmPassword = req.body.confirmPassword;

    // ::TODO -> validation

    User.findOne({ email })
       .then(userDocument => {
            if (userDocument) {
                return res.redirect('/signup');
            }
            return bcrypt.hash(password, 12)
            .then(harshedPassword => {
             const user = new User({
                 email,
                 name: email,
                 password: harshedPassword,
                 cart: {
                     items: []
                 }
             });
     
             return user.save()
            })
            .then(result => {
                res.redirect('/login')
            })
       })
       .catch(e => {
            res.redirect('/signup');
       })
}

exports.logout = (req, res, next) => {
    req.session.destroy((e) => {
        console.log('Error', e);
        res.redirect('/')
    })
}

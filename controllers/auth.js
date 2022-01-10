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

    User.findOne({ email })
        .then(user => {
            if (user) {
                req.session.isLoggedIn = true;
                req.session.user = user;
                req.session.save((err) => {
                    console.log(err)
                    res.redirect('/');
                })
            } else {
                res.render('auth/login', {
                    path: '/login',
                    pageTitle: 'Login',
                    isAuthenticated: req.session.isLoggedIn,
                    error: `No user with email ${email} was found`
                }) 
            }

        })
        .catch(e => {
            console.log(`No user with email ${email} was found`)
            res.render('auth/login', {
                path: '/login',
                pageTitle: 'Login',
                isAuthenticated: false,
                error: `No user with email ${email} was found`
            }) 
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
            return bcrypt.hash(password, 12);
       })
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
       .catch(e => {
           console.log(e)
       })

    
    // if (req.session.user) {
    //     res.redirect('/')
    // }
    // res.render('auth/signup', {
    //     path: '/signup',
    //     pageTitle: 'Signup',
    //     isAuthenticated: req.session.isLoggedIn,
    //     error: ''
    // })
}

exports.logout = (req, res, next) => {
    req.session.destroy((e) => {
        console.log('Error', e);
        res.redirect('/')
    })
}

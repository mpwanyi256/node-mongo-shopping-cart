const User = require('../models/user');

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

exports.postLogin = (req, res, next) => {
    const email = req.body.email.trim(),
          password = req.body.password.trim();

    User.findOne({ email })
        .then(user => {
            if (user) {
                req.session.isLoggedIn = true;
                req.session.user = user;
                res.redirect('/');
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

exports.logout = (req, res, next) => {
    req.session.destroy((e) => {
        console.log('Error', e);
        res.redirect('/')
    })
}

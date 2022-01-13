const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodeMailer = require('nodemailer');
const sendGridTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');

const transporter = nodeMailer.createTransport(sendGridTransport({
    auth: {
        api_key: process.env.SEND_GRID_API_KEY
    }
}))

exports.getLogin = (req, res, next) => {
    if (req.session.user) {
        res.redirect('/')
    }
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        error: req.flash('error')
    })
}

exports.getSignup = (req, res, next) => {
    if (req.session.user) {
        res.redirect('/')
    }
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        error: ''
    })
}

exports.postLogin = (req, res, next) => {
    const email = req.body.email.trim(),
          password = req.body.password.trim();

    const redirectOnAuthFailure = () => {
        req.flash('error', 'Invalid email or password.');
        res.redirect('/login');
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
                return transporter.sendMail({
                    to: email,
                    from: 'info@smartpos.com',
                    subject: 'Welcome To Smart POS',
                    html: '<h2>Your account was successfully created!.. Welcome aboard</h2>',

                })
            }).catch(e => {
                console.log('Email sending failed.');
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

exports.getResetPassword = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset password',
        error: message
    })
}

exports.postReset = (req, res, next) => {
    const userEmail = req.body.email;

    crypto.randomBytes(32, (error, buffer) => {
        if (error) {
            console.log('Error in crypto', error);
            return res.redirect('/reset');
        } 

        const token = buffer.toString('hex');

        // Find user by email
        User.findOne({ email: userEmail })
            .then(user => {
                if (!user) {
                    req.flash(`Sorry, no user with ${userEmail} was found`);
                    return redirect('/reset');
                }

                user.resetToken = token;
                user.resetTokenExpirationDate = Date.now() + 3600000;
                return user.save();
            })
            .then(response => {
                /* 
                    -> Sending emails will require you to update the email configs
                    res.redirect('/')
                    transporter.sendMail({
                    to: userEmail,
                    from: 'shop@website.com',
                    subject: 'Password Reset',
                    html: `
                        <p>You requested a password reset</p>
                        <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
                    `
                    })
                */
               res.redirect(`/reset/${token}`);

            })
            .catch(e => {
                req.flash('error', `Sorry, no user with ${userEmail} was found`);
                return res.redirect('/reset');
                // console.log('Error in finding a user ', userEmail)
            })
    })
}

exports.getResetPasswordForm = (req, res, next) => {
    const token = req.params.token;

    User.findOne({ resetToken: token, resetTokenExpirationDate: {
        $gt: Date.now()
    } })
    .then(user => {
        let message = req.flash('error');
        if (message.length > 0) {
            message = message[0];
        } else {
            message = null;
        }
        res.render('auth/reset-password', {
            path: '/reset',
            pageTitle: 'Enter new password',
            error: message,
            userId: user._id.toString(),
            isValidToken: true,
            token: token
        });
    })
    .catch(e => {
        res.render('auth/reset-password', {
            path: '/reset',
            pageTitle: 'Enter new password',
            error: null,
            userId: null,
            isValidToken: false,
            token: token
        });
    })
}

exports.postResetNewPassword = (req, res, next) => {
    const newPassword = req.body.password,
          userId = req.body.user_id,
          token = req.body.passwordToken;
    let resetUser;

    User.findOne({ 
        resetToken: token,
        resetTokenExpirationDate: { $gt: Date.now() },
        _id: userId
    })
    .then(userFound => {
        if (!userFound) throw new Error('User not found');
        resetUser = userFound;
        return bcrypt.hash(newPassword, 12)
    })
    .then(harshedPassword => {
        resetUser.password = harshedPassword;
        resetUser.resetToken = undefined;
        resetUser.resetTokenExpirationDate = undefined;

        return resetUser.save();
    })
    .then(resetResponse => {
        res.redirect('/login');
    })
    .catch(e => {
        console.log('Error', e);
    });
}

const express = require('express');
const authController = require('../controllers/auth')

const router = express.Router();

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.post('/logout', authController.logout);
router.get('/signup', authController.getSignup);
router.post('/signup', authController.postSignup);
router.get('/reset', authController.getResetPassword);
router.post('/reset', authController.postReset);
router.get('/reset/:token', authController.getResetPasswordForm);
router.post('/reset-password', authController.postResetNewPassword);

module.exports = router;

const express = require('express');
const router = express.Router();

module.exports = (controllers, middleware) => {
    const { authController } = controllers;

    // Registro com validação profunda de email (bloqueia emails temporários e inválidos)
    router.post('/register',
        middleware.validation.validateEmailDeep,
        middleware.validation.validate(middleware.validation.schemas.signup),
        (req, res, next) => authController.register(req, res, next)
    );

    // Login tradicional (email/senha)
    router.post('/login',
        middleware.validation.validate(middleware.validation.schemas.login),
        (req, res, next) => authController.login(req, res, next)
    );

    // OAuth - Google Login (inicia o fluxo OAuth)
    router.get('/google',
        (req, res, next) => authController.loginWithGoogle(req, res, next)
    );

    // OAuth - Callback (tratamento backend se necessário)
    router.get('/callback',
        (req, res, next) => authController.handleOAuthCallback(req, res, next)
    );

    // Email Confirmation - Reenviar email de confirmação
    router.post('/resend-confirmation',
        (req, res, next) => authController.resendConfirmationEmail(req, res, next)
    );

    // Email Confirmation - Verificar status de confirmação
    router.get('/check-verification',
        (req, res, next) => authController.checkEmailVerification(req, res, next)
    );

    // Rotas protegidas
    router.get('/profile', middleware.auth.authenticate, (req, res, next) => authController.getProfile(req, res, next));
    router.get('/financial-health', middleware.auth.authenticate, (req, res, next) => authController.getFinancialHealth(req, res, next));

    // Gerenciamento de conta
    router.delete('/account', middleware.auth.authenticate, (req, res, next) => authController.deleteAccount(req, res, next));

    // Export de dados - Premium only
    router.post('/account/export-data',
        middleware.auth.authenticate,
        middleware.auth.checkPremium,
        (req, res, next) => authController.exportUserData(req, res, next)
    );

    return router;
};

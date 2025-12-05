const { logger } = require('./logger');
const constants = require('./constants');

/**
 * Mascara um token para logs (segurança)
 * @param {string} token - Token completo
 * @returns {string} Token mascarado
 */
function maskToken(token) {
    if (!token || token.length < constants.INVITATION_TOKEN_MASK_LENGTH) {
        return '***';
    }
    return token.substring(0, constants.INVITATION_TOKEN_MASK_LENGTH) + '...';
}

/**
 * Constrói a URL do frontend baseada no ambiente
 * @returns {string} URL do frontend
 */
function getFrontendUrl() {
    return process.env.FRONTEND_URL || 
           process.env.CLIENT_URL || 
           (process.env.NODE_ENV === 'production' 
               ? constants.FRONTEND_URLS.PRODUCTION 
               : constants.FRONTEND_URLS.DEVELOPMENT);
}

/**
 * Constrói o link de convite completo
 * @param {string} token - Token do convite
 * @returns {string} Link completo do convite
 */
function buildInvitationLink(token) {
    const frontendUrl = getFrontendUrl();
    return `${frontendUrl}/groups/invite/${token}`;
}

/**
 * Calcula a data de expiração do convite
 * @returns {Date} Data de expiração
 */
function calculateExpirationDate() {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + constants.INVITATION_EXPIRATION_DAYS);
    return expiresAt;
}

/**
 * Verifica se um convite está expirado
 * @param {string|Date} expiresAt - Data de expiração
 * @returns {boolean} True se expirado
 */
function isInvitationExpired(expiresAt) {
    if (!expiresAt) return false;
    const expirationDate = new Date(expiresAt);
    const now = new Date();
    return now > expirationDate;
}

/**
 * Valida se um convite está válido (não expirado e pendente)
 * @param {Object} invitation - Objeto do convite
 * @returns {Object} { valid: boolean, error?: string, statusCode?: number }
 */
function validateInvitation(invitation) {
    if (!invitation) {
        return {
            valid: false,
            error: 'Invitation not found or invalid token.',
            statusCode: 404
        };
    }

    // Verifica se está expirado
    if (invitation.expires_at && isInvitationExpired(invitation.expires_at)) {
        logger.warn('Invitation expired', {
            invitationId: invitation.id,
            expiresAt: invitation.expires_at
        });
        return {
            valid: false,
            error: 'Invitation link has expired.',
            statusCode: 410,
            expired: true,
            expiresAt: invitation.expires_at
        };
    }

    // Verifica se ainda está pendente
    if (invitation.status !== 'pending') {
        logger.warn('Invitation already used', {
            invitationId: invitation.id,
            currentStatus: invitation.status
        });
        return {
            valid: false,
            error: 'This invitation has already been used.',
            statusCode: 410,
            status: invitation.status
        };
    }

    return { valid: true };
}

/**
 * Verifica se um erro é relacionado a schema (migração necessária)
 * @param {Error} error - Erro a verificar
 * @returns {boolean} True se for erro de schema
 */
function isSchemaError(error) {
    if (!error || !error.message) return false;
    
    const errorMessage = error.message.toLowerCase();
    const schemaKeywords = ['expires_at', 'invitation_token', 'column', 'schema cache'];
    
    return schemaKeywords.some(keyword => errorMessage.includes(keyword));
}

/**
 * Retorna o SQL de migração para convites
 * @returns {string} SQL de migração
 */
function getInvitationMigrationSQL() {
    return `-- Run this SQL in Supabase SQL Editor:
-- 1. Go to https://app.supabase.com
-- 2. Select your project
-- 3. Open "SQL Editor"
-- 4. Copy and execute the following:

ALTER TABLE group_invitations 
ADD COLUMN IF NOT EXISTS invitation_token UUID UNIQUE;

ALTER TABLE group_invitations 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_group_invitations_token ON group_invitations(invitation_token);

CREATE INDEX IF NOT EXISTS idx_group_invitations_expires_at ON group_invitations(expires_at);`;
}

/**
 * Cria resposta de erro para migração necessária
 * @returns {Object} Resposta de erro formatada
 */
function createMigrationErrorResponse() {
    return {
        error: 'Database migration required. The invitation_token and expires_at columns do not exist in the group_invitations table.',
        code: 'MIGRATION_REQUIRED',
        migrationRequired: true,
        instructions: 'Please run the migration SQL in Supabase SQL Editor to add the required columns.',
        migrationSQL: getInvitationMigrationSQL()
    };
}

module.exports = {
    maskToken,
    getFrontendUrl,
    buildInvitationLink,
    calculateExpirationDate,
    isInvitationExpired,
    validateInvitation,
    isSchemaError,
    getInvitationMigrationSQL,
    createMigrationErrorResponse
};


const dns = require('dns').promises;
const { isDisposableEmail, getBlockedDomainsCount } = require('../utils/disposableEmailDomains');
const { logger } = require('../utils/logger');

class EmailValidationService {
    constructor() {
        // Regex RFC 5322 simplificado para validação de formato
        this.emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    }

    /**
     * Validação completa de email
     * Valida: formato, comprimento, emails temporários e domínio (MX)
     */
    async validateEmail(email) {
        const startTime = Date.now();
        
        try {
            // 1. Validação básica
            if (!email || typeof email !== 'string') {
                return {
                    isValid: false,
                    reason: 'Email inválido',
                    details: { step: 'format', error: 'Email vazio ou tipo inválido' }
                };
            }

            const trimmedEmail = email.trim().toLowerCase();

            // 2. Validação de formato regex
            if (!this.emailRegex.test(trimmedEmail)) {
                return {
                    isValid: false,
                    reason: 'Formato de email inválido',
                    details: { step: 'regex', email: trimmedEmail }
                };
            }

            // 3. Validação de comprimento (RFC 5321)
            if (trimmedEmail.length > 254) {
                return {
                    isValid: false,
                    reason: 'Email muito longo',
                    details: { step: 'length', length: trimmedEmail.length }
                };
            }

            const [localPart, domain] = trimmedEmail.split('@');

            // 4. Validação da parte local (RFC 5321)
            if (localPart.length > 64) {
                return {
                    isValid: false,
                    reason: 'Nome de usuário do email muito longo',
                    details: { step: 'local-part', length: localPart.length }
                };
            }

            // 5. Verificação de email temporário/descartável (BLOQUEIA FAKES!)
            if (isDisposableEmail(trimmedEmail)) {
                logger.warn('Email temporário bloqueado', { email: trimmedEmail, domain });
                return {
                    isValid: false,
                    reason: 'Emails temporários não são permitidos. Use um email real.',
                    details: { 
                        step: 'disposable-check', 
                        domain,
                        blocked: true,
                        totalBlockedDomains: getBlockedDomainsCount()
                    }
                };
            }

            // 6. Validação de domínio (DNS MX Record - verifica se domínio existe)
            const mxValidation = await this.validateDomainMX(domain);
            if (!mxValidation.isValid) {
                return {
                    isValid: false,
                    reason: mxValidation.reason,
                    details: { step: 'mx-lookup', domain, ...mxValidation.details }
                };
            }

            // ✅ Email válido!
            const processingTime = Date.now() - startTime;
            logger.info('Email validado com sucesso', { 
                email: trimmedEmail, 
                domain, 
                processingTime: `${processingTime}ms` 
            });

            return {
                isValid: true,
                details: {
                    email: trimmedEmail,
                    domain,
                    processingTime,
                    checks: {
                        format: true,
                        disposable: false,
                        mxRecord: true
                    }
                }
            };

        } catch (error) {
            logger.error('Erro ao validar email', { error: error.message, email });
            
            // Fail-safe: em caso de erro na validação, permitir mas logar
            return {
                isValid: true,
                details: {
                    warning: 'Validação incompleta devido a erro',
                    error: error.message
                }
            };
        }
    }

    /**
     * Valida se o domínio tem registros MX (pode receber emails)
     * Performance: ~50-100ms
     */
    async validateDomainMX(domain) {
        try {
            // Timeout de 3 segundos para DNS lookup
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('DNS lookup timeout')), 3000)
            );

            const mxRecords = await Promise.race([
                dns.resolveMx(domain),
                timeoutPromise
            ]);

            if (!mxRecords || mxRecords.length === 0) {
                return {
                    isValid: false,
                    reason: 'Domínio não pode receber emails',
                    details: { mxRecords: 0 }
                };
            }

            return {
                isValid: true,
                details: {
                    mxRecords: mxRecords.length,
                    primaryMx: mxRecords[0].exchange
                }
            };

        } catch (error) {
            // Erros comuns de DNS
            if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') {
                return {
                    isValid: false,
                    reason: 'Domínio não existe ou não está configurado para receber emails',
                    details: { error: error.code }
                };
            }

            // Para outros erros (timeout, rede), permitir mas logar (fail-safe)
            logger.warn('Erro ao validar MX record, permitindo email', { 
                domain, 
                error: error.message 
            });
            
            return {
                isValid: true,
                details: { warning: 'MX validation skipped', error: error.message }
            };
        }
    }

    /**
     * Validação rápida de formato (sem MX lookup)
     * Útil para validação client-side ou pré-validação
     */
    quickValidate(email) {
        if (!email || typeof email !== 'string') {
            return false;
        }

        const trimmedEmail = email.trim().toLowerCase();
        
        // Formato + não temporário
        return this.emailRegex.test(trimmedEmail) && !isDisposableEmail(trimmedEmail);
    }

    /**
     * Extrai domínio do email
     */
    extractDomain(email) {
        if (!email || typeof email !== 'string') {
            return null;
        }

        const parts = email.trim().toLowerCase().split('@');
        return parts.length === 2 ? parts[1] : null;
    }

    /**
     * Validação em lote de emails (útil para importação)
     */
    async validateBatch(emails) {
        if (!Array.isArray(emails)) {
            return [];
        }

        const validations = await Promise.all(
            emails.map(async (email) => {
                const result = await this.validateEmail(email);
                return {
                    email,
                    isValid: result.isValid,
                    reason: result.reason
                };
            })
        );

        return validations;
    }
}

module.exports = EmailValidationService;


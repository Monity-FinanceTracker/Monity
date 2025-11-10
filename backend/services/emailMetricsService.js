const { logger } = require('../utils/logger');

/**
 * Serviço para rastrear métricas de validação de email
 * Útil para monitorar bloqueios e padrões de abuse
 */
class EmailMetricsService {
    constructor() {
        this.metrics = {
            totalValidations: 0,
            blocked: 0,
            accepted: 0,
            blockedByReason: {
                format: 0,
                disposable: 0,
                mxRecord: 0,
                length: 0
            },
            blockedDomains: new Map(), // domínio -> contador
            lastReset: Date.now()
        };
        
        // Resetar métricas a cada 24h
        this.resetInterval = setInterval(() => this.logAndReset(), 24 * 60 * 60 * 1000);
    }

    /**
     * Registra tentativa de validação
     */
    recordValidation(validation, email) {
        this.metrics.totalValidations++;

        if (validation.isValid) {
            this.metrics.accepted++;
        } else {
            this.metrics.blocked++;
            
            // Rastrear razão do bloqueio
            const step = validation.details?.step;
            if (step && this.metrics.blockedByReason[step] !== undefined) {
                this.metrics.blockedByReason[step]++;
            }

            // Rastrear domínios bloqueados
            if (step === 'disposable-check' || step === 'mx-lookup') {
                const domain = validation.details?.domain || this.extractDomain(email);
                if (domain) {
                    const count = this.metrics.blockedDomains.get(domain) || 0;
                    this.metrics.blockedDomains.set(domain, count + 1);
                }
            }
        }

        // Log a cada 100 validações
        if (this.metrics.totalValidations % 100 === 0) {
            this.logMetrics();
        }
    }

    /**
     * Extrai domínio do email
     */
    extractDomain(email) {
        if (!email || typeof email !== 'string') return null;
        const parts = email.split('@');
        return parts.length === 2 ? parts[1] : null;
    }

    /**
     * Retorna métricas atuais
     */
    getMetrics() {
        return {
            ...this.metrics,
            blockedDomains: Array.from(this.metrics.blockedDomains.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 20) // Top 20 domínios bloqueados
                .map(([domain, count]) => ({ domain, count })),
            uptime: Date.now() - this.metrics.lastReset,
            blockRate: this.metrics.totalValidations > 0 
                ? (this.metrics.blocked / this.metrics.totalValidations * 100).toFixed(2) + '%'
                : '0%'
        };
    }

    /**
     * Loga métricas no console
     */
    logMetrics() {
        const metrics = this.getMetrics();
        
        logger.info('📊 Métricas de Validação de Email', {
            total: metrics.totalValidations,
            aceitos: metrics.accepted,
            bloqueados: metrics.blocked,
            taxaDeBloqueio: metrics.blockRate,
            motivos: metrics.blockedByReason,
            top5Dominios: metrics.blockedDomains.slice(0, 5)
        });
    }

    /**
     * Loga e reseta métricas (chamado a cada 24h)
     */
    logAndReset() {
        logger.info('📊 RELATÓRIO DIÁRIO - Validação de Email', this.getMetrics());
        
        // Resetar contadores mas manter domínios bloqueados (histórico)
        this.metrics.totalValidations = 0;
        this.metrics.blocked = 0;
        this.metrics.accepted = 0;
        this.metrics.blockedByReason = {
            format: 0,
            disposable: 0,
            mxRecord: 0,
            length: 0
        };
        this.metrics.lastReset = Date.now();
    }

    /**
     * Cleanup ao desligar servidor
     */
    destroy() {
        if (this.resetInterval) {
            clearInterval(this.resetInterval);
        }
    }
}

// Singleton
const emailMetricsService = new EmailMetricsService();

module.exports = emailMetricsService;


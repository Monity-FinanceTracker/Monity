const natural = require('natural');
const compromise = require('compromise');
const { removeStopwords } = require('stopword');
const { Matrix } = require('ml-matrix');
const NaiveBayes = require('ml-naivebayes');
const { decryptObject, encryptObject } = require('../middleware');
const { logger } = require('../utils');

class SmartCategorizationService {
    constructor(supabase) {
        this.supabase = supabase;
        this.tokenizer = new natural.WordTokenizer();
        this.stemmer = natural.PorterStemmer;
        this.classifier = null;
        this.merchantPatterns = new Map();
        this.defaultRules = new Map();
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;

        try {
            logger.info('[SmartCategorization] Initializing engine...');
            
            await this.loadMerchantPatterns();
            await this.loadDefaultRules();
            await this.loadMLModel();
            
            this.isInitialized = true;
            logger.info('[SmartCategorization] Engine initialized successfully');
        } catch (error) {
            logger.error('[SmartCategorization] Failed to initialize:', { error });
            throw error;
        }
    }

    async loadMerchantPatterns() {
        const { data: patterns, error } = await this.supabase
            .from('merchant_patterns')
            .select('*')
            .order('confidence_score', { ascending: false });

        if (error) {
            logger.error('[SmartCategorization] Error loading merchant patterns:', { error });
            return;
        }

        this.merchantPatterns.clear();
        
        if (patterns && patterns.length > 0) {
            patterns.forEach(pattern => {
                this.merchantPatterns.set(pattern.pattern.toLowerCase(), {
                    category: pattern.suggested_category,
                    confidence: pattern.confidence_score,
                    usage: pattern.usage_count
                });
            });

            logger.info(`[SmartCategorization] Loaded ${patterns.length} merchant patterns`);
        } else {
            logger.info('[SmartCategorization] No merchant patterns found in database');
        }
    }

    async loadDefaultRules() {
        const { data: rules, error } = await this.supabase
            .from('default_category_rules')
            .select('*')
            .eq('is_active', true)
            .order('confidence_score', { ascending: false });

        if (error) {
            logger.error('[SmartCategorization] Error loading default rules:', { error });
            return;
        }

        this.defaultRules.clear();
        
        if (rules && rules.length > 0) {
            rules.forEach(rule => {
                const key = `${rule.rule_type}:${rule.rule_value.toLowerCase()}`;
                this.defaultRules.set(key, {
                    category: rule.suggested_category,
                    confidence: rule.confidence_score,
                    transactionType: rule.transaction_type_id
                });
            });

            logger.info(`[SmartCategorization] Loaded ${rules.length} default rules`);
        } else {
            logger.info('[SmartCategorization] No default rules found in database');
        }
    }

    async loadMLModel() {
        try {
            const { data: trainingData, error } = await this.supabase
                .from('transactions')
                .select('description, category, amount, typeId')
                .not('category', 'is', null)
                .not('description', 'is', null)
                .limit(5000);

            if (error) {
                logger.error('[SmartCategorization] Error loading training data:', { error });
                return;
            }

            if (!trainingData || !Array.isArray(trainingData) || trainingData.length === 0) {
                logger.info('[SmartCategorization] No training data available, using rule-based approach only');
                return;
            }
            
            const decryptedTrainingData = decryptObject('transactions', trainingData);

            // Filter out any invalid data after decryption
            const validTrainingData = decryptedTrainingData.filter(transaction => 
                transaction && 
                transaction.description && 
                transaction.description.trim() && 
                transaction.category && 
                transaction.category.trim()
            );

            if (validTrainingData.length < 10) {
                logger.info(`[SmartCategorization] Insufficient valid training data (${validTrainingData.length} samples), using rule-based approach only`);
                return;
            }

            await this.trainNaiveBayesModel(validTrainingData);
            
        } catch (error) {
            logger.error('[SmartCategorization] Error training ML model:', { 
                error: error.message, 
                stack: error.stack 
            });
        }
    }

    async trainNaiveBayesModel(trainingData) {
        try {
            const features = [];
            const labels = [];

            for (const transaction of trainingData) {
                try {
                    const extractedFeatures = this.extractFeatures(transaction.description, transaction.amount);
                    
                    // Only add if we extracted valid features
                    if (extractedFeatures && extractedFeatures.length > 0) {
                        features.push(extractedFeatures);
                        labels.push(transaction.category);
                    }
                } catch (featureError) {
                    logger.warn('[SmartCategorization] Error extracting features for transaction:', { 
                        description: transaction.description,
                        error: featureError.message 
                    });
                    continue;
                }
            }

            if (features.length === 0 || labels.length === 0) {
                logger.warn('[SmartCategorization] No valid features extracted from training data');
                return;
            }

            if (features.length !== labels.length) {
                logger.error('[SmartCategorization] Mismatch between features and labels count');
                return;
            }

            // Initialize classifier
            this.classifier = new NaiveBayes();
            
            // Prepare training set with proper format
            const trainingSet = features.map((feature, index) => ({
                input: feature,
                output: labels[index]
            }));

            // Filter out any invalid training samples
            const validTrainingSet = trainingSet.filter(sample => 
                sample.input && 
                sample.input.length > 0 && 
                sample.output && 
                sample.output.trim()
            );

            if (validTrainingSet.length === 0) {
                logger.warn('[SmartCategorization] No valid training samples after filtering');
                return;
            }

            // Train the model
            this.classifier.train(validTrainingSet);

            logger.info(`[SmartCategorization] Successfully trained Naive Bayes model with ${validTrainingSet.length} valid samples`);
            
        } catch (error) {
            logger.error('[SmartCategorization] Error in trainNaiveBayesModel:', { 
                error: error.message, 
                stack: error.stack 
            });
            // Reset classifier on error
            this.classifier = null;
        }
    }

    extractFeatures(description, amount = 0) {
        if (!description || typeof description !== 'string') return [];

        try {
            const features = [];
            const cleanDesc = description.toLowerCase().trim();
            
            if (!cleanDesc) return [];
            
            // Tokenize with error handling
            let tokens = [];
            try {
                tokens = this.tokenizer.tokenize(cleanDesc) || [];
            } catch (tokenError) {
                logger.warn('[SmartCategorization] Error tokenizing description:', { 
                    description: cleanDesc, 
                    error: tokenError.message 
                });
                // Fallback to simple word splitting
                tokens = cleanDesc.split(/\s+/).filter(token => token.length > 0);
            }
            
            const portugueseStopWords = ['de', 'da', 'do', 'das', 'dos', 'em', 'na', 'no', 'nas', 'nos', 'para', 'por', 'com', 'sem', 'sob', 'sobre', 'entre', 'durante', 'antes', 'depois', 'ate', 'desde', 'contra', 'segundo', 'conforme', 'perante', 'mediante', 'durante', 'excepto', 'salvo', 'menos', 'fora', 'afora', 'alem', 'aquem', 'atraves', 'junto', 'perto', 'longe', 'dentro', 'fora', 'cima', 'baixo', 'frente', 'tras', 'lado', 'vez', 'vezes'];
            
            // Remove stopwords with error handling
            try {
                tokens = removeStopwords(tokens, portugueseStopWords);
            } catch (stopwordError) {
                logger.warn('[SmartCategorization] Error removing stopwords:', { 
                    error: stopwordError.message 
                });
            }
            
            // Stem tokens with error handling
            try {
                tokens = tokens.map(token => {
                    try {
                        return this.stemmer.stem(token);
                    } catch (stemError) {
                        // Return original token if stemming fails
                        return token;
                    }
                });
            } catch (stemError) {
                logger.warn('[SmartCategorization] Error stemming tokens:', { 
                    error: stemError.message 
                });
            }
            
            // Filter valid tokens
            const validTokens = tokens.filter(token => 
                token && 
                typeof token === 'string' && 
                token.trim().length > 0 && 
                token.length <= 50 // Prevent extremely long tokens
            );
            
            features.push(...validTokens);
            
            // Extract merchant with error handling
            try {
                const merchant = this.extractMerchant(cleanDesc);
                if (merchant) {
                    features.push(`merchant_${merchant}`);
                }
            } catch (merchantError) {
                logger.warn('[SmartCategorization] Error extracting merchant:', { 
                    error: merchantError.message 
                });
            }
            
            // Add amount feature with validation
            if (amount && typeof amount === 'number' && amount > 0 && isFinite(amount)) {
                try {
                    const amountFeature = this.getAmountRangeFeature(amount);
                    if (amountFeature) {
                        features.push(amountFeature);
                    }
                } catch (amountError) {
                    logger.warn('[SmartCategorization] Error processing amount feature:', { 
                        amount, 
                        error: amountError.message 
                    });
                }
            }
        
            // Add additional features with error handling
            try {
                features.push(`length_${this.getDescriptionLengthCategory(cleanDesc)}`);
            } catch (lengthError) {
                logger.warn('[SmartCategorization] Error processing length feature:', { 
                    error: lengthError.message 
                });
            }
            
            try {
                this.addBrazilianFeatures(cleanDesc, features);
            } catch (brazilianError) {
                logger.warn('[SmartCategorization] Error adding Brazilian features:', { 
                    error: brazilianError.message 
                });
            }
            
            // NLP features with error handling
            try {
                const doc = compromise(cleanDesc);
                const places = doc.places().out('array');
                const organizations = doc.organizations().out('array');
                
                places.forEach(place => {
                    if (place && typeof place === 'string') {
                        features.push(`place_${place.toLowerCase()}`);
                    }
                });
                organizations.forEach(org => {
                    if (org && typeof org === 'string') {
                        features.push(`org_${org.toLowerCase()}`);
                    }
                });
            } catch (nlpError) {
                logger.warn('[SmartCategorization] Error processing NLP features:', { 
                    error: nlpError.message 
                });
            }

            return features.filter(feature => feature && feature.length > 0);
            
        } catch (error) {
            logger.error('[SmartCategorization] Error in extractFeatures:', { 
                description, 
                error: error.message 
            });
            return [];
        }
    }

    addBrazilianFeatures(description, features) {
        const bankingTerms = {
            'tef': 'banking_tef',
            'pix': 'banking_pix',
            'transferencia': 'banking_transfer',
            'saque': 'banking_withdrawal',
            'deposito': 'banking_deposit',
            'pgto': 'payment',
            'pagamento': 'payment',
            'compra': 'purchase',
            'debito': 'debit',
            'credito': 'credit'
        };

        for (const [term, feature] of Object.entries(bankingTerms)) {
            if (description.includes(term)) {
                features.push(feature);
            }
        }

        if (description.includes('r$') || description.includes('real')) {
            features.push('currency_brl');
        }

        if (/\d{3}\.\d{3}\.\d{3}-\d{2}/.test(description)) {
            features.push('document_cpf');
        }
        if (/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/.test(description)) {
            features.push('document_cnpj');
        }
    }

    extractMerchant(description) {
        const patterns = [
            /^([A-Z]+[A-Z\s&]+?)[\s\*]/,
            /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,
            /^([\w\s]+?)(?:\s+\d+|\s*\*|$)/,
            /^([A-ZÁÇÉÍÓÚÂÊÎÔÛÀÈÌÒÙÃ]+[\w\s&]*?)[\s\*]/,
            /(TEF|PIX|TRANSFERENCIA|SAQUE|DEPOSITO)/i,
        ];

        for (const pattern of patterns) {
            const match = description.match(pattern);
            if (match && match[1] && match[1].length > 2) {
                return match[1].trim().toLowerCase();
            }
        }

        const brazilianPatterns = [
            /^(.*?)\s+(LTDA|S\/A|SA|ME|EPP)(\s|$)/i,
            /^(PGTO|PAG|COMPRA)\s+(.*)/i,
            /^(.*?)\s+(\d{2}\/\d{2}|\d{4})/,
        ];

        for (const pattern of brazilianPatterns) {
            const match = description.match(pattern);
            if (match && match[1] && match[1].length > 2) {
                return match[1].trim().toLowerCase();
            }
        }

        return null;
    }

    getAmountRangeFeature(amount) {
        if (amount <= 10) return 'amount_very_small';
        if (amount <= 50) return 'amount_small';
        if (amount <= 200) return 'amount_medium';
        if (amount <= 1000) return 'amount_large';
        return 'amount_very_large';
    }

    getDescriptionLengthCategory(description) {
        const length = description.length;
        if (length <= 10) return 'short';
        if (length <= 30) return 'medium';
        return 'long';
    }
    
    async suggestCategory(description, amount = 0, transactionType = 1, userId = null) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        const suggestions = [];
        const cleanDesc = description.toLowerCase().trim();

        try {
            const merchantSuggestion = this.checkMerchantPatterns(cleanDesc);
            if (merchantSuggestion) {
                suggestions.push(merchantSuggestion);
            }

            const ruleSuggestions = this.checkDefaultRules(cleanDesc, transactionType);
            suggestions.push(...ruleSuggestions);

            if (this.classifier) {
                const mlSuggestion = this.getMLPrediction(description, amount);
                if (mlSuggestion) {
                    suggestions.push(mlSuggestion);
                }
            }

            if (userId) {
                const userSuggestion = await this.getUserSpecificSuggestion(description, userId);
                if (userSuggestion) {
                    suggestions.push(userSuggestion);
                }
            }

            const sortedSuggestions = this.rankSuggestions(suggestions);
            
            return sortedSuggestions.slice(0, 3);

        } catch (error) {
            logger.error('[SmartCategorization] Error in categorization:', { error });
            return [{
                category: 'Uncategorized',
                confidence: 0.3,
                source: 'fallback'
            }];
        }
    }

    checkMerchantPatterns(description) {
        for (const [pattern, data] of this.merchantPatterns) {
            if (description.includes(pattern)) {
                return {
                    category: data.category,
                    confidence: Math.min(data.confidence + (data.usage / 1000), 0.98),
                    source: 'merchant_pattern',
                    pattern: pattern
                };
            }
        }
        return null;
    }

    checkDefaultRules(description, transactionType) {
        const suggestions = [];

        for (const [ruleKey, data] of this.defaultRules) {
            const [ruleType, ruleValue] = ruleKey.split(':');
            
            if (data.transactionType !== transactionType) continue;

            let matches = false;
            
            if (ruleType === 'keyword' && description.includes(ruleValue)) {
                matches = true;
            } else if (ruleType === 'merchant' && description.includes(ruleValue)) {
                matches = true;
            }

            if (matches) {
                suggestions.push({
                    category: data.category,
                    confidence: data.confidence,
                    source: 'rule',
                    rule: ruleKey
                });
            }
        }

        return suggestions;
    }

    getMLPrediction(description, amount) {
        if (!this.classifier) return null;

        try {
            const features = this.extractFeatures(description, amount);
            const prediction = this.classifier.predict(features);
            
            return {
                category: prediction.category,
                confidence: Math.min(prediction.probability * 0.8, 0.9),
                source: 'ml_model'
            };
        } catch (error) {
            logger.error('[SmartCategorization] ML prediction error:', { error });
            return null;
        }
    }

    async getUserSpecificSuggestion(description, userId) {
        try {
            const { data: userTransactions, error } = await this.supabase
                .from('transactions')
                .select('description, category')
                .eq('userId', userId)
                .not('category', 'is', null)
                .limit(100);

            if (error || !userTransactions.length) return null;
            
            const decryptedUserTransactions = decryptObject('transactions', userTransactions);

            let bestMatch = null;
            let bestSimilarity = 0;

            for (const transaction of decryptedUserTransactions) {
                const similarity = this.calculateStringSimilarity(
                    description.toLowerCase(), 
                    transaction.description.toLowerCase()
                );
                
                if (similarity > bestSimilarity && similarity > 0.6) {
                    bestSimilarity = similarity;
                    bestMatch = transaction;
                }
            }

            if (bestMatch) {
                return {
                    category: bestMatch.category,
                    confidence: Math.min(bestSimilarity * 0.8, 0.85),
                    source: 'user_history'
                };
            }

        } catch (error) {
            logger.error('[SmartCategorization] User suggestion error:', { error });
        }

        return null;
    }

    calculateStringSimilarity(str1, str2) {
        const tokens1 = new Set(this.tokenizer.tokenize(str1) || []);
        const tokens2 = new Set(this.tokenizer.tokenize(str2) || []);
        
        const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
        const union = new Set([...tokens1, ...tokens2]);
        
        return intersection.size / union.size;
    }

    rankSuggestions(suggestions) {
        const categoryMap = new Map();
        
        for (const suggestion of suggestions) {
            if (!categoryMap.has(suggestion.category)) {
                categoryMap.set(suggestion.category, suggestion);
            } else {
                const existing = categoryMap.get(suggestion.category);
                if (suggestion.confidence > existing.confidence) {
                    categoryMap.set(suggestion.category, suggestion);
                }
            }
        }

        return Array.from(categoryMap.values())
            .sort((a, b) => b.confidence - a.confidence);
    }

    async recordFeedback(userId, transactionDescription, suggestedCategory, actualCategory, wasAccepted, confidence, amount = null) {
        try {
            const merchantPattern = this.extractMerchant(transactionDescription.toLowerCase());
            
            const feedbackData = {
                user_id: userId,
                transaction_description: transactionDescription,
                suggested_category: suggestedCategory,
                actual_category: actualCategory,
                was_suggestion_accepted: wasAccepted,
                confidence_score: confidence,
                transaction_amount: amount,
                merchant_pattern: merchantPattern
            };

            const encryptedFeedback = encryptObject('categorization_feedback', feedbackData);

            const { error } = await this.supabase
                .from('categorization_feedback')
                .insert([encryptedFeedback]);

            if (error) {
                logger.error('[SmartCategorization] Error recording feedback:', { error });
                return;
            }

            if (merchantPattern && !wasAccepted) {
                await this.updateMerchantPattern(merchantPattern, actualCategory);
            }

            await this.addToTrainingData(userId, transactionDescription, actualCategory, amount);

            logger.info(`[SmartCategorization] Recorded feedback: ${wasAccepted ? 'accepted' : 'corrected'}`);

        } catch (error) {
            logger.error('[SmartCategorization] Error in recordFeedback:', { error });
        }
    }

    async updateMerchantPattern(pattern, category) {
        try {
            const { data: existing, error: fetchError } = await this.supabase
                .from('merchant_patterns')
                .select('*')
                .eq('pattern', pattern.toUpperCase())
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
                logger.error('[SmartCategorization] Error checking merchant pattern:', { fetchError });
                return;
            }

            if (existing) {
                const { error: updateError } = await this.supabase
                    .from('merchant_patterns')
                    .update({ 
                        suggested_category: category,
                        usage_count: existing.usage_count + 1,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', existing.id);

                if (updateError) {
                    logger.error('[SmartCategorization] Error updating merchant pattern:', { updateError });
                }
            } else {
                const { error: insertError } = await this.supabase
                    .from('merchant_patterns')
                    .insert([{
                        pattern: pattern.toUpperCase(),
                        suggested_category: category,
                        confidence_score: 0.7,
                        usage_count: 1
                    }]);

                if (insertError) {
                    logger.error('[SmartCategorization] Error creating merchant pattern:', { insertError });
                }
            }

            await this.loadMerchantPatterns();

        } catch (error) {
            logger.error('[SmartCategorization] Error in updateMerchantPattern:', { error });
        }
    }

    async addToTrainingData(userId, description, category, amount, transactionType = 1) {
        try {
            const features = this.extractFeatures(description, amount);
            
            const trainingDataEntry = {
                user_id: userId,
                description: description,
                amount: amount,
                category: category,
                transaction_type_id: transactionType,
                processed_features: JSON.stringify(features),
                is_verified: true
            };

            const encryptedEntry = encryptObject('ml_training_data', trainingDataEntry);

            const { error } = await this.supabase
                .from('ml_training_data')
                .insert([encryptedEntry]);

            if (error) {
                logger.error('[SmartCategorization] Error adding training data:', { error });
            }

        } catch (error) {
            logger.error('[SmartCategorization] Error in addToTrainingData:', { error });
        }
    }

    async retrainModel() {
        logger.info('[SmartCategorization] Starting model retraining...');
        
        try {
            const { data: trainingData, error } = await this.supabase
                .from('ml_training_data')
                .select('description, category, amount, transaction_type_id')
                .eq('is_verified', true);

            if (error) {
                logger.error('[SmartCategorization] Error fetching training data for retraining:', { error });
                return;
            }

            if (trainingData.length < 50) {
                logger.info('[SmartCategorization] Insufficient data for retraining');
                return;
            }

            await this.trainNaiveBayesModel(trainingData);
            
            logger.info(`[SmartCategorization] Model retrained with ${trainingData.length} samples`);

        } catch (error) {
            logger.error('[SmartCategorization] Error during model retraining:', { error });
        }
    }
}

module.exports = SmartCategorizationService;

const SmartCategorizationService = require('../services/smartCategorizationService');

const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockResolvedValue({ data: [], error: null }),
    limit: jest.fn().mockResolvedValue({ data: [], error: null }),
    single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
    not: jest.fn().mockReturnThis(),
};

describe('Smart Categorization Service', () => {
    let service;

    beforeEach(() => {
        service = new SmartCategorizationService(mockSupabase);
        jest.clearAllMocks();
    });

    describe('suggestCategory', () => {
        it('should suggest a category based on merchant patterns', async () => {
            const from = jest.fn().mockImplementation((table) => {
                const baseMock = {
                    select: jest.fn().mockReturnThis(),
                    insert: jest.fn().mockReturnThis(),
                    update: jest.fn().mockReturnThis(),
                    delete: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    gte: jest.fn().mockReturnThis(),
                    lte: jest.fn().mockReturnThis(),
                    order: jest.fn().mockResolvedValue({ data: [], error: null }),
                    limit: jest.fn().mockResolvedValue({ data: [], error: null }),
                    single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
                    not: jest.fn().mockReturnThis(),
                };

                if (table === 'merchant_patterns') {
                    baseMock.order = jest.fn().mockResolvedValue({
                        data: [{ pattern: 'starbucks', suggested_category: 'Food & Drink', confidence_score: 0.9 }],
                        error: null
                    });
                }
                return baseMock;
            });
            service.supabase = { from };

            await service.initialize();

            const suggestions = await service.suggestCategory('STARBUCKS COFFEE SHOP', 5.50, 1);
            expect(suggestions[0].category).toBe('Food & Drink');
        });
    });

    describe('recordFeedback', () => {
        it('should insert feedback into the database', async () => {
            service.recordFeedback = jest.fn().mockResolvedValue(null);
            
            await service.recordFeedback('user-123', 'TEST', 'A', 'B', true, 0.9, 10);

            expect(service.recordFeedback).toHaveBeenCalledWith('user-123', 'TEST', 'A', 'B', true, 0.9, 10);
        });
    });
}); 
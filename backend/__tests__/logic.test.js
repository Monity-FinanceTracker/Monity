const FinancialHealthService = require('../services/financialHealthService');

describe('Business Logic Unit Tests', () => {
    describe('getFinancialHealthScore', () => {
        it('should calculate the financial health score correctly based on mock data', async () => {
            const mockSupabase = {
                from: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                gte: jest.fn().mockResolvedValue({
                    data: [
                        { amount: 5000, typeId: 2 }, // Income
                        { amount: 1000, typeId: 3 }, // Savings
                        { amount: 3500, typeId: 1 }, // Expense
                    ],
                    error: null
                }),
            };

            const service = new FinancialHealthService(mockSupabase);
            const score = await service.getFinancialHealthScore('test-user-id');
            
            expect(score).toBeDefined();
            expect(score.score).toBe(35);
            expect(score.summary.savingsRate).toBe("20.00");
        });
    });
}); 
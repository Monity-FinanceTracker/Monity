const investmentCalculatorService = require('../services/investmentCalculatorService');

describe('Investment Calculator Service', () => {
    describe('validateParameters', () => {
        test('should validate correct parameters', () => {
            const params = {
                initialInvestment: 1000,
                contributionAmount: 100,
                contributionFrequency: 'monthly',
                annualInterestRate: 8,
                goalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            };

            const result = investmentCalculatorService.validateParameters(params);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        test('should reject negative initial investment', () => {
            const params = {
                initialInvestment: -1000,
                contributionAmount: 100,
                contributionFrequency: 'monthly',
                annualInterestRate: 8,
                goalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            };

            const result = investmentCalculatorService.validateParameters(params);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Initial investment cannot be negative');
        });

        test('should reject past goal date', () => {
            const params = {
                initialInvestment: 1000,
                contributionAmount: 100,
                contributionFrequency: 'monthly',
                annualInterestRate: 8,
                goalDate: '2020-01-01'
            };

            const result = investmentCalculatorService.validateParameters(params);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Goal date must be in the future');
        });

        test('should reject invalid contribution frequency', () => {
            const params = {
                initialInvestment: 1000,
                contributionAmount: 100,
                contributionFrequency: 'invalid',
                annualInterestRate: 8,
                goalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            };

            const result = investmentCalculatorService.validateParameters(params);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Invalid contribution frequency');
        });
    });

    describe('calculateCompoundInterest', () => {
        test('should calculate correct future value with no contributions', () => {
            const params = {
                initialInvestment: 10000,
                contributionAmount: 0,
                contributionFrequency: 'monthly',
                annualInterestRate: 8,
                goalDate: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            };

            const result = investmentCalculatorService.calculateCompoundInterest(params);
            
            // After 10 years at 8% annually, $10,000 should be approximately $21,589
            expect(result.finalValue).toBeGreaterThan(20000);
            expect(result.finalValue).toBeLessThan(23000);
            expect(result.totalContributions).toBe(10000);
            expect(result.totalInterest).toBeGreaterThan(10000);
        });

        test('should calculate correct future value with monthly contributions', () => {
            const params = {
                initialInvestment: 1000,
                contributionAmount: 100,
                contributionFrequency: 'monthly',
                annualInterestRate: 8,
                goalDate: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            };

            const result = investmentCalculatorService.calculateCompoundInterest(params);
            
            // With $1000 initial + $100/month for 5 years at 8%, should be around $8,500-9,000
            expect(result.finalValue).toBeGreaterThan(8000);
            expect(result.finalValue).toBeLessThan(10000);
            expect(result.totalContributions).toBeGreaterThan(7000); // Initial + 60 months * $100
            expect(result.totalInterest).toBeGreaterThan(0);
            expect(result.roiPercentage).toBeGreaterThan(0);
        });

        test('should calculate correct ROI percentage', () => {
            const params = {
                initialInvestment: 1000,
                contributionAmount: 100,
                contributionFrequency: 'monthly',
                annualInterestRate: 10,
                goalDate: new Date(Date.now() + 1 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            };

            const result = investmentCalculatorService.calculateCompoundInterest(params);
            
            // ROI should be positive with positive interest rate
            expect(result.roiPercentage).toBeGreaterThan(0);
            expect(result.totalInterest).toBeGreaterThan(0);
            expect(result.finalValue).toBeGreaterThan(result.totalContributions);
        });

        test('should handle annual contributions correctly', () => {
            const params = {
                initialInvestment: 5000,
                contributionAmount: 1000,
                contributionFrequency: 'annually',
                annualInterestRate: 7,
                goalDate: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            };

            const result = investmentCalculatorService.calculateCompoundInterest(params);
            
            // Total contributions should be initial + 3 years * $1000
            expect(result.totalContributions).toBeGreaterThan(7000);
            expect(result.totalContributions).toBeLessThan(9000);
            expect(result.finalValue).toBeGreaterThan(result.totalContributions);
        });

        test('should handle semi-annual contributions correctly', () => {
            const params = {
                initialInvestment: 2000,
                contributionAmount: 500,
                contributionFrequency: 'semi-annually',
                annualInterestRate: 6,
                goalDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            };

            const result = investmentCalculatorService.calculateCompoundInterest(params);
            
            // Total contributions should be initial + 4 periods * $500
            expect(result.totalContributions).toBeGreaterThan(3500);
            expect(result.totalContributions).toBeLessThan(5000);
            expect(result.finalValue).toBeGreaterThan(result.totalContributions);
        });
    });

    describe('generateGrowthData', () => {
        test('should generate monthly growth data', () => {
            const params = {
                initialInvestment: 1000,
                contributionAmount: 100,
                contributionFrequency: 'monthly',
                annualInterestRate: 8,
                goalDate: new Date(Date.now() + 1 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            };

            const result = investmentCalculatorService.generateGrowthData(params, 'monthly');
            
            expect(result).toBeInstanceOf(Array);
            expect(result.length).toBeGreaterThan(0);
            expect(result.length).toBeLessThanOrEqual(13); // Start + 12 months
            
            // First point should be initial investment
            expect(result[0].totalValue).toBeCloseTo(1000, 0);
            expect(result[0].interestEarned).toBe(0);
            
            // Each subsequent point should have higher total value
            for (let i = 1; i < result.length; i++) {
                expect(result[i].totalValue).toBeGreaterThan(result[i-1].totalValue);
            }
        });

        test('should generate annual growth data', () => {
            const params = {
                initialInvestment: 5000,
                contributionAmount: 500,
                contributionFrequency: 'monthly',
                annualInterestRate: 10,
                goalDate: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            };

            const result = investmentCalculatorService.generateGrowthData(params, 'annually');
            
            expect(result).toBeInstanceOf(Array);
            expect(result.length).toBeGreaterThan(0);
            expect(result.length).toBeLessThanOrEqual(6); // Start + 5 years
            
            // Each data point should have required fields
            result.forEach(point => {
                expect(point).toHaveProperty('period');
                expect(point).toHaveProperty('label');
                expect(point).toHaveProperty('totalValue');
                expect(point).toHaveProperty('totalContributions');
                expect(point).toHaveProperty('interestEarned');
            });
        });

        test('should show increasing interest over time', () => {
            const params = {
                initialInvestment: 1000,
                contributionAmount: 100,
                contributionFrequency: 'monthly',
                annualInterestRate: 8,
                goalDate: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            };

            const result = investmentCalculatorService.generateGrowthData(params, 'annually');
            
            // Interest should compound and increase over time
            for (let i = 1; i < result.length; i++) {
                expect(result[i].interestEarned).toBeGreaterThan(result[i-1].interestEarned);
            }
        });
    });

    describe('formatResults', () => {
        test('should format calculation results correctly', () => {
            const calculation = {
                finalValue: 15000.50,
                totalContributions: 10000,
                totalInterest: 5000.50,
                roiPercentage: 50.00,
                years: 5.5,
                totalPeriods: 66
            };

            const result = investmentCalculatorService.formatResults(calculation);
            
            expect(result).toHaveProperty('summary');
            expect(result).toHaveProperty('details');
            expect(result.summary.finalValue).toBe(15000.50);
            expect(result.summary.totalContributions).toBe(10000);
            expect(result.details.totalPeriods).toBe(66);
        });
    });
});





/**
 * Investment Calculator Service
 * Provides compound interest calculation and investment growth projection logic
 */

class InvestmentCalculatorService {
    /**
     * Calculate compound interest with regular contributions
     * @param {Object} params - Calculation parameters
     * @param {number} params.initialInvestment - Initial principal amount
     * @param {number} params.contributionAmount - Regular contribution amount
     * @param {string} params.contributionFrequency - 'monthly', 'semi-annually', or 'annually'
     * @param {number} params.annualInterestRate - Annual interest rate as percentage (e.g., 8 for 8%)
     * @param {string} params.goalDate - Target date in ISO format (YYYY-MM-DD)
     * @returns {Object} Calculation results
     */
    calculateCompoundInterest(params) {
        const {
            initialInvestment,
            contributionAmount,
            contributionFrequency,
            annualInterestRate,
            goalDate
        } = params;

        // Convert inputs
        const P = parseFloat(initialInvestment) || 0;
        const PMT = parseFloat(contributionAmount) || 0;
        const r = parseFloat(annualInterestRate) / 100; // Convert percentage to decimal
        
        // Calculate time period in years
        const now = new Date();
        const goal = new Date(goalDate);
        const diffTime = Math.abs(goal - now);
        const t = diffTime / (1000 * 60 * 60 * 24 * 365.25); // Years including leap years

        // Determine compounding frequency and contribution periods per year
        let n = 12; // Default to monthly compounding
        let contributionsPerYear;
        
        switch (contributionFrequency) {
            case 'monthly':
                contributionsPerYear = 12;
                n = 12;
                break;
            case 'semi-annually':
                contributionsPerYear = 2;
                n = 12; // Still compound monthly for accuracy
                break;
            case 'annually':
                contributionsPerYear = 1;
                n = 12; // Still compound monthly for accuracy
                break;
            default:
                contributionsPerYear = 12;
        }

        // Calculate future value of initial investment: FV_principal = P(1 + r/n)^(nt)
        const principalGrowth = P * Math.pow(1 + r / n, n * t);

        // Calculate future value of regular contributions
        // For contributions, we need to account for their frequency
        let contributionsGrowth = 0;
        const totalPeriods = Math.floor(t * contributionsPerYear);
        
        for (let i = 0; i < totalPeriods; i++) {
            // Time remaining for this contribution to grow
            const timeRemaining = t - (i / contributionsPerYear);
            contributionsGrowth += PMT * Math.pow(1 + r / n, n * timeRemaining);
        }

        // Total future value
        const finalValue = principalGrowth + contributionsGrowth;
        
        // Total contributions (initial + regular contributions)
        const totalContributions = P + (PMT * totalPeriods);
        
        // Total interest earned
        const totalInterest = finalValue - totalContributions;
        
        // Return on Investment percentage
        const roiPercentage = totalContributions > 0 
            ? ((totalInterest / totalContributions) * 100)
            : 0;

        return {
            finalValue: Math.round(finalValue * 100) / 100,
            totalContributions: Math.round(totalContributions * 100) / 100,
            totalInterest: Math.round(totalInterest * 100) / 100,
            roiPercentage: Math.round(roiPercentage * 100) / 100,
            years: Math.round(t * 100) / 100,
            totalPeriods
        };
    }

    /**
     * Generate growth data for charting
     * @param {Object} params - Same as calculateCompoundInterest
     * @param {string} viewType - 'monthly' or 'annually'
     * @returns {Array} Array of data points with time, principal, contributions, and interest
     */
    generateGrowthData(params, viewType = 'monthly') {
        const {
            initialInvestment,
            contributionAmount,
            contributionFrequency,
            annualInterestRate,
            goalDate
        } = params;

        const P = parseFloat(initialInvestment) || 0;
        const PMT = parseFloat(contributionAmount) || 0;
        const r = parseFloat(annualInterestRate) / 100;
        
        const now = new Date();
        const goal = new Date(goalDate);
        const diffTime = Math.abs(goal - now);
        const totalYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);

        const n = 12; // Monthly compounding
        let contributionsPerYear;
        
        switch (contributionFrequency) {
            case 'monthly':
                contributionsPerYear = 12;
                break;
            case 'semi-annually':
                contributionsPerYear = 2;
                break;
            case 'annually':
                contributionsPerYear = 1;
                break;
            default:
                contributionsPerYear = 12;
        }

        const dataPoints = [];
        let intervals;
        let intervalYears;

        if (viewType === 'monthly') {
            intervals = Math.min(Math.ceil(totalYears * 12), 360); // Cap at 30 years
            intervalYears = 1 / 12;
        } else {
            intervals = Math.min(Math.ceil(totalYears), 30); // Cap at 30 years
            intervalYears = 1;
        }

        // Add initial point
        dataPoints.push({
            period: 0,
            label: viewType === 'monthly' ? 'Start' : 'Year 0',
            principalValue: P,
            totalContributions: P,
            totalValue: P,
            interestEarned: 0
        });

        for (let i = 1; i <= intervals; i++) {
            const currentYears = i * intervalYears;
            if (currentYears > totalYears) break;

            // Calculate principal growth
            const principalValue = P * Math.pow(1 + r / n, n * currentYears);

            // Calculate contributions made up to this point
            const periodsElapsed = Math.floor(currentYears * contributionsPerYear);
            
            // Calculate future value of all contributions made so far
            let contributionsValue = 0;
            for (let j = 0; j < periodsElapsed; j++) {
                const contributionTime = j / contributionsPerYear;
                const growthTime = currentYears - contributionTime;
                contributionsValue += PMT * Math.pow(1 + r / n, n * growthTime);
            }

            const totalValue = principalValue + contributionsValue;
            const totalContributions = P + (PMT * periodsElapsed);
            const interestEarned = totalValue - totalContributions;

            let label;
            if (viewType === 'monthly') {
                const monthNum = i % 12 || 12;
                const yearNum = Math.floor((i - 1) / 12);
                label = yearNum > 0 ? `Y${yearNum}M${monthNum}` : `M${monthNum}`;
            } else {
                label = `Year ${i}`;
            }

            dataPoints.push({
                period: i,
                label,
                principalValue: Math.round(principalValue * 100) / 100,
                totalContributions: Math.round(totalContributions * 100) / 100,
                totalValue: Math.round(totalValue * 100) / 100,
                interestEarned: Math.round(interestEarned * 100) / 100
            });
        }

        return dataPoints;
    }

    /**
     * Format calculation results for response
     * @param {Object} calculation - Raw calculation results
     * @returns {Object} Formatted results
     */
    formatResults(calculation) {
        return {
            summary: {
                finalValue: calculation.finalValue,
                totalContributions: calculation.totalContributions,
                totalInterest: calculation.totalInterest,
                roiPercentage: calculation.roiPercentage,
                years: calculation.years
            },
            details: {
                totalPeriods: calculation.totalPeriods,
                averageAnnualReturn: calculation.roiPercentage / calculation.years
            }
        };
    }

    /**
     * Validate calculation parameters
     * @param {Object} params - Parameters to validate
     * @returns {Object} Validation result with errors array
     */
    validateParameters(params) {
        const errors = [];
        const {
            initialInvestment,
            contributionAmount,
            contributionFrequency,
            annualInterestRate,
            goalDate
        } = params;

        // Validate initial investment
        if (initialInvestment === undefined || initialInvestment === null) {
            errors.push('Initial investment is required');
        } else if (parseFloat(initialInvestment) < 0) {
            errors.push('Initial investment cannot be negative');
        }

        // Validate contribution amount
        if (contributionAmount === undefined || contributionAmount === null) {
            errors.push('Contribution amount is required');
        } else if (parseFloat(contributionAmount) < 0) {
            errors.push('Contribution amount cannot be negative');
        }

        // Validate contribution frequency
        const validFrequencies = ['monthly', 'semi-annually', 'annually'];
        if (!contributionFrequency) {
            errors.push('Contribution frequency is required');
        } else if (!validFrequencies.includes(contributionFrequency)) {
            errors.push('Invalid contribution frequency');
        }

        // Validate annual interest rate
        if (annualInterestRate === undefined || annualInterestRate === null) {
            errors.push('Annual interest rate is required');
        } else {
            const rate = parseFloat(annualInterestRate);
            if (rate < 0) {
                errors.push('Interest rate cannot be negative');
            } else if (rate > 100) {
                errors.push('Interest rate seems unrealistic (>100%)');
            }
        }

        // Validate goal date
        if (!goalDate) {
            errors.push('Goal date is required');
        } else {
            const goal = new Date(goalDate);
            const now = new Date();
            if (isNaN(goal.getTime())) {
                errors.push('Invalid goal date format');
            } else if (goal <= now) {
                errors.push('Goal date must be in the future');
            } else {
                const yearsDiff = (goal - now) / (1000 * 60 * 60 * 24 * 365.25);
                if (yearsDiff > 50) {
                    errors.push('Goal date cannot be more than 50 years in the future');
                }
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

module.exports = new InvestmentCalculatorService();






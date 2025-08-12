/**
 * SAP Utilities Module
 * Helper functions for SAP-specific operations and data formatting
 */

class SAPUtils {
    constructor() {
        this.transactionMap = new Map();
        this.moduleMap = new Map();
        this.businessProcessMap = new Map();
        
        this.initializeMappings();
    }

    /**
     * Initialize SAP data mappings
     */
    initializeMappings() {
        // Common SAP transactions
        const transactions = [
            { code: 'ME21N', name: 'Create Purchase Order', module: 'MM', icon: '🛒' },
            { code: 'ME22N', name: 'Change Purchase Order', module: 'MM', icon: '✏️' },
            { code: 'ME23N', name: 'Display Purchase Order', module: 'MM', icon: '👁️' },
            { code: 'MIGO', name: 'Goods Movement', module: 'MM', icon: '📦' },
            { code: 'FB60', name: 'Enter Incoming Invoice', module: 'FI', icon: '🧾' },
            { code: 'FB70', name: 'Enter Incoming Invoice (Logistics)', module: 'FI', icon: '📋' },
            { code: 'VA01', name: 'Create Sales Order', module: 'SD', icon: '💰' },
            { code: 'VA02', name: 'Change Sales Order', module: 'SD', icon: '✏️' },
            { code: 'VA03', name: 'Display Sales Order', module: 'SD', icon: '👁️' },
            { code: 'VF01', name: 'Create Billing Document', module: 'SD', icon: '💳' },
            { code: 'VL01N', name: 'Create Outbound Delivery', module: 'SD', icon: '🚚' },
            { code: 'MIRO', name: 'Invoice Receipt', module: 'MM', icon: '📄' },
            { code: 'F-43', name: 'Enter Vendor Invoice', module: 'FI', icon: '💼' },
            { code: 'F-53', name: 'Post Vendor Payment', module: 'FI', icon: '💸' }
        ];

        transactions.forEach(t => {
            this.transactionMap.set(t.code, t);
        });

        // SAP modules
        const modules = [
            { code: 'MM', name: 'Materials Management', icon: '📦', color: '#4CAF50' },
            { code: 'FI', name: 'Financial Accounting', icon: '💰', color: '#2196F3' },
            { code: 'SD', name: 'Sales and Distribution', icon: '🛍️', color: '#FF9800' },
            { code: 'CO', name: 'Controlling', icon: '📊', color: '#9C27B0' },
            { code: 'HR', name: 'Human Resources', icon: '👥', color: '#607D8B' },
            { code: 'WM', name: 'Warehouse Management', icon: '🏭', color: '#795548' },
            { code: 'PP', name: 'Production Planning', icon: '⚙️', color: '#E91E63' },
            { code: 'QM', name: 'Quality Management', icon: '✅', color: '#009688' }
        ];

        modules.forEach(m => {
            this.moduleMap.set(m.code, m);
        });

        // Business processes
        const processes = [
            { name: 'Procurement', icon: '🛒', transactions: ['ME21N', 'ME22N', 'MIGO', 'MIRO'] },
            { name: 'Order to Cash', icon: '💰', transactions: ['VA01', 'VL01N', 'VF01'] },
            { name: 'Accounts Payable', icon: '💳', transactions: ['FB60', 'F-43', 'F-53'] },
            { name: 'Inventory Management', icon: '📦', transactions: ['MIGO', 'MB51', 'MB52'] },
            { name: 'Financial Accounting', icon: '📊', transactions: ['FB60', 'F-43', 'F-53'] }
        ];

        processes.forEach(p => {
            this.businessProcessMap.set(p.name, p);
        });
    }

    /**
     * Get transaction information
     */
    getTransactionInfo(code) {
        return this.transactionMap.get(code) || {
            code: code,
            name: 'Unknown Transaction',
            module: 'Unknown',
            icon: '❓'
        };
    }

    /**
     * Get module information
     */
    getModuleInfo(code) {
        return this.moduleMap.get(code) || {
            code: code,
            name: 'Unknown Module',
            icon: '❓',
            color: '#666666'
        };
    }

    /**
     * Get business process information
     */
    getBusinessProcessInfo(name) {
        return this.businessProcessMap.get(name) || {
            name: name,
            icon: '❓',
            transactions: []
        };
    }

    /**
     * Format transaction for display
     */
    formatTransaction(transaction) {
        const info = this.getTransactionInfo(transaction.code);
        
        return {
            ...transaction,
            displayName: `${transaction.code} - ${info.name}`,
            icon: info.icon,
            moduleInfo: this.getModuleInfo(transaction.module || info.module)
        };
    }

    /**
     * Parse SAP entities from text
     */
    parseEntities(text) {
        const entities = {
            transactions: [],
            modules: [],
            businessObjects: []
        };

        // Extract transaction codes (pattern: 2-4 letters followed by 2-4 numbers/letters)
        const transactionPattern = /\b[A-Z]{2,4}[0-9A-Z]{2,4}\b/g;
        const foundTransactions = text.match(transactionPattern) || [];
        
        foundTransactions.forEach(code => {
            if (this.transactionMap.has(code)) {
                entities.transactions.push(this.getTransactionInfo(code));
            }
        });

        // Extract module mentions
        const modulePattern = /\b(MM|FI|SD|CO|HR|WM|PP|QM)\b/g;
        const foundModules = text.match(modulePattern) || [];
        
        foundModules.forEach(code => {
            if (this.moduleMap.has(code)) {
                entities.modules.push(this.getModuleInfo(code));
            }
        });

        // Extract business objects (simplified)
        const businessObjectPatterns = [
            /purchase\s+order/gi,
            /sales\s+order/gi,
            /invoice/gi,
            /goods\s+receipt/gi,
            /material\s+document/gi,
            /vendor/gi,
            /customer/gi,
            /material/gi
        ];

        businessObjectPatterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
                entities.businessObjects.push(...matches.map(m => m.toLowerCase()));
            }
        });

        // Remove duplicates
        entities.businessObjects = [...new Set(entities.businessObjects)];

        return entities;
    }

    /**
     * Generate test scenario name
     */
    generateTestScenarioName(transaction, testType = 'functional') {
        const info = this.getTransactionInfo(transaction.code);
        const typeMap = {
            functional: 'Standard',
            negative: 'Error Handling',
            security: 'Authorization',
            integration: 'End-to-End',
            performance: 'Performance'
        };
        
        return `${typeMap[testType] || 'Test'} - ${info.name} (${transaction.code})`;
    }

    /**
     * Calculate risk score
     */
    calculateRiskScore(transaction, dependencies = [], complexity = 'Medium') {
        let score = 0;
        
        // Base score by transaction importance
        const criticalTransactions = ['FB60', 'MIGO', 'VA01', 'ME21N'];
        if (criticalTransactions.includes(transaction.code)) {
            score += 3;
        } else {
            score += 1;
        }
        
        // Add score based on dependencies
        score += Math.min(dependencies.length * 0.5, 3);
        
        // Add score based on complexity
        const complexityScores = { Low: 0, Medium: 1, High: 2 };
        score += complexityScores[complexity] || 1;
        
        // Normalize to 1-10 scale
        return Math.min(Math.max(Math.round(score), 1), 10);
    }

    /**
     * Format risk level
     */
    formatRiskLevel(riskScore) {
        if (riskScore >= 7) return { level: 'High', color: '#f44336', icon: '🔴' };
        if (riskScore >= 4) return { level: 'Medium', color: '#ff9800', icon: '🟡' };
        return { level: 'Low', color: '#4caf50', icon: '🟢' };
    }

    /**
     * Format duration
     */
    formatDuration(minutes) {
        if (minutes < 60) {
            return `${minutes}m`;
        }
        
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        
        if (remainingMinutes === 0) {
            return `${hours}h`;
        }
        
        return `${hours}h ${remainingMinutes}m`;
    }

    /**
     * Generate priority based on various factors
     */
    calculatePriority(transaction, riskLevel, businessImpact) {
        const weights = {
            risk: { High: 3, Medium: 2, Low: 1 },
            impact: { High: 3, Medium: 2, Low: 1 }
        };
        
        const riskScore = weights.risk[riskLevel] || 1;
        const impactScore = weights.impact[businessImpact] || 1;
        const total = riskScore + impactScore;
        
        if (total >= 5) return 'high';
        if (total >= 3) return 'medium';
        return 'low';
    }

    /**
     * Format test case for display
     */
    formatTestCase(testCase) {
        const transactionInfo = this.getTransactionInfo(testCase.transaction_code);
        const riskInfo = this.formatRiskLevel(testCase.risk_level);
        
        return {
            ...testCase,
            displayName: this.generateTestScenarioName(transactionInfo, testCase.test_type),
            transactionInfo: transactionInfo,
            moduleInfo: this.getModuleInfo(transactionInfo.module),
            formattedDuration: this.formatDuration(testCase.estimated_duration_minutes || 15),
            riskInfo: riskInfo,
            priority: this.calculatePriority(transactionInfo, riskInfo.level, testCase.business_impact || 'Medium')
        };
    }

    /**
     * Group test cases by module
     */
    groupTestCasesByModule(testCases) {
        const groups = new Map();
        
        testCases.forEach(testCase => {
            const moduleCode = testCase.moduleInfo?.code || 'Unknown';
            if (!groups.has(moduleCode)) {
                groups.set(moduleCode, {
                    module: this.getModuleInfo(moduleCode),
                    testCases: []
                });
            }
            groups.get(moduleCode).testCases.push(testCase);
        });
        
        return Array.from(groups.values());
    }

    /**
     * Calculate test coverage metrics
     */
    calculateCoverageMetrics(testCases, transactions) {
        const totalTransactions = transactions.length;
        const testedTransactions = new Set(testCases.map(tc => tc.transaction_code)).size;
        
        const typeDistribution = {};
        testCases.forEach(tc => {
            typeDistribution[tc.test_type] = (typeDistribution[tc.test_type] || 0) + 1;
        });
        
        const priorityDistribution = {};
        testCases.forEach(tc => {
            priorityDistribution[tc.priority] = (priorityDistribution[tc.priority] || 0) + 1;
        });
        
        return {
            transactionCoverage: totalTransactions > 0 ? (testedTransactions / totalTransactions * 100) : 0,
            totalTestCases: testCases.length,
            typeDistribution: typeDistribution,
            priorityDistribution: priorityDistribution,
            estimatedExecutionTime: testCases.reduce((sum, tc) => sum + (tc.estimated_duration_minutes || 15), 0)
        };
    }

    /**
     * Validate SAP transaction code
     */
    isValidTransactionCode(code) {
        return /^[A-Z]{2,4}[0-9A-Z]{2,4}$/.test(code);
    }

    /**
     * Format dependency relationship
     */
    formatDependencyRelationship(relationship) {
        const relationshipMap = {
            'reads': { icon: '📖', description: 'Reads data from' },
            'writes': { icon: '✏️', description: 'Writes data to' },
            'calls': { icon: '📞', description: 'Calls function in' },
            'updates': { icon: '🔄', description: 'Updates data in' },
            'validates': { icon: '✅', description: 'Validates data from' },
            'references': { icon: '🔗', description: 'References data in' },
            'posts': { icon: '📝', description: 'Posts to' },
            'calculates': { icon: '🔢', description: 'Calculates using' }
        };
        
        return relationshipMap[relationship] || { icon: '❓', description: 'Related to' };
    }

    /**
     * Generate SAP color scheme based on module
     */
    getModuleColorScheme(moduleCode) {
        const module = this.getModuleInfo(moduleCode);
        return {
            primary: module.color,
            secondary: this.lightenColor(module.color, 20),
            background: this.lightenColor(module.color, 90)
        };
    }

    /**
     * Lighten color by percentage
     */
    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const B = (num >> 8 & 0x00FF) + amt;
        const G = (num & 0x0000FF) + amt;
        
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + 
                     (B < 255 ? B < 1 ? 0 : B : 255) * 0x100 + 
                     (G < 255 ? G < 1 ? 0 : G : 255)).toString(16).slice(1);
    }

    /**
     * Format business metrics
     */
    formatBusinessMetrics(metrics) {
        return {
            timeSaved: this.formatDuration(metrics.timeSaved || 0),
            costSavings: new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: 'USD' 
            }).format(metrics.costSavings || 0),
            efficiencyGain: `${(metrics.efficiencyGain || 0).toFixed(1)}%`,
            qualityImprovement: `${(metrics.qualityImprovement || 0).toFixed(1)}%`
        };
    }
}

// Export singleton instance
const sapUtils = new SAPUtils();

// For debugging in console
window.sapUtils = sapUtils;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = sapUtils;
} else {
    window.sapUtils = sapUtils;
} 
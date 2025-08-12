/**
 * Script Generator Component
 * Generates automation scripts using backend Script Generation Agent
 */

class ScriptGenerator {
    constructor() {
        console.log('ScriptGenerator: Initializing script generator');
        
        this.config = {
            apiBaseUrl: 'http://localhost:8000',
            supportedFormats: ['robot_framework', 'tosca_xml']
        };
        
        this.selectedTestCase = null;
        this.generatedScripts = {};
        this.activeTab = 'robot_framework';
        
        this.init();
    }
    
    async init() {
        try {
            this.setupEventListeners();
            await this.loadTestCases();
            this.renderInterface();
        } catch (error) {
            console.error('ScriptGenerator: Failed to initialize:', error);
            this.renderErrorState();
        }
    }
    
    async loadTestCases() {
        console.log('ScriptGenerator: Loading available test cases');
        
        try {
            const response = await fetch(`${this.config.apiBaseUrl}/api/generate-tests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    analysis: {
                        extracted_transactions: [
                            { code: 'ME21N', name: 'Create Purchase Order' },
                            { code: 'FB60', name: 'Enter Incoming Invoice' }
                        ]
                    }
                })
            });
            
            const data = await response.json();
            this.availableTestCases = this.transformTestCases(data);
            
        } catch (error) {
            console.error('ScriptGenerator: Failed to load test cases:', error);
            this.availableTestCases = this.getMockTestCases();
        }
    }
    
    getMockTestCases() {
        return [
            {
                id: 'TC001',
                name: 'ME21N Purchase Order with Vendor Validation',
                transaction: 'ME21N'
            },
            {
                id: 'TC002', 
                name: 'FB60 Invoice Entry with Tax Calculation',
                transaction: 'FB60'
            }
        ];
    }
    
    async generateScripts() {
        if (!this.selectedTestCase) {
            alert('Please select a test case first');
            return;
        }
        
        console.log('ScriptGenerator: Generating scripts for:', this.selectedTestCase.id);
        
        try {
            // Call backend script generation
            const response = await fetch(`${this.config.apiBaseUrl}/api/generate-scripts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    test_case: this.selectedTestCase,
                    formats: ['robot_framework', 'tosca_xml']
                })
            });
            
            const data = await response.json();
            this.generatedScripts = data;
            this.renderScripts();
            
        } catch (error) {
            console.error('ScriptGenerator: Script generation failed:', error);
            this.showErrorState();
        }
    }
    
    setupEventListeners() {
        console.log('ScriptGenerator: Setting up event listeners');
    }
    
    renderInterface() {
        console.log('ScriptGenerator: Rendering interface');
    }
    
    renderScripts() {
        console.log('ScriptGenerator: Rendering generated scripts');
    }
    
    renderErrorState() {
        console.log('ScriptGenerator: Rendering error state');
    }
}

// Global initialization
let scriptGenerator;
document.addEventListener('DOMContentLoaded', () => {
    scriptGenerator = new ScriptGenerator();
});

// Export for global access
if (typeof window !== 'undefined') {
    window.scriptGenerator = scriptGenerator;
} 
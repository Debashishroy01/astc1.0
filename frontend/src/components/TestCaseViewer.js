/**
 * Test Case Viewer Component
 * Displays and manages generated test cases
 */

class TestCaseViewer {
    constructor() {
        this.testCases = [];
        this.filteredTestCases = [];
        this.currentFilters = {
            module: '',
            priority: '',
            testType: ''
        };
        
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.testCasesList = document.getElementById('testCasesList');
        this.moduleFilter = document.getElementById('moduleFilter');
        this.priorityFilter = document.getElementById('priorityFilter');
    }

    attachEventListeners() {
        if (this.moduleFilter) {
            this.moduleFilter.addEventListener('change', () => this.applyFilters());
        }
        
        if (this.priorityFilter) {
            this.priorityFilter.addEventListener('change', () => this.applyFilters());
        }
    }

    updateTestCases(testCases) {
        this.testCases = testCases || [];
        this.filteredTestCases = [...this.testCases];
        this.renderTestCases();
    }

    applyFilters() {
        this.currentFilters.module = this.moduleFilter?.value || '';
        this.currentFilters.priority = this.priorityFilter?.value || '';
        
        this.filteredTestCases = this.testCases.filter(testCase => {
            const matchesModule = !this.currentFilters.module || 
                                 testCase.transaction_code?.includes(this.currentFilters.module);
            const matchesPriority = !this.currentFilters.priority || 
                                   testCase.priority === this.currentFilters.priority;
            
            return matchesModule && matchesPriority;
        });
        
        this.renderTestCases();
    }

    renderTestCases() {
        if (!this.testCasesList) return;

        if (this.filteredTestCases.length === 0) {
            this.testCasesList.innerHTML = `
                <div class="no-tests-placeholder">
                    <div class="placeholder-icon">📝</div>
                    <p>No test cases generated yet</p>
                    <p>Use the Natural Language interface to analyze requirements and generate tests</p>
                </div>
            `;
            return;
        }

        const testCasesHtml = this.filteredTestCases.map(testCase => {
            return this.renderTestCase(testCase);
        }).join('');

        this.testCasesList.innerHTML = testCasesHtml;
    }

    renderTestCase(testCase) {
        const formatted = sapUtils.formatTestCase(testCase);
        
        return `
            <div class="test-case-item" onclick="testCaseViewer.showTestCaseDetails('${testCase.test_id}')">
                <div class="test-case-header">
                    <h4 class="test-case-title">${formatted.displayName || testCase.name}</h4>
                    <span class="test-case-priority ${testCase.priority}">${(testCase.priority || 'medium').toUpperCase()}</span>
                </div>
                <div class="test-case-meta">
                    <span class="test-case-type">${testCase.test_type || 'functional'}</span>
                    <span class="test-case-duration">${formatted.formattedDuration}</span>
                    <span class="test-case-transaction">${testCase.transaction_code}</span>
                </div>
                <div class="test-case-description">
                    ${testCase.description || 'No description available'}
                </div>
                <div class="test-case-stats">
                    <span class="stat">
                        <strong>Steps:</strong> ${(testCase.steps || []).length}
                    </span>
                    <span class="stat">
                        <strong>Validations:</strong> ${(testCase.validations || []).length}
                    </span>
                    <span class="stat">
                        <strong>Risk:</strong> ${testCase.risk_level || 'Medium'}
                    </span>
                </div>
            </div>
        `;
    }

    showTestCaseDetails(testId) {
        const testCase = this.testCases.find(tc => tc.test_id === testId);
        if (!testCase) return;

        const content = this.generateTestCaseDetailsHtml(testCase);
        showModal('Test Case Details', content);
    }

    generateTestCaseDetailsHtml(testCase) {
        return `
            <div class="test-case-details">
                <div class="test-case-header">
                    <h3>${testCase.name}</h3>
                    <span class="priority-badge ${testCase.priority}">${(testCase.priority || 'medium').toUpperCase()}</span>
                </div>
                
                <div class="test-case-info">
                    <div class="info-row">
                        <strong>Transaction:</strong> ${testCase.transaction_code}
                    </div>
                    <div class="info-row">
                        <strong>Type:</strong> ${testCase.test_type}
                    </div>
                    <div class="info-row">
                        <strong>Duration:</strong> ${testCase.estimated_duration_minutes || 15} minutes
                    </div>
                    <div class="info-row">
                        <strong>Risk Level:</strong> ${testCase.risk_level || 'Medium'}
                    </div>
                </div>

                <div class="test-case-description">
                    <h4>Description</h4>
                    <p>${testCase.description || 'No description available'}</p>
                </div>

                ${testCase.prerequisites && testCase.prerequisites.length > 0 ? `
                <div class="test-case-prerequisites">
                    <h4>Prerequisites</h4>
                    <ul>
                        ${testCase.prerequisites.map(prereq => `<li>${prereq}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}

                <div class="test-case-steps">
                    <h4>Test Steps</h4>
                    <ol>
                        ${(testCase.steps || []).map(step => `<li>${step}</li>`).join('')}
                    </ol>
                </div>

                <div class="test-case-validations">
                    <h4>Expected Results & Validations</h4>
                    <ul>
                        ${(testCase.validations || []).map(validation => `<li>${validation}</li>`).join('')}
                    </ul>
                </div>

                ${testCase.test_data && Object.keys(testCase.test_data).length > 0 ? `
                <div class="test-case-data">
                    <h4>Test Data</h4>
                    <table class="test-data-table">
                        ${Object.entries(testCase.test_data).map(([key, value]) => `
                            <tr>
                                <td><strong>${key}:</strong></td>
                                <td>${value}</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>
                ` : ''}

                <div class="test-case-actions">
                    <button class="btn btn-primary" onclick="testCaseViewer.exportTestCase('${testCase.test_id}')">
                        Export Test Case
                    </button>
                    <button class="btn btn-secondary" onclick="testCaseViewer.copyTestCase('${testCase.test_id}')">
                        Copy to Clipboard
                    </button>
                </div>
            </div>
        `;
    }

    exportTestCase(testId) {
        const testCase = this.testCases.find(tc => tc.test_id === testId);
        if (!testCase) return;

        const exportData = {
            name: testCase.name,
            transaction: testCase.transaction_code,
            type: testCase.test_type,
            priority: testCase.priority,
            description: testCase.description,
            prerequisites: testCase.prerequisites || [],
            steps: testCase.steps || [],
            validations: testCase.validations || [],
            test_data: testCase.test_data || {},
            expected_result: testCase.expected_result
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${testCase.transaction_code}_${testCase.test_type}_test.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    copyTestCase(testId) {
        const testCase = this.testCases.find(tc => tc.test_id === testId);
        if (!testCase) return;

        const textContent = `
Test Case: ${testCase.name}
Transaction: ${testCase.transaction_code}
Type: ${testCase.test_type}
Priority: ${testCase.priority}

Description:
${testCase.description}

Prerequisites:
${(testCase.prerequisites || []).map((prereq, i) => `${i + 1}. ${prereq}`).join('\n')}

Test Steps:
${(testCase.steps || []).map((step, i) => `${i + 1}. ${step}`).join('\n')}

Expected Results:
${(testCase.validations || []).map((validation, i) => `${i + 1}. ${validation}`).join('\n')}
        `.trim();

        navigator.clipboard.writeText(textContent).then(() => {
            // Show success message
            const successMsg = document.createElement('div');
            successMsg.textContent = 'Test case copied to clipboard!';
            successMsg.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #28a745;
                color: white;
                padding: 10px 20px;
                border-radius: 5px;
                z-index: 10000;
            `;
            document.body.appendChild(successMsg);
            setTimeout(() => successMsg.remove(), 3000);
        });
    }

    refreshTestCases() {
        // This could be called to refresh test cases from the server
        console.log('Refreshing test cases...');
    }

    clearTestCases() {
        this.testCases = [];
        this.filteredTestCases = [];
        this.renderTestCases();
    }
}

// Global function for HTML event handlers
function filterTests() {
    if (window.testCaseViewer) {
        window.testCaseViewer.applyFilters();
    }
}

// Initialize when DOM is ready
let testCaseViewer;

document.addEventListener('DOMContentLoaded', () => {
    testCaseViewer = new TestCaseViewer();
    window.testCaseViewer = testCaseViewer;
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TestCaseViewer;
} else {
    window.TestCaseViewer = TestCaseViewer;
} 
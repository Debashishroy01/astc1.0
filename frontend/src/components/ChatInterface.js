/**
 * Chat Interface Component
 * Handles natural language input and displays AI analysis results
 */

class ChatInterface {
    constructor() {
        this.isProcessing = false;
        this.messageHistory = [];
        this.currentRequestId = null;
        
        if (this.initializeElements()) {
            this.attachEventListeners();
        }
    }

    initializeElements() {
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.processingIndicator = document.getElementById('processingIndicator');
        
        // Check if all required elements exist
        if (!this.chatMessages) {
            console.warn('ChatInterface: chatMessages element not found');
            return false;
        }
        if (!this.chatInput) {
            console.warn('ChatInterface: chatInput element not found');
            return false;
        }
        if (!this.sendBtn) {
            console.warn('ChatInterface: sendBtn element not found');
            return false;
        }
        if (!this.processingIndicator) {
            console.warn('ChatInterface: processingIndicator element not found');
            return false;
        }
        
        // Auto-focus the input for better UX
        setTimeout(() => {
            if (this.chatInput) {
                this.chatInput.focus();
            }
        }, 100);
        
        return true;
    }

    attachEventListeners() {
        // Send button click
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        
        // Enhanced keyboard shortcuts for better UX
        this.chatInput.addEventListener('keydown', (e) => {
            // Enter to send (without modifier keys)
            if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
                e.preventDefault();
                this.sendMessage();
            }
            // Shift+Enter for new line (default behavior)
            // No need to handle this as it's browser default
        });

        // Auto-resize textarea as user types
        this.chatInput.addEventListener('input', () => {
            this.autoResizeTextarea();
        });
    }

    autoResizeTextarea() {
        if (!this.chatInput) return;
        
        // Reset height to calculate new height
        this.chatInput.style.height = 'auto';
        
        // Set new height based on content, with min/max limits
        const minHeight = 80; // 3 rows roughly
        const maxHeight = 200; // About 8 rows
        const newHeight = Math.max(minHeight, Math.min(this.chatInput.scrollHeight, maxHeight));
        
        this.chatInput.style.height = newHeight + 'px';
    }

    async sendMessage() {
        if (!this.chatInput) {
            console.warn('ChatInterface: chatInput element not available');
            return;
        }
        
        const message = this.chatInput.value.trim();
        
        if (!message || this.isProcessing) {
            return;
        }

        // Add user message to chat
        this.addMessage({
            type: 'user',
            content: message,
            timestamp: new Date()
        });

        // Clear input and show processing
        this.chatInput.value = '';
        if (this.processingIndicator) {
            this.processingIndicator.style.display = 'block';
        }
        this.isProcessing = true;

        try {
            // Perform complete analysis
            const result = await api.performCompleteAnalysis(message);
            
            if (result.success) {
                await this.handleAnalysisResult(result.data);
            } else {
                this.addMessage({
                    type: 'error',
                    content: `Analysis failed: ${result.error}`,
                    timestamp: new Date()
                });
            }
        } catch (error) {
            console.error('Chat error:', error);
            this.addMessage({
                type: 'error',
                content: `An error occurred: ${error.message}`,
                timestamp: new Date()
            });
        } finally {
            this.setProcessing(false);
        }
    }

    async handleAnalysisResult(data) {
        const { analysis, tests, dependencies } = data;
        
        // Add analysis message
        if (analysis && analysis.analysis) {
            this.addAnalysisMessage(analysis.analysis);
        }

        // Add test generation message
        if (tests && tests.test_suite) {
            this.addTestGenerationMessage(tests.test_suite);
        }

        // Add dependency analysis message
        if (dependencies && dependencies.dependency_analysis) {
            this.addDependencyAnalysisMessage(dependencies.dependency_analysis);
        }

        // Update other components with new data
        this.notifyOtherComponents(data);
    }

    addMessage(message) {
        if (!this.chatMessages) {
            console.warn('ChatInterface: chatMessages element not available for appendChild');
            return;
        }
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.type}-message`;
        
        // Create message avatar
        const messageAvatar = document.createElement('div');
        messageAvatar.className = 'message-avatar';
        messageAvatar.textContent = message.type === 'user' ? '👤' : '🤖';
        
        // Create message content wrapper
        const messageContentWrapper = document.createElement('div');
        messageContentWrapper.className = 'message-content';
        
        // Create message text
        const messageText = document.createElement('div');
        messageText.className = 'message-text';
        messageText.innerHTML = this.escapeHtml(message.content);
        
        // Create message time
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = this.formatTimestamp(message.timestamp);
        
        // Assemble the message structure
        messageContentWrapper.appendChild(messageText);
        messageContentWrapper.appendChild(messageTime);
        messageElement.appendChild(messageAvatar);
        messageElement.appendChild(messageContentWrapper);
        
        this.chatMessages.appendChild(messageElement);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        
        // Store in history
        this.messageHistory.push(message);
    }

    renderMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.type}-message`;
        
        const timestamp = this.formatTimestamp(message.timestamp);
        
        switch (message.type) {
            case 'user':
                messageElement.innerHTML = `
                    <div class="message-content">
                        <div class="message-header">
                            <span class="message-sender">You</span>
                            <span class="message-time">${timestamp}</span>
                        </div>
                        <p>${this.escapeHtml(message.content)}</p>
                    </div>
                `;
                break;
                
            case 'agent':
                messageElement.innerHTML = `
                    <div class="message-avatar">🤖</div>
                    <div class="message-content">
                        <div class="message-header">
                            <span class="message-sender">${message.agent || 'ASTC Agent'}</span>
                            <span class="message-time">${timestamp}</span>
                        </div>
                        <div class="message-body">${message.content}</div>
                    </div>
                `;
                break;
                
            case 'system':
                messageElement.innerHTML = `
                    <div class="message-content">
                        <div class="system-content">${message.content}</div>
                    </div>
                `;
                break;
                
            case 'error':
                messageElement.innerHTML = `
                    <div class="message-content error-content">
                        <div class="error-icon">⚠️</div>
                        <div class="error-text">${this.escapeHtml(message.content)}</div>
                    </div>
                `;
                break;
        }
        
        this.chatMessages.appendChild(messageElement);
    }

    addAnalysisMessage(analysis) {
        const content = this.formatAnalysisContent(analysis);
        
        this.addMessage({
            type: 'agent',
            agent: 'SAP Intelligence Agent',
            content: content,
            timestamp: new Date(),
            data: analysis
        });
    }

    formatAnalysisContent(analysis) {
        let content = `
            <div class="analysis-result">
                <h4>📊 Analysis Complete</h4>
                <p><strong>Confidence:</strong> ${(analysis.confidence_score * 100).toFixed(1)}%</p>
        `;

        if (analysis.extracted_transactions && analysis.extracted_transactions.length > 0) {
            content += `
                <div class="transactions-found">
                    <h5>🔍 Transactions Identified:</h5>
                    <ul>
            `;
            
            analysis.extracted_transactions.forEach(transaction => {
                const info = sapUtils.getTransactionInfo(transaction.code);
                content += `
                    <li>
                        <span class="transaction-code">${transaction.code}</span>
                        <span class="transaction-name">${info.name}</span>
                        <span class="transaction-module">(${transaction.module})</span>
                    </li>
                `;
            });
            
            content += `
                    </ul>
                </div>
            `;
        }

        if (analysis.business_processes && analysis.business_processes.length > 0) {
            content += `
                <div class="processes-found">
                    <h5>🏢 Business Processes:</h5>
                    <ul>
            `;
            
            analysis.business_processes.forEach(process => {
                content += `<li>${process}</li>`;
            });
            
            content += `
                    </ul>
                </div>
            `;
        }

        if (analysis.intent && analysis.intent.primary_intent) {
            const intentIcons = {
                'test_creation': '🧪',
                'impact_analysis': '📈',
                'process_documentation': '📋',
                'troubleshooting': '🔧',
                'training': '📚'
            };
            
            const icon = intentIcons[analysis.intent.primary_intent] || '❓';
            content += `
                <div class="intent-analysis">
                    <h5>🎯 Intent Analysis:</h5>
                    <p>${icon} ${analysis.intent.primary_intent.replace('_', ' ').toUpperCase()}</p>
                </div>
            `;
        }

        if (analysis.recommendations && analysis.recommendations.length > 0) {
            content += `
                <div class="recommendations">
                    <h5>💡 Recommendations:</h5>
                    <ul>
            `;
            
            analysis.recommendations.forEach(rec => {
                content += `<li>${rec}</li>`;
            });
            
            content += `
                    </ul>
                </div>
            `;
        }

        content += `</div>`;
        return content;
    }

    addTestGenerationMessage(testSuite) {
        const content = this.formatTestGenerationContent(testSuite);
        
        this.addMessage({
            type: 'agent',
            agent: 'Test Generation Agent',
            content: content,
            timestamp: new Date(),
            data: testSuite
        });
    }

    formatTestGenerationContent(testSuite) {
        let content = `
            <div class="test-generation-result">
                <h4>🧪 Test Cases Generated</h4>
                <p><strong>Total Test Cases:</strong> ${testSuite.total_tests}</p>
        `;

        if (testSuite.coverage_metrics) {
            const coverage = testSuite.coverage_metrics;
            content += `
                <div class="coverage-metrics">
                    <h5>📊 Coverage Metrics:</h5>
                    <div class="metrics-grid">
                        <div class="metric">
                            <span class="metric-label">Transaction Coverage:</span>
                            <span class="metric-value">${coverage.transaction_coverage.toFixed(1)}%</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Test Types:</span>
                            <span class="metric-value">${Object.keys(coverage.test_type_distribution).length}</span>
                        </div>
                    </div>
                </div>
            `;
        }

        if (testSuite.estimated_execution_time) {
            const time = testSuite.estimated_execution_time;
            content += `
                <div class="execution-time">
                    <h5>⏱️ Estimated Execution Time:</h5>
                    <p>${sapUtils.formatDuration(time.total_minutes)}</p>
                </div>
            `;
        }

        // Show sample test cases
        if (testSuite.test_cases && testSuite.test_cases.length > 0) {
            content += `
                <div class="sample-tests">
                    <h5>📝 Sample Test Cases:</h5>
                    <div class="test-case-preview">
            `;
            
            const sampleTests = testSuite.test_cases.slice(0, 3); // Show first 3
            sampleTests.forEach(testCase => {
                const formatted = sapUtils.formatTestCase(testCase);
                content += `
                    <div class="test-case-item">
                        <div class="test-case-header">
                            <span class="test-case-name">${formatted.name}</span>
                            <span class="test-case-priority priority-${formatted.priority}">${formatted.priority.toUpperCase()}</span>
                        </div>
                        <div class="test-case-details">
                            <span class="test-case-type">${testCase.test_type}</span>
                            <span class="test-case-duration">${formatted.formattedDuration}</span>
                        </div>
                    </div>
                `;
            });
            
            if (testSuite.test_cases.length > 3) {
                content += `
                    <div class="test-case-more">
                        <button class="btn btn-secondary" onclick="showView('tests')">
                            View All ${testSuite.test_cases.length} Test Cases
                        </button>
                    </div>
                `;
            }
            
            content += `
                    </div>
                </div>
            `;
        }

        content += `</div>`;
        return content;
    }

    addDependencyAnalysisMessage(dependencyAnalysis) {
        const content = this.formatDependencyAnalysisContent(dependencyAnalysis);
        
        this.addMessage({
            type: 'agent',
            agent: 'Dependency Analysis Agent',
            content: content,
            timestamp: new Date(),
            data: dependencyAnalysis
        });
    }

    formatDependencyAnalysisContent(analysis) {
        let content = `
            <div class="dependency-analysis-result">
                <h4>🔗 Dependency Analysis Complete</h4>
        `;

        if (analysis.consolidated_analysis) {
            const consolidated = analysis.consolidated_analysis;
            content += `
                <div class="dependency-summary">
                    <h5>📊 Analysis Summary:</h5>
                    <div class="metrics-grid">
                        <div class="metric">
                            <span class="metric-label">Components Involved:</span>
                            <span class="metric-value">${consolidated.total_components_involved}</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Complexity:</span>
                            <span class="metric-value">${consolidated.overall_complexity}</span>
                        </div>
                    </div>
                </div>
            `;

            if (consolidated.high_risk_components && consolidated.high_risk_components.length > 0) {
                content += `
                    <div class="high-risk-components">
                        <h5>⚠️ High Risk Components:</h5>
                        <ul>
                `;
                
                consolidated.high_risk_components.forEach(component => {
                    content += `<li>${component}</li>`;
                });
                
                content += `
                        </ul>
                    </div>
                `;
            }

            if (consolidated.recommended_approach && consolidated.recommended_approach.length > 0) {
                content += `
                    <div class="recommended-approach">
                        <h5>💡 Recommended Approach:</h5>
                        <ul>
                `;
                
                consolidated.recommended_approach.forEach(recommendation => {
                    content += `<li>${recommendation}</li>`;
                });
                
                content += `
                        </ul>
                    </div>
                `;
            }
        }

        content += `
            <div class="dependency-actions">
                <button class="btn btn-secondary" onclick="showView('dependencies')">
                    View Dependency Graph
                </button>
            </div>
        `;

        content += `</div>`;
        return content;
    }

    setProcessing(processing) {
        this.isProcessing = processing;
        this.sendBtn.disabled = processing;
        this.chatInput.disabled = processing;
        
        if (processing) {
            this.processingIndicator.style.display = 'flex';
            this.sendBtn.innerHTML = '<span class="spinner"></span> Processing...';
        } else {
            this.processingIndicator.style.display = 'none';
            this.sendBtn.innerHTML = '<span class="btn-icon">🚀</span> Analyze';
        }
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    formatTimestamp(timestamp) {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    notifyOtherComponents(data) {
        console.log('ChatInterface: Notifying other components with data:', data);
        
        // Robust dashboard notification with multiple fallbacks
        try {
            if (window.dashboard && typeof window.dashboard.updateWithAnalysisData === 'function') {
                console.log('ChatInterface: Notifying dashboard...');
                
                // Add extra safety wrapper
                setTimeout(() => {
                    try {
                        window.dashboard.updateWithAnalysisData(data);
                        console.log('ChatInterface: Dashboard notified successfully');
                    } catch (innerError) {
                        console.error('ChatInterface: Inner dashboard notification error:', innerError);
                        console.error('Dashboard status:', window.dashboard?.getStatus?.() || 'No status method');
                    }
                }, 10); // Small delay to ensure DOM is fully ready
                
            } else {
                console.log('ChatInterface: Dashboard not available or missing updateWithAnalysisData method');
                
                // Try to reinitialize dashboard if it's missing
                if (!window.dashboard && window.initializeDashboard) {
                    console.log('ChatInterface: Attempting to reinitialize dashboard...');
                    window.initializeDashboard();
                }
            }
        } catch (error) {
            console.error('ChatInterface: Dashboard notification failed completely:', error);
            console.error('Stack trace:', error.stack);
            
            // Emergency fallback - create minimal dashboard if none exists
            if (!window.dashboard) {
                console.log('ChatInterface: Creating emergency dashboard fallback');
                window.dashboard = {
                    updateWithAnalysisData: (data) => console.log('Emergency dashboard: Data received', data),
                    addActivity: (activity) => console.log('Emergency dashboard: Activity received', activity),
                    getStatus: () => ({ mode: 'emergency', initialized: false })
                };
            }
        }

        // Notify test case viewer (existing code with enhanced error handling)
        try {
            if (window.testCaseViewer && data.tests && data.tests.test_suite && data.tests.test_suite.test_cases) {
                console.log('ChatInterface: Notifying test case viewer...');
                
                setTimeout(() => {
                    try {
                        window.testCaseViewer.updateTestCases(data.tests.test_suite.test_cases);
                        console.log('ChatInterface: Test case viewer notified successfully');
                    } catch (innerError) {
                        console.error('ChatInterface: Inner test case viewer notification error:', innerError);
                    }
                }, 10);
                
            } else {
                console.log('ChatInterface: Test case viewer not available or no test data to notify');
            }
        } catch (error) {
            console.error('ChatInterface: Test case viewer notification failed:', error);
        }

        // Notify any other components that might be listening
        try {
            // Dispatch custom event for any other components
            const event = new CustomEvent('astc-analysis-complete', {
                detail: data,
                bubbles: true
            });
            document.dispatchEvent(event);
            console.log('ChatInterface: Custom event dispatched');
        } catch (error) {
            console.error('ChatInterface: Custom event dispatch failed:', error);
        }
    }

    // Public methods for external use
    clear() {
        this.messages = [];
        this.chatMessages.innerHTML = `
            <div class="message system-message">
                <div class="message-content">
                    <p>👋 Welcome to ASTC! I can help you analyze SAP testing requirements and generate comprehensive test cases.</p>
                    <p>Try asking me something like:</p>
                    <ul>
                        <li>"Test ME21N purchase order creation with approval workflow"</li>
                        <li>"What happens if I change vendor validation rules?"</li>
                        <li>"Generate test cases for order-to-cash process"</li>
                    </ul>
                </div>
            </div>
        `;
    }

    addSystemMessage(content) {
        this.addMessage({
            type: 'system',
            content: content,
            timestamp: new Date()
        });
    }

    // Preset messages for quick testing
    loadPresetMessage(preset) {
        const presets = {
            'po_creation': "Test ME21N purchase order creation with approval workflow",
            'invoice_processing': "Analyze FB60 invoice processing with three-way matching",
            'sales_order': "Generate test cases for VA01 sales order creation process",
            'goods_movement': "Test MIGO goods movement with inventory validation",
            'impact_analysis': "What happens if I change vendor validation rules in procurement?"
        };

        if (presets[preset]) {
            this.chatInput.value = presets[preset];
            this.autoResizeTextarea();
        }
    }
}

// Initialize chat interface when DOM is ready
let chatInterface;

// Function to safely initialize chat interface
function initializeChatInterface() {
    try {
        console.log('Attempting to initialize ChatInterface...');
        
        // Check if we're on the chat view
        const chatView = document.getElementById('chatView');
        if (!chatView || !chatView.classList.contains('active')) {
            console.log('Chat view not active, skipping initialization');
            return;
        }
        
        if (!chatInterface) {
            console.log('Creating new ChatInterface instance...');
            chatInterface = new ChatInterface();
            window.chatInterface = chatInterface;
            console.log('ChatInterface created successfully');
        } else {
            console.log('ChatInterface already exists, reinitializing...');
            // Try to reinitialize if elements are now available
            if (chatInterface.initializeElements()) {
                chatInterface.attachEventListeners();
                console.log('ChatInterface reinitialized successfully');
            }
        }
    } catch (error) {
        console.warn('ChatInterface initialization failed:', error);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, waiting for chat view...');
    setTimeout(initializeChatInterface, 100);
});

// Also expose the initialization function globally for view switching
window.initializeChatInterface = initializeChatInterface;

// Add global function to reinitialize chat when switching views
window.reinitializeChatInterface = function() {
    console.log('Reinitializing ChatInterface for view switch...');
    setTimeout(initializeChatInterface, 50);
};

// Export chat functions globally
window.sendMessage = function() {
    try {
        console.log('sendMessage called');
        // Try to initialize chat interface if it doesn't exist
        if (!window.chatInterface && window.initializeChatInterface) {
            window.initializeChatInterface();
        }
        
        if (window.chatInterface) {
            window.chatInterface.sendMessage();
        } else {
            console.warn('ChatInterface not available for sendMessage');
        }
    } catch (error) {
        console.error('Error in sendMessage:', error);
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatInterface;
} else {
    window.ChatInterface = ChatInterface;
} 
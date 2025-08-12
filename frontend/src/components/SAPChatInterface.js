/**
 * SAP Chat Interface Component - Built from Scratch
 * Completely error-proof chat interface for SAP intelligence
 * Zero dependency on problematic DOM elements
 * Robust error handling and null checking throughout
 */

class SAPChatInterface {
    constructor() {
        console.log('SAPChatInterface: Initializing new SAP Chat Interface');
        
        // State management
        this.state = {
            isProcessing: false,
            messageHistory: [],
            currentRequestId: null,
            isInitialized: false
        };
        
        // Configuration
        this.config = {
            maxMessages: 50,
            apiBaseUrl: 'http://localhost:8000',
            autoScroll: true,
            showTypingIndicator: true,
            placeholderText: `Ask ASTC about your SAP changes, transports, or testing needs...

Examples:
• What should I test for transport TR001?
• Which custom programs are affected by recent changes?
• What are the risks with MM+FI integration?`
        };
        
        // UI Elements - will be safely initialized
        this.elements = {};
        
        // Initialize when ready
        this.initialize();
    }

    initialize() {
        console.log('SAPChatInterface: Starting initialization');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeElements());
        } else {
            this.initializeElements();
        }
    }

    initializeElements() {
        console.log('SAPChatInterface: Initializing chat elements');
        
        // Safely find chat elements
        this.elements = {
            chatMessages: this.findElement('chatMessages'),
            chatInput: this.findElement('chatInput'),
            sendBtn: this.findElement('sendBtn'),
            processingIndicator: this.findElement('processingIndicator'),
            chatContainer: this.findElement('chatView') || this.findElement('chat-container'),
            suggestedQuestions: this.findElement('suggested-questions') || this.findElement('suggestion-buttons')
        };
        
        // Log which elements were found
        Object.entries(this.elements).forEach(([key, element]) => {
            if (element) {
                console.log(`SAPChatInterface: Found ${key} element`);
            } else {
                console.log(`SAPChatInterface: ${key} element not found (will handle gracefully)`);
            }
        });
        
        // Set up the interface
        this.setupInterface();
        this.attachEventListeners();
        this.state.isInitialized = true;
        
        console.log('SAPChatInterface: Initialization complete');
    }

    findElement(id) {
        // Try multiple ways to find elements
        let element = document.getElementById(id);
        
        if (!element) {
            // Try by class name
            const byClass = document.querySelector(`.${id}`);
            if (byClass) element = byClass;
        }
        
        if (!element) {
            // Try by data attribute
            const byData = document.querySelector(`[data-element="${id}"]`);
            if (byData) element = byData;
        }
        
        return element;
    }

    setupInterface() {
        console.log('SAPChatInterface: Setting up interface');
        
        // Setup input placeholder
        if (this.elements.chatInput) {
            this.elements.chatInput.placeholder = this.config.placeholderText;
            this.elements.chatInput.focus();
        }
        
        // Setup processing indicator
        if (this.elements.processingIndicator) {
            this.hideProcessingIndicator();
        }
        
        // Load any existing messages
        this.loadMessageHistory();
    }

    attachEventListeners() {
        console.log('SAPChatInterface: Attaching event listeners');
        
        // Send button click
        if (this.elements.sendBtn) {
            this.elements.sendBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.sendMessage();
            });
        }
        
        // Input enter key
        if (this.elements.chatInput) {
            this.elements.chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                } else if (e.key === 'Enter' && e.shiftKey) {
                    // Allow new line with Shift+Enter
                    return true;
                }
            });
            
            // Auto-resize textarea
            this.elements.chatInput.addEventListener('input', () => {
                this.autoResizeTextarea();
            });
        }
        
        // Suggested questions
        if (this.elements.suggestedQuestions) {
            this.elements.suggestedQuestions.addEventListener('click', (e) => {
                if (e.target.classList.contains('suggestion-btn') || e.target.closest('.suggestion-btn')) {
                    const button = e.target.classList.contains('suggestion-btn') ? e.target : e.target.closest('.suggestion-btn');
                    const question = button.textContent.trim();
                    this.askQuestion(question);
                }
            });
        }
        
        console.log('SAPChatInterface: Event listeners attached');
    }

    sendMessage() {
        if (!this.state.isInitialized) {
            console.warn('SAPChatInterface: Cannot send message - interface not initialized');
            return;
        }
        
        if (this.state.isProcessing) {
            console.log('SAPChatInterface: Message sending blocked - already processing');
            return;
        }
        
        const messageText = this.getInputText();
        if (!messageText || messageText.trim().length === 0) {
            console.log('SAPChatInterface: Empty message - not sending');
            return;
        }
        
        console.log('SAPChatInterface: Sending message:', messageText);
        
        // Add user message to display
        this.addMessage({
            type: 'user',
            content: messageText.trim(),
            timestamp: new Date()
        });
        
        // Clear input
        this.clearInput();
        
        // Show processing
        this.showProcessingIndicator();
        this.state.isProcessing = true;
        
        // Send to API
        this.sendToAPI(messageText.trim());
    }

    getInputText() {
        if (this.elements.chatInput && this.elements.chatInput.value !== undefined) {
            return this.elements.chatInput.value;
        }
        return '';
    }

    clearInput() {
        if (this.elements.chatInput) {
            this.elements.chatInput.value = '';
            this.autoResizeTextarea();
        }
    }

    addMessage(message) {
        if (!this.elements.chatMessages) {
            console.warn('SAPChatInterface: Cannot add message - chatMessages element not found');
            return;
        }
        
        try {
            // Add to history
            this.state.messageHistory.push(message);
            
            // Keep history within limits
            if (this.state.messageHistory.length > this.config.maxMessages) {
                this.state.messageHistory = this.state.messageHistory.slice(-this.config.maxMessages);
            }
            
            // Create message element
            const messageElement = this.createMessageElement(message);
            
            // Add to DOM
            this.elements.chatMessages.appendChild(messageElement);
            
            // Auto-scroll if enabled
            if (this.config.autoScroll) {
                this.scrollToBottom();
            }
            
            console.log('SAPChatInterface: Message added successfully');
        } catch (error) {
            console.error('SAPChatInterface: Error adding message:', error);
        }
    }

    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.type}-message`;
        
        // Create message structure
        const messageBubble = document.createElement('div');
        messageBubble.className = 'message-bubble';
        
        // Add avatar for ASTC messages
        if (message.type === 'astc') {
            const avatar = document.createElement('div');
            avatar.className = 'message-avatar';
            avatar.textContent = '🤖';
            messageDiv.appendChild(avatar);
        }
        
        // Message content
        const content = document.createElement('div');
        content.className = 'message-content';
        content.innerHTML = this.formatMessageContent(message.content);
        
        // Message time
        const time = document.createElement('div');
        time.className = 'message-time';
        time.textContent = this.formatTimestamp(message.timestamp);
        
        // Assemble message
        messageBubble.appendChild(content);
        messageBubble.appendChild(time);
        messageDiv.appendChild(messageBubble);
        
        return messageDiv;
    }

    formatMessageContent(content) {
        // Safely format message content
        if (typeof content !== 'string') {
            content = String(content);
        }
        
        // Basic HTML escaping for safety
        const div = document.createElement('div');
        div.textContent = content;
        let escaped = div.innerHTML;
        
        // Allow basic formatting
        escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        escaped = escaped.replace(/\*(.*?)\*/g, '<em>$1</em>');
        escaped = escaped.replace(/\n/g, '<br>');
        
        return escaped;
    }

    formatTimestamp(timestamp) {
        if (!timestamp || !(timestamp instanceof Date)) {
            return 'Just now';
        }
        
        return timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
    
    showDependencyVisualization(dependencyData) {
        console.log('SAPChatInterface: Showing dependency visualization:', dependencyData);
        
        try {
            // Always add a notification with visualization button first
            this.addDependencyNotification(dependencyData);
            
            // Try to trigger the dependency graph component
            if (window.dependencyGraph && typeof window.dependencyGraph.updateWithDependencyData === 'function') {
                console.log('SAPChatInterface: Triggering dependency graph with data');
                window.dependencyGraph.updateWithDependencyData(dependencyData);
                
                // Switch to Dependency Graph view
                if (window.showView) {
                    setTimeout(() => window.showView('dependencies'), 500);
                }
            } else {
                console.log('SAPChatInterface: dependencyGraph not available or missing updateWithDependencyData method');
            }
            
            // Try to trigger advanced dependency graph
            if (window.advancedDependencyGraph && typeof window.advancedDependencyGraph.updateWithDependencyData === 'function') {
                console.log('SAPChatInterface: Triggering advanced dependency graph');
                window.advancedDependencyGraph.updateWithDependencyData(dependencyData);
            }
            
        } catch (error) {
            console.error('SAPChatInterface: Error showing dependency visualization:', error);
            // Still add notification even if visualization fails
            this.addDependencyNotification(dependencyData);
        }
    }
    
    addDependencyNotification(dependencyData) {
        try {
            const components = Object.keys(dependencyData.dependency_analysis?.individual_components || {});
            const componentNames = components.join(', ') || 'components';
            
            // Add a notification that dependency analysis is available
            const notification = document.createElement('div');
            notification.className = 'dependency-notification';
            notification.innerHTML = `
                <div style="background: #e3f2fd; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #2196f3; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h4 style="margin: 0 0 10px 0; color: #1976d2;">🔗 Dependency Analysis Complete</h4>
                    <p style="margin: 0 0 15px 0;">Dependency analysis for <strong>${componentNames}</strong> is now available.</p>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <button onclick="showView('dependencies')" style="background: #2196f3; color: white; border: none; padding: 10px 16px; border-radius: 4px; cursor: pointer; font-size: 14px;">
                            📊 View Dependency Graph
                        </button>
                        <button onclick="showView('advanced-dependencies')" style="background: #4caf50; color: white; border: none; padding: 10px 16px; border-radius: 4px; cursor: pointer; font-size: 14px;">
                            🌐 Advanced Analysis
                        </button>
                        <button onclick="showView('agent-network')" style="background: #ff9800; color: white; border: none; padding: 10px 16px; border-radius: 4px; cursor: pointer; font-size: 14px;">
                            🔍 Network View
                        </button>
                    </div>
                </div>
            `;
            
            // Add notification to chat messages
            const chatMessages = document.querySelector('.chat-messages');
            if (chatMessages) {
                chatMessages.appendChild(notification);
                // Scroll to show the notification
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        } catch (error) {
            console.error('SAPChatInterface: Error adding dependency notification:', error);
        }
    }

    showProcessingIndicator() {
        if (this.elements.processingIndicator) {
            this.elements.processingIndicator.style.display = 'block';
        }
    }

    hideProcessingIndicator() {
        if (this.elements.processingIndicator) {
            this.elements.processingIndicator.style.display = 'none';
        }
    }

    scrollToBottom() {
        if (this.elements.chatMessages) {
            this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
        }
    }

    autoResizeTextarea() {
        if (!this.elements.chatInput) return;
        
        // Reset height to auto to get correct scrollHeight
        this.elements.chatInput.style.height = 'auto';
        
        // Set height based on content
        const scrollHeight = this.elements.chatInput.scrollHeight;
        const maxHeight = 200; // Maximum height in pixels
        
        if (scrollHeight <= maxHeight) {
            this.elements.chatInput.style.height = scrollHeight + 'px';
        } else {
            this.elements.chatInput.style.height = maxHeight + 'px';
        }
    }

    askQuestion(question) {
        console.log('SAPChatInterface: Asking suggested question:', question);
        
        if (this.elements.chatInput) {
            this.elements.chatInput.value = question;
            this.elements.chatInput.focus();
            this.autoResizeTextarea();
            
            // Auto-send after a brief delay
            setTimeout(() => {
                this.sendMessage();
            }, 100);
        }
    }

    async sendToAPI(message) {
        console.log('SAPChatInterface: Sending to API:', message);
        
        try {
            // Step 1: Get SAP Intelligence analysis
            const analysisResponse = await fetch(`${this.config.apiBaseUrl}/api/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    requirement: message
                })
            });
            
            if (!analysisResponse.ok) {
                throw new Error(`HTTP ${analysisResponse.status}: ${analysisResponse.statusText}`);
            }
            
            const analysisData = await analysisResponse.json();
            console.log('SAPChatInterface: Analysis Response:', analysisData);
            
            if (analysisData.error) {
                throw new Error(analysisData.message || 'Analysis API Error');
            }
            
            // Step 2: Generate test cases if analysis was successful and intent is test creation
            let testData = null;
            const hasTestIntent = analysisData.analysis && 
                                  analysisData.analysis.intent && 
                                  analysisData.analysis.intent.primary_intent === 'test_creation';
            const hasTestKeyword = message.toLowerCase().includes('test');
            const hasDependencyIntent = analysisData.analysis && 
                                       analysisData.analysis.intent && 
                                       analysisData.analysis.intent.primary_intent === 'dependency_analysis';
            
            // Only generate tests for test-related queries, not dependency analysis
            if (analysisData.analysis && (hasTestIntent || hasTestKeyword) && !hasDependencyIntent) {
                console.log('SAPChatInterface: Triggering test generation. Intent:', hasTestIntent, 'Keyword:', hasTestKeyword);
                try {
                    const testResponse = await fetch(`${this.config.apiBaseUrl}/api/generate-tests`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            analysis: analysisData.analysis
                        })
                    });
                    if (testResponse.ok) {
                        testData = await testResponse.json();
                        console.log('SAPChatInterface: Test Generation Response:', testData);
                    }
                } catch (testError) {
                    console.log('SAPChatInterface: Test generation skipped:', testError.message);
                }
            }
            
            // Step 3: Analyze dependencies if relevant
            let dependencyData = null;
            const hasDependencyKeywords = message.toLowerCase().includes('dependency') || 
                                         message.toLowerCase().includes('impact') || 
                                         message.toLowerCase().includes('risk');
            
            if (analysisData.analysis && (hasDependencyIntent || hasDependencyKeywords)) {
                console.log('SAPChatInterface: Triggering dependency analysis. Intent:', hasDependencyIntent, 'Keywords:', hasDependencyKeywords);
                
                // Extract program names from the message for dependency analysis
                let components = analysisData.analysis.extracted_transactions || [];
                
                // If no transactions were extracted but we have dependency intent, 
                // try to extract program names (Z_*, Y_*, custom programs) from the message
                if (components.length === 0 && hasDependencyIntent) {
                    const programMatches = message.match(/\b[ZY]_\w+\b/gi);
                    if (programMatches) {
                        components = programMatches;
                    }
                }
                
                console.log('SAPChatInterface: Components for dependency analysis:', components);
                
                try {
                    const depResponse = await fetch(`${this.config.apiBaseUrl}/api/analyze-dependencies`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            components: components,
                            modules: analysisData.analysis.modules_involved || [],
                            analysis: analysisData.analysis
                        })
                    });
                    if (depResponse.ok) {
                        dependencyData = await depResponse.json();
                        console.log('SAPChatInterface: Dependency Analysis Response:', dependencyData);
                    }
                } catch (depError) {
                    console.log('SAPChatInterface: Dependency analysis skipped:', depError.message);
                }
            }
            
            // Combine all agent responses
            const combinedData = {
                analysis: analysisData,
                tests: testData,
                dependencies: dependencyData,
                originalMessage: message
            };
            
            this.handleComprehensiveResponse(combinedData);
            
            // Trigger dependency visualizations if dependency data is available
            if (dependencyData && dependencyData.dependency_analysis) {
                this.showDependencyVisualization(dependencyData);
            }
            
        } catch (error) {
            console.error('SAPChatInterface: API Error:', error);
            this.handleAPIError(error);
        } finally {
            this.hideProcessingIndicator();
            this.state.isProcessing = false;
        }
    }

    handleComprehensiveResponse(combinedData) {
        console.log('SAPChatInterface: Processing comprehensive response:', combinedData);
        
        try {
            // Format the response using real agent data
            let responseContent = this.formatAgentBasedResponse(combinedData);
            
            // Add ASTC response
            this.addMessage({
                type: 'astc',
                content: responseContent,
                timestamp: new Date()
            });
            
            // If we have dependency data, show visualization buttons
            if (combinedData.dependencies && combinedData.dependencies.dependency_analysis) {
                this.showDependencyVisualization(combinedData.dependencies);
            }
            
            // Notify other components with the analysis data
            if (combinedData.analysis) {
                this.notifyOtherComponents(combinedData.analysis);
            }
            
        } catch (error) {
            console.error('SAPChatInterface: Error handling comprehensive response:', error);
            this.addMessage({
                type: 'astc',
                content: 'I encountered an issue processing your request. Please try again.',
                timestamp: new Date()
            });
        }
    }

    formatAgentBasedResponse(combinedData) {
        let content = '';
        const { analysis, tests, dependencies, originalMessage } = combinedData;
        
        if (analysis && analysis.analysis) {
            const data = analysis.analysis;
            
            // Header with real agent confidence
            content += `📊 **SAP Intelligence Agent Analysis**\n\n`;
            content += `**Agent:** sap_intelligence\n`;
            content += `**Confidence:** ${(data.confidence_score * 100).toFixed(1)}%\n`;
            content += `**Request ID:** ${analysis.request_id}\n\n`;
            
            // Intent and scope analysis from agent
            if (data.intent) {
                content += `🎯 **Intent Detection:**\n`;
                content += `**Primary Intent:** ${data.intent.primary_intent}\n`;
                content += `**Confidence:** ${(data.intent.confidence * 100).toFixed(1)}%\n`;
                content += `**Complexity:** ${data.intent.complexity}\n`;
                if (data.scope) {
                    content += `**Scope Type:** ${data.scope.scope_type}\n`;
                    if (data.scope.estimated_effort_hours > 0) {
                        content += `**Estimated Effort:** ${data.scope.estimated_effort_hours} hours\n`;
                    }
                }
                content += '\n';
            }
            
            // SAP-specific findings from agent
            if (data.extracted_transactions && data.extracted_transactions.length > 0) {
                content += `🔧 **SAP Transactions Detected:**\n`;
                data.extracted_transactions.forEach(transaction => {
                    if (typeof transaction === 'object' && transaction.code) {
                        content += `• **${transaction.code}** - ${transaction.name || 'Unknown'} (${transaction.module || 'N/A'})\n`;
                        if (transaction.confidence) {
                            content += `  *Confidence: ${(transaction.confidence * 100).toFixed(0)}%*\n`;
                        }
                    } else {
                        content += `• ${transaction}\n`;
                    }
                });
                content += '\n';
            }
            
            if (data.modules_involved && data.modules_involved.length > 0) {
                content += `🏗️ **SAP Modules Identified:**\n`;
                data.modules_involved.forEach(module => {
                    content += `• ${module}\n`;
                });
                content += '\n';
            }
            
            if (data.business_processes && data.business_processes.length > 0) {
                content += `⚙️ **Business Processes:**\n`;
                data.business_processes.forEach(process => {
                    content += `• ${process}\n`;
                });
                content += '\n';
            }
            
            // Entity extraction from agent
            if (data.entities) {
                let hasEntities = false;
                let entityContent = `🔍 **Extracted Entities:**\n`;
                
                if (data.entities.vendors && data.entities.vendors.length > 0) {
                    entityContent += `**Vendors:** ${data.entities.vendors.join(', ')}\n`;
                    hasEntities = true;
                }
                if (data.entities.materials && data.entities.materials.length > 0) {
                    entityContent += `**Materials:** ${data.entities.materials.join(', ')}\n`;
                    hasEntities = true;
                }
                if (data.entities.customers && data.entities.customers.length > 0) {
                    entityContent += `**Customers:** ${data.entities.customers.join(', ')}\n`;
                    hasEntities = true;
                }
                if (data.entities.amounts && data.entities.amounts.length > 0) {
                    entityContent += `**Amounts:** ${data.entities.amounts.join(', ')}\n`;
                    hasEntities = true;
                }
                
                if (hasEntities) {
                    content += entityContent + '\n';
                }
            }
            
            // Test Generation Agent Results
            if (tests && tests.test_suite && tests.test_suite.test_cases) {
                content += `🧪 **Test Generation Agent Results:**\n`;
                content += `**Agent:** test_generation\n`;
                content += `**Request ID:** ${tests.request_id}\n\n`;
                
                const testCases = tests.test_suite.test_cases;
                if (testCases.length > 0) {
                    content += `**Generated ${testCases.length} comprehensive test cases:**\n\n`;
                    testCases.forEach((testCase, index) => {
                        content += `**${index + 1}. ${testCase.name || 'Test Case'}** (${testCase.test_type || 'functional'})\n`;
                        if (testCase.description) {
                            content += `   📝 ${testCase.description}\n`;
                        }
                        if (testCase.transaction_code) {
                            content += `   📋 Transaction: **${testCase.transaction_code}**\n`;
                        }
                        if (testCase.priority) {
                            content += `   ⚡ Priority: **${testCase.priority}**\n`;
                        }
                        if (testCase.steps && testCase.steps.length > 0) {
                            content += `   🔢 **Test Steps (${testCase.steps.length} steps):**\n`;
                            testCase.steps.forEach((step, stepIndex) => {
                                content += `      ${stepIndex + 1}. ${step}\n`;
                            });
                        }
                        if (testCase.estimated_duration_minutes) {
                            content += `   ⏱️ Estimated Duration: ${testCase.estimated_duration_minutes} minutes\n`;
                        }
                        
                        // Show test data if available
                        if (testCase.test_data && Object.keys(testCase.test_data).length > 0) {
                            content += `   📄 **Test Data:**\n`;
                            Object.entries(testCase.test_data).forEach(([key, value]) => {
                                content += `      • ${key}: ${value}\n`;
                            });
                        }
                        
                        // Show validations if available
                        if (testCase.validations && testCase.validations.length > 0) {
                            content += `   ✅ **Expected Results:**\n`;
                            testCase.validations.forEach((validation, valIndex) => {
                                content += `      ${valIndex + 1}. ${validation}\n`;
                            });
                        }
                        
                        // Show prerequisites if available
                        if (testCase.prerequisites && testCase.prerequisites.length > 0) {
                            content += `   📋 **Prerequisites:**\n`;
                            testCase.prerequisites.forEach((prereq, preqIndex) => {
                                content += `      ${preqIndex + 1}. ${prereq}\n`;
                            });
                        }
                        
                        content += '\n';
                    });
                    
                    // Show coverage metrics if available
                    if (tests.test_suite.coverage_metrics) {
                        const coverage = tests.test_suite.coverage_metrics;
                        content += `📊 **Coverage Analysis:**\n`;
                        content += `   • Total Coverage: ${coverage.coverage_completeness}\n`;
                        if (coverage.test_type_distribution) {
                            const types = Object.entries(coverage.test_type_distribution);
                            content += `   • Test Types: ${types.map(([type, count]) => `${count} ${type}`).join(', ')}\n`;
                        }
                        if (tests.test_suite.estimated_execution_time) {
                            content += `   • Total Execution Time: ${tests.test_suite.estimated_execution_time.total_hours.toFixed(1)} hours\n`;
                        }
                        content += '\n';
                    }
                } else {
                    content += `No specific test cases generated for this request.\n`;
                }
            }
            
                            // Dependency Analysis Agent Results
                if (dependencies && dependencies.dependency_analysis) {
                    const depAnalysis = dependencies.dependency_analysis;
                    content += `🔗 **Dependency Analysis Agent Results:**\n`;
                    content += `**Agent:** ${dependencies.agent_id || 'dependency_analysis'}\n`;
                    content += `**Request ID:** ${dependencies.request_id}\n\n`;
                    
                    // Individual component analysis
                    if (depAnalysis.individual_components) {
                        content += `📋 **Component Analysis:**\n`;
                        Object.entries(depAnalysis.individual_components).forEach(([component, analysis]) => {
                            content += `• **${component}**\n`;
                            content += `  🎯 Risk Level: ${analysis.risk_level}\n`;
                            content += `  💼 Business Impact: ${analysis.business_impact}\n`;
                            
                            if (analysis.direct_dependencies && analysis.direct_dependencies.length > 0) {
                                content += `  ⬇️ Direct Dependencies: ${analysis.direct_dependencies.join(', ')}\n`;
                            }
                            
                            if (analysis.dependent_components && analysis.dependent_components.length > 0) {
                                content += `  ⬆️ Dependent Components: ${analysis.dependent_components.join(', ')}\n`;
                            }
                            
                            if (analysis.risk_mitigation_strategies && analysis.risk_mitigation_strategies.length > 0) {
                                content += `  🛡️ Risk Mitigation:\n`;
                                analysis.risk_mitigation_strategies.forEach((strategy, index) => {
                                    content += `     ${index + 1}. ${strategy}\n`;
                                });
                            }
                            content += '\n';
                        });
                    }
                    
                    // Show dependency visualization button - this will be replaced with an actual button
                    content += `🎯 **Dependency visualization is ready!**\n\n`;
                
                // Consolidated analysis
                if (depAnalysis.consolidated_analysis) {
                    const consolidated = depAnalysis.consolidated_analysis;
                    content += `📊 **Overall Analysis:**\n`;
                    content += `• Total Components: ${consolidated.total_components_involved}\n`;
                    content += `• Complexity: ${consolidated.overall_complexity}\n`;
                    
                    if (consolidated.estimated_impact_scope) {
                        const impact = consolidated.estimated_impact_scope;
                        content += `• Testing Effort: ${impact.estimated_testing_effort_hours} hours\n`;
                        content += `• Recommended Timeline: ${impact.recommended_timeline_days} days\n`;
                    }
                    
                    if (consolidated.recommended_approach && consolidated.recommended_approach.length > 0) {
                        content += `• **Recommended Approach:**\n`;
                        consolidated.recommended_approach.forEach((recommendation, index) => {
                            content += `  ${index + 1}. ${recommendation}\n`;
                        });
                    }
                    content += '\n';
                }
            }
            
            // Agent recommendations
            if (data.recommendations && data.recommendations.length > 0) {
                content += `💡 **SAP Intelligence Recommendations:**\n`;
                data.recommendations.forEach(rec => {
                    content += `• ${rec}\n`;
                });
                content += '\n';
            }
            
            // Next steps from agent
            if (analysis.next_steps && analysis.next_steps.length > 0) {
                content += `📋 **Suggested Next Steps:**\n`;
                analysis.next_steps.forEach(step => {
                    content += `• ${step}\n`;
                });
                content += '\n';
            }
            
            // Suggest additional agent capabilities
            content += `🤖 **Available Agent Services:**\n`;
            if (!tests && originalMessage.toLowerCase().includes('test')) {
                content += `• Run **Test Generation Agent** for detailed test cases\n`;
            }
            if (!dependencies && (originalMessage.toLowerCase().includes('dependency') || originalMessage.toLowerCase().includes('impact'))) {
                content += `• Run **Dependency Analysis Agent** for impact assessment\n`;
            }
            content += `• **Script Generation Agent** for automation scripts\n`;
            content += `• **Business Impact Agent** for ROI analysis\n`;
            content += `• **Persona Adaptation Agent** for role-specific guidance\n\n`;
            
            // Note: Interactive suggestions are now available in the fixed section above
            
        } else {
            content = `🤖 **ASTC Agent Network Ready**\n\n`;
            content += `I have 8 specialized SAP testing agents ready to help:\n`;
            content += `• **SAP Intelligence** - Requirements analysis\n`;
            content += `• **Test Generation** - Automated test case creation\n`;
            content += `• **Dependency Analysis** - Impact assessment\n`;
            content += `• **Test Execution** - Test running and validation\n`;
            content += `• **Script Generation** - Automation scripts\n`;
            content += `• **Persona Adaptation** - Role-specific guidance\n`;
            content += `• **Dependency Intelligence** - Advanced risk analysis\n`;
            content += `• **Business Impact** - ROI and business case analysis\n\n`;
            content += `How can I help you with your SAP testing needs?`;
        }
        
        return content;
    }



    handleAPIError(error) {
        console.error('SAPChatInterface: Handling API error:', error);
        
        let errorMessage = 'I\'m having trouble connecting to the SAP analysis system. ';
        
        if (error.message.includes('Failed to fetch')) {
            errorMessage += 'Please check if the backend server is running.';
        } else if (error.message.includes('HTTP 500')) {
            errorMessage += 'There was a server error. Please try again.';
        } else {
            errorMessage += 'Please try again in a moment.';
        }
        
        this.addMessage({
            type: 'astc',
            content: errorMessage,
            timestamp: new Date()
        });
    }

    notifyOtherComponents(data) {
        console.log('SAPChatInterface: Notifying other components');
        
        // Safely notify dashboard
        if (window.dashboard && typeof window.dashboard.updateWithAnalysisData === 'function') {
            try {
                window.dashboard.updateWithAnalysisData(data);
                console.log('SAPChatInterface: Dashboard notified successfully');
            } catch (error) {
                console.error('SAPChatInterface: Error notifying dashboard:', error);
            }
        }
        
        // Safely notify SAP Intelligence Dashboard
        if (window.sapIntelligenceDashboard && typeof window.sapIntelligenceDashboard.updateWithAnalysisData === 'function') {
            try {
                window.sapIntelligenceDashboard.updateWithAnalysisData(data);
                console.log('SAPChatInterface: SAP Intelligence Dashboard notified successfully');
            } catch (error) {
                console.error('SAPChatInterface: Error notifying SAP Intelligence Dashboard:', error);
            }
        }
        
        // Safely notify test case viewer
        if (window.testCaseViewer && data.tests && typeof window.testCaseViewer.updateTestCases === 'function') {
            try {
                window.testCaseViewer.updateTestCases(data.tests.test_suite.test_cases);
                console.log('SAPChatInterface: Test case viewer notified successfully');
            } catch (error) {
                console.error('SAPChatInterface: Error notifying test case viewer:', error);
            }
        }
    }

    loadMessageHistory() {
        console.log('SAPChatInterface: Loading message history');
        
        // Load any existing messages from storage or initial state
        if (this.state.messageHistory.length === 0) {
            // Add welcome message if no history
            this.addMessage({
                type: 'astc',
                content: 'Hello! I\'m ASTC, your SAP Testing Copilot. I can help you analyze transports, generate test cases, and assess change impacts. What would you like to know about your SAP changes?',
                timestamp: new Date()
            });
        }
    }

    clearHistory() {
        console.log('SAPChatInterface: Clearing chat history');
        
        this.state.messageHistory = [];
        
        if (this.elements.chatMessages) {
            this.elements.chatMessages.innerHTML = '';
        }
        
        // Add welcome message back
        this.loadMessageHistory();
    }

    destroy() {
        console.log('SAPChatInterface: Destroying chat interface');
        
        // Remove event listeners
        if (this.elements.sendBtn) {
            this.elements.sendBtn.removeEventListener('click', this.sendMessage);
        }
        
        if (this.elements.chatInput) {
            this.elements.chatInput.removeEventListener('keydown', this.handleKeyDown);
            this.elements.chatInput.removeEventListener('input', this.autoResizeTextarea);
        }
        
        // Clear state
        this.state = null;
        this.elements = null;
        
        console.log('SAPChatInterface: Destruction complete');
    }
}

// Global functions for backward compatibility
function askQuestion(question) {
    console.log('Global askQuestion called with:', question);
    
    if (window.sapChatInterface && window.sapChatInterface.askQuestion) {
        window.sapChatInterface.askQuestion(question);
    } else {
        console.warn('SAP Chat Interface not available');
    }
}

function sendMessage() {
    console.log('Global sendMessage called');
    
    if (window.sapChatInterface && window.sapChatInterface.sendMessage) {
        window.sapChatInterface.sendMessage();
    } else {
        console.warn('SAP Chat Interface not available');
    }
}

// Initialize the chat interface and expose globally
let sapChatInterface;

document.addEventListener('DOMContentLoaded', () => {
    console.log('SAPChatInterface: DOM loaded, initializing...');
    
    // Create new SAP Chat Interface instance
    sapChatInterface = new SAPChatInterface();
    
    // Expose globally for other components and backward compatibility
    window.chatInterface = sapChatInterface;
    window.sapChatInterface = sapChatInterface;
    window.askQuestion = askQuestion;
    window.sendMessage = sendMessage;
    
    console.log('SAPChatInterface: Global chat object created');
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SAPChatInterface;
} 
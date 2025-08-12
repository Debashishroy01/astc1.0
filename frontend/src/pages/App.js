/**
 * Main Application Controller
 * Coordinates all components and handles application state
 */

class ASTCApp {
    constructor() {
        this.currentView = 'dashboard';
        this.isInitialized = false;
        this.connectionStatus = 'disconnected';
        this.updateInterval = null;
        this.components = {};
        
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initializing ASTC Application...');
            
            // Initialize UI elements first
            this.initializeElements();
            
            // Set up event listeners immediately (even if backend fails)
            this.attachEventListeners();
            
            // Initialize components (they can work without backend)
            this.initializeComponents();
            
            // Try backend connection (non-blocking)
            this.checkBackendConnection()
                .then(() => {
                    console.log('✅ Backend connected - loading data...');
                    return this.loadInitialData();
                })
                .then(() => {
                    console.log('✅ Initial data loaded - starting updates...');
                    this.startRealTimeUpdates();
                })
                .catch(error => {
                    console.warn('⚠️ Backend connection failed, but app will continue in offline mode:', error);
                    this.setConnectionStatus('error');
                });
            
            this.isInitialized = true;
            console.log('✅ ASTC Application initialized successfully (navigation ready)');
            
        } catch (error) {
            console.error('❌ Failed to initialize ASTC Application:', error);
            this.showInitializationError(error);
        }
    }

    initializeElements() {
        // Main navigation elements
        this.navLinks = document.querySelectorAll('.nav-link');
        this.views = document.querySelectorAll('.view');
        
        // Status elements
        this.systemStatus = document.getElementById('systemStatus');
        this.statusIndicator = document.getElementById('statusIndicator');
        this.statusText = document.getElementById('statusText');
        
        // Agent list
        this.agentList = document.getElementById('agentList');
        
        // Activity list
        this.activityList = document.getElementById('activityList');
    }

    async checkBackendConnection() {
        console.log('🔌 Checking backend connection...');
        
        try {
            const healthCheck = await api.checkHealth();
            
            if (healthCheck.success) {
                this.setConnectionStatus('connected');
                console.log('✅ Backend connection established');
                return true;
            } else {
                throw new Error('Health check failed');
            }
        } catch (error) {
            console.error('❌ Backend connection failed:', error);
            this.setConnectionStatus('error');
            throw error;
        }
    }

    initializeComponents() {
        console.log('🔧 Initializing components...');
        
        // Note: Components are initialized in their respective files
        // This method sets up any additional coordination needed
        
        // Set up component references
        this.components = {
            chatInterface: window.chatInterface,
            dependencyGraph: window.dependencyGraph,
            testCaseViewer: window.testCaseViewer,
            testExecutionResults: window.testExecutionResults,
            agentStatus: window.agentStatus,
            dashboard: window.dashboard,
            // Priority Enhancement Components
            scriptGenerator: window.scriptGenerator,
            personaSwitcher: window.personaSwitcher,
            advancedDependencyGraph: window.advancedDependencyGraph,
            businessImpactDashboard: window.businessImpactDashboard
        };
    }

    attachEventListeners() {
        // Navigation
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = link.getAttribute('data-view');
                this.showView(view);
            });
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Visibility change (tab focus)
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
    }

    async loadInitialData() {
        console.log('📊 Loading initial data...');
        
        try {
            const metrics = await api.getDashboardMetrics();
            
            if (metrics.success) {
                this.updateDashboardMetrics(metrics.data);
                this.updateAgentStatus(metrics.data.agents);
                this.updateActivityFeed(metrics.data.messages);
            }
        } catch (error) {
            console.error('Failed to load initial data:', error);
        }
    }

    startRealTimeUpdates() {
        console.log('🔄 Starting real-time updates...');
        
        // Update every 30 seconds
        this.updateInterval = setInterval(async () => {
            try {
                const updates = await api.pollForUpdates();
                
                if (updates.success) {
                    this.updateAgentStatus(updates.data.agents);
                    this.updateRecentMessages(updates.data.messages);
                }
            } catch (error) {
                console.error('Real-time update failed:', error);
            }
        }, 30000);
    }

    setConnectionStatus(status) {
        this.connectionStatus = status;
        
        const statusConfig = {
            connected: {
                class: '',
                text: 'Connected',
                color: '#28a745'
            },
            connecting: {
                class: 'loading',
                text: 'Connecting...',
                color: '#ffc107'
            },
            error: {
                class: 'error',
                text: 'Connection Error',
                color: '#dc3545'
            },
            disconnected: {
                class: 'error',
                text: 'Disconnected',
                color: '#6c757d'
            }
        };

        const config = statusConfig[status] || statusConfig.disconnected;
        
        this.statusIndicator.className = `status-indicator ${config.class}`;
        this.statusText.textContent = config.text;
        this.statusIndicator.style.backgroundColor = config.color;
    }

    showView(viewName) {
        console.log(`🔄 Switching to view: ${viewName}`);
        
        try {
            // Update navigation
            this.navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('data-view') === viewName) {
                    link.classList.add('active');
                }
            });

            // Update views
            this.views.forEach(view => {
                view.classList.remove('active');
                if (view.id === `${viewName}View`) {
                    view.classList.add('active');
                    console.log(`✅ Activated view: ${view.id}`);
                }
            });

            this.currentView = viewName;
            this.onViewChanged(viewName);
            
            // Update window title
            document.title = `ASTC - ${this.getViewTitle(viewName)}`;
            
        } catch (error) {
            console.error('❌ Error switching views:', error);
            // Fallback to dashboard
            if (viewName !== 'dashboard') {
                this.showView('dashboard');
            }
        }
    }

    getViewTitle(viewName) {
        const titles = {
            dashboard: 'Dashboard',
            chat: 'Natural Language',
            dependencies: 'Dependencies',
            tests: 'Test Cases',
            execution: 'Test Execution',
            agents: 'Agent Status',
            automation: 'Automation',
            // Priority Enhancement Views
            scripts: 'Script Generator',
            'persona-switcher': 'Persona Views',
            'advanced-dependencies': 'Dependency Intelligence',
            'business-impact': 'Business Impact',
            // Real-Time Monitoring Views
            'agent-network': 'Agent Network',
            'message-flow': 'Message Flow',
            'live-monitoring': 'Live Monitoring'
        };
        return titles[viewName] || 'Unknown View';
    }

    onViewChanged(viewName) {
        console.log(`📱 Switched to view: ${viewName}`);
        
        // Handle view-specific initialization
        switch (viewName) {
            case 'dependencies':
                if (this.components.dependencyGraph) {
                    // Reset graph if needed
                }
                break;
                
            case 'agents':
                if (this.components.agentStatus) {
                    this.components.agentStatus.refreshStatus();
                }
                break;
                
            case 'tests':
                if (this.components.testCaseViewer) {
                    this.components.testCaseViewer.refreshTestCases();
                }
                break;
                
            case 'execution':
                if (this.components.testExecutionResults) {
                    this.components.testExecutionResults.refreshExecutionData();
                }
                break;
                
            // Priority Enhancement Views
            case 'scripts':
                if (this.components.scriptGenerator && typeof this.components.scriptGenerator.init === 'function') {
                    this.components.scriptGenerator.init('scriptGenerator');
                }
                break;
                
            case 'persona-switcher':
                if (this.components.personaSwitcher && typeof this.components.personaSwitcher.init === 'function') {
                    this.components.personaSwitcher.init('personaSwitcher');
                }
                break;
                
            case 'advanced-dependencies':
                if (this.components.advancedDependencyGraph && typeof this.components.advancedDependencyGraph.init === 'function') {
                    this.components.advancedDependencyGraph.init('advancedDependencyGraph');
                }
                break;
                
            case 'business-impact':
                if (this.components.businessImpactDashboard && typeof this.components.businessImpactDashboard.init === 'function') {
                    this.components.businessImpactDashboard.init('businessImpactDashboard');
                }
                break;
                
            // Real-Time Monitoring Views
            case 'agent-network':
                if (window.agentNetworkVisualization && typeof window.agentNetworkVisualization.initialize === 'function') {
                    window.agentNetworkVisualization.initialize('agent-network-content');
                }
                break;
                
            case 'message-flow':
                if (window.messageFlowDisplay && typeof window.messageFlowDisplay.initialize === 'function') {
                    window.messageFlowDisplay.initialize('message-flow-content');
                }
                break;
                
            case 'live-monitoring':
                this.initializeLiveMonitoring();
                break;
        }
    }

    updateDashboardMetrics(data) {
        // Update metric cards
        const metrics = {
            totalAnalyses: this.calculateTotalAnalyses(data),
            totalTestCases: this.calculateTotalTestCases(data),
            dependenciesAnalyzed: this.calculateDependenciesAnalyzed(data),
            timesSaved: this.calculateTimeSaved(data)
        };

        this.updateMetricCard('totalAnalyses', metrics.totalAnalyses);
        this.updateMetricCard('totalTestCases', metrics.totalTestCases);
        this.updateMetricCard('dependenciesAnalyzed', metrics.dependenciesAnalyzed);
        this.updateMetricCard('timesSaved', metrics.timesSaved + 'h');
    }

    updateMetricCard(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    calculateTotalAnalyses(data) {
        // Calculate from message history
        if (data.messages && data.messages.messages) {
            return data.messages.messages.filter(msg => 
                msg.type === 'framework_event' && 
                msg.event?.event_type === 'agent_registered'
            ).length;
        }
        return 0;
    }

    calculateTotalTestCases(data) {
        // This would be calculated from stored test cases
        return 0; // Placeholder
    }

    calculateDependenciesAnalyzed(data) {
        // This would be calculated from dependency analyses
        return 0; // Placeholder
    }

    calculateTimeSaved(data) {
        // Calculate estimated time savings
        return 0; // Placeholder
    }

    updateAgentStatus(agentData) {
        if (!agentData || !agentData.agents) return;

        agentData.agents.forEach(agent => {
            const agentItem = this.findAgentItem(agent.agent_id);
            if (agentItem) {
                const indicator = agentItem.querySelector('.agent-status-indicator');
                if (indicator) {
                    indicator.setAttribute('data-status', agent.status);
                }
            }
        });
    }

    findAgentItem(agentId) {
        const agentItems = this.agentList.querySelectorAll('.agent-item');
        for (const item of agentItems) {
            const nameElement = item.querySelector('.agent-name');
            if (nameElement && this.getAgentIdFromName(nameElement.textContent) === agentId) {
                return item;
            }
        }
        return null;
    }

    getAgentIdFromName(name) {
        const nameMap = {
            'SAP Intelligence': 'sap_intelligence',
            'Test Generation': 'test_generation',
            'Dependency Analysis': 'dependency_analysis'
        };
        return nameMap[name] || name.toLowerCase().replace(/\s+/g, '_');
    }

    updateActivityFeed(messageData) {
        if (!messageData || !messageData.messages) return;

        // Clear current activity
        this.activityList.innerHTML = '';

        // Add recent activities
        const recentMessages = messageData.messages
            .filter(msg => msg.type === 'framework_event')
            .slice(0, 5);

        recentMessages.forEach(msg => {
            this.addActivityItem(msg);
        });

        // If no activities, show default
        if (recentMessages.length === 0) {
            this.activityList.innerHTML = `
                <div class="activity-item">
                    <div class="activity-icon">🔄</div>
                    <div class="activity-content">
                        <p>System initialized successfully</p>
                        <span class="activity-time">Just now</span>
                    </div>
                </div>
            `;
        }
    }

    addActivityItem(message) {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        const icon = this.getActivityIcon(message.event?.event_type);
        const description = this.getActivityDescription(message.event);
        const time = this.formatActivityTime(message.event?.timestamp);

        activityItem.innerHTML = `
            <div class="activity-icon">${icon}</div>
            <div class="activity-content">
                <p>${description}</p>
                <span class="activity-time">${time}</span>
            </div>
        `;

        this.activityList.appendChild(activityItem);
    }

    getActivityIcon(eventType) {
        const iconMap = {
            'agent_registered': '🤖',
            'framework_started': '🚀',
            'workflow_started': '⚡',
            'message_processing_error': '⚠️'
        };
        return iconMap[eventType] || '📋';
    }

    getActivityDescription(event) {
        if (!event) return 'System activity';

        const descriptionMap = {
            'agent_registered': `Agent ${event.agent_name} registered`,
            'framework_started': 'Framework started',
            'workflow_started': `Workflow ${event.workflow_id} started`,
            'message_processing_error': 'Message processing error occurred'
        };

        return descriptionMap[event.event_type] || 'System activity';
    }

    formatActivityTime(timestamp) {
        if (!timestamp) return 'Just now';

        const now = new Date();
        const eventTime = new Date(timestamp);
        const diffMs = now.getTime() - eventTime.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    }

    updateRecentMessages(messageData) {
        // Update components that display message information
        if (this.components.agentStatus) {
            this.components.agentStatus.updateMessageHistory(messageData);
        }
    }

    handleResize() {
        // Handle responsive layout changes
        if (this.components.dependencyGraph && this.currentView === 'dependencies') {
            // Trigger graph resize if needed
        }
    }

    handleKeyboardShortcuts(e) {
        // Implement keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case '1':
                    e.preventDefault();
                    this.showView('dashboard');
                    break;
                case '2':
                    e.preventDefault();
                    this.showView('chat');
                    break;
                case '3':
                    e.preventDefault();
                    this.showView('dependencies');
                    break;
                case '4':
                    e.preventDefault();
                    this.showView('tests');
                    break;
            }
        }
    }

    handleVisibilityChange() {
        if (document.hidden) {
            // Page is hidden, reduce update frequency
            if (this.updateInterval) {
                clearInterval(this.updateInterval);
            }
        } else {
            // Page is visible, resume normal updates
            this.startRealTimeUpdates();
        }
    }

    showInitializationError(error) {
        const errorOverlay = document.createElement('div');
        errorOverlay.className = 'initialization-error';
        errorOverlay.innerHTML = `
            <div class="error-content">
                <h2>🚨 Initialization Error</h2>
                <p>Failed to initialize ASTC Application:</p>
                <p class="error-message">${error.message}</p>
                <div class="error-actions">
                    <button class="btn btn-primary" onclick="location.reload()">
                        Retry
                    </button>
                    <button class="btn btn-secondary" onclick="this.parentElement.parentElement.parentElement.style.display='none'">
                        Continue Anyway
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(errorOverlay);
    }

    // Public API methods
    async refreshData() {
        await this.loadInitialData();
    }

    getCurrentView() {
        return this.currentView;
    }

    getConnectionStatus() {
        return this.connectionStatus;
    }

    // Cleanup
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        // Cleanup components
        Object.values(this.components).forEach(component => {
            if (component && typeof component.destroy === 'function') {
                component.destroy();
            }
        });
    }

    initializeLiveMonitoring() {
        console.log('📊 Initializing Live Monitoring Dashboard...');
        
        try {
            // Initialize embedded network visualization
            if (window.agentNetworkVisualization) {
                const networkContainer = document.getElementById('embedded-network');
                if (networkContainer) {
                    networkContainer.innerHTML = '<div id="embedded-network-viz" style="width: 100%; height: 200px;"></div>';
                    window.agentNetworkVisualization.initialize('embedded-network-viz');
                }
            }
            
            // Initialize embedded message flow
            if (window.messageFlowDisplay) {
                const flowContainer = document.getElementById('embedded-flow');
                if (flowContainer) {
                    flowContainer.innerHTML = '<div id="embedded-flow-viz" style="width: 100%; height: 200px;"></div>';
                    window.messageFlowDisplay.initialize('embedded-flow-viz');
                }
            }
            
            // Initialize system metrics
            this.initializeSystemMetrics();
            
            // Initialize active workflows
            this.initializeActiveWorkflows();
            
        } catch (error) {
            console.error('Failed to initialize live monitoring:', error);
        }
    }

    initializeSystemMetrics() {
        const metricsContainer = document.getElementById('system-metrics');
        if (!metricsContainer) return;
        
        metricsContainer.innerHTML = `
            <div class="metrics-grid">
                <div class="metric-item">
                    <h5>Active Agents</h5>
                    <div id="active-agents-count" class="metric-value">-</div>
                </div>
                <div class="metric-item">
                    <h5>Messages/Min</h5>
                    <div id="messages-per-min" class="metric-value">-</div>
                </div>
                <div class="metric-item">
                    <h5>Avg Response</h5>
                    <div id="avg-response-time" class="metric-value">-</div>
                </div>
                <div class="metric-item">
                    <h5>System Health</h5>
                    <div id="system-health" class="metric-value health-good">Good</div>
                </div>
            </div>
        `;
        
        // Start metrics updates
        this.updateSystemMetrics();
        setInterval(() => {
            this.updateSystemMetrics();
        }, 5000);
    }

    async updateSystemMetrics() {
        try {
            const response = await api.getRealTimeMonitoring();
            if (response.success) {
                const data = response.data;
                
                // Update active agents count
                const activeAgents = Object.keys(data.agents || {}).length;
                const activeAgentsEl = document.getElementById('active-agents-count');
                if (activeAgentsEl) activeAgentsEl.textContent = activeAgents;
                
                // Calculate messages per minute
                const recentMessages = data.recent_message_flows || [];
                const messagesPerMin = recentMessages.length;
                const messagesEl = document.getElementById('messages-per-min');
                if (messagesEl) messagesEl.textContent = messagesPerMin;
                
                // Calculate average response time
                const avgResponseTime = this.calculateAverageResponseTime(recentMessages);
                const responseTimeEl = document.getElementById('avg-response-time');
                if (responseTimeEl) responseTimeEl.textContent = `${avgResponseTime.toFixed(1)}ms`;
                
                // Update system health
                const healthEl = document.getElementById('system-health');
                if (healthEl) {
                    const health = this.calculateSystemHealth(data);
                    healthEl.textContent = health.status;
                    healthEl.className = `metric-value health-${health.level}`;
                }
            }
        } catch (error) {
            console.error('Failed to update system metrics:', error);
        }
    }

    calculateAverageResponseTime(messageFlows) {
        const responseTimes = messageFlows
            .filter(flow => flow.processing_time)
            .map(flow => flow.processing_time);
        
        if (responseTimes.length === 0) return 0;
        return responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    }

    calculateSystemHealth(data) {
        const agents = Object.values(data.agents || {});
        const errorCount = agents.reduce((count, agent) => 
            count + (agent.metrics?.error_count || 0), 0);
        
        if (errorCount === 0) {
            return { status: 'Excellent', level: 'excellent' };
        } else if (errorCount < 5) {
            return { status: 'Good', level: 'good' };
        } else if (errorCount < 10) {
            return { status: 'Warning', level: 'warning' };
        } else {
            return { status: 'Error', level: 'error' };
        }
    }

    initializeActiveWorkflows() {
        const workflowsContainer = document.getElementById('active-workflows');
        if (!workflowsContainer) return;
        
        workflowsContainer.innerHTML = `
            <div class="workflows-list">
                <div class="workflow-item">
                    <span class="workflow-status active">●</span>
                    <span class="workflow-name">Agent Monitoring</span>
                </div>
                <div class="workflow-item">
                    <span class="workflow-status active">●</span>
                    <span class="workflow-name">Message Processing</span>
                </div>
                <div class="workflow-item">
                    <span class="workflow-status idle">●</span>
                    <span class="workflow-name">Test Execution</span>
                </div>
            </div>
        `;
    }
}

// Global functions for HTML event handlers
function showView(viewName) {
    if (window.app) {
        window.app.showView(viewName);
    }
}

function sendMessage() {
    console.log('Global sendMessage called');
    // Try to initialize chat interface if it doesn't exist
    if (!window.chatInterface && window.initializeChatInterface) {
        console.log('Initializing chat interface...');
        window.initializeChatInterface();
    }

    if (window.chatInterface) {
        console.log('Calling chatInterface.sendMessage()');
        window.chatInterface.sendMessage();
    } else {
        console.warn('ChatInterface not available');
        // Fallback: try to find and call the method directly
        const chatInput = document.getElementById('chatInput');
        if (chatInput && chatInput.value.trim()) {
            console.log('Using fallback sendMessage');
            // Simple fallback - could trigger the API call directly
        }
    }
}

// Expose sendMessage globally
window.sendMessage = sendMessage;

function loadDependencies() {
    if (window.dependencyGraph) {
        window.dependencyGraph.loadDependencies();
    }
}

function updateDepth() {
    if (window.dependencyGraph) {
        const slider = document.getElementById('depthSlider');
        document.getElementById('depthValue').textContent = slider.value;
        
        if (window.dependencyGraph.currentTransaction) {
            window.dependencyGraph.loadDependencies();
        }
    }
}

function filterTests() {
    if (window.testCaseViewer) {
        window.testCaseViewer.applyFilters();
    }
}

function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function showModal(title, content) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    if (modal && modalTitle && modalBody) {
        modalTitle.textContent = title;
        modalBody.innerHTML = content;
        modal.style.display = 'flex';
    }
}

// Global debugging functions
window.debugASTCNavigation = function() {
    console.log('=== ASTC Navigation Debug ===');
    const app = window.app;
    
    if (!app) {
        console.error('❌ ASTC App not initialized');
        return;
    }
    
    console.log('✅ App initialized:', app.isInitialized);
    console.log('📱 Current view:', app.currentView);
    console.log('🔗 Nav links found:', app.navLinks?.length || 0);
    console.log('👁️ Views found:', app.views?.length || 0);
    
    // Test each nav link
    if (app.navLinks) {
        app.navLinks.forEach((link, i) => {
            const view = link.getAttribute('data-view');
            console.log(`  Link ${i}: ${view} (${link.textContent.trim()})`);
        });
    }
    
    // Test each view
    if (app.views) {
        app.views.forEach((view, i) => {
            console.log(`  View ${i}: ${view.id} (visible: ${view.classList.contains('active')})`);
        });
    }
};

window.testNavigation = function(viewName) {
    console.log(`🧪 Testing navigation to: ${viewName}`);
    const app = window.app;
    
    if (!app) {
        console.error('❌ ASTC App not initialized');
        return;
    }
    
    try {
        app.showView(viewName);
        console.log(`✅ Navigation test completed for: ${viewName}`);
    } catch (error) {
        console.error(`❌ Navigation test failed for ${viewName}:`, error);
    }
};

// Initialize application when DOM is ready
let app;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM ready - initializing ASTC App...');
    app = new ASTCApp();
    window.app = app;
    
    // Add debugging info to console
    setTimeout(() => {
        console.log('📋 Debug commands available:');
        console.log('  debugASTCNavigation() - Check navigation status');
        console.log('  testNavigation("chat") - Test natural language view');
        console.log('  testNavigation("dependencies") - Test dependencies view');
    }, 1000);
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (app) {
        app.destroy();
    }
});

// SAP Intelligence Chat Functions
function askQuestion(question) {
    console.log('askQuestion called with:', question);
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.value = question;
        chatInput.focus();
        // Auto-trigger send after a brief delay to show the question was filled
        setTimeout(() => {
            sendMessage();
        }, 100);
    } else {
        console.warn('Chat input not found, question:', question);
    }
}

// Expose functions globally
window.askQuestion = askQuestion;

function generateTestScenarios() {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.value = "Generate detailed test scenarios for Z_VENDOR_CHECK validation changes";
        setTimeout(() => {
            if (window.sendMessage) {
                window.sendMessage();
            }
        }, 100);
    }
}

function explainComplexity() {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.value = "Explain why TR001 has high complexity and what it means for testing";
        setTimeout(() => {
            if (window.sendMessage) {
                window.sendMessage();
            }
        }, 100);
    }
}

// Make functions globally available
window.askQuestion = askQuestion;
window.generateTestScenarios = generateTestScenarios;
window.explainComplexity = explainComplexity;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ASTCApp;
} else {
    window.ASTCApp = ASTCApp;
} 
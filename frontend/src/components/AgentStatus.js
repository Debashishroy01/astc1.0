/**
 * Agent Status Component
 * Monitors and displays agent communication and status
 */

class AgentStatus {
    constructor() {
        this.agents = [];
        this.messageHistory = [];
        this.updateInterval = null;
        
        this.initializeElements();
        this.attachEventListeners();
        this.startMonitoring();
    }

    initializeElements() {
        this.agentCards = document.getElementById('agentCards');
        this.messageTimeline = document.getElementById('messageTimeline');
    }

    attachEventListeners() {
        // Could add event listeners for agent interactions
    }

    async startMonitoring() {
        // Initial load
        await this.refreshStatus();
        
        // Set up periodic updates
        this.updateInterval = setInterval(async () => {
            await this.refreshStatus();
        }, 10000); // Update every 10 seconds
    }

    async refreshStatus() {
        try {
            const result = await api.getAgentStatus();
            
            if (result.success) {
                this.updateAgentStatus(result.data);
            }
        } catch (error) {
            console.error('Failed to refresh agent status:', error);
        }
    }

    updateAgentStatus(data) {
        if (data.agents) {
            this.agents = data.agents;
            this.renderAgentCards();
        }
    }

    renderAgentCards() {
        if (!this.agentCards) return;

        const agentCardsHtml = this.agents.map(agent => {
            return this.renderAgentCard(agent);
        }).join('');

        this.agentCards.innerHTML = agentCardsHtml || `
            <div class="no-agents">
                <p>No agents available</p>
            </div>
        `;
    }

    renderAgentCard(agent) {
        const statusIcon = this.getStatusIcon(agent.status);
        const statusColor = this.getStatusColor(agent.status);
        const lastActivity = this.formatLastActivity(agent.last_activity);

        return `
            <div class="agent-card">
                <div class="agent-card-header">
                    <h4 class="agent-card-title">${agent.name}</h4>
                    <span class="agent-status" style="color: ${statusColor}">
                        ${statusIcon} ${agent.status.toUpperCase()}
                    </span>
                </div>
                
                <div class="agent-card-body">
                    <div class="agent-info">
                        <div class="info-item">
                            <strong>Agent ID:</strong>
                            <span>${agent.agent_id}</span>
                        </div>
                        <div class="info-item">
                            <strong>Messages Processed:</strong>
                            <span>${agent.message_count || 0}</span>
                        </div>
                        <div class="info-item">
                            <strong>Last Activity:</strong>
                            <span>${lastActivity}</span>
                        </div>
                    </div>
                    
                    <div class="agent-capabilities">
                        <h5>Capabilities:</h5>
                        <div class="capability-tags">
                            ${(agent.capabilities || []).map(cap => `
                                <span class="capability-tag">${this.formatCapability(cap)}</span>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="agent-card-actions">
                    <button class="btn btn-sm btn-secondary" onclick="agentStatus.sendTestMessage('${agent.agent_id}')">
                        Send Test Message
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="agentStatus.viewAgentDetails('${agent.agent_id}')">
                        View Details
                    </button>
                </div>
            </div>
        `;
    }

    getStatusIcon(status) {
        const icons = {
            'active': '🟢',
            'inactive': '🔴',
            'loading': '🟡',
            'error': '❌'
        };
        return icons[status] || '❓';
    }

    getStatusColor(status) {
        const colors = {
            'active': '#28a745',
            'inactive': '#6c757d',
            'loading': '#ffc107',
            'error': '#dc3545'
        };
        return colors[status] || '#6c757d';
    }

    formatLastActivity(lastActivity) {
        if (!lastActivity) return 'Never';
        
        const now = new Date();
        const activityTime = new Date(lastActivity);
        const diffMs = now.getTime() - activityTime.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    }

    formatCapability(capability) {
        return capability
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }

    async sendTestMessage(agentId) {
        try {
            // Send a simple test message to the agent
            const testMessage = {
                type: "ping",
                message: "Test message from frontend",
                timestamp: new Date().toISOString()
            };

            // This would typically go through the API
            console.log(`Sending test message to ${agentId}:`, testMessage);
            
            // Show success notification
            this.showNotification(`Test message sent to ${agentId}`, 'success');
            
        } catch (error) {
            console.error('Failed to send test message:', error);
            this.showNotification('Failed to send test message', 'error');
        }
    }

    viewAgentDetails(agentId) {
        const agent = this.agents.find(a => a.agent_id === agentId);
        if (!agent) return;

        const detailsHtml = this.generateAgentDetailsHtml(agent);
        showModal(`Agent Details - ${agent.name}`, detailsHtml);
    }

    generateAgentDetailsHtml(agent) {
        return `
            <div class="agent-details">
                <div class="agent-overview">
                    <h4>${agent.name}</h4>
                    <div class="agent-status-detail">
                        Status: <span style="color: ${this.getStatusColor(agent.status)}">
                            ${this.getStatusIcon(agent.status)} ${agent.status.toUpperCase()}
                        </span>
                    </div>
                </div>

                <div class="agent-metrics">
                    <h5>Performance Metrics</h5>
                    <div class="metrics-grid">
                        <div class="metric">
                            <span class="metric-label">Messages Processed:</span>
                            <span class="metric-value">${agent.message_count || 0}</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Last Activity:</span>
                            <span class="metric-value">${this.formatLastActivity(agent.last_activity)}</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Capabilities:</span>
                            <span class="metric-value">${(agent.capabilities || []).length}</span>
                        </div>
                    </div>
                </div>

                <div class="agent-capabilities-detail">
                    <h5>Capabilities</h5>
                    <ul>
                        ${(agent.capabilities || []).map(cap => `
                            <li>
                                <strong>${this.formatCapability(cap)}</strong>
                                <p>${this.getCapabilityDescription(cap)}</p>
                            </li>
                        `).join('')}
                    </ul>
                </div>

                <div class="agent-actions">
                    <button class="btn btn-primary" onclick="agentStatus.sendTestMessage('${agent.agent_id}')">
                        Send Test Message
                    </button>
                    <button class="btn btn-secondary" onclick="agentStatus.downloadAgentLogs('${agent.agent_id}')">
                        Download Logs
                    </button>
                </div>
            </div>
        `;
    }

    getCapabilityDescription(capability) {
        const descriptions = {
            'natural_language_processing': 'Processes and understands natural language requirements',
            'sap_transaction_analysis': 'Analyzes SAP transaction codes and business processes',
            'test_case_generation': 'Generates comprehensive test cases and scenarios',
            'dependency_graph_analysis': 'Maps and analyzes SAP component dependencies',
            'risk_assessment': 'Evaluates risk levels and impact assessments',
            'test_automation_scripting': 'Creates automated test scripts and procedures'
        };
        return descriptions[capability] || 'Specialized agent capability';
    }

    updateMessageHistory(messageData) {
        if (messageData && messageData.messages) {
            this.messageHistory = messageData.messages.slice(0, 20); // Keep last 20 messages
            this.renderMessageTimeline();
        }
    }

    renderMessageTimeline() {
        if (!this.messageTimeline) return;

        if (this.messageHistory.length === 0) {
            this.messageTimeline.innerHTML = `
                <div class="timeline-placeholder">
                    <p>No agent messages yet</p>
                </div>
            `;
            return;
        }

        const timelineHtml = this.messageHistory.map(message => {
            return this.renderTimelineMessage(message);
        }).join('');

        this.messageTimeline.innerHTML = timelineHtml;
    }

    renderTimelineMessage(message) {
        const time = this.formatMessageTime(message.timestamp);
        const type = message.type || 'message';
        const icon = this.getMessageIcon(type);

        return `
            <div class="timeline-message">
                <div class="message-icon">${icon}</div>
                <div class="message-content">
                    <div class="message-header">
                        <strong>${message.from_agent || 'System'}</strong>
                        <span class="message-time">${time}</span>
                    </div>
                    <div class="message-body">
                        ${this.formatMessageContent(message)}
                    </div>
                </div>
            </div>
        `;
    }

    getMessageIcon(type) {
        const icons = {
            'framework_event': '⚙️',
            'agent_message': '🤖',
            'user_message': '👤',
            'error': '❌',
            'success': '✅'
        };
        return icons[type] || '💬';
    }

    formatMessageTime(timestamp) {
        if (!timestamp) return '';
        
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    formatMessageContent(message) {
        if (message.type === 'framework_event' && message.event) {
            const event = message.event;
            switch (event.event_type) {
                case 'agent_registered':
                    return `Agent "${event.agent_name}" registered successfully`;
                case 'framework_started':
                    return 'Framework started and initialized';
                case 'workflow_started':
                    return `Workflow "${event.workflow_id}" started`;
                default:
                    return event.event_type || 'Framework event';
            }
        }
        
        return message.message || message.payload || 'Agent communication';
    }

    downloadAgentLogs(agentId) {
        // Generate mock log data
        const logs = this.generateMockLogs(agentId);
        const blob = new Blob([logs], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${agentId}_logs_${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }

    generateMockLogs(agentId) {
        const agent = this.agents.find(a => a.agent_id === agentId);
        const timestamp = new Date().toISOString();
        
        return `
ASTC Agent Logs - ${agent?.name || agentId}
Generated: ${timestamp}
=====================================

[${timestamp}] Agent initialized successfully
[${timestamp}] Registered ${(agent?.capabilities || []).length} capabilities
[${timestamp}] Status: ${agent?.status || 'unknown'}
[${timestamp}] Messages processed: ${agent?.message_count || 0}
[${timestamp}] Last activity: ${agent?.last_activity || 'Never'}

Recent Activity:
${this.messageHistory
    .filter(msg => msg.from_agent === agentId || msg.to_agent === agentId)
    .slice(0, 10)
    .map(msg => `[${msg.timestamp}] ${this.formatMessageContent(msg)}`)
    .join('\n') || 'No recent activity'}

=====================================
End of logs
        `.trim();
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 10000;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// Initialize when DOM is ready
let agentStatus;

document.addEventListener('DOMContentLoaded', () => {
    agentStatus = new AgentStatus();
    window.agentStatus = agentStatus;
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgentStatus;
} else {
    window.AgentStatus = AgentStatus;
} 
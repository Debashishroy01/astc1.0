/**
 * Message Flow Display Component
 * Real-time visualization of agent message flows and communication patterns
 * Shows live message streams, activity timelines, and communication analytics
 */

class MessageFlowDisplay {
    constructor() {
        this.container = null;
        this.messageContainer = null;
        this.timelineContainer = null;
        this.activityLog = [];
        this.messageFlows = [];
        this.updateInterval = null;
        this.maxLogEntries = 100;
        this.animationQueue = [];
        this.isAnimating = false;
        
        console.log('💬 Message Flow Display initialized');
    }
    
    initialize(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Container not found:', containerId);
            return;
        }
        
        this.setupInterface();
        this.startRealTimeUpdates();
    }
    
    setupInterface() {
        this.container.innerHTML = `
            <div class="message-flow-header">
                <h4>💬 Agent Communication Flow</h4>
                <div class="flow-stats">
                    <span id="total-messages">Messages: 0</span>
                    <span id="active-flows">Active: 0</span>
                    <span id="avg-response-time">Avg Response: 0ms</span>
                </div>
                <div class="flow-controls">
                    <button id="pause-flow" class="btn btn-sm">⏸️ Pause</button>
                    <button id="clear-log" class="btn btn-sm">🗑️ Clear</button>
                    <select id="filter-agent" class="form-select">
                        <option value="">All Agents</option>
                    </select>
                </div>
            </div>
            
            <div class="message-flow-content">
                <div class="live-messages-panel">
                    <h5>Live Message Stream</h5>
                    <div id="live-messages" class="live-messages-container"></div>
                </div>
                
                <div class="activity-timeline-panel">
                    <h5>Activity Timeline</h5>
                    <div id="activity-timeline" class="timeline-container"></div>
                </div>
                
                <div class="communication-analytics">
                    <h5>Communication Analytics</h5>
                    <div class="analytics-grid">
                        <div class="metric-card">
                            <h6>Message Volume</h6>
                            <canvas id="message-volume-chart" width="200" height="100"></canvas>
                        </div>
                        <div class="metric-card">
                            <h6>Response Times</h6>
                            <canvas id="response-time-chart" width="200" height="100"></canvas>
                        </div>
                        <div class="metric-card">
                            <h6>Agent Activity</h6>
                            <div id="agent-activity-bars" class="activity-bars"></div>
                        </div>
                        <div class="metric-card">
                            <h6>Communication Patterns</h6>
                            <div id="communication-patterns" class="pattern-display"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.messageContainer = document.getElementById('live-messages');
        this.timelineContainer = document.getElementById('activity-timeline');
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        document.getElementById('pause-flow').addEventListener('click', () => {
            this.toggleUpdates();
        });
        
        document.getElementById('clear-log').addEventListener('click', () => {
            this.clearActivityLog();
        });
        
        document.getElementById('filter-agent').addEventListener('change', (e) => {
            this.filterByAgent(e.target.value);
        });
    }
    
    async updateMessageFlow() {
        try {
            const response = await api.makeRequest('/api/monitoring/activity-history?limit=50', 'GET');
            
            if (response.success) {
                this.processMessageFlowData(response.data);
                this.updateFlowStats(response.data);
                this.renderLiveMessages();
                this.updateTimeline();
                this.updateAnalytics();
            }
        } catch (error) {
            console.error('Failed to fetch message flow data:', error);
        }
    }
    
    processMessageFlowData(data) {
        // Process activities
        if (data.activities) {
            data.activities.forEach(activity => {
                if (!this.activityLog.find(a => a.timestamp === activity.timestamp && a.agent_id === activity.agent_id)) {
                    this.activityLog.push(activity);
                    this.animateNewActivity(activity);
                }
            });
        }
        
        // Process message flows
        if (data.message_flows) {
            data.message_flows.forEach(flow => {
                if (!this.messageFlows.find(f => f.message_id === flow.message_id)) {
                    this.messageFlows.push(flow);
                    this.animateMessageFlow(flow);
                }
            });
        }
        
        // Keep only recent entries
        this.activityLog = this.activityLog.slice(-this.maxLogEntries);
        this.messageFlows = this.messageFlows.slice(-this.maxLogEntries);
        
        // Update agent filter options
        this.updateAgentFilter();
    }
    
    animateNewActivity(activity) {
        this.animationQueue.push({
            type: 'activity',
            data: activity,
            timestamp: Date.now()
        });
        
        if (!this.isAnimating) {
            this.processAnimationQueue();
        }
    }
    
    animateMessageFlow(flow) {
        this.animationQueue.push({
            type: 'message_flow',
            data: flow,
            timestamp: Date.now()
        });
        
        if (!this.isAnimating) {
            this.processAnimationQueue();
        }
    }
    
    processAnimationQueue() {
        if (this.animationQueue.length === 0) {
            this.isAnimating = false;
            return;
        }
        
        this.isAnimating = true;
        const animation = this.animationQueue.shift();
        
        if (animation.type === 'activity') {
            this.showActivityAnimation(animation.data);
        } else if (animation.type === 'message_flow') {
            this.showMessageFlowAnimation(animation.data);
        }
        
        // Process next animation after delay
        setTimeout(() => {
            this.processAnimationQueue();
        }, 100);
    }
    
    showActivityAnimation(activity) {
        const activityElement = document.createElement('div');
        activityElement.className = `activity-flash activity-${activity.activity_type}`;
        activityElement.innerHTML = `
            <span class="activity-agent">${activity.agent_id}</span>
            <span class="activity-type">${this.formatActivityType(activity.activity_type)}</span>
        `;
        
        // Add to live messages with animation
        this.messageContainer.insertBefore(activityElement, this.messageContainer.firstChild);
        
        // Animate in
        setTimeout(() => {
            activityElement.classList.add('animate-in');
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            activityElement.classList.add('animate-out');
            setTimeout(() => {
                if (activityElement.parentNode) {
                    activityElement.parentNode.removeChild(activityElement);
                }
            }, 300);
        }, 3000);
    }
    
    showMessageFlowAnimation(flow) {
        const flowElement = document.createElement('div');
        flowElement.className = 'message-flow-animation';
        flowElement.innerHTML = `
            <div class="flow-path">
                <span class="from-agent">${flow.from_agent}</span>
                <div class="flow-arrow">→</div>
                <span class="to-agent">${flow.to_agent}</span>
            </div>
            <div class="flow-details">
                <span class="message-type">${flow.message_type}</span>
                <span class="payload-size">${this.formatBytes(flow.payload_size)}</span>
            </div>
        `;
        
        this.messageContainer.insertBefore(flowElement, this.messageContainer.firstChild);
        
        // Animate the arrow
        const arrow = flowElement.querySelector('.flow-arrow');
        arrow.style.animation = 'pulse 0.5s ease-in-out';
        
        // Animate in
        setTimeout(() => {
            flowElement.classList.add('animate-in');
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            flowElement.classList.add('animate-out');
            setTimeout(() => {
                if (flowElement.parentNode) {
                    flowElement.parentNode.removeChild(flowElement);
                }
            }, 300);
        }, 4000);
    }
    
    renderLiveMessages() {
        // Limit visible messages to prevent performance issues
        const visibleMessages = this.messageContainer.children.length;
        if (visibleMessages > 20) {
            const messagesToRemove = visibleMessages - 20;
            for (let i = 0; i < messagesToRemove; i++) {
                const lastChild = this.messageContainer.lastElementChild;
                if (lastChild) {
                    this.messageContainer.removeChild(lastChild);
                }
            }
        }
    }
    
    updateTimeline() {
        const recentActivities = this.activityLog.slice(-10);
        
        this.timelineContainer.innerHTML = recentActivities.map(activity => `
            <div class="timeline-entry">
                <div class="timeline-time">${this.formatTime(activity.timestamp)}</div>
                <div class="timeline-content">
                    <div class="timeline-agent">${activity.agent_id}</div>
                    <div class="timeline-activity">${this.formatActivityType(activity.activity_type)}</div>
                    ${activity.processing_time ? `<div class="timeline-duration">${activity.processing_time.toFixed(2)}ms</div>` : ''}
                </div>
                <div class="timeline-marker ${activity.activity_type}"></div>
            </div>
        `).join('');
    }
    
    updateAnalytics() {
        this.updateMessageVolumeChart();
        this.updateResponseTimeChart();
        this.updateAgentActivityBars();
        this.updateCommunicationPatterns();
    }
    
    updateMessageVolumeChart() {
        const canvas = document.getElementById('message-volume-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Get message counts per minute for last 10 minutes
        const now = Date.now();
        const messageCounts = [];
        for (let i = 9; i >= 0; i--) {
            const startTime = now - (i + 1) * 60000;
            const endTime = now - i * 60000;
            const count = this.messageFlows.filter(flow => {
                const flowTime = new Date(flow.timestamp).getTime();
                return flowTime >= startTime && flowTime < endTime;
            }).length;
            messageCounts.push(count);
        }
        
        // Draw chart
        const maxCount = Math.max(...messageCounts, 1);
        const barWidth = width / messageCounts.length;
        
        ctx.fillStyle = '#3b82f6';
        messageCounts.forEach((count, index) => {
            const barHeight = (count / maxCount) * height * 0.8;
            const x = index * barWidth;
            const y = height - barHeight;
            ctx.fillRect(x, y, barWidth - 2, barHeight);
        });
        
        // Draw axes
        ctx.strokeStyle = '#666';
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(width, height);
        ctx.stroke();
    }
    
    updateResponseTimeChart() {
        const canvas = document.getElementById('response-time-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Get response times
        const responseTimes = this.messageFlows
            .filter(flow => flow.processing_time)
            .slice(-20)
            .map(flow => flow.processing_time);
        
        if (responseTimes.length === 0) return;
        
        const maxTime = Math.max(...responseTimes);
        const pointWidth = width / Math.max(responseTimes.length - 1, 1);
        
        // Draw line chart
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        responseTimes.forEach((time, index) => {
            const x = index * pointWidth;
            const y = height - (time / maxTime) * height * 0.8;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Draw points
        ctx.fillStyle = '#10b981';
        responseTimes.forEach((time, index) => {
            const x = index * pointWidth;
            const y = height - (time / maxTime) * height * 0.8;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
        });
    }
    
    updateAgentActivityBars() {
        const container = document.getElementById('agent-activity-bars');
        if (!container) return;
        
        // Count activities per agent
        const agentCounts = {};
        this.activityLog.forEach(activity => {
            agentCounts[activity.agent_id] = (agentCounts[activity.agent_id] || 0) + 1;
        });
        
        const maxCount = Math.max(...Object.values(agentCounts), 1);
        
        container.innerHTML = Object.entries(agentCounts).map(([agentId, count]) => `
            <div class="activity-bar">
                <div class="bar-label">${agentId}</div>
                <div class="bar-container">
                    <div class="bar-fill" style="width: ${(count / maxCount) * 100}%"></div>
                </div>
                <div class="bar-count">${count}</div>
            </div>
        `).join('');
    }
    
    updateCommunicationPatterns() {
        const container = document.getElementById('communication-patterns');
        if (!container) return;
        
        // Analyze communication patterns
        const patterns = {};
        this.messageFlows.forEach(flow => {
            const pattern = `${flow.from_agent} → ${flow.to_agent}`;
            patterns[pattern] = (patterns[pattern] || 0) + 1;
        });
        
        const topPatterns = Object.entries(patterns)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
        
        container.innerHTML = topPatterns.map(([pattern, count]) => `
            <div class="pattern-item">
                <span class="pattern-text">${pattern}</span>
                <span class="pattern-count">${count}</span>
            </div>
        `).join('');
    }
    
    updateFlowStats(data) {
        const totalMessages = this.messageFlows.length;
        const activeFlows = this.animationQueue.length;
        const avgResponseTime = this.calculateAverageResponseTime();
        
        document.getElementById('total-messages').textContent = `Messages: ${totalMessages}`;
        document.getElementById('active-flows').textContent = `Active: ${activeFlows}`;
        document.getElementById('avg-response-time').textContent = `Avg Response: ${avgResponseTime.toFixed(1)}ms`;
    }
    
    calculateAverageResponseTime() {
        const responseTimes = this.messageFlows
            .filter(flow => flow.processing_time)
            .map(flow => flow.processing_time);
        
        if (responseTimes.length === 0) return 0;
        return responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    }
    
    updateAgentFilter() {
        const select = document.getElementById('filter-agent');
        const currentValue = select.value;
        
        const agents = [...new Set(this.activityLog.map(a => a.agent_id))];
        
        select.innerHTML = '<option value="">All Agents</option>' +
            agents.map(agent => `<option value="${agent}">${agent}</option>`).join('');
        
        select.value = currentValue;
    }
    
    filterByAgent(agentId) {
        // Implementation for filtering would go here
        console.log('Filtering by agent:', agentId);
    }
    
    formatActivityType(type) {
        return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    formatTime(timestamp) {
        return new Date(timestamp).toLocaleTimeString();
    }
    
    formatBytes(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
    
    toggleUpdates() {
        const button = document.getElementById('pause-flow');
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
            button.textContent = '▶️ Resume';
        } else {
            this.startRealTimeUpdates();
            button.textContent = '⏸️ Pause';
        }
    }
    
    clearActivityLog() {
        this.activityLog = [];
        this.messageFlows = [];
        this.messageContainer.innerHTML = '';
        this.timelineContainer.innerHTML = '';
        this.updateAnalytics();
    }
    
    startRealTimeUpdates() {
        // Initial load
        this.updateMessageFlow();
        
        // Set up periodic updates
        this.updateInterval = setInterval(() => {
            this.updateMessageFlow();
        }, 1000); // Update every second for real-time feel
    }
    
    stopRealTimeUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
    
    destroy() {
        this.stopRealTimeUpdates();
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Create global instance
window.messageFlowDisplay = new MessageFlowDisplay(); 
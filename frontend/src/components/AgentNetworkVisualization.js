/**
 * Agent Network Visualization Component
 * Professional agent network topology with core active agents and connections
 */

class AgentNetworkVisualization {
    constructor() {
        console.log('AgentNetworkVisualization: Initializing professional agent network');
        
        this.container = null;
        this.svg = null;
        this.width = 1200;
        this.height = 600;
        
        // Real-time backend integration
        this.apiBaseUrl = 'http://localhost:3000';
        this.realTimeData = null;
        this.updateInterval = null;
        this.isAnimating = true;
        this.statusColors = {
            'ready': '#10b981',      // Green
            'processing': '#3b82f6', // Blue  
            'error': '#ef4444',      // Red
            'idle': '#94a3b8',       // Gray
            'busy': '#f59e0b'        // Orange
        };
        
        // Core active agents (positions can be dynamic based on activity)
        this.coreAgents = [
            {
                id: 'sap_intelligence',
                name: 'SAP Intelligence',
                type: 'core',
                icon: '🧠',
                baseColor: '#2563eb',
                currentColor: '#2563eb',
                baseX: 600, baseY: 120,  // Base positions
                x: 600, y: 120,          // Current positions (can be dynamic)
                status: 'ready',
                metrics: { requests: 0, avgTime: 0, successRate: 0 },
                description: 'Analyzes SAP transports and identifies testing requirements',
                capabilities: ['Transport Analysis', 'Object Detection', 'Change Assessment']
            },
            {
                id: 'test_generation',
                name: 'Test Generation',
                type: 'processor',
                icon: '🧪',
                baseColor: '#059669',
                currentColor: '#059669',
                baseX: 300, baseY: 280,
                x: 300, y: 280,
                status: 'ready',
                metrics: { requests: 0, avgTime: 0, successRate: 0 },
                description: 'Generates comprehensive test cases from SAP analysis',
                capabilities: ['Test Case Creation', 'Scenario Generation', 'Coverage Analysis']
            },
            {
                id: 'script_generation',
                name: 'Script Generation',
                type: 'processor',
                icon: '📝',
                baseColor: '#dc2626',
                currentColor: '#dc2626',
                baseX: 900, baseY: 280,
                x: 900, y: 280,
                status: 'ready',
                metrics: { requests: 0, avgTime: 0, successRate: 0 },
                description: 'Converts test cases to automation scripts',
                capabilities: ['Robot Framework', 'Tosca XML', 'Script Optimization']
            },
            {
                id: 'dependency_analysis',
                name: 'Dependency Analysis',
                type: 'analysis',
                icon: '🔗',
                baseColor: '#9333ea',
                currentColor: '#9333ea',
                baseX: 400, baseY: 450,
                x: 400, y: 450,
                status: 'ready',
                metrics: { requests: 0, avgTime: 0, successRate: 0 },
                description: 'Maps object dependencies and impact analysis',
                capabilities: ['Dependency Mapping', 'Impact Assessment', 'Risk Analysis']
            },
            {
                id: 'test_execution',
                name: 'Test Execution',
                type: 'execution',
                icon: '⚡',
                baseColor: '#ea580c',
                currentColor: '#ea580c',
                baseX: 800, baseY: 450,
                x: 800, y: 450,
                status: 'ready',
                metrics: { requests: 0, avgTime: 0, successRate: 0 },
                description: 'Simulates and validates test execution',
                capabilities: ['Test Simulation', 'Result Validation', 'Performance Metrics']
            }
        ];
        
        // Professional connections between agents
        this.agentConnections = [
            // SAP Intelligence feeds into all other agents
            { source: 'sap_intelligence', target: 'test_generation', type: 'Analysis Data', strength: 0.9 },
            { source: 'sap_intelligence', target: 'dependency_analysis', type: 'Object Data', strength: 0.8 },
            { source: 'sap_intelligence', target: 'script_generation', type: 'Context Data', strength: 0.6 },
            
            // Test Generation to Script Generation workflow
            { source: 'test_generation', target: 'script_generation', type: 'Test Cases', strength: 0.9 },
            
            // Script Generation to Test Execution
            { source: 'script_generation', target: 'test_execution', type: 'Scripts', strength: 0.8 },
            
            // Test Generation to Test Execution
            { source: 'test_generation', target: 'test_execution', type: 'Test Data', strength: 0.7 },
            
            // Dependency Analysis supports Test Generation
            { source: 'dependency_analysis', target: 'test_generation', type: 'Dependencies', strength: 0.6 },
            
            // Dependency Analysis supports Test Execution
            { source: 'dependency_analysis', target: 'test_execution', type: 'Impact Data', strength: 0.5 }
        ];
        
        this.init();
    }
    
    init() {
        try {
            this.findContainer();
            this.createProfessionalInterface();
            this.setupVisualization();
            this.renderAgentNetwork();
            this.startRealTimeUpdates();  // Start real-time monitoring
            this.startConnectionAnimations();
        } catch (error) {
            console.error('AgentNetworkVisualization: Initialization failed:', error);
        }
    }
    
    // 🔄 REAL-TIME BACKEND INTEGRATION
    async startRealTimeUpdates() {
        console.log('🔄 Starting real-time agent network updates');
        
        // Initial data load
        await this.fetchAgentData();
        
        // Set up periodic updates every 5 seconds
        this.updateInterval = setInterval(async () => {
            if (this.isAnimating) {
                await this.fetchAgentData();
            }
        }, 5000);
    }
    
    async fetchAgentData() {
        try {
            // Fetch agent status data from backend
            const response = await fetch(`${this.apiBaseUrl}/api/agents/status`);
            const agentData = await response.json();
            
            if (agentData && agentData.agents) {
                this.updateAgentStates(agentData.agents);
                this.updateNetworkVisualization();
            }
        } catch (error) {
            console.warn('AgentNetworkVisualization: Failed to fetch real-time data:', error);
            // Continue with current data, don't break the visualization
        }
    }
    
    updateAgentStates(backendData) {
        // Update each agent with real-time data from backend
        this.coreAgents.forEach(agent => {
            const backendAgent = backendData.find(ba => ba.agent_id === agent.id);
            
            if (backendAgent) {
                // Update status and color
                const oldStatus = agent.status;
                agent.status = this.mapBackendStatus(backendAgent.state);
                agent.currentColor = this.statusColors[agent.status] || agent.baseColor;
                
                // Update metrics
                agent.metrics = {
                    requests: backendAgent.requests_processed || 0,
                    avgTime: backendAgent.avg_response_time || 0,
                    successRate: backendAgent.success_rate || 0
                };
                
                // Dynamic positioning based on activity level
                if (agent.status === 'processing' || agent.status === 'busy') {
                    // Slightly move active agents to show activity
                    const activityOffset = Math.sin(Date.now() / 1000) * 5;
                    agent.x = agent.baseX + activityOffset;
                    agent.y = agent.baseY + activityOffset;
                } else {
                    // Return to base position when not active
                    agent.x = agent.baseX;
                    agent.y = agent.baseY;
                }
                
                // Log status changes
                if (oldStatus !== agent.status) {
                    console.log(`🔄 Agent ${agent.name}: ${oldStatus} → ${agent.status}`);
                }
            }
        });
    }
    
    mapBackendStatus(backendState) {
        // Map backend agent states to our visualization states
        const stateMap = {
            'ACTIVE': 'ready',
            'PROCESSING': 'processing', 
            'IDLE': 'idle',
            'ERROR': 'error',
            'BUSY': 'busy'
        };
        return stateMap[backendState] || 'idle';
    }
    
    updateNetworkVisualization() {
        // Smoothly update the visualization with new data
        this.updateAgentNodes();
        this.updateNetworkStats();
    }
    
    updateAgentNodes() {
        if (!this.svg) return;
        
        const nodeGroup = this.svg.select('.nodes-group');
        const nodes = nodeGroup.selectAll('.node-group').data(this.coreAgents);
        
        // Smooth transitions for position and color changes
        nodes.transition()
            .duration(1000)
            .attr('transform', d => `translate(${d.x}, ${d.y})`);
            
        nodes.select('.node-circle')
            .transition()
            .duration(800)
            .attr('fill', d => d.currentColor)
            .attr('stroke-width', d => d.status === 'processing' ? 6 : 4)
            .attr('opacity', d => d.status === 'error' ? 0.7 : 0.9);
            
        // Update labels to reflect current position
        this.svg.select('.labels-group').selectAll('.node-label')
            .data(this.coreAgents)
            .transition()
            .duration(1000)
            .attr('x', d => d.x)
            .attr('y', d => d.y + 55);
    }
    
    updateNetworkStats() {
        // Update the network statistics in the header
        const activeAgents = this.coreAgents.filter(a => a.status !== 'idle').length;
        const avgSuccessRate = Math.round(
            this.coreAgents.reduce((sum, a) => sum + a.metrics.successRate, 0) / this.coreAgents.length
        );
        
        // Update DOM elements if they exist
        const statsContainer = this.container?.querySelector('.network-stats');
        if (statsContainer) {
            const statValues = statsContainer.querySelectorAll('.stat-value');
            if (statValues[0]) statValues[0].textContent = activeAgents;
            if (statValues[2]) statValues[2].textContent = `${avgSuccessRate}%`;
        }
    }
    
    findContainer() {
        this.container = document.getElementById('agent-network-content');
        if (!this.container) {
            console.warn('AgentNetworkVisualization: Container not found');
            return;
        }
        console.log('AgentNetworkVisualization: Container found');
    }
    
    createProfessionalInterface() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="professional-network-container">
                <div class="network-header">
                    <h3>🌐 Active Agent Network Topology</h3>
                    <div class="network-stats">
                        <span class="stat-item">
                            <span class="stat-value">${this.coreAgents.length}</span>
                            <span class="stat-label">Active Agents</span>
                        </span>
                        <span class="stat-item">
                            <span class="stat-value">${this.agentConnections.length}</span>
                            <span class="stat-label">Connections</span>
                        </span>
                        <span class="stat-item">
                            <span class="stat-value">98%</span>
                            <span class="stat-label">Network Health</span>
                        </span>
                    </div>
                </div>
                
                <div class="network-controls">
                    <button class="control-btn primary" onclick="agentNetworkVisualization.refreshNetwork()">🔄 Refresh</button>
                    <button class="control-btn secondary" onclick="agentNetworkVisualization.toggleAnimations()">⏸️ Pause</button>
                    <select class="control-select" onchange="agentNetworkVisualization.changeView(this.value)">
                        <option value="topology">Network Topology</option>
                        <option value="dataflow">Data Flow</option>
                        <option value="performance">Performance</option>
                    </select>
                </div>
                
                <div class="network-canvas-container">
                    <svg class="network-canvas" width="${this.width}" height="${this.height}" viewBox="0 0 ${this.width} ${this.height}"></svg>
                </div>
                
                <div class="agent-legend">
                    <h4>Agent Types</h4>
                    <div class="legend-items">
                        <div class="legend-item">
                            <div class="legend-color core"></div>
                            <span>Core Intelligence</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color processor"></div>
                            <span>Processing</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color analysis"></div>
                            <span>Analysis</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color execution"></div>
                            <span>Execution</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add comprehensive CSS for professional styling
        const style = document.createElement('style');
        style.textContent = `
            .professional-network-container {
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                border-radius: 12px;
                padding: 24px;
                margin: 20px 0;
                box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                border: 1px solid #e2e8f0;
            }
            
            .network-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 16px;
                border-bottom: 2px solid #e2e8f0;
            }
            
            .network-header h3 {
                margin: 0;
                color: #1e293b;
                font-size: 24px;
                font-weight: 700;
            }
            
            .network-stats {
                display: flex;
                gap: 24px;
            }
            
            .stat-item {
                text-align: center;
                padding: 8px 16px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            }
            
            .stat-value {
                display: block;
                font-size: 20px;
                font-weight: 700;
                color: #2563eb;
            }
            
            .stat-label {
                display: block;
                font-size: 12px;
                color: #64748b;
                margin-top: 2px;
            }
            
            .network-controls {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 20px;
                padding: 12px;
                background: white;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
            }
            
            .control-btn {
                padding: 8px 16px;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .control-btn.primary {
                background: #2563eb;
                color: white;
            }
            
            .control-btn.primary:hover {
                background: #1d4ed8;
            }
            
            .control-btn.secondary {
                background: #f1f5f9;
                color: #475569;
                border: 1px solid #cbd5e1;
            }
            
            .control-btn.secondary:hover {
                background: #e2e8f0;
            }
            
            .control-select {
                padding: 8px 12px;
                border: 1px solid #cbd5e1;
                border-radius: 6px;
                font-size: 14px;
                background: white;
                color: #374151;
            }
            
            .network-canvas-container {
                background: white;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
                overflow: hidden;
                box-shadow: 0 4px 16px rgba(0,0,0,0.05);
            }
            
            .network-canvas {
                display: block;
                width: 100%;
                height: auto;
            }
            
            .agent-legend {
                margin-top: 20px;
                padding: 16px;
                background: white;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
            }
            
            .agent-legend h4 {
                margin: 0 0 12px 0;
                color: #1e293b;
                font-size: 16px;
            }
            
            .legend-items {
                display: flex;
                gap: 20px;
                flex-wrap: wrap;
            }
            
            .legend-item {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
                color: #475569;
            }
            
            .legend-color {
                width: 12px;
                height: 12px;
                border-radius: 50%;
            }
            
            .legend-color.core { background: #2563eb; }
            .legend-color.processor { background: #059669; }
            .legend-color.analysis { background: #9333ea; }
            .legend-color.execution { background: #ea580c; }
            
            .agent-node {
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .agent-node:hover {
                transform: scale(1.05);
            }
            
            .agent-connection {
                stroke-width: 2;
                opacity: 0.6;
                transition: all 0.3s ease;
            }
            
            .agent-connection:hover {
                opacity: 1;
                stroke-width: 3;
            }
            
            .connection-label {
                font-size: 11px;
                fill: #64748b;
                text-anchor: middle;
                pointer-events: none;
            }
            
            .agent-label {
                font-size: 12px;
                font-weight: 600;
                fill: #1e293b;
                text-anchor: middle;
                pointer-events: none;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    setupVisualization() {
        // First, select the SVG element that was created in createProfessionalInterface
        this.svg = d3.select(this.container).select('.network-canvas');
        
        if (this.svg.empty()) {
            console.error('AgentNetworkVisualization: SVG element not found');
            return;
        }
        
        console.log('AgentNetworkVisualization: SVG element selected');
        
        // Create SVG groups for organized rendering
        this.svg.append('g').attr('class', 'links-group');
        this.svg.append('g').attr('class', 'nodes-group');
        this.svg.append('g').attr('class', 'labels-group');
        
        // Add arrow marker definition
        const defs = this.svg.append('defs');
        
        defs.append('marker')
            .attr('id', 'arrowhead')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 8)
            .attr('refY', 0)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', '#94a3b8');
    }
    
    renderAgentNetwork() {
        console.log('AgentNetworkVisualization: Rendering agent network');
        
        // Render connections first (so they appear behind nodes)
        this.renderConnections();
        
        // Render agent nodes
        this.renderAgentNodes();
        
        // Render labels
        this.renderLabels();
    }
    
    renderConnections() {
        const linkGroup = this.svg.select('.links-group');
        
        // Clear existing connections
        linkGroup.selectAll('*').remove();
        
        // Create lines for connections
        linkGroup.selectAll('.connection-line')
            .data(this.agentConnections)
            .enter()
            .append('line')
            .attr('class', 'connection-line')
            .attr('x1', d => this.getAgentPosition(d.source).x)
            .attr('y1', d => this.getAgentPosition(d.source).y)
            .attr('x2', d => this.getAgentPosition(d.target).x)
            .attr('y2', d => this.getAgentPosition(d.target).y)
            .attr('stroke', '#94a3b8')
            .attr('stroke-width', 3)  // Increased from 2 to 3
            .attr('stroke-opacity', 0.7)  // Increased opacity
            .attr('marker-end', 'url(#arrowhead)');
        
        // Add connection labels (ADJUSTED FOR BIGGER NODES)
        linkGroup.selectAll('.connection-label')
            .data(this.agentConnections)
            .enter()
            .append('text')
            .attr('class', 'connection-label')
            .attr('x', d => {
                const source = this.getAgentPosition(d.source);
                const target = this.getAgentPosition(d.target);
                return (source.x + target.x) / 2;
            })
            .attr('y', d => {
                const source = this.getAgentPosition(d.source);
                const target = this.getAgentPosition(d.target);
                return (source.y + target.y) / 2 - 8;  // Adjusted offset
            })
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')  // Increased from 10px to 12px
            .attr('font-weight', '600')
            .attr('fill', '#475569')
            .style('text-shadow', '1px 1px 2px rgba(255,255,255,0.9)')  // Better contrast
            .text(d => d.type);
    }
    
    renderAgentNodes() {
        const nodeGroup = this.svg.select('.nodes-group');
        
        // Clear existing nodes
        nodeGroup.selectAll('*').remove();
        
        // Create node groups for each agent
        const nodes = nodeGroup.selectAll('.node-group')
            .data(this.coreAgents)
            .enter()
            .append('g')
            .attr('class', 'node-group')
            .attr('transform', d => `translate(${d.x}, ${d.y})`)
            .style('cursor', 'pointer');
        
        // Add circles (BIGGER SIZE)
        nodes.append('circle')
            .attr('class', 'node-circle')
            .attr('r', 35)  // Increased from 25 to 35
            .attr('fill', d => d.currentColor)
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 4)  // Increased stroke width
            .attr('opacity', 0.9)
            .style('filter', 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))');
        
        // Add icons (LARGER SIZE)
        nodes.append('text')
            .attr('class', 'node-icon')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .attr('font-size', '28px')  // Increased from 20px to 28px
            .attr('fill', '#ffffff')
            .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.5)')
            .text(d => d.icon);
        
        // Add hover and click events
        nodes
            .on('mouseover', (event, d) => this.highlightConnections(d))
            .on('mouseout', () => this.resetHighlight())
            .on('click', (event, d) => this.showAgentDetails(d));
    }
    
    renderLabels() {
        const labelGroup = this.svg.select('.labels-group');
        
        // Clear existing labels
        labelGroup.selectAll('*').remove();
        
        // Add agent names below nodes (LARGER TEXT)
        labelGroup.selectAll('.node-label')
            .data(this.coreAgents)
            .enter()
            .append('text')
            .attr('class', 'node-label')
            .attr('x', d => d.x)
            .attr('y', d => d.y + 55)  // Adjusted position for bigger circles
            .attr('text-anchor', 'middle')
            .attr('font-size', '16px')  // Increased from 12px to 16px
            .attr('font-weight', 'bold')  // Made bold for better legibility
            .attr('fill', '#2d3748')
            .style('text-shadow', '1px 1px 2px rgba(255,255,255,0.8)')  // Added text shadow for contrast
            .text(d => d.name);
    }
    
    showAgentDetails(agent) {
        // Enhanced modal with real-time metrics
        const modal = document.createElement('div');
        modal.className = 'agent-modal';
        modal.innerHTML = `
            <div class="modal-content professional">
                <div class="modal-header">
                    <div class="agent-status-indicator ${agent.status}"></div>
                    <h3>${agent.icon} ${agent.name}</h3>
                    <span class="close-modal">&times;</span>
                </div>
                
                <div class="modal-body">
                    <div class="agent-info-grid">
                        <div class="info-section">
                            <h4>🎯 Current Status</h4>
                            <div class="status-details">
                                <span class="status-badge ${agent.status}">${agent.status.toUpperCase()}</span>
                                <p class="status-description">${this.getStatusDescription(agent.status)}</p>
                            </div>
                        </div>
                        
                        <div class="info-section">
                            <h4>📊 Real-Time Metrics</h4>
                            <div class="metrics-grid">
                                <div class="metric-item">
                                    <span class="metric-label">Requests Processed</span>
                                    <span class="metric-value">${agent.metrics.requests}</span>
                                </div>
                                <div class="metric-item">
                                    <span class="metric-label">Avg Response Time</span>
                                    <span class="metric-value">${agent.metrics.avgTime.toFixed(2)}s</span>
                                </div>
                                <div class="metric-item">
                                    <span class="metric-label">Success Rate</span>
                                    <span class="metric-value success-rate">${agent.metrics.successRate}%</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="info-section">
                            <h4>🛠️ Capabilities</h4>
                            <div class="capabilities-list">
                                ${agent.capabilities.map(cap => `<span class="capability-tag">${cap}</span>`).join('')}
                            </div>
                        </div>
                        
                        <div class="info-section">
                            <h4>📝 Description</h4>
                            <p class="agent-description">${agent.description}</p>
                        </div>
                        
                        <div class="info-section">
                            <h4>🔗 Network Position</h4>
                            <div class="position-info">
                                <span>X: ${Math.round(agent.x)}, Y: ${Math.round(agent.y)}</span>
                                <span class="position-type">${agent.x !== agent.baseX || agent.y !== agent.baseY ? 'Dynamic (Activity-based)' : 'Base Position'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Enhanced close functionality
        const closeModal = () => {
            modal.remove();
        };
        
        // Close button click
        const closeButton = modal.querySelector('.close-modal');
        closeButton.addEventListener('click', closeModal);
        
        // Click outside modal to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // Escape key to close
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
        
        // Enhanced modal styles
        const style = document.createElement('style');
        style.textContent = `
            .agent-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                animation: modalFadeIn 0.3s ease;
            }
            
            @keyframes modalFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .modal-content.professional {
                background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                border-radius: 16px;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
                width: 90%;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                border: 1px solid #e2e8f0;
                animation: modalSlideIn 0.3s ease;
            }
            
            @keyframes modalSlideIn {
                from { transform: translateY(-20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            .modal-header {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 24px;
                border-bottom: 1px solid #e2e8f0;
                background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
                color: white;
                border-radius: 16px 16px 0 0;
                position: relative;
            }
            
            .agent-status-indicator {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                animation: statusPulse 2s infinite;
            }
            
            .agent-status-indicator.ready { background: #10b981; }
            .agent-status-indicator.processing { background: #3b82f6; }
            .agent-status-indicator.error { background: #ef4444; }
            .agent-status-indicator.idle { background: #94a3b8; }
            .agent-status-indicator.busy { background: #f59e0b; }
            
            @keyframes statusPulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.7; transform: scale(1.1); }
            }
            
            .close-modal {
                position: absolute;
                right: 20px;
                font-size: 28px;
                cursor: pointer;
                color: #94a3b8;
                transition: all 0.2s ease;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.1);
            }
            
            .close-modal:hover {
                color: #ffffff;
                background: rgba(255, 255, 255, 0.2);
                transform: scale(1.1);
            }
            
            .modal-body {
                padding: 24px;
            }
            
            .agent-info-grid {
                display: grid;
                gap: 20px;
            }
            
            .info-section h4 {
                margin: 0 0 12px 0;
                color: #1e293b;
                font-size: 16px;
                font-weight: 600;
            }
            
            .status-badge {
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .status-badge.ready { background: #d1fae5; color: #065f46; }
            .status-badge.processing { background: #dbeafe; color: #1e40af; }
            .status-badge.error { background: #fee2e2; color: #991b1b; }
            .status-badge.idle { background: #f1f5f9; color: #475569; }
            .status-badge.busy { background: #fef3c7; color: #92400e; }
            
            .metrics-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 12px;
            }
            
            .metric-item {
                background: #f8fafc;
                padding: 12px;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
                transition: transform 0.2s ease;
            }
            
            .metric-item:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            
            .metric-label {
                display: block;
                font-size: 12px;
                color: #64748b;
                margin-bottom: 4px;
                font-weight: 500;
            }
            
            .metric-value {
                font-size: 18px;
                font-weight: 700;
                color: #1e293b;
            }
            
            .metric-value.success-rate {
                color: ${agent.metrics.successRate > 90 ? '#059669' : agent.metrics.successRate > 70 ? '#f59e0b' : '#ef4444'};
            }
            
            .capabilities-list {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }
            
            .capability-tag {
                background: #e0e7ff;
                color: #3730a3;
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 500;
                transition: all 0.2s ease;
            }
            
            .capability-tag:hover {
                background: #c7d2fe;
                transform: scale(1.05);
            }
            
            .position-info {
                display: flex;
                flex-direction: column;
                gap: 4px;
                font-family: monospace;
                color: #64748b;
            }
            
            .position-type {
                font-size: 12px;
                color: #059669;
                font-weight: 600;
            }
            
            .agent-description {
                color: #64748b;
                line-height: 1.6;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    getStatusDescription(status) {
        const descriptions = {
            'ready': 'Agent is online and ready to process requests',
            'processing': 'Agent is actively processing a request',
            'error': 'Agent encountered an error and needs attention',
            'idle': 'Agent is online but not currently active',
            'busy': 'Agent is handling multiple concurrent requests'
        };
        return descriptions[status] || 'Status unknown';
    }
    
    highlightConnections(agent) {
        // Highlight connections related to this agent
        this.linkGroup.selectAll('.agent-connection')
            .style('opacity', d => 
                (d.source === agent.id || d.target === agent.id) ? 1 : 0.2
            )
            .style('stroke-width', d => 
                (d.source === agent.id || d.target === agent.id) ? 4 : 2
            );
    }
    
    resetHighlight() {
        this.linkGroup.selectAll('.agent-connection')
            .style('opacity', 0.7)
            .style('stroke-width', d => Math.max(2, d.strength * 4));
    }
    
    startConnectionAnimations() {
        // Add subtle pulsing animation to core node
        this.nodeGroup.selectAll('.agent-node')
            .filter(d => d.type === 'core')
            .select('circle')
            .transition()
            .duration(2000)
            .ease(d3.easeLinear)
            .style('opacity', 0.8)
            .transition()
            .duration(2000)
            .ease(d3.easeLinear)
            .style('opacity', 1)
            .on('end', () => this.startConnectionAnimations());
    }
    
    // 🎛️ CONTROL METHODS
    refreshNetwork() {
        console.log('🔄 Manual network refresh triggered');
        this.fetchAgentData();
    }
    
    toggleAnimations() {
        this.isAnimating = !this.isAnimating;
        const button = this.container?.querySelector('.control-btn.secondary');
        
        if (this.isAnimating) {
            if (button) button.innerHTML = '⏸️ Pause';
            console.log('▶️ Real-time updates resumed');
        } else {
            if (button) button.innerHTML = '▶️ Resume';
            console.log('⏸️ Real-time updates paused');
        }
    }
    
    changeView(viewType) {
        console.log(`🔄 Switching to ${viewType} view`);
        
        switch(viewType) {
            case 'topology':
                // Standard network topology view
                this.resetToBasePositions();
                break;
            case 'dataflow':
                // Arrange agents by data flow patterns
                this.arrangeByDataFlow();
                break;
            case 'performance':
                // Arrange agents by performance metrics
                this.arrangeByPerformance();
                break;
        }
        
        this.updateAgentNodes();
    }
    
    resetToBasePositions() {
        this.coreAgents.forEach(agent => {
            agent.x = agent.baseX;
            agent.y = agent.baseY;
        });
    }
    
    arrangeByDataFlow() {
        // Arrange agents in a flow pattern showing data movement
        const flowPositions = [
            { x: 200, y: 300 },  // SAP Intelligence (input)
            { x: 400, y: 200 },  // Test Generation  
            { x: 400, y: 400 },  // Dependency Analysis
            { x: 700, y: 200 },  // Script Generation
            { x: 1000, y: 300 }  // Test Execution (output)
        ];
        
        this.coreAgents.forEach((agent, index) => {
            if (flowPositions[index]) {
                agent.x = flowPositions[index].x;
                agent.y = flowPositions[index].y;
            }
        });
    }
    
    arrangeByPerformance() {
        // Arrange agents vertically by performance metrics
        const sortedAgents = [...this.coreAgents].sort((a, b) => b.metrics.successRate - a.metrics.successRate);
        
        sortedAgents.forEach((agent, index) => {
            agent.x = 600; // Center horizontally
            agent.y = 100 + (index * 100); // Vertical spacing
        });
    }
    
    // 🧹 CLEANUP
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        console.log('🧹 AgentNetworkVisualization destroyed');
    }

    getAgentPosition(agentId) {
        const agent = this.coreAgents.find(a => a.id === agentId);
        return agent ? { x: agent.x, y: agent.y } : { x: 0, y: 0 };
    }
}

// Global initialization
window.agentNetworkVisualization = new AgentNetworkVisualization(); 
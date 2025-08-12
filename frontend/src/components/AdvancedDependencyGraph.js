/**
 * AdvancedDependencyGraph Component - Priority 4: Advanced Dependency Intelligence
 * Enhanced dependency analysis with interactive graphs and risk intelligence
 */

class AdvancedDependencyGraph {
    constructor() {
        this.graph = null;
        this.nodes = [];
        this.links = [];
        this.riskData = {};
        this.currentView = 'standard';
        this.selectedNode = null;
        this.scenarios = [];
        this.heatmapData = {};
        
        this.viewModes = {
            'standard': 'Standard Dependencies',
            'risk_heatmap': 'Risk Heat Map', 
            'impact_radius': 'Impact Radius',
            'what_if': 'What-If Analysis',
            'optimization': 'Optimization View'
        };

        this.setupD3Configuration();
    }

    /**
     * Initialize the advanced dependency graph
     */
    init(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Advanced dependency graph container not found');
            return;
        }

        container.innerHTML = this.render();
        this.setupGraph();
        this.loadDependencyData();
    }

    /**
     * Render the advanced dependency graph UI
     */
    render() {
        return `
            <div class="advanced-dependency-graph" id="advancedDepGraph">
                <!-- Control Panel -->
                <div class="control-panel">
                    <div class="view-controls">
                        <label>View Mode:</label>
                        <select id="viewModeSelect">
                            ${Object.entries(this.viewModes).map(([key, label]) => `
                                <option value="${key}" ${key === this.currentView ? 'selected' : ''}>${label}</option>
                            `).join('')}
                        </select>
                    </div>

                    <div class="analysis-controls">
                        <button id="analyzeAdvanced" class="btn btn-primary">🧠 Analyze Advanced</button>
                        <button id="calculateRisk" class="btn btn-warning">⚠️ Risk Analysis</button>
                        <button id="whatIfScenario" class="btn btn-info">🔮 What-If</button>
                        <button id="optimizeDeps" class="btn btn-success">⚡ Optimize</button>
                    </div>

                    <div class="filter-controls">
                        <label>Risk Level:</label>
                        <select id="riskFilter">
                            <option value="all">All Levels</option>
                            <option value="critical">Critical Only</option>
                            <option value="high">High & Above</option>
                            <option value="medium">Medium & Above</option>
                        </select>

                        <label>Dependency Type:</label>
                        <select id="typeFilter">
                            <option value="all">All Types</option>
                            <option value="functional">Functional</option>
                            <option value="technical">Technical</option>
                            <option value="data">Data Flow</option>
                            <option value="business">Business Process</option>
                        </select>
                    </div>

                    <div class="search-controls">
                        <input type="text" id="nodeSearch" placeholder="Search nodes..." />
                        <button id="searchBtn">🔍</button>
                        <button id="clearSearch">❌</button>
                    </div>
                </div>

                <!-- Graph Container -->
                <div class="graph-container">
                    <div class="graph-area">
                        <svg id="dependencyGraphSvg"></svg>
                        
                        <!-- Interactive Overlays -->
                        <div class="graph-overlays">
                            <!-- Risk Heatmap Legend -->
                            <div id="riskLegend" class="risk-legend" style="display: none;">
                                <h4>Risk Level</h4>
                                <div class="legend-items">
                                    <div class="legend-item">
                                        <span class="color-box critical"></span>
                                        <span>Critical (9-10)</span>
                                    </div>
                                    <div class="legend-item">
                                        <span class="color-box high"></span>
                                        <span>High (7-8)</span>
                                    </div>
                                    <div class="legend-item">
                                        <span class="color-box medium"></span>
                                        <span>Medium (4-6)</span>
                                    </div>
                                    <div class="legend-item">
                                        <span class="color-box low"></span>
                                        <span>Low (1-3)</span>
                                    </div>
                                </div>
                            </div>

                            <!-- What-If Scenario Panel -->
                            <div id="whatIfPanel" class="what-if-panel" style="display: none;">
                                <h4>🔮 What-If Scenario Analysis</h4>
                                <div class="scenario-config">
                                    <label>Change Type:</label>
                                    <select id="changeType">
                                        <option value="modification">Modification</option>
                                        <option value="enhancement">Enhancement</option>
                                        <option value="deprecation">Deprecation</option>
                                        <option value="integration">New Integration</option>
                                    </select>

                                    <label>Target Node:</label>
                                    <input type="text" id="targetNode" placeholder="e.g., ME21N" />

                                    <label>Impact Scope:</label>
                                    <select id="impactScope">
                                        <option value="immediate">Immediate Only</option>
                                        <option value="downstream">Downstream (1 level)</option>
                                        <option value="full_chain">Full Chain</option>
                                        <option value="business_process">Business Process</option>
                                    </select>

                                    <button id="runScenario" class="btn btn-primary">Run Analysis</button>
                                    <button id="clearScenario" class="btn btn-secondary">Clear</button>
                                </div>

                                <div id="scenarioResults" class="scenario-results"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Side Panel -->
                    <div class="side-panel" id="sidePanel">
                        <div class="panel-content">
                            <h3>Node Details</h3>
                            <div id="nodeDetails">
                                <p>Click on a node to see detailed information</p>
                            </div>

                            <h3>Risk Analysis</h3>
                            <div id="riskAnalysis">
                                <p>Risk information will appear here</p>
                            </div>

                            <h3>Impact Radius</h3>
                            <div id="impactRadius">
                                <p>Impact analysis will appear here</p>
                            </div>

                            <h3>Recommendations</h3>
                            <div id="recommendations">
                                <p>AI recommendations will appear here</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Analysis Results -->
                <div class="analysis-results" id="analysisResults" style="display: none;">
                    <div class="results-content">
                        <h3>Analysis Results</h3>
                        <div id="resultsData"></div>
                    </div>
                </div>
            </div>

            <style>
                .advanced-dependency-graph {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    overflow: hidden;
                    height: 800px;
                    display: flex;
                    flex-direction: column;
                }

                .control-panel {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 15px 20px;
                    display: flex;
                    align-items: center;
                    gap: 30px;
                    flex-wrap: wrap;
                }

                .control-panel label {
                    font-weight: 500;
                    margin-right: 8px;
                }

                .control-panel select,
                .control-panel input {
                    padding: 6px 10px;
                    border: none;
                    border-radius: 4px;
                    font-size: 14px;
                }

                .control-panel .btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 500;
                    font-size: 14px;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .btn.btn-primary {
                    background: #007bff;
                    color: white;
                }

                .btn.btn-warning {
                    background: #ffc107;
                    color: #212529;
                }

                .btn.btn-info {
                    background: #17a2b8;
                    color: white;
                }

                .btn.btn-success {
                    background: #28a745;
                    color: white;
                }

                .btn.btn-secondary {
                    background: #6c757d;
                    color: white;
                }

                .btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                }

                .graph-container {
                    flex: 1;
                    display: flex;
                    position: relative;
                }

                .graph-area {
                    flex: 1;
                    position: relative;
                    background: #f8f9fa;
                }

                #dependencyGraphSvg {
                    width: 100%;
                    height: 100%;
                }

                .graph-overlays {
                    position: absolute;
                    top: 0;
                    left: 0;
                    pointer-events: none;
                }

                .risk-legend {
                    background: rgba(255,255,255,0.95);
                    border-radius: 8px;
                    padding: 15px;
                    margin: 20px;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                    pointer-events: auto;
                }

                .risk-legend h4 {
                    margin: 0 0 10px 0;
                    font-size: 16px;
                    font-weight: 600;
                }

                .legend-items {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                }

                .color-box {
                    width: 20px;
                    height: 20px;
                    border-radius: 4px;
                    border: 1px solid #ddd;
                }

                .color-box.critical {
                    background: #dc3545;
                }

                .color-box.high {
                    background: #fd7e14;
                }

                .color-box.medium {
                    background: #ffc107;
                }

                .color-box.low {
                    background: #28a745;
                }

                .what-if-panel {
                    background: rgba(255,255,255,0.95);
                    border-radius: 8px;
                    padding: 20px;
                    margin: 20px;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                    pointer-events: auto;
                    max-width: 350px;
                }

                .what-if-panel h4 {
                    margin: 0 0 15px 0;
                    font-size: 16px;
                    font-weight: 600;
                    color: #17a2b8;
                }

                .scenario-config {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .scenario-config label {
                    font-weight: 500;
                    margin-bottom: 4px;
                }

                .scenario-config select,
                .scenario-config input {
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 14px;
                }

                .scenario-results {
                    margin-top: 15px;
                    padding: 15px;
                    background: #f8f9fa;
                    border-radius: 6px;
                    border-left: 4px solid #17a2b8;
                }

                .side-panel {
                    width: 350px;
                    background: white;
                    border-left: 1px solid #e9ecef;
                    overflow-y: auto;
                }

                .panel-content {
                    padding: 20px;
                }

                .panel-content h3 {
                    color: #495057;
                    font-size: 18px;
                    margin: 0 0 15px 0;
                    padding-bottom: 8px;
                    border-bottom: 2px solid #e9ecef;
                }

                .panel-content > div {
                    margin-bottom: 25px;
                    padding: 15px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    border-left: 4px solid #007bff;
                }

                .analysis-results {
                    background: white;
                    border-top: 1px solid #e9ecef;
                    max-height: 200px;
                    overflow-y: auto;
                }

                .results-content {
                    padding: 20px;
                }

                /* D3 Node Styles */
                .node {
                    cursor: pointer;
                    stroke-width: 2px;
                    transition: all 0.3s ease;
                }

                .node:hover {
                    stroke-width: 4px;
                    filter: brightness(1.1);
                }

                .node.selected {
                    stroke: #007bff;
                    stroke-width: 4px;
                }

                .node.risk-critical {
                    fill: #dc3545;
                }

                .node.risk-high {
                    fill: #fd7e14;
                }

                .node.risk-medium {
                    fill: #ffc107;
                }

                .node.risk-low {
                    fill: #28a745;
                }

                .link {
                    stroke: #6c757d;
                    stroke-width: 2px;
                    fill: none;
                    opacity: 0.7;
                }

                .link.highlighted {
                    stroke: #007bff;
                    stroke-width: 3px;
                    opacity: 1;
                }

                .link.risk-path {
                    stroke: #dc3545;
                    stroke-width: 3px;
                    stroke-dasharray: 5,5;
                    animation: dash 1s linear infinite;
                }

                @keyframes dash {
                    to {
                        stroke-dashoffset: -10;
                    }
                }

                .node-label {
                    font-size: 12px;
                    font-weight: 500;
                    text-anchor: middle;
                    pointer-events: none;
                    fill: #495057;
                }

                .impact-radius {
                    fill: none;
                    stroke: #17a2b8;
                    stroke-width: 2px;
                    stroke-dasharray: 3,3;
                    opacity: 0.6;
                }

                .tooltip {
                    position: absolute;
                    background: rgba(0,0,0,0.9);
                    color: white;
                    padding: 8px 12px;
                    border-radius: 4px;
                    font-size: 12px;
                    pointer-events: none;
                    z-index: 1000;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .tooltip.visible {
                    opacity: 1;
                }
            </style>
        `;
    }

    /**
     * Setup D3 configuration
     */
    setupD3Configuration() {
        this.simulation = null;
        this.svg = null;
        this.g = null;
        this.tooltip = null;
        
        this.nodeRadius = 25;
        this.linkDistance = 150;
        this.chargeStrength = -300;
        
        this.colorScale = d3.scaleOrdinal()
            .domain(['transaction', 'process', 'data', 'integration', 'custom'])
            .range(['#007bff', '#28a745', '#ffc107', '#17a2b8', '#6f42c1']);
    }

    /**
     * Setup the D3 graph
     */
    setupGraph() {
        const container = document.querySelector('.graph-area');
        const width = container.clientWidth;
        const height = container.clientHeight;

        // Create SVG
        this.svg = d3.select('#dependencyGraphSvg')
            .attr('width', width)
            .attr('height', height);

        // Create main group for zooming
        this.g = this.svg.append('g');

        // Setup zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                this.g.attr('transform', event.transform);
            });

        this.svg.call(zoom);

        // Create simulation
        this.simulation = d3.forceSimulation()
            .force('link', d3.forceLink().id(d => d.id).distance(this.linkDistance))
            .force('charge', d3.forceManyBody().strength(this.chargeStrength))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(this.nodeRadius + 5));

        // Create tooltip
        this.tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip');

        this.setupEventListeners();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // View mode change
        document.getElementById('viewModeSelect').addEventListener('change', (e) => {
            this.changeViewMode(e.target.value);
        });

        // Analysis buttons
        document.getElementById('analyzeAdvanced').addEventListener('click', () => {
            this.analyzeAdvancedDependencies();
        });

        document.getElementById('calculateRisk').addEventListener('click', () => {
            this.calculateRiskHeatmap();
        });

        document.getElementById('whatIfScenario').addEventListener('click', () => {
            this.toggleWhatIfPanel();
        });

        document.getElementById('optimizeDeps').addEventListener('click', () => {
            this.optimizeDependencyStructure();
        });

        // Filter controls
        document.getElementById('riskFilter').addEventListener('change', (e) => {
            this.applyRiskFilter(e.target.value);
        });

        document.getElementById('typeFilter').addEventListener('change', (e) => {
            this.applyTypeFilter(e.target.value);
        });

        // Search functionality
        document.getElementById('nodeSearch').addEventListener('input', (e) => {
            this.searchNodes(e.target.value);
        });

        document.getElementById('searchBtn').addEventListener('click', () => {
            const query = document.getElementById('nodeSearch').value;
            this.searchNodes(query);
        });

        document.getElementById('clearSearch').addEventListener('click', () => {
            document.getElementById('nodeSearch').value = '';
            this.clearSearch();
        });

        // What-if scenario controls
        document.addEventListener('click', (e) => {
            if (e.target.id === 'runScenario') {
                this.runWhatIfScenario();
            } else if (e.target.id === 'clearScenario') {
                this.clearScenario();
            }
        });
    }

    /**
     * Load dependency data from API
     */
    async loadDependencyData() {
        try {
            const response = await window.apiClient.analyzeAdvancedDependencies(
                'ME21N', // target node
                3, // analysis depth
                true // include custom code
            );

            if (response.success) {
                this.processAdvancedData(response.dependency_analysis);
            } else {
                this.loadMockData();
            }
        } catch (error) {
            console.error('Failed to load dependency data:', error);
            this.loadMockData();
        }
    }

    /**
     * Load mock data for demonstration
     */
    loadMockData() {
        this.nodes = [
            { id: 'ME21N', type: 'transaction', name: 'Purchase Order Creation', risk: 8.5, business_criticality: 9.2 },
            { id: 'MIGO', type: 'transaction', name: 'Goods Receipt', risk: 7.2, business_criticality: 8.5 },
            { id: 'FB60', type: 'transaction', name: 'Invoice Receipt', risk: 6.8, business_criticality: 7.8 },
            { id: 'VA01', type: 'transaction', name: 'Sales Order', risk: 5.4, business_criticality: 8.9 },
            { id: 'MM_PURCHASE', type: 'process', name: 'Purchase Process', risk: 7.8, business_criticality: 9.0 },
            { id: 'VENDOR_MASTER', type: 'data', name: 'Vendor Master Data', risk: 8.9, business_criticality: 9.5 },
            { id: 'MATERIAL_MASTER', type: 'data', name: 'Material Master', risk: 7.1, business_criticality: 8.8 },
            { id: 'RFC_CONNECTOR', type: 'integration', name: 'RFC Interface', risk: 6.3, business_criticality: 7.2 },
            { id: 'Z_CUSTOM_PO', type: 'custom', name: 'Custom PO Enhancement', risk: 9.1, business_criticality: 6.8 }
        ];

        this.links = [
            { source: 'ME21N', target: 'VENDOR_MASTER', type: 'reads', strength: 0.9 },
            { source: 'ME21N', target: 'MATERIAL_MASTER', type: 'reads', strength: 0.8 },
            { source: 'ME21N', target: 'MM_PURCHASE', type: 'part_of', strength: 1.0 },
            { source: 'ME21N', target: 'Z_CUSTOM_PO', type: 'enhanced_by', strength: 0.7 },
            { source: 'MM_PURCHASE', target: 'MIGO', type: 'triggers', strength: 0.9 },
            { source: 'MM_PURCHASE', target: 'FB60', type: 'triggers', strength: 0.8 },
            { source: 'MIGO', target: 'MATERIAL_MASTER', type: 'updates', strength: 0.9 },
            { source: 'FB60', target: 'VENDOR_MASTER', type: 'references', strength: 0.8 },
            { source: 'VA01', target: 'MATERIAL_MASTER', type: 'reads', strength: 0.7 },
            { source: 'RFC_CONNECTOR', target: 'ME21N', type: 'integrates', strength: 0.6 }
        ];

        this.updateGraph();
    }

    /**
     * Process advanced dependency data from API
     */
    processAdvancedData(data) {
        if (data.nodes) {
            this.nodes = data.nodes.map(node => ({
                ...node,
                risk: node.risk_score || Math.random() * 10,
                business_criticality: node.business_criticality || Math.random() * 10
            }));
        }

        if (data.relationships) {
            this.links = data.relationships.map(link => ({
                source: link.from_node,
                target: link.to_node,
                type: link.relationship_type,
                strength: link.strength || 0.5
            }));
        }

        if (data.risk_assessment) {
            this.riskData = data.risk_assessment;
        }

        this.updateGraph();
    }

    /**
     * Update the graph visualization
     */
    updateGraph() {
        // Clear existing elements
        this.g.selectAll('*').remove();

        // Create links
        const link = this.g.append('g')
            .attr('class', 'links')
            .selectAll('line')
            .data(this.links)
            .enter().append('line')
            .attr('class', 'link')
            .attr('stroke-width', d => Math.sqrt(d.strength * 5));

        // Create nodes
        const node = this.g.append('g')
            .attr('class', 'nodes')
            .selectAll('circle')
            .data(this.nodes)
            .enter().append('circle')
            .attr('class', d => `node ${this.getRiskClass(d.risk)}`)
            .attr('r', d => this.nodeRadius + (d.business_criticality * 2))
            .attr('fill', d => this.getNodeColor(d))
            .call(d3.drag()
                .on('start', (event, d) => this.dragStarted(event, d))
                .on('drag', (event, d) => this.dragged(event, d))
                .on('end', (event, d) => this.dragEnded(event, d)))
            .on('click', (event, d) => this.nodeClicked(event, d))
            .on('mouseover', (event, d) => this.showTooltip(event, d))
            .on('mouseout', () => this.hideTooltip());

        // Create labels
        const labels = this.g.append('g')
            .attr('class', 'labels')
            .selectAll('text')
            .data(this.nodes)
            .enter().append('text')
            .attr('class', 'node-label')
            .text(d => d.id);

        // Update simulation
        this.simulation
            .nodes(this.nodes)
            .on('tick', () => {
                link
                    .attr('x1', d => d.source.x)
                    .attr('y1', d => d.source.y)
                    .attr('x2', d => d.target.x)
                    .attr('y2', d => d.target.y);

                node
                    .attr('cx', d => d.x)
                    .attr('cy', d => d.y);

                labels
                    .attr('x', d => d.x)
                    .attr('y', d => d.y + 5);
            });

        this.simulation.force('link')
            .links(this.links);

        this.simulation.alpha(1).restart();
    }

    /**
     * Get risk class for styling
     */
    getRiskClass(risk) {
        if (risk >= 9) return 'risk-critical';
        if (risk >= 7) return 'risk-high';
        if (risk >= 4) return 'risk-medium';
        return 'risk-low';
    }

    /**
     * Get node color based on type and view mode
     */
    getNodeColor(d) {
        if (this.currentView === 'risk_heatmap') {
            if (d.risk >= 9) return '#dc3545';
            if (d.risk >= 7) return '#fd7e14';
            if (d.risk >= 4) return '#ffc107';
            return '#28a745';
        }
        return this.colorScale(d.type);
    }

    /**
     * Change view mode
     */
    changeViewMode(mode) {
        this.currentView = mode;
        
        // Show/hide appropriate UI elements
        document.getElementById('riskLegend').style.display = 
            mode === 'risk_heatmap' ? 'block' : 'none';
        
        document.getElementById('whatIfPanel').style.display = 
            mode === 'what_if' ? 'block' : 'none';

        // Update graph based on view mode
        this.updateGraphForViewMode(mode);
    }

    /**
     * Update graph visualization for specific view mode
     */
    updateGraphForViewMode(mode) {
        const nodes = this.g.selectAll('.node');
        const links = this.g.selectAll('.link');

        switch (mode) {
            case 'risk_heatmap':
                nodes.attr('fill', d => this.getNodeColor(d));
                break;
            
            case 'impact_radius':
                this.showImpactRadius();
                break;
            
            case 'optimization':
                this.showOptimizationSuggestions();
                break;
            
            default:
                nodes.attr('fill', d => this.colorScale(d.type));
                break;
        }
    }

    /**
     * Analyze advanced dependencies
     */
    async analyzeAdvancedDependencies() {
        try {
            const response = await window.apiClient.analyzeAdvancedDependencies(
                this.selectedNode?.id || 'ME21N',
                3,
                true
            );

            if (response.success) {
                this.displayAnalysisResults(response.dependency_analysis);
            }
        } catch (error) {
            console.error('Advanced analysis failed:', error);
        }
    }

    /**
     * Calculate risk heatmap
     */
    async calculateRiskHeatmap() {
        this.currentView = 'risk_heatmap';
        document.getElementById('viewModeSelect').value = 'risk_heatmap';
        
        try {
            const response = await window.apiClient.calculateRiskHeatmap(
                { nodes: this.nodes, links: this.links },
                { type: 'comprehensive' },
                { focus: 'business_impact' }
            );

            if (response.success) {
                this.processRiskHeatmap(response.risk_analysis);
            }
        } catch (error) {
            console.error('Risk calculation failed:', error);
        }

        this.changeViewMode('risk_heatmap');
    }

    /**
     * Toggle what-if analysis panel
     */
    toggleWhatIfPanel() {
        this.currentView = 'what_if';
        document.getElementById('viewModeSelect').value = 'what_if';
        this.changeViewMode('what_if');
    }

    /**
     * Run what-if scenario analysis
     */
    async runWhatIfScenario() {
        const changeType = document.getElementById('changeType').value;
        const targetNode = document.getElementById('targetNode').value;
        const impactScope = document.getElementById('impactScope').value;

        if (!targetNode) {
            alert('Please specify a target node');
            return;
        }

        try {
            const response = await window.apiClient.analyzeWhatIfScenario(
                {
                    type: changeType,
                    target: targetNode,
                    scope: impactScope
                },
                { nodes: this.nodes, links: this.links },
                { depth: 3, include_business_impact: true }
            );

            if (response.success) {
                this.displayScenarioResults(response.scenario_analysis);
            }
        } catch (error) {
            console.error('What-if analysis failed:', error);
        }
    }

    /**
     * Display scenario analysis results
     */
    displayScenarioResults(results) {
        const resultsContainer = document.getElementById('scenarioResults');
        
        resultsContainer.innerHTML = `
            <h5>Impact Analysis Results</h5>
            <div class="scenario-metrics">
                <div class="metric">
                    <strong>Affected Nodes:</strong> ${results.affected_nodes?.length || 0}
                </div>
                <div class="metric">
                    <strong>Risk Score Change:</strong> ${results.risk_delta || 'N/A'}
                </div>
                <div class="metric">
                    <strong>Business Impact:</strong> ${results.business_impact || 'Medium'}
                </div>
                <div class="metric">
                    <strong>Recommended Actions:</strong> ${results.recommendations?.length || 0}
                </div>
            </div>
            
            ${results.recommendations ? `
                <div class="recommendations">
                    <h6>Recommendations:</h6>
                    <ul>
                        ${results.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        `;

        // Highlight affected nodes
        if (results.affected_nodes) {
            this.highlightNodes(results.affected_nodes);
        }
    }

    /**
     * Node interaction handlers
     */
    nodeClicked(event, d) {
        // Update selected node
        this.selectedNode = d;
        
        // Update visual selection
        this.g.selectAll('.node').classed('selected', false);
        d3.select(event.target).classed('selected', true);
        
        // Update side panel
        this.updateNodeDetails(d);
        this.updateRiskAnalysis(d);
        this.updateImpactRadius(d);
        this.updateRecommendations(d);
    }

    /**
     * Update node details panel
     */
    updateNodeDetails(node) {
        const details = document.getElementById('nodeDetails');
        details.innerHTML = `
            <div class="node-info">
                <h4>${node.name || node.id}</h4>
                <p><strong>Type:</strong> ${node.type}</p>
                <p><strong>Risk Score:</strong> ${node.risk.toFixed(1)}/10</p>
                <p><strong>Business Criticality:</strong> ${node.business_criticality.toFixed(1)}/10</p>
                <p><strong>Dependencies:</strong> ${this.getNodeDependencies(node.id).length}</p>
            </div>
        `;
    }

    /**
     * Show tooltip on hover
     */
    showTooltip(event, d) {
        this.tooltip
            .style('opacity', 1)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px')
            .html(`
                <strong>${d.name || d.id}</strong><br/>
                Type: ${d.type}<br/>
                Risk: ${d.risk.toFixed(1)}/10<br/>
                Criticality: ${d.business_criticality.toFixed(1)}/10
            `);
    }

    /**
     * Hide tooltip
     */
    hideTooltip() {
        this.tooltip.style('opacity', 0);
    }

    /**
     * Drag event handlers
     */
    dragStarted(event, d) {
        if (!event.active) this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    dragEnded(event, d) {
        if (!event.active) this.simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    /**
     * Additional helper methods
     */
    getNodeDependencies(nodeId) {
        return this.links.filter(link => 
            link.source.id === nodeId || link.target.id === nodeId
        );
    }

    highlightNodes(nodeIds) {
        this.g.selectAll('.node')
            .classed('highlighted', d => nodeIds.includes(d.id));
    }

    // Placeholder methods for additional functionality
    optimizeDependencyStructure() {
        console.log('Optimization analysis initiated...');
    }

    showImpactRadius() {
        console.log('Showing impact radius...');
    }

    showOptimizationSuggestions() {
        console.log('Showing optimization suggestions...');
    }

    processRiskHeatmap(data) {
        console.log('Processing risk heatmap data:', data);
    }

    displayAnalysisResults(data) {
        console.log('Displaying analysis results:', data);
    }

    updateRiskAnalysis(node) {
        console.log('Updating risk analysis for:', node);
    }

    updateImpactRadius(node) {
        console.log('Updating impact radius for:', node);
    }

    updateRecommendations(node) {
        console.log('Updating recommendations for:', node);
    }

    applyRiskFilter(level) {
        console.log('Applying risk filter:', level);
    }

    applyTypeFilter(type) {
        console.log('Applying type filter:', type);
    }

    searchNodes(query) {
        console.log('Searching nodes:', query);
    }

    clearSearch() {
        console.log('Clearing search');
    }

    clearScenario() {
        document.getElementById('targetNode').value = '';
        document.getElementById('scenarioResults').innerHTML = '';
    }
}

// Global instance
window.advancedDependencyGraph = new AdvancedDependencyGraph();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('advancedDependencyGraph');
    if (container) {
        window.advancedDependencyGraph.init('advancedDependencyGraph');
    }
}); 
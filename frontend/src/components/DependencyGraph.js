/**
 * Dependency Graph Component
 * Visualizes SAP transaction dependencies using D3.js
 */

class DependencyGraph {
    constructor() {
        this.svg = null;
        this.width = 800;
        this.height = 600;
        this.nodes = [];
        this.links = [];
        this.simulation = null;
        this.currentTransaction = null;
        
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.container = document.getElementById('dependencyGraph');
        this.transactionSelect = document.getElementById('transactionSelect');
        this.depthSlider = document.getElementById('depthSlider');
        this.depthValue = document.getElementById('depthValue');
        this.dependencyDetails = document.getElementById('dependencyDetails');
        this.detailsContent = document.getElementById('detailsContent');
    }

    attachEventListeners() {
        // Depth slider change
        this.depthSlider.addEventListener('input', (e) => {
            this.depthValue.textContent = e.target.value;
            if (this.currentTransaction) {
                this.loadDependencies();
            }
        });
    }

    async loadDependencies() {
        const transaction = this.transactionSelect.value;
        if (!transaction) {
            this.clearGraph();
            return;
        }

        this.currentTransaction = transaction;
        this.showLoading();

        try {
            const depth = parseInt(this.depthSlider.value);
            const result = await api.analyzeDependencies([transaction], {
                depth: depth,
                includeIndirect: true
            });

            if (result.success && result.data.visualization_data) {
                this.updateGraph(result.data.visualization_data);
                this.showDependencyDetails(result.data.dependency_analysis);
            } else {
                this.showError('Failed to load dependencies: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Dependency loading error:', error);
            this.showError('Error loading dependencies: ' + error.message);
        }
    }

    updateGraph(visualizationData) {
        console.log('DependencyGraph: updateGraph called with:', visualizationData);
        
        // Ensure we have valid arrays
        const nodes = Array.isArray(visualizationData?.nodes) ? visualizationData.nodes : [];
        const edges = Array.isArray(visualizationData?.edges) ? visualizationData.edges : [];
        
        this.nodes = nodes;
        this.links = this.processLinks(edges);
        
        console.log('DependencyGraph: Processed nodes:', this.nodes.length, 'links:', this.links.length);
        
        // Only proceed if we have data
        if (this.nodes.length === 0 && this.links.length === 0) {
            console.warn('DependencyGraph: No nodes or links to display');
            this.showError('No dependency data to visualize');
            return;
        }
        
        this.clearGraph();
        this.createSVG();
        this.setupSimulation();
        this.renderGraph();
    }

    processLinks(edges) {
        if (!Array.isArray(edges)) {
            console.warn('DependencyGraph: processLinks called with non-array:', edges);
            return [];
        }
        
        return edges.map(edge => ({
            source: edge.source,
            target: edge.target,
            type: edge.type,
            impact: edge.impact,
            dependency_type: edge.dependency_type
        }));
    }

    createSVG() {
        this.container.innerHTML = '';
        
        const containerRect = this.container.getBoundingClientRect();
        this.width = containerRect.width - 20;
        this.height = containerRect.height - 20;

        this.svg = d3.select(this.container)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .style('border', '1px solid #dee2e6')
            .style('border-radius', '8px')
            .style('background', '#ffffff');

        // Add zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                this.svg.select('g').attr('transform', event.transform);
            });

        this.svg.call(zoom);

        // Create main group for zoomable content
        this.mainGroup = this.svg.append('g');

        // Add arrow markers for directed edges
        this.svg.append('defs').selectAll('marker')
            .data(['dependency', 'high-impact', 'medium-impact', 'low-impact'])
            .enter().append('marker')
            .attr('id', d => d)
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 20)
            .attr('refY', 0)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', d => this.getMarkerColor(d));
    }

    getMarkerColor(type) {
        const colors = {
            'dependency': '#6c757d',
            'high-impact': '#dc3545',
            'medium-impact': '#ffc107', 
            'low-impact': '#28a745'
        };
        return colors[type] || '#6c757d';
    }

    setupSimulation() {
        // Ensure we have valid arrays before creating the simulation
        if (!Array.isArray(this.nodes)) {
            console.error('DependencyGraph: this.nodes is not an array:', this.nodes);
            this.nodes = [];
        }
        if (!Array.isArray(this.links)) {
            console.error('DependencyGraph: this.links is not an array:', this.links);
            this.links = [];
        }
        
        console.log('DependencyGraph: Creating simulation with', this.nodes.length, 'nodes and', this.links.length, 'links');
        
        this.simulation = d3.forceSimulation(this.nodes)
            .force('link', d3.forceLink(this.links).id(d => d.id).distance(100))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(this.width / 2, this.height / 2))
            .force('collision', d3.forceCollide().radius(30));
    }

    renderGraph() {
        // Render links
        this.linkElements = this.mainGroup.selectAll('.link')
            .data(this.links)
            .enter().append('line')
            .attr('class', 'link')
            .attr('stroke', d => this.getLinkColor(d))
            .attr('stroke-width', d => this.getLinkWidth(d))
            .attr('stroke-dasharray', d => d.dependency_type === 'conditional' ? '5,5' : 'none')
            .attr('marker-end', d => `url(#${this.getMarkerType(d)})`);

        // Render nodes
        this.nodeElements = this.mainGroup.selectAll('.node')
            .data(this.nodes)
            .enter().append('g')
            .attr('class', 'node')
            .call(d3.drag()
                .on('start', (event, d) => this.dragStarted(event, d))
                .on('drag', (event, d) => this.dragged(event, d))
                .on('end', (event, d) => this.dragEnded(event, d)));

        // Add node circles
        this.nodeElements.append('circle')
            .attr('r', d => this.getNodeRadius(d))
            .attr('fill', d => this.getNodeColor(d))
            .attr('stroke', '#fff')
            .attr('stroke-width', 2);

        // Add node labels
        this.nodeElements.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '.35em')
            .attr('font-size', '12px')
            .attr('font-weight', 'bold')
            .attr('fill', '#333')
            .text(d => d.id);

        // Add node type indicators
        this.nodeElements.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '1.5em')
            .attr('font-size', '10px')
            .attr('fill', '#666')
            .text(d => d.type);

        // Add hover effects
        this.nodeElements
            .on('mouseover', (event, d) => this.showNodeTooltip(event, d))
            .on('mouseout', () => this.hideNodeTooltip())
            .on('click', (event, d) => this.selectNode(event, d));

        // Update simulation
        this.simulation
            .nodes(this.nodes)
            .on('tick', () => this.ticked());

        this.simulation.force('link')
            .links(this.links);
    }

    getLinkColor(link) {
        const impactColors = {
            'high': '#dc3545',
            'medium': '#ffc107',
            'low': '#28a745'
        };
        return impactColors[link.impact] || '#6c757d';
    }

    getLinkWidth(link) {
        const impactWidths = {
            'high': 3,
            'medium': 2,
            'low': 1
        };
        return impactWidths[link.impact] || 1;
    }

    getMarkerType(link) {
        return `${link.impact}-impact`;
    }

    getNodeRadius(node) {
        const radiusMap = {
            'transaction': 25,
            'master_data': 20,
            'custom_program': 18,
            'configuration': 15
        };
        return radiusMap[node.type] || 15;
    }

    getNodeColor(node) {
        const colorMap = {
            'transaction': '#0066cc',
            'master_data': '#28a745',
            'custom_program': '#dc3545',
            'configuration': '#ffc107'
        };

        // Highlight current transaction
        if (node.id === this.currentTransaction) {
            return '#ff6b6b';
        }

        return colorMap[node.type] || '#6c757d';
    }

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

    ticked() {
        this.linkElements
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);

        this.nodeElements
            .attr('transform', d => `translate(${d.x},${d.y})`);
    }

    showNodeTooltip(event, node) {
        const tooltip = d3.select('body').append('div')
            .attr('class', 'dependency-tooltip')
            .style('position', 'absolute')
            .style('background', 'rgba(0, 0, 0, 0.8)')
            .style('color', 'white')
            .style('padding', '10px')
            .style('border-radius', '5px')
            .style('font-size', '12px')
            .style('pointer-events', 'none')
            .style('z-index', '1000');

        tooltip.html(`
            <strong>${node.label || node.id}</strong><br/>
            <strong>Type:</strong> ${node.type}<br/>
            <strong>Module:</strong> ${node.module}<br/>
            <strong>Risk:</strong> ${node.risk}<br/>
            <strong>Category:</strong> ${node.category}
        `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
    }

    hideNodeTooltip() {
        d3.selectAll('.dependency-tooltip').remove();
    }

    selectNode(event, node) {
        // Highlight selected node and its connections
        this.highlightNodeConnections(node);
        
        // Show node details
        this.showNodeDetails(node);
    }

    highlightNodeConnections(selectedNode) {
        // Reset all elements
        this.nodeElements.select('circle')
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .attr('opacity', 0.3);

        this.linkElements
            .attr('opacity', 0.1);

        // Find connected nodes
        const connectedNodes = new Set([selectedNode.id]);
        const connectedLinks = [];

        this.links.forEach(link => {
            if (link.source.id === selectedNode.id || link.target.id === selectedNode.id) {
                connectedNodes.add(link.source.id);
                connectedNodes.add(link.target.id);
                connectedLinks.push(link);
            }
        });

        // Highlight connected elements
        this.nodeElements
            .filter(d => connectedNodes.has(d.id))
            .select('circle')
            .attr('opacity', 1)
            .attr('stroke', '#ff6b6b')
            .attr('stroke-width', 3);

        this.linkElements
            .filter(d => connectedLinks.includes(d))
            .attr('opacity', 1);
    }

    showNodeDetails(node) {
        // Find node connections
        const dependencies = [];
        const dependents = [];

        this.links.forEach(link => {
            if (link.source.id === node.id) {
                dependencies.push({
                    node: link.target,
                    relationship: link.type,
                    impact: link.impact
                });
            }
            if (link.target.id === node.id) {
                dependents.push({
                    node: link.source,
                    relationship: link.type,
                    impact: link.impact
                });
            }
        });

        let content = `
            <div class="node-details">
                <h5>${node.label || node.id}</h5>
                <div class="node-info">
                    <p><strong>Type:</strong> ${node.type}</p>
                    <p><strong>Module:</strong> ${node.module}</p>
                    <p><strong>Risk Level:</strong> ${node.risk}</p>
                    <p><strong>Category:</strong> ${node.category}</p>
                </div>
        `;

        if (dependencies.length > 0) {
            content += `
                <div class="dependencies">
                    <h6>Dependencies (${dependencies.length}):</h6>
                    <ul>
            `;
            dependencies.forEach(dep => {
                const relationshipInfo = sapUtils.formatDependencyRelationship(dep.relationship);
                content += `
                    <li>
                        ${relationshipInfo.icon} ${relationshipInfo.description} 
                        <strong>${dep.node.id}</strong>
                        <span class="impact-${dep.impact}">(${dep.impact} impact)</span>
                    </li>
                `;
            });
            content += `</ul></div>`;
        }

        if (dependents.length > 0) {
            content += `
                <div class="dependents">
                    <h6>Dependents (${dependents.length}):</h6>
                    <ul>
            `;
            dependents.forEach(dep => {
                const relationshipInfo = sapUtils.formatDependencyRelationship(dep.relationship);
                content += `
                    <li>
                        ${relationshipInfo.icon} <strong>${dep.node.id}</strong> ${relationshipInfo.description} this
                        <span class="impact-${dep.impact}">(${dep.impact} impact)</span>
                    </li>
                `;
            });
            content += `</ul></div>`;
        }

        content += `</div>`;

        this.detailsContent.innerHTML = content;
        this.dependencyDetails.style.display = 'block';
    }

    showDependencyDetails(dependencyAnalysis) {
        if (!dependencyAnalysis || !dependencyAnalysis.consolidated_analysis) {
            return;
        }

        const analysis = dependencyAnalysis.consolidated_analysis;
        
        // Update the details panel with analysis summary
        const summaryHtml = `
            <div class="dependency-summary">
                <h5>Analysis Summary</h5>
                <div class="summary-metrics">
                    <div class="metric">
                        <span class="metric-label">Components:</span>
                        <span class="metric-value">${analysis.total_components_involved}</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Complexity:</span>
                        <span class="metric-value">${analysis.overall_complexity}</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">High Risk:</span>
                        <span class="metric-value">${analysis.high_risk_components?.length || 0}</span>
                    </div>
                </div>
            </div>
        `;

        // Prepend summary to details content
        this.detailsContent.innerHTML = summaryHtml + this.detailsContent.innerHTML;
    }

    clearGraph() {
        if (this.container) {
            this.container.innerHTML = `
                <div class="graph-placeholder">
                    <div class="placeholder-icon">🔗</div>
                    <p>Select a transaction to view dependencies</p>
                </div>
            `;
        }

        this.dependencyDetails.style.display = 'none';
    }

    showLoading() {
        this.container.innerHTML = `
            <div class="graph-loading">
                <div class="spinner-large"></div>
                <p>Analyzing dependencies...</p>
            </div>
        `;
    }

    showError(message) {
        this.container.innerHTML = `
            <div class="graph-error">
                <div class="error-icon">⚠️</div>
                <p>${message}</p>
                <button class="btn btn-secondary" onclick="dependencyGraph.loadDependencies()">
                    Retry
                </button>
            </div>
        `;
    }

    // Public methods
    resetGraph() {
        this.clearGraph();
        this.transactionSelect.value = '';
        this.currentTransaction = null;
    }

    setTransaction(transactionCode) {
        this.transactionSelect.value = transactionCode;
        this.loadDependencies();
    }

    exportGraph() {
        if (!this.svg) return;

        // Create a canvas and convert SVG to image
        const svgData = new XMLSerializer().serializeToString(this.svg.node());
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        canvas.width = this.width;
        canvas.height = this.height;

        img.onload = () => {
            ctx.drawImage(img, 0, 0);
            const link = document.createElement('a');
            link.download = `dependency-graph-${this.currentTransaction || 'export'}.png`;
            link.href = canvas.toDataURL();
            link.click();
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
    
    updateWithDependencyData(dependencyData) {
        console.log('DependencyGraph: Updating with dependency data:', dependencyData);
        
        try {
            // Ensure the container exists and is initialized
            if (!this.container) {
                this.container = document.getElementById('dependencyGraph');
                if (!this.container) {
                    console.error('DependencyGraph: Container element not found');
                    return;
                }
            }
            
            // Extract component names from the dependency analysis
            if (dependencyData && dependencyData.dependency_analysis && dependencyData.dependency_analysis.individual_components) {
                const components = Object.keys(dependencyData.dependency_analysis.individual_components);
                console.log('DependencyGraph: Found components:', components);
                
                if (components.length > 0) {
                    // Set the first component as the current transaction
                    const firstComponent = components[0];
                    console.log('DependencyGraph: Setting transaction to:', firstComponent);
                    
                    // Update the transaction select if it exists
                    if (this.transactionSelect) {
                        // Add option if it doesn't exist
                        const existingOption = Array.from(this.transactionSelect.options).find(option => option.value === firstComponent);
                        if (!existingOption) {
                            const option = document.createElement('option');
                            option.value = firstComponent;
                            option.textContent = firstComponent;
                            this.transactionSelect.appendChild(option);
                        }
                        this.transactionSelect.value = firstComponent;
                    }
                    
                    // Create visualization data from the dependency analysis
                    this.createVisualizationFromData(dependencyData.dependency_analysis);
                }
            }
        } catch (error) {
            console.error('DependencyGraph: Error updating with dependency data:', error);
        }
    }
    
    createVisualizationFromData(dependencyAnalysis) {
        console.log('DependencyGraph: Creating visualization from data:', dependencyAnalysis);
        
        try {
            if (!this.svg) {
                this.createSVG();
            }
            
            const nodes = [];
            const links = [];
            
            // Process individual components
            if (dependencyAnalysis.individual_components) {
                Object.entries(dependencyAnalysis.individual_components).forEach(([componentName, analysis]) => {
                    // Add main component node
                    nodes.push({
                        id: componentName,
                        name: componentName,
                        type: 'main',
                        riskLevel: analysis.risk_level || 'Low',
                        businessImpact: analysis.business_impact || 'Low'
                    });
                    
                    // Add dependency nodes and links
                    if (analysis.direct_dependencies) {
                        analysis.direct_dependencies.forEach(dep => {
                            if (!nodes.find(n => n.id === dep)) {
                                nodes.push({
                                    id: dep,
                                    name: dep,
                                    type: 'dependency',
                                    riskLevel: 'Unknown',
                                    businessImpact: 'Unknown'
                                });
                            }
                            links.push({
                                source: componentName,
                                target: dep,
                                type: 'depends_on'
                            });
                        });
                    }
                    
                    // Add dependent component nodes and links
                    if (analysis.dependent_components) {
                        analysis.dependent_components.forEach(dep => {
                            if (!nodes.find(n => n.id === dep)) {
                                nodes.push({
                                    id: dep,
                                    name: dep,
                                    type: 'dependent',
                                    riskLevel: 'Unknown',
                                    businessImpact: 'Unknown'
                                });
                            }
                            links.push({
                                source: dep,
                                target: componentName,
                                type: 'depends_on'
                            });
                        });
                    }
                });
            }
            
            console.log('DependencyGraph: Created nodes:', nodes);
            console.log('DependencyGraph: Created links:', links);
            
            // Update the graph with the new data
            const visualizationData = {
                nodes: nodes,
                edges: links
            };
            this.updateGraph(visualizationData);
            
        } catch (error) {
            console.error('DependencyGraph: Error creating visualization:', error);
        }
    }

}

// Global function for loading dependencies (called from HTML)
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

// Initialize when DOM is ready
let dependencyGraph;

document.addEventListener('DOMContentLoaded', () => {
    dependencyGraph = new DependencyGraph();
    window.dependencyGraph = dependencyGraph;
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DependencyGraph;
} else {
    window.DependencyGraph = DependencyGraph;
} 
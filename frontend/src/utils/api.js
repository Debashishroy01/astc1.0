/**
 * ASTC API Utility Module
 * Handles all communication with the backend server
 */

class ASTCApi {
    constructor(baseUrl = 'http://localhost:8000') {
        this.baseUrl = baseUrl;
        this.requestId = 0;
    }

    /**
     * Generate unique request ID
     */
    generateRequestId() {
        return `req_${Date.now()}_${++this.requestId}`;
    }

    /**
     * Make HTTP request with error handling
     */
    async makeRequest(endpoint, method = 'GET', data = null) {
        const requestId = this.generateRequestId();
        const url = `${this.baseUrl}${endpoint}`;
        
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'X-Request-ID': requestId
            }
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        try {
            console.log(`[API] ${method} ${endpoint}`, data || '');
            
            const response = await fetch(url, options);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log(`[API] Response:`, result);
            
            return {
                success: true,
                data: result,
                requestId: requestId
            };

        } catch (error) {
            console.error(`[API] Error in ${method} ${endpoint}:`, error);
            
            return {
                success: false,
                error: error.message,
                requestId: requestId
            };
        }
    }

    /**
     * Health check endpoint
     */
    async checkHealth() {
        return await this.makeRequest('/api/health');
    }

    /**
     * Get system status
     */
    async getSystemStatus() {
        return await this.makeRequest('/api/framework/status');
    }

    /**
     * Get agent status
     */
    async getAgentStatus() {
        return await this.makeRequest('/api/agents/status');
    }

    /**
     * Get test execution history
     */
    async getExecutionHistory(limit = 50) {
        return await this.makeRequest(`/api/execution/history?limit=${limit}`);
    }

    /**
     * Start a test execution
     */
    async startTestExecution(testCaseId, config = {}) {
        return await this.makeRequest('/api/execution/start', 'POST', {
            test_case_id: testCaseId,
            config: config
        });
    }

    /**
     * Execute test cases using real TestExecutionAgent
     */
    async executeTests(testCases, executionType = 'suite') {
        return await this.makeRequest('/api/execute-tests', 'POST', {
            test_cases: testCases,
            execution_type: executionType
        });
    }

    /**
     * Execute a single test case using real TestExecutionAgent
     */
    async executeSingleTest(testCase) {
        return await this.executeTests([testCase], 'single');
    }

    /**
     * Generate automation scripts using real ScriptGenerationAgent
     */
    async generateAutomationScripts(testCases) {
        return await this.makeRequest('/api/generate-scripts', 'POST', {
            test_cases: testCases
        });
    }

    /**
     * Generate BAPI script for specific transaction
     */
    async generateBAPIScript(transaction, parameters = {}) {
        return await this.makeRequest('/api/generate-bapi-script', 'POST', {
            transaction: transaction,
            parameters: parameters
        });
    }

    /**
     * Generate GUI script for specific transaction
     */
    async generateGUIScript(transaction, steps = []) {
        return await this.makeRequest('/api/generate-gui-script', 'POST', {
            transaction: transaction,
            steps: steps
        });
    }

    /**
     * Optimize existing script code
     */
    async optimizeScript(scriptCode, optimizationGoals = []) {
        return await this.makeRequest('/api/optimize-script', 'POST', {
            script_code: scriptCode,
            optimization_goals: optimizationGoals
        });
    }

    /**
     * Validate script code for issues
     */
    async validateScript(scriptCode, scriptType = '') {
        return await this.makeRequest('/api/validate-script', 'POST', {
            script_code: scriptCode,
            script_type: scriptType
        });
    }

    /**
     * Adapt content for specific persona using real PersonaAdaptationAgent
     */
    async adaptContent(content, persona, contentType = 'general_message') {
        return await this.makeRequest('/api/adapt-content', 'POST', {
            content: content,
            persona: persona,
            content_type: contentType
        });
    }

    /**
     * Get persona-specific dashboard
     */
    async getPersonaDashboard(persona, dataSources = {}) {
        return await this.makeRequest('/api/get-persona-dashboard', 'POST', {
            persona: persona,
            data_sources: dataSources
        });
    }

    /**
     * Transform language from one persona style to another
     */
    async transformLanguage(text, fromPersona, toPersona) {
        return await this.makeRequest('/api/transform-language', 'POST', {
            text: text,
            from_persona: fromPersona,
            to_persona: toPersona
        });
    }

    /**
     * Switch persona view with complete data adaptation
     */
    async switchPersona(currentData, fromPersona, toPersona) {
        return await this.makeRequest('/api/switch-persona', 'POST', {
            current_data: currentData,
            from_persona: fromPersona,
            to_persona: toPersona
        });
    }

    /**
     * Analyze advanced dependencies with intelligent SAP patterns
     */
    async analyzeAdvancedDependencies(targetNode, analysisDepth = 3, includeCustomCode = true) {
        return await this.makeRequest('/api/analyze-advanced-dependencies', 'POST', {
            target_node: targetNode,
            analysis_depth: analysisDepth,
            include_custom_code: includeCustomCode
        });
    }

    /**
     * Generate interactive dependency graph with advanced features
     */
    async generateInteractiveGraph(nodes, focusArea = '', visualizationOptions = {}) {
        return await this.makeRequest('/api/generate-interactive-graph', 'POST', {
            nodes: nodes,
            focus_area: focusArea,
            visualization_options: visualizationOptions
        });
    }

    /**
     * Calculate risk heatmap with intelligent analysis
     */
    async calculateRiskHeatmap(dependencyGraph, changeScenario = {}, businessContext = {}) {
        return await this.makeRequest('/api/calculate-risk-heatmap', 'POST', {
            dependency_graph: dependencyGraph,
            change_scenario: changeScenario,
            business_context: businessContext
        });
    }

    /**
     * Simulate change impact with advanced modeling
     */
    async simulateChangeImpact(changeType, targetNodes, changeDetails = {}) {
        return await this.makeRequest('/api/simulate-change-impact', 'POST', {
            change_type: changeType,
            target_nodes: targetNodes,
            change_details: changeDetails
        });
    }

    /**
     * Analyze what-if scenarios with predictive modeling
     */
    async analyzeWhatIfScenario(scenarioDefinition, baselineState = {}, analysisParameters = {}) {
        return await this.makeRequest('/api/analyze-what-if-scenario', 'POST', {
            scenario_definition: scenarioDefinition,
            baseline_state: baselineState,
            analysis_parameters: analysisParameters
        });
    }

    /**
     * Optimize dependency structure for better performance
     */
    async optimizeDependencyStructure(currentStructure, optimizationGoals, constraints = {}) {
        return await this.makeRequest('/api/optimize-dependency-structure', 'POST', {
            current_structure: currentStructure,
            optimization_goals: optimizationGoals,
            constraints: constraints
        });
    }

    /**
     * Generate impact radius analysis
     */
    async generateImpactRadius(changePoint, radiusParameters = {}, includeProbability = true) {
        return await this.makeRequest('/api/generate-impact-radius', 'POST', {
            change_point: changePoint,
            radius_parameters: radiusParameters,
            include_probability: includeProbability
        });
    }

    /**
     * Calculate comprehensive ROI with financial modeling
     */
    async calculateROI(roiParameters, companyProfile, currentTool = 'manual') {
        return await this.makeRequest('/api/calculate-roi', 'POST', {
            roi_parameters: roiParameters,
            company_profile: companyProfile,
            current_tool: currentTool
        });
    }

    /**
     * Generate executive-ready business case
     */
    async generateBusinessCase(companyProfile, projectScope, stakeholderPriorities) {
        return await this.makeRequest('/api/generate-business-case', 'POST', {
            company_profile: companyProfile,
            project_scope: projectScope,
            stakeholder_priorities: stakeholderPriorities
        });
    }

    /**
     * Perform comprehensive competitive analysis
     */
    async performCompetitiveAnalysis(currentTools, evaluationCriteria, industryContext) {
        return await this.makeRequest('/api/competitive-analysis', 'POST', {
            current_tools: currentTools,
            evaluation_criteria: evaluationCriteria,
            industry_context: industryContext
        });
    }

    /**
     * Perform market benchmarking analysis
     */
    async performMarketBenchmarking(companyProfile, performanceMetrics, benchmarkCategories) {
        return await this.makeRequest('/api/market-benchmarking', 'POST', {
            company_profile: companyProfile,
            performance_metrics: performanceMetrics,
            benchmark_categories: benchmarkCategories
        });
    }

    /**
     * Generate executive dashboard with KPIs
     */
    async generateExecutiveDashboard(dashboardType = 'overview', timePeriod = '12_months', focusAreas = []) {
        return await this.makeRequest('/api/executive-dashboard', 'POST', {
            dashboard_type: dashboardType,
            time_period: timePeriod,
            focus_areas: focusAreas
        });
    }

    /**
     * Track value realization progress
     */
    async trackValueRealization(baselineMetrics, currentMetrics, targetMetrics) {
        return await this.makeRequest('/api/value-realization-tracking', 'POST', {
            baseline_metrics: baselineMetrics,
            current_metrics: currentMetrics,
            target_metrics: targetMetrics
        });
    }

    /**
     * Analyze strategic impact and alignment
     */
    async analyzeStrategicImpact(businessObjectives, technologyRoadmap, marketConditions) {
        return await this.makeRequest('/api/strategic-impact-analysis', 'POST', {
            business_objectives: businessObjectives,
            technology_roadmap: technologyRoadmap,
            market_conditions: marketConditions
        });
    }

    /**
     * Analyze SAP requirements
     */
    async analyzeRequirement(requirement, context = {}) {
        return await this.makeRequest('/api/analyze', 'POST', {
            requirement: requirement,
            context: context,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Generate test cases
     */
    async generateTests(analysis, requirements = {}) {
        return await this.makeRequest('/api/generate-tests', 'POST', {
            analysis: analysis,
            requirements: requirements,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Analyze dependencies
     */
    async analyzeDependencies(components, options = {}) {
        const payload = {
            components: components,
            depth: options.depth || 2,
            include_indirect: options.includeIndirect !== false,
            timestamp: new Date().toISOString()
        };

        return await this.makeRequest('/api/analyze-dependencies', 'POST', payload);
    }

    /**
     * Get dependencies for a specific transaction
     */
    async getDependencies(transactionCode) {
        return await this.makeRequest(`/api/dependencies?transaction=${transactionCode}`);
    }

    /**
     * Perform impact assessment
     */
    async performImpactAssessment(changeType, components, scope = 'minor') {
        return await this.makeRequest('/api/impact-assessment', 'POST', {
            change_type: changeType,
            components: components,
            scope: scope,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Simulate change impact
     */
    async simulateChange(changes, scope = 'immediate') {
        return await this.makeRequest('/api/simulate-change', 'POST', {
            changes: changes,
            scope: scope,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Start workflow
     */
    async startWorkflow(workflowType, parameters = {}) {
        return await this.makeRequest('/api/workflow/start', 'POST', {
            workflow_type: workflowType,
            initiator: 'frontend_user',
            parameters: parameters,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Get message history
     */
    async getMessageHistory(limit = 100) {
        return await this.makeRequest(`/api/message/history?limit=${limit}`);
    }

    /**
     * Complete analysis workflow (combines multiple API calls)
     */
    async performCompleteAnalysis(requirement, context = {}) {
        try {
            // Step 1: Analyze the requirement
            const analysisResult = await this.analyzeRequirement(requirement, context);
            
            if (!analysisResult.success) {
                return analysisResult;
            }

            const analysis = analysisResult.data.analysis;
            const transactions = analysis.extracted_transactions || [];

            // Step 2: Generate test cases if transactions were found
            let testResult = null;
            if (transactions.length > 0) {
                testResult = await this.generateTests(analysis, context);
            }

            // Step 3: Analyze dependencies if transactions were found
            let dependencyResult = null;
            if (transactions.length > 0) {
                const transactionCodes = transactions.map(t => t.code);
                dependencyResult = await this.analyzeDependencies(transactionCodes);
            }

            return {
                success: true,
                data: {
                    analysis: analysisResult.data,
                    tests: testResult?.data || null,
                    dependencies: dependencyResult?.data || null
                },
                requestId: analysisResult.requestId
            };

        } catch (error) {
            console.error('[API] Complete analysis error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Batch API calls for dashboard metrics
     */
    async getDashboardMetrics() {
        try {
            const [health, agents, messages] = await Promise.all([
                this.checkHealth(),
                this.getAgentStatus(),
                this.getMessageHistory(50)
            ]);

            return {
                success: true,
                data: {
                    health: health.data,
                    agents: agents.data,
                    messages: messages.data
                }
            };

        } catch (error) {
            console.error('[API] Dashboard metrics error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Poll for real-time updates
     */
    async pollForUpdates(lastUpdate = null) {
        try {
            const [agents, messages] = await Promise.all([
                this.getAgentStatus(),
                this.getMessageHistory(10)
            ]);

            return {
                success: true,
                data: {
                    agents: agents.data,
                    messages: messages.data,
                    timestamp: new Date().toISOString()
                }
            };

        } catch (error) {
            console.error('[API] Polling error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ========================================
    // Real-Time Monitoring API Methods
    // ========================================

    /**
     * Get real-time monitoring data
     */
    async getRealTimeMonitoring() {
        try {
            const response = await this.makeRequest('/api/monitoring/real-time', 'GET');
            console.log('📊 Real-time monitoring data retrieved:', response);
            return response;
        } catch (error) {
            console.error('Real-time monitoring error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get agent network topology
     */
    async getNetworkTopology() {
        try {
            const response = await this.makeRequest('/api/monitoring/network-topology', 'GET');
            console.log('🌐 Network topology data retrieved:', response);
            return response;
        } catch (error) {
            console.error('Network topology error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get agent activity history
     */
    async getActivityHistory(limit = 100) {
        try {
            const response = await this.makeRequest(`/api/monitoring/activity-history?limit=${limit}`, 'GET');
            console.log('📈 Activity history retrieved:', response);
            return response;
        } catch (error) {
            console.error('Activity history error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Start real-time monitoring session
     */
    async startRealTimeMonitoring(callback) {
        try {
            // For now, implement polling-based real-time updates
            // In a full implementation, this would use WebSockets
            const pollInterval = setInterval(async () => {
                try {
                    const monitoringData = await this.getRealTimeMonitoring();
                    if (monitoringData.success && callback) {
                        callback(monitoringData.data);
                    }
                } catch (error) {
                    console.error('Real-time monitoring poll error:', error);
                }
            }, 2000); // Poll every 2 seconds

            return {
                success: true,
                pollInterval: pollInterval,
                stop: () => clearInterval(pollInterval)
            };
        } catch (error) {
            console.error('Start real-time monitoring error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Export singleton instance
const api = new ASTCApi();

// For debugging in console
window.astcApi = api;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
} else {
    window.api = api;
} 
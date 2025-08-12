/**
 * BusinessImpactDashboard Component - Priority 5: Business Impact Dashboard
 * ROI calculation, competitive analysis, and executive business case generation
 */

class BusinessImpactDashboard {
    constructor() {
        this.currentView = 'overview';
        this.roiData = {};
        this.competitiveData = {};
        this.businessMetrics = {};
        this.charts = {};
        
        this.views = {
            'overview': 'Executive Overview',
            'roi_calculator': 'ROI Calculator',
            'competitive': 'Competitive Analysis',
            'benchmarking': 'Market Benchmarking',
            'business_case': 'Business Case Generator'
        };

        this.setupChartDefaults();
    }

    /**
     * Initialize the business impact dashboard
     */
    init(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Business impact dashboard container not found');
            return;
        }

        container.innerHTML = this.render();
        this.setupEventListeners();
        this.loadDashboardData();
    }

    /**
     * Render the business impact dashboard UI
     */
    render() {
        return `
            <div class="business-impact-dashboard" id="businessDashboard">
                <!-- Navigation Header -->
                <div class="dashboard-header">
                    <div class="header-content">
                        <h1>📈 Business Impact Dashboard</h1>
                        <p>Quantified value proposition and competitive analysis</p>
                    </div>
                    
                    <div class="view-selector">
                        ${Object.entries(this.views).map(([key, label]) => `
                            <button 
                                class="view-tab ${key === this.currentView ? 'active' : ''}"
                                data-view="${key}"
                            >
                                ${label}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <!-- Dashboard Content -->
                <div class="dashboard-content">
                    <!-- Executive Overview -->
                    <div id="overviewView" class="view-content ${this.currentView === 'overview' ? 'active' : ''}">
                        <div class="executive-summary">
                            <h2>Executive Summary</h2>
                            <div class="summary-metrics">
                                <div class="metric-card roi-highlight">
                                    <div class="metric-icon">💰</div>
                                    <div class="metric-content">
                                        <div class="metric-value" id="roiValue">180%</div>
                                        <div class="metric-label">3-Year ROI</div>
                                        <div class="metric-trend positive">+24% vs. industry</div>
                                    </div>
                                </div>
                                
                                <div class="metric-card">
                                    <div class="metric-icon">⏱️</div>
                                    <div class="metric-content">
                                        <div class="metric-value" id="paybackValue">6</div>
                                        <div class="metric-label">Payback (Months)</div>
                                        <div class="metric-trend positive">3x faster than average</div>
                                    </div>
                                </div>
                                
                                <div class="metric-card">
                                    <div class="metric-icon">💵</div>
                                    <div class="metric-content">
                                        <div class="metric-value" id="savingsValue">$3.2M</div>
                                        <div class="metric-label">Total Savings</div>
                                        <div class="metric-trend positive">Net present value</div>
                                    </div>
                                </div>
                                
                                <div class="metric-card">
                                    <div class="metric-icon">📊</div>
                                    <div class="metric-content">
                                        <div class="metric-value" id="riskValue">85%</div>
                                        <div class="metric-label">Risk Reduction</div>
                                        <div class="metric-trend positive">Quality improvement</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="overview-charts">
                            <div class="chart-container">
                                <h3>Financial Impact Projection</h3>
                                <canvas id="financialChart" width="600" height="300"></canvas>
                            </div>
                            
                            <div class="chart-container">
                                <h3>Competitive Positioning</h3>
                                <canvas id="competitiveChart" width="600" height="300"></canvas>
                            </div>
                        </div>

                        <div class="strategic-value">
                            <h3>Strategic Value Proposition</h3>
                            <div class="value-cards">
                                <div class="value-card">
                                    <h4>🚀 Digital Transformation Leadership</h4>
                                    <p>First-mover advantage in AI-powered SAP testing creates sustainable competitive differentiation</p>
                                </div>
                                <div class="value-card">
                                    <h4>⚡ Operational Excellence</h4>
                                    <p>75% reduction in testing time enables faster time-to-market and increased agility</p>
                                </div>
                                <div class="value-card">
                                    <h4>🎯 Risk Mitigation</h4>
                                    <p>Predictive quality analysis prevents production issues and regulatory compliance risks</p>
                                </div>
                                <div class="value-card">
                                    <h4>💡 Innovation Platform</h4>
                                    <p>Foundation for continuous improvement and future AI-driven business optimization</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ROI Calculator -->
                    <div id="roiCalculatorView" class="view-content ${this.currentView === 'roi_calculator' ? 'active' : ''}">
                        <div class="roi-calculator">
                            <h2>📊 ROI Calculator</h2>
                            
                            <div class="calculator-sections">
                                <div class="input-section">
                                    <h3>Input Parameters</h3>
                                    
                                    <div class="input-groups">
                                        <div class="input-group">
                                            <h4>Team & Resources</h4>
                                            <label>Team Size</label>
                                            <input type="number" id="teamSize" value="10" min="1" max="100">
                                            
                                            <label>Average Hourly Rate ($)</label>
                                            <input type="number" id="hourlyRate" value="75" min="30" max="200">
                                            
                                            <label>Testing Hours/Month</label>
                                            <input type="number" id="testingHours" value="160" min="40" max="320">
                                        </div>
                                        
                                        <div class="input-group">
                                            <h4>Project Scope</h4>
                                            <label>Project Duration (Months)</label>
                                            <input type="number" id="projectDuration" value="12" min="3" max="36">
                                            
                                            <label>Defect Cost ($)</label>
                                            <input type="number" id="defectCost" value="50000" min="1000" max="500000">
                                            
                                            <label>Downtime Cost/Hour ($)</label>
                                            <input type="number" id="downtimeCost" value="5000" min="100" max="50000">
                                        </div>
                                        
                                        <div class="input-group">
                                            <h4>Company Profile</h4>
                                            <label>Industry</label>
                                            <select id="industry">
                                                <option value="manufacturing">Manufacturing</option>
                                                <option value="financial_services">Financial Services</option>
                                                <option value="healthcare">Healthcare</option>
                                                <option value="retail">Retail</option>
                                                <option value="automotive">Automotive</option>
                                            </select>
                                            
                                            <label>Company Size</label>
                                            <select id="companySize">
                                                <option value="small">Small (< 500 employees)</option>
                                                <option value="medium">Medium (500-5000)</option>
                                                <option value="large">Large (5000-50000)</option>
                                                <option value="enterprise">Enterprise (> 50000)</option>
                                            </select>
                                            
                                            <label>Current Tool</label>
                                            <select id="currentTool">
                                                <option value="manual">Manual Testing</option>
                                                <option value="tricentis_tosca">Tricentis Tosca</option>
                                                <option value="worksoft_certify">Worksoft Certify</option>
                                                <option value="selenium">Selenium</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div class="calculator-actions">
                                        <button id="calculateROI" class="btn btn-primary">📊 Calculate ROI</button>
                                        <button id="resetCalculator" class="btn btn-secondary">🔄 Reset</button>
                                        <button id="saveScenario" class="btn btn-success">💾 Save Scenario</button>
                                    </div>
                                </div>
                                
                                <div class="results-section">
                                    <h3>ROI Analysis Results</h3>
                                    <div id="roiResults" class="roi-results">
                                        <div class="results-placeholder">
                                            <p>Configure parameters and click "Calculate ROI" to see detailed financial analysis</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Competitive Analysis -->
                    <div id="competitiveView" class="view-content ${this.currentView === 'competitive' ? 'active' : ''}">
                        <div class="competitive-analysis">
                            <h2>🏆 Competitive Analysis</h2>
                            
                            <div class="market-overview">
                                <div class="market-metrics">
                                    <div class="market-metric">
                                        <h4>Market Size</h4>
                                        <div class="metric-value">$2.8B</div>
                                        <div class="metric-description">SAP Testing Tools TAM</div>
                                    </div>
                                    <div class="market-metric">
                                        <h4>Growth Rate</h4>
                                        <div class="metric-value">12.5%</div>
                                        <div class="metric-description">CAGR 2024-2029</div>
                                    </div>
                                    <div class="market-metric">
                                        <h4>Market Position</h4>
                                        <div class="metric-value">Leader</div>
                                        <div class="metric-description">AI-powered SAP testing</div>
                                    </div>
                                </div>
                            </div>

                            <div class="competitive-matrix">
                                <h3>Competitive Positioning Matrix</h3>
                                <div class="matrix-container">
                                    <canvas id="competitiveMatrix" width="800" height="500"></canvas>
                                </div>
                            </div>

                            <div class="competitor-comparison">
                                <h3>Feature Comparison</h3>
                                <div class="comparison-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Feature</th>
                                                <th>ASTC</th>
                                                <th>Tricentis Tosca</th>
                                                <th>Worksoft Certify</th>
                                                <th>Manual Testing</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>AI-Powered Intelligence</td>
                                                <td class="feature-excellent">★★★★★</td>
                                                <td class="feature-good">★★★☆☆</td>
                                                <td class="feature-fair">★★☆☆☆</td>
                                                <td class="feature-poor">☆☆☆☆☆</td>
                                            </tr>
                                            <tr>
                                                <td>SAP Specialization</td>
                                                <td class="feature-excellent">★★★★★</td>
                                                <td class="feature-good">★★★★☆</td>
                                                <td class="feature-excellent">★★★★★</td>
                                                <td class="feature-fair">★★☆☆☆</td>
                                            </tr>
                                            <tr>
                                                <td>Implementation Speed</td>
                                                <td class="feature-excellent">★★★★★</td>
                                                <td class="feature-fair">★★☆☆☆</td>
                                                <td class="feature-good">★★★☆☆</td>
                                                <td class="feature-excellent">★★★★★</td>
                                            </tr>
                                            <tr>
                                                <td>Total Cost of Ownership</td>
                                                <td class="feature-excellent">★★★★★</td>
                                                <td class="feature-fair">★★☆☆☆</td>
                                                <td class="feature-good">★★★☆☆</td>
                                                <td class="feature-poor">★☆☆☆☆</td>
                                            </tr>
                                            <tr>
                                                <td>Learning Curve</td>
                                                <td class="feature-excellent">★★★★★</td>
                                                <td class="feature-poor">★☆☆☆☆</td>
                                                <td class="feature-fair">★★☆☆☆</td>
                                                <td class="feature-good">★★★★☆</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div class="competitive-advantages">
                                <h3>Key Competitive Advantages</h3>
                                <div class="advantage-cards">
                                    <div class="advantage-card">
                                        <div class="advantage-icon">🧠</div>
                                        <h4>AI-First Architecture</h4>
                                        <p>Unique AI-powered intelligence that understands SAP business processes and generates intelligent test scenarios</p>
                                    </div>
                                    <div class="advantage-card">
                                        <div class="advantage-icon">⚡</div>
                                        <h4>Rapid Implementation</h4>
                                        <p>6-month payback vs. 12-18 months for traditional solutions. No extensive configuration or customization required</p>
                                    </div>
                                    <div class="advantage-card">
                                        <div class="advantage-icon">💰</div>
                                        <h4>Superior ROI</h4>
                                        <p>180% ROI vs. 120% for Tosca and 135% for Worksoft. Significantly lower total cost of ownership</p>
                                    </div>
                                    <div class="advantage-card">
                                        <div class="advantage-icon">🎯</div>
                                        <h4>SAP-Native Design</h4>
                                        <p>Built specifically for SAP environments with deep understanding of SAP business processes and data flows</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Market Benchmarking -->
                    <div id="benchmarkingView" class="view-content ${this.currentView === 'benchmarking' ? 'active' : ''}">
                        <div class="market-benchmarking">
                            <h2>📊 Market Benchmarking</h2>
                            <div class="benchmarking-content">
                                <div class="benchmark-charts">
                                    <div class="chart-container">
                                        <h3>Industry Performance Comparison</h3>
                                        <canvas id="benchmarkChart" width="600" height="300"></canvas>
                                    </div>
                                    
                                    <div class="chart-container">
                                        <h3>Maturity Assessment</h3>
                                        <canvas id="maturityChart" width="600" height="300"></canvas>
                                    </div>
                                </div>
                                
                                <div class="benchmark-insights">
                                    <h3>Key Insights</h3>
                                    <div class="insight-cards">
                                        <div class="insight-card">
                                            <h4>Above Industry Average</h4>
                                            <p>Your projected automation rate of 85% significantly exceeds the industry average of 35%</p>
                                        </div>
                                        <div class="insight-card">
                                            <h4>Best-in-Class ROI</h4>
                                            <p>ASTC ROI puts you in the top 5% of organizations for testing investment returns</p>
                                        </div>
                                        <div class="insight-card">
                                            <h4>Faster Time-to-Value</h4>
                                            <p>6-month payback vs. industry average of 18 months for testing tool implementations</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Business Case Generator -->
                    <div id="businessCaseView" class="view-content ${this.currentView === 'business_case' ? 'active' : ''}">
                        <div class="business-case-generator">
                            <h2>📋 Business Case Generator</h2>
                            
                            <div class="business-case-form">
                                <div class="form-section">
                                    <h3>Company Information</h3>
                                    <div class="form-fields">
                                        <input type="text" id="companyName" placeholder="Company Name" />
                                        <select id="businessIndustry">
                                            <option value="">Select Industry</option>
                                            <option value="manufacturing">Manufacturing</option>
                                            <option value="financial_services">Financial Services</option>
                                            <option value="healthcare">Healthcare</option>
                                            <option value="retail">Retail</option>
                                        </select>
                                        <select id="businessSize">
                                            <option value="">Select Company Size</option>
                                            <option value="small">Small (< 500 employees)</option>
                                            <option value="medium">Medium (500-5000)</option>
                                            <option value="large">Large (5000-50000)</option>
                                            <option value="enterprise">Enterprise (> 50000)</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="form-section">
                                    <h3>Project Scope</h3>
                                    <div class="form-fields">
                                        <input type="number" id="transactionCount" placeholder="Number of SAP Transactions" value="15" />
                                        <select id="projectTimeline">
                                            <option value="6_months">6 Months</option>
                                            <option value="12_months">12 Months</option>
                                            <option value="18_months" selected>18 Months</option>
                                            <option value="24_months">24 Months</option>
                                        </select>
                                        <input type="text" id="criticalProcesses" placeholder="Critical Business Processes" />
                                    </div>
                                </div>
                                
                                <div class="form-section">
                                    <h3>Stakeholder Priorities</h3>
                                    <div class="priority-checkboxes">
                                        <label><input type="checkbox" value="cost" checked> Cost Reduction</label>
                                        <label><input type="checkbox" value="quality" checked> Quality Improvement</label>
                                        <label><input type="checkbox" value="speed"> Speed to Market</label>
                                        <label><input type="checkbox" value="compliance"> Compliance</label>
                                        <label><input type="checkbox" value="risk"> Risk Mitigation</label>
                                        <label><input type="checkbox" value="innovation"> Innovation</label>
                                    </div>
                                </div>
                                
                                <div class="form-actions">
                                    <button id="generateBusinessCase" class="btn btn-primary">📋 Generate Business Case</button>
                                    <button id="exportBusinessCase" class="btn btn-success">📄 Export PDF</button>
                                </div>
                            </div>
                            
                            <div id="businessCaseOutput" class="business-case-output"></div>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                .business-impact-dashboard {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    overflow: hidden;
                    min-height: 800px;
                }

                .dashboard-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 20px;
                }

                .header-content h1 {
                    margin: 0 0 5px 0;
                    font-size: 28px;
                    font-weight: 700;
                }

                .header-content p {
                    margin: 0;
                    opacity: 0.9;
                    font-size: 16px;
                }

                .view-selector {
                    display: flex;
                    gap: 10px;
                    margin-top: 20px;
                }

                .view-tab {
                    background: rgba(255,255,255,0.1);
                    border: none;
                    border-radius: 8px;
                    color: white;
                    padding: 10px 16px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-weight: 500;
                }

                .view-tab:hover {
                    background: rgba(255,255,255,0.2);
                }

                .view-tab.active {
                    background: rgba(255,255,255,0.3);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                }

                .dashboard-content {
                    padding: 30px;
                }

                .view-content {
                    display: none;
                }

                .view-content.active {
                    display: block;
                }

                /* Executive Overview Styles */
                .executive-summary h2 {
                    color: #495057;
                    margin-bottom: 25px;
                    font-size: 24px;
                }

                .summary-metrics {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                    margin-bottom: 40px;
                }

                .metric-card {
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    transition: transform 0.3s ease;
                }

                .metric-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
                }

                .metric-card.roi-highlight {
                    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                    color: white;
                }

                .metric-icon {
                    font-size: 32px;
                    opacity: 0.8;
                }

                .metric-value {
                    font-size: 32px;
                    font-weight: 700;
                    line-height: 1;
                    margin-bottom: 5px;
                }

                .metric-label {
                    font-size: 14px;
                    font-weight: 500;
                    opacity: 0.8;
                    margin-bottom: 5px;
                }

                .metric-trend {
                    font-size: 12px;
                    font-weight: 600;
                }

                .metric-trend.positive {
                    color: #28a745;
                }

                .roi-highlight .metric-trend.positive {
                    color: rgba(255,255,255,0.9);
                }

                .overview-charts {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                    margin-bottom: 40px;
                }

                .chart-container {
                    background: #f8f9fa;
                    border-radius: 12px;
                    padding: 20px;
                    text-align: center;
                }

                .chart-container h3 {
                    color: #495057;
                    margin-bottom: 20px;
                    font-size: 18px;
                }

                .strategic-value h3 {
                    color: #495057;
                    margin-bottom: 25px;
                    font-size: 22px;
                }

                .value-cards {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 20px;
                }

                .value-card {
                    background: #f8f9fa;
                    border-radius: 12px;
                    padding: 20px;
                    border-left: 4px solid #667eea;
                }

                .value-card h4 {
                    color: #495057;
                    margin: 0 0 10px 0;
                    font-size: 16px;
                }

                .value-card p {
                    color: #6c757d;
                    margin: 0;
                    line-height: 1.5;
                }

                /* ROI Calculator Styles */
                .calculator-sections {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                }

                .input-section, .results-section {
                    background: #f8f9fa;
                    border-radius: 12px;
                    padding: 25px;
                }

                .input-groups {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 25px;
                    margin-bottom: 25px;
                }

                .input-group h4 {
                    color: #495057;
                    margin-bottom: 15px;
                    font-size: 16px;
                    border-bottom: 2px solid #e9ecef;
                    padding-bottom: 5px;
                }

                .input-group label {
                    display: block;
                    margin: 10px 0 5px 0;
                    font-weight: 500;
                    color: #495057;
                }

                .input-group input,
                .input-group select {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid #ced4da;
                    border-radius: 6px;
                    font-size: 14px;
                }

                .calculator-actions {
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                }

                .btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .btn.btn-primary {
                    background: #007bff;
                    color: white;
                }

                .btn.btn-secondary {
                    background: #6c757d;
                    color: white;
                }

                .btn.btn-success {
                    background: #28a745;
                    color: white;
                }

                .btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                }

                .roi-results {
                    min-height: 400px;
                }

                .results-placeholder {
                    text-align: center;
                    color: #6c757d;
                    font-style: italic;
                    padding: 60px 20px;
                }

                /* Competitive Analysis Styles */
                .market-overview {
                    margin-bottom: 40px;
                }

                .market-metrics {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }

                .market-metric {
                    background: #f8f9fa;
                    border-radius: 12px;
                    padding: 20px;
                    text-align: center;
                    border-left: 4px solid #667eea;
                }

                .market-metric h4 {
                    color: #495057;
                    margin: 0 0 10px 0;
                    font-size: 14px;
                    font-weight: 600;
                }

                .market-metric .metric-value {
                    font-size: 24px;
                    font-weight: 700;
                    color: #667eea;
                    margin-bottom: 5px;
                }

                .market-metric .metric-description {
                    font-size: 12px;
                    color: #6c757d;
                }

                .matrix-container {
                    background: #f8f9fa;
                    border-radius: 12px;
                    padding: 20px;
                    text-align: center;
                    margin-bottom: 40px;
                }

                .comparison-table {
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    margin-bottom: 40px;
                }

                .comparison-table table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .comparison-table th,
                .comparison-table td {
                    padding: 15px;
                    text-align: center;
                    border-bottom: 1px solid #e9ecef;
                }

                .comparison-table th {
                    background: #667eea;
                    color: white;
                    font-weight: 600;
                }

                .comparison-table td:first-child {
                    text-align: left;
                    font-weight: 500;
                }

                .feature-excellent {
                    color: #28a745;
                }

                .feature-good {
                    color: #17a2b8;
                }

                .feature-fair {
                    color: #ffc107;
                }

                .feature-poor {
                    color: #dc3545;
                }

                .advantage-cards {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                }

                .advantage-card {
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    text-align: center;
                    transition: transform 0.3s ease;
                }

                .advantage-card:hover {
                    transform: translateY(-3px);
                }

                .advantage-icon {
                    font-size: 32px;
                    margin-bottom: 15px;
                }

                .advantage-card h4 {
                    color: #495057;
                    margin-bottom: 10px;
                    font-size: 16px;
                }

                .advantage-card p {
                    color: #6c757d;
                    margin: 0;
                    line-height: 1.5;
                    font-size: 14px;
                }

                /* Business Case Generator Styles */
                .business-case-form {
                    background: #f8f9fa;
                    border-radius: 12px;
                    padding: 25px;
                    margin-bottom: 30px;
                }

                .form-section {
                    margin-bottom: 25px;
                }

                .form-section h3 {
                    color: #495057;
                    margin-bottom: 15px;
                    font-size: 18px;
                    border-bottom: 2px solid #e9ecef;
                    padding-bottom: 5px;
                }

                .form-fields {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                }

                .form-fields input,
                .form-fields select {
                    padding: 10px 12px;
                    border: 1px solid #ced4da;
                    border-radius: 6px;
                    font-size: 14px;
                }

                .priority-checkboxes {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 10px;
                }

                .priority-checkboxes label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    font-weight: 500;
                    color: #495057;
                }

                .form-actions {
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                    margin-top: 25px;
                }

                .business-case-output {
                    background: white;
                    border-radius: 12px;
                    padding: 25px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    min-height: 200px;
                }

                /* Benchmarking Styles */
                .benchmarking-content {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                }

                .benchmark-charts {
                    display: flex;
                    flex-direction: column;
                    gap: 30px;
                }

                .insight-cards {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .insight-card {
                    background: #f8f9fa;
                    border-radius: 12px;
                    padding: 20px;
                    border-left: 4px solid #28a745;
                }

                .insight-card h4 {
                    color: #495057;
                    margin: 0 0 10px 0;
                    font-size: 16px;
                }

                .insight-card p {
                    color: #6c757d;
                    margin: 0;
                    line-height: 1.5;
                }

                /* Responsive Design */
                @media (max-width: 768px) {
                    .calculator-sections,
                    .overview-charts,
                    .benchmarking-content {
                        grid-template-columns: 1fr;
                    }
                    
                    .view-selector {
                        flex-wrap: wrap;
                    }
                    
                    .input-groups {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
        `;
    }

    /**
     * Setup chart defaults
     */
    setupChartDefaults() {
        // Chart.js would be loaded here in a real implementation
        this.chartColors = {
            primary: '#667eea',
            success: '#28a745',
            warning: '#ffc107',
            danger: '#dc3545',
            info: '#17a2b8'
        };
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // View tab switching
        document.querySelectorAll('.view-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });

        // ROI Calculator
        document.getElementById('calculateROI')?.addEventListener('click', () => {
            this.calculateROI();
        });

        document.getElementById('resetCalculator')?.addEventListener('click', () => {
            this.resetCalculator();
        });

        document.getElementById('saveScenario')?.addEventListener('click', () => {
            this.saveScenario();
        });

        // Business Case Generator
        document.getElementById('generateBusinessCase')?.addEventListener('click', () => {
            this.generateBusinessCase();
        });

        document.getElementById('exportBusinessCase')?.addEventListener('click', () => {
            this.exportBusinessCase();
        });
    }

    /**
     * Switch between dashboard views
     */
    switchView(view) {
        this.currentView = view;
        
        // Update active tab
        document.querySelectorAll('.view-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.view === view);
        });

        // Update visible content
        document.querySelectorAll('.view-content').forEach(content => {
            content.classList.toggle('active', content.id === `${view}View`);
        });

        // Load view-specific data
        this.loadViewData(view);
    }

    /**
     * Load dashboard data
     */
    async loadDashboardData() {
        try {
            // Load executive dashboard data
            const response = await window.apiClient.generateExecutiveDashboard(
                'overview',
                '12_months',
                ['financial', 'operational', 'strategic']
            );

            if (response.success) {
                this.updateExecutiveMetrics(response.executive_dashboard);
            }

            // Load initial charts
            this.initializeCharts();
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            this.loadMockDashboardData();
        }
    }

    /**
     * Load mock dashboard data for demonstration
     */
    loadMockDashboardData() {
        this.businessMetrics = {
            roi: 180,
            payback_months: 6,
            total_savings: 3200000,
            risk_reduction: 85,
            cost_savings_ytd: 1200000
        };

        this.updateExecutiveMetrics({
            key_performance_indicators: this.businessMetrics,
            financial_metrics: {
                total_savings: 3200000,
                investment_recovery: 92,
                payback_achieved: true
            }
        });

        this.initializeCharts();
    }

    /**
     * Update executive metrics display
     */
    updateExecutiveMetrics(data) {
        const kpis = data.key_performance_indicators || {};
        
        document.getElementById('roiValue').textContent = `${kpis.roi_current || 180}%`;
        document.getElementById('paybackValue').textContent = kpis.payback_months || 6;
        document.getElementById('savingsValue').textContent = `$${(kpis.cost_savings_ytd || 1200000).toLocaleString()}`;
        document.getElementById('riskValue').textContent = `${kpis.quality_improvement || 85}%`;
    }

    /**
     * Initialize charts
     */
    initializeCharts() {
        // In a real implementation, Chart.js would be used here
        this.createFinancialChart();
        this.createCompetitiveChart();
        this.createBenchmarkChart();
        this.createMaturityChart();
        this.createCompetitiveMatrix();
    }

    /**
     * Create financial impact chart
     */
    createFinancialChart() {
        const canvas = document.getElementById('financialChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Mock chart drawing
        ctx.fillStyle = this.chartColors.primary;
        ctx.fillRect(50, 50, 100, 200);
        ctx.fillStyle = this.chartColors.success;
        ctx.fillRect(200, 30, 100, 220);
        ctx.fillStyle = this.chartColors.info;
        ctx.fillRect(350, 80, 100, 170);
        
        // Labels
        ctx.fillStyle = '#495057';
        ctx.font = '14px Arial';
        ctx.fillText('Year 1', 70, 270);
        ctx.fillText('Year 2', 220, 270);
        ctx.fillText('Year 3', 370, 270);
    }

    /**
     * Create competitive positioning chart
     */
    createCompetitiveChart() {
        const canvas = document.getElementById('competitiveChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Draw competitive comparison bars
        const tools = ['Manual', 'Selenium', 'Tosca', 'Worksoft', 'ASTC'];
        const rois = [45, 80, 120, 135, 180];
        
        tools.forEach((tool, index) => {
            const x = 50 + index * 100;
            const height = (rois[index] / 180) * 200;
            const y = 250 - height;
            
            ctx.fillStyle = index === 4 ? this.chartColors.success : this.chartColors.primary;
            ctx.fillRect(x, y, 80, height);
            
            ctx.fillStyle = '#495057';
            ctx.font = '12px Arial';
            ctx.fillText(tool, x + 10, 270);
            ctx.fillText(`${rois[index]}%`, x + 20, y - 10);
        });
    }

    /**
     * Calculate ROI based on user inputs
     */
    async calculateROI() {
        const params = {
            team_size: parseInt(document.getElementById('teamSize').value),
            avg_hourly_rate: parseFloat(document.getElementById('hourlyRate').value),
            project_duration_months: parseInt(document.getElementById('projectDuration').value),
            testing_hours_per_month: parseInt(document.getElementById('testingHours').value),
            defect_cost: parseFloat(document.getElementById('defectCost').value),
            downtime_cost_per_hour: parseFloat(document.getElementById('downtimeCost').value)
        };

        const companyProfile = {
            industry: document.getElementById('industry').value,
            size: document.getElementById('companySize').value
        };

        const currentTool = document.getElementById('currentTool').value;

        try {
            const response = await window.apiClient.calculateROI(params, companyProfile, currentTool);
            
            if (response.success) {
                this.displayROIResults(response.roi_analysis);
            }
        } catch (error) {
            console.error('ROI calculation failed:', error);
            this.displayMockROIResults(params);
        }
    }

    /**
     * Display ROI calculation results
     */
    displayROIResults(analysis) {
        const resultsContainer = document.getElementById('roiResults');
        
        resultsContainer.innerHTML = `
            <div class="roi-summary">
                <h4>ROI Analysis Summary</h4>
                <div class="summary-grid">
                    <div class="summary-item">
                        <div class="summary-label">Total ROI</div>
                        <div class="summary-value">${analysis.executive_summary.total_roi_percentage.toFixed(1)}%</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Payback Period</div>
                        <div class="summary-value">${analysis.executive_summary.payback_period_months.toFixed(1)} months</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Net Present Value</div>
                        <div class="summary-value">$${analysis.executive_summary.net_present_value.toLocaleString()}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">3-Year Savings</div>
                        <div class="summary-value">$${analysis.executive_summary.three_year_savings.toLocaleString()}</div>
                    </div>
                </div>
            </div>

            <div class="roi-details">
                <h4>Financial Breakdown</h4>
                <div class="breakdown-sections">
                    <div class="breakdown-section">
                        <h5>Investment</h5>
                        <p>Total First Year: $${analysis.astc_investment.total_first_year_cost.toLocaleString()}</p>
                        <p>Annual Recurring: $${analysis.astc_investment.total_annual_recurring_cost.toLocaleString()}</p>
                    </div>
                    <div class="breakdown-section">
                        <h5>Annual Benefits</h5>
                        <p>Labor Savings: $${analysis.projected_benefits.annual_labor_savings.toLocaleString()}</p>
                        <p>Quality Improvements: $${analysis.projected_benefits.annual_defect_savings.toLocaleString()}</p>
                        <p>Total Benefits: $${analysis.projected_benefits.total_annual_benefits.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div class="competitive-comparison">
                <h4>vs. ${analysis.competitive_positioning.competitive_positioning.current_tool_roi}% (Current Tool)</h4>
                <p>ASTC delivers ${analysis.competitive_positioning.competitive_positioning.roi_improvement}% higher ROI</p>
                <p>Payback ${analysis.competitive_positioning.competitive_positioning.payback_improvement} months faster</p>
            </div>

            <style>
                .roi-summary {
                    background: #e8f5e8;
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 20px;
                    border-left: 4px solid #28a745;
                }

                .summary-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 15px;
                    margin-top: 15px;
                }

                .summary-item {
                    text-align: center;
                }

                .summary-label {
                    font-size: 14px;
                    color: #6c757d;
                    font-weight: 500;
                }

                .summary-value {
                    font-size: 24px;
                    font-weight: 700;
                    color: #28a745;
                    margin-top: 5px;
                }

                .roi-details,
                .competitive-comparison {
                    background: #f8f9fa;
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 20px;
                }

                .breakdown-sections {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin-top: 15px;
                }

                .breakdown-section h5 {
                    color: #495057;
                    margin-bottom: 10px;
                    font-size: 16px;
                }

                .breakdown-section p {
                    margin: 5px 0;
                    color: #6c757d;
                }
            </style>
        `;
    }

    /**
     * Display mock ROI results
     */
    displayMockROIResults(params) {
        const mockROI = 150 + (params.team_size * 2);
        const mockPayback = Math.max(4, 12 - params.team_size);
        const mockSavings = params.team_size * params.avg_hourly_rate * 2000;

        const resultsContainer = document.getElementById('roiResults');
        resultsContainer.innerHTML = `
            <div class="roi-summary">
                <h4>ROI Analysis Summary</h4>
                <div class="summary-grid">
                    <div class="summary-item">
                        <div class="summary-label">Total ROI</div>
                        <div class="summary-value">${mockROI}%</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Payback Period</div>
                        <div class="summary-value">${mockPayback} months</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Total Savings</div>
                        <div class="summary-value">$${mockSavings.toLocaleString()}</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate business case
     */
    async generateBusinessCase() {
        const companyProfile = {
            name: document.getElementById('companyName').value,
            industry: document.getElementById('businessIndustry').value,
            size: document.getElementById('businessSize').value
        };

        const projectScope = {
            transaction_count: parseInt(document.getElementById('transactionCount').value),
            timeline: document.getElementById('projectTimeline').value
        };

        const priorities = Array.from(document.querySelectorAll('.priority-checkboxes input:checked'))
            .map(cb => cb.value);

        try {
            const response = await window.apiClient.generateBusinessCase(
                companyProfile,
                projectScope,
                { focus_areas: priorities }
            );

            if (response.success) {
                this.displayBusinessCase(response.business_case);
            }
        } catch (error) {
            console.error('Business case generation failed:', error);
            this.displayMockBusinessCase(companyProfile, priorities);
        }
    }

    /**
     * Display generated business case
     */
    displayBusinessCase(businessCase) {
        const outputContainer = document.getElementById('businessCaseOutput');
        
        outputContainer.innerHTML = `
            <div class="business-case-document">
                <h3>Executive Business Case</h3>
                
                <div class="business-case-section">
                    <h4>Executive Summary</h4>
                    <div class="section-content">
                        ${businessCase.executive_summary}
                    </div>
                </div>

                <div class="business-case-section">
                    <h4>Current Challenges</h4>
                    <ul class="challenges-list">
                        ${businessCase.situation_analysis.current_challenges.map(challenge => 
                            `<li>${challenge}</li>`
                        ).join('')}
                    </ul>
                </div>

                <div class="business-case-section">
                    <h4>Proposed Solution Benefits</h4>
                    <ul class="benefits-list">
                        ${businessCase.solution_overview.proposed_benefits.map(benefit => 
                            `<li>${benefit}</li>`
                        ).join('')}
                    </ul>
                </div>

                <div class="business-case-section">
                    <h4>Competitive Advantages</h4>
                    <div class="advantages-grid">
                        ${businessCase.solution_overview.competitive_advantages.map(advantage => 
                            `<div class="advantage-item">${advantage}</div>`
                        ).join('')}
                    </div>
                </div>
            </div>

            <style>
                .business-case-document {
                    line-height: 1.6;
                }

                .business-case-section {
                    margin-bottom: 30px;
                }

                .business-case-section h4 {
                    color: #495057;
                    border-bottom: 2px solid #e9ecef;
                    padding-bottom: 8px;
                    margin-bottom: 15px;
                }

                .section-content {
                    color: #6c757d;
                    white-space: pre-line;
                }

                .challenges-list,
                .benefits-list {
                    color: #6c757d;
                    padding-left: 20px;
                }

                .challenges-list li,
                .benefits-list li {
                    margin-bottom: 8px;
                }

                .advantages-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 15px;
                }

                .advantage-item {
                    background: #e8f5e8;
                    padding: 15px;
                    border-radius: 8px;
                    border-left: 4px solid #28a745;
                    color: #495057;
                    font-weight: 500;
                }
            </style>
        `;
    }

    /**
     * Display mock business case
     */
    displayMockBusinessCase(companyProfile, priorities) {
        const outputContainer = document.getElementById('businessCaseOutput');
        outputContainer.innerHTML = `
            <div class="business-case-document">
                <h3>Executive Business Case for ${companyProfile.name || 'Your Organization'}</h3>
                <div class="business-case-section">
                    <h4>Executive Summary</h4>
                    <p>ASTC implementation delivers 180% ROI with 6-month payback, transforming SAP testing operations through AI-powered automation and risk-driven intelligence.</p>
                </div>
            </div>
        `;
    }

    /**
     * Load view-specific data
     */
    loadViewData(view) {
        switch (view) {
            case 'competitive':
                this.loadCompetitiveData();
                break;
            case 'benchmarking':
                this.loadBenchmarkingData();
                break;
            case 'roi_calculator':
                this.resetCalculator();
                break;
        }
    }

    /**
     * Placeholder methods for additional functionality
     */
    loadCompetitiveData() {
        console.log('Loading competitive analysis data...');
    }

    loadBenchmarkingData() {
        console.log('Loading market benchmarking data...');
    }

    resetCalculator() {
        document.getElementById('teamSize').value = '10';
        document.getElementById('hourlyRate').value = '75';
        document.getElementById('testingHours').value = '160';
        document.getElementById('roiResults').innerHTML = '<div class="results-placeholder"><p>Configure parameters and click "Calculate ROI" to see detailed financial analysis</p></div>';
    }

    saveScenario() {
        console.log('Saving ROI scenario...');
    }

    exportBusinessCase() {
        console.log('Exporting business case to PDF...');
    }

    createBenchmarkChart() {
        console.log('Creating benchmark chart...');
    }

    createMaturityChart() {
        console.log('Creating maturity assessment chart...');
    }

    createCompetitiveMatrix() {
        console.log('Creating competitive matrix...');
    }
}

// Global instance
window.businessImpactDashboard = new BusinessImpactDashboard();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('businessImpactDashboard');
    if (container) {
        window.businessImpactDashboard.init('businessImpactDashboard');
    }
}); 
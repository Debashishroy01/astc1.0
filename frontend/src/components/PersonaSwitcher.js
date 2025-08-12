/**
 * PersonaSwitcher Component - Priority 3: Persona-Driven Experience
 * Provides role-based content adaptation and dashboard generation
 */

class PersonaSwitcher {
    constructor() {
        this.currentPersona = 'qa_manager';
        this.personaProfiles = {
            'qa_manager': {
                name: 'QA Manager',
                icon: '👨‍💼',
                description: 'Risk-focused dashboard with business impact metrics',
                color: '#1f77b4',
                focus: ['risk', 'budget', 'timeline', 'coverage']
            },
            'developer': {
                name: 'Developer',
                icon: '👨‍💻',
                description: 'Technical test details and code-level information',
                color: '#ff7f0e',
                focus: ['technical', 'performance', 'integration', 'debug']
            },
            'business_user': {
                name: 'Business User',
                icon: '👨‍💼',
                description: 'Plain English explanations in business terms',
                color: '#2ca02c',
                focus: ['process', 'workflow', 'business_impact', 'outcomes']
            }
        };
        
        this.contentAdaptations = new Map();
        this.setupEventListeners();
    }

    /**
     * Initialize the persona switcher component
     */
    init(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Persona switcher container not found');
            return;
        }

        container.innerHTML = this.render();
        this.attachEventListeners();
        this.loadPersonaDashboard();
    }

    /**
     * Render the persona switcher UI
     */
    render() {
        const personas = Object.entries(this.personaProfiles);
        
        return `
            <div class="persona-switcher" id="personaSwitcher">
                <div class="persona-selector">
                    <h3>👤 View As:</h3>
                    <div class="persona-tabs">
                        ${personas.map(([key, persona]) => `
                            <button 
                                class="persona-tab ${key === this.currentPersona ? 'active' : ''}"
                                data-persona="${key}"
                                style="border-bottom: 3px solid ${key === this.currentPersona ? persona.color : 'transparent'}"
                            >
                                <span class="persona-icon">${persona.icon}</span>
                                <span class="persona-name">${persona.name}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
                
                <div class="persona-context">
                    <div class="context-info">
                        <span class="context-description">
                            ${this.personaProfiles[this.currentPersona].description}
                        </span>
                        <button id="customizePersona" class="customize-btn">⚙️ Customize</button>
                    </div>
                </div>

                <div class="persona-dashboard" id="personaDashboard">
                    <div class="loading">Loading persona-specific dashboard...</div>
                </div>

                <div class="persona-customization" id="personaCustomization" style="display: none;">
                    <h4>Customize ${this.personaProfiles[this.currentPersona].name} View</h4>
                    <div class="focus-areas">
                        ${this.personaProfiles[this.currentPersona].focus.map(area => `
                            <label class="focus-area">
                                <input type="checkbox" value="${area}" checked>
                                <span>${area.replace('_', ' ').toUpperCase()}</span>
                            </label>
                        `).join('')}
                    </div>
                    <div class="customization-actions">
                        <button id="applyCustomization">Apply Changes</button>
                        <button id="resetCustomization">Reset to Default</button>
                    </div>
                </div>
            </div>

            <style>
                .persona-switcher {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    margin-bottom: 20px;
                    overflow: hidden;
                }

                .persona-selector {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 20px;
                }

                .persona-selector h3 {
                    margin: 0 0 15px 0;
                    font-size: 18px;
                    font-weight: 600;
                }

                .persona-tabs {
                    display: flex;
                    gap: 10px;
                }

                .persona-tab {
                    background: rgba(255,255,255,0.1);
                    border: none;
                    border-radius: 8px;
                    color: white;
                    padding: 12px 16px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    font-weight: 500;
                }

                .persona-tab:hover {
                    background: rgba(255,255,255,0.2);
                    transform: translateY(-2px);
                }

                .persona-tab.active {
                    background: rgba(255,255,255,0.3);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                }

                .persona-icon {
                    font-size: 16px;
                }

                .persona-context {
                    background: #f8f9fa;
                    padding: 15px 20px;
                    border-bottom: 1px solid #e9ecef;
                }

                .context-info {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .context-description {
                    color: #6c757d;
                    font-style: italic;
                }

                .customize-btn {
                    background: #007bff;
                    border: none;
                    border-radius: 6px;
                    color: white;
                    padding: 6px 12px;
                    cursor: pointer;
                    font-size: 12px;
                    transition: background-color 0.3s ease;
                }

                .customize-btn:hover {
                    background: #0056b3;
                }

                .persona-dashboard {
                    padding: 20px;
                    min-height: 400px;
                }

                .persona-customization {
                    background: #f8f9fa;
                    padding: 20px;
                    border-top: 1px solid #e9ecef;
                }

                .focus-areas {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 10px;
                    margin: 15px 0;
                }

                .focus-area {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                }

                .focus-area input[type="checkbox"] {
                    margin: 0;
                }

                .customization-actions {
                    display: flex;
                    gap: 10px;
                    margin-top: 15px;
                }

                .customization-actions button {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 500;
                }

                #applyCustomization {
                    background: #28a745;
                    color: white;
                }

                #resetCustomization {
                    background: #6c757d;
                    color: white;
                }

                .loading {
                    text-align: center;
                    color: #6c757d;
                    padding: 40px;
                    font-style: italic;
                }

                /* Persona-specific styling */
                .qa-manager-view {
                    --primary-color: #1f77b4;
                    --secondary-color: #e3f2fd;
                }

                .developer-view {
                    --primary-color: #ff7f0e;
                    --secondary-color: #fff3e0;
                }

                .business-user-view {
                    --primary-color: #2ca02c;
                    --secondary-color: #e8f5e8;
                }

                .persona-metric {
                    background: var(--secondary-color);
                    border-left: 4px solid var(--primary-color);
                    padding: 15px;
                    margin: 10px 0;
                    border-radius: 0 8px 8px 0;
                }

                .persona-metric h4 {
                    color: var(--primary-color);
                    margin: 0 0 8px 0;
                }

                .persona-metric .value {
                    font-size: 24px;
                    font-weight: bold;
                    color: var(--primary-color);
                }

                .persona-metric .description {
                    color: #6c757d;
                    font-size: 14px;
                    margin-top: 5px;
                }
            </style>
        `;
    }

    /**
     * Attach event listeners to the persona switcher
     */
    attachEventListeners() {
        // Persona tab switching
        document.querySelectorAll('.persona-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const persona = e.currentTarget.dataset.persona;
                this.switchPersona(persona);
            });
        });

        // Customization toggle
        const customizeBtn = document.getElementById('customizePersona');
        if (customizeBtn) {
            customizeBtn.addEventListener('click', () => {
                this.toggleCustomization();
            });
        }

        // Apply customization
        const applyBtn = document.getElementById('applyCustomization');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                this.applyCustomization();
            });
        }

        // Reset customization
        const resetBtn = document.getElementById('resetCustomization');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetCustomization();
            });
        }
    }

    /**
     * Switch to a different persona
     */
    async switchPersona(persona) {
        if (persona === this.currentPersona) return;

        this.currentPersona = persona;
        
        // Update UI
        this.updatePersonaUI();
        
        // Load persona-specific dashboard
        await this.loadPersonaDashboard();
        
        // Trigger persona change event
        this.dispatchPersonaChangeEvent(persona);
    }

    /**
     * Update the persona UI elements
     */
    updatePersonaUI() {
        // Update active tab
        document.querySelectorAll('.persona-tab').forEach(tab => {
            const isActive = tab.dataset.persona === this.currentPersona;
            tab.classList.toggle('active', isActive);
            
            if (isActive) {
                const persona = this.personaProfiles[this.currentPersona];
                tab.style.borderBottom = `3px solid ${persona.color}`;
            } else {
                tab.style.borderBottom = '3px solid transparent';
            }
        });

        // Update context description
        const description = document.querySelector('.context-description');
        if (description) {
            description.textContent = this.personaProfiles[this.currentPersona].description;
        }

        // Update body class for persona-specific styling
        document.body.className = document.body.className.replace(/\w+-view/g, '');
        document.body.classList.add(`${this.currentPersona.replace('_', '-')}-view`);
    }

    /**
     * Load persona-specific dashboard content
     */
    async loadPersonaDashboard() {
        const dashboardContainer = document.getElementById('personaDashboard');
        if (!dashboardContainer) return;

        dashboardContainer.innerHTML = '<div class="loading">Loading persona-specific dashboard...</div>';

        try {
            // Get persona-specific dashboard from API
            const response = await window.apiClient.adaptContent(
                'dashboard',
                { content: 'main_dashboard' },
                this.currentPersona
            );

            if (response.success) {
                dashboardContainer.innerHTML = this.renderPersonaDashboard(response.adapted_content);
            } else {
                dashboardContainer.innerHTML = this.renderDefaultDashboard();
            }
        } catch (error) {
            console.error('Failed to load persona dashboard:', error);
            dashboardContainer.innerHTML = this.renderDefaultDashboard();
        }
    }

    /**
     * Render persona-specific dashboard content
     */
    renderPersonaDashboard(content) {
        const persona = this.personaProfiles[this.currentPersona];
        
        // Generate persona-specific metrics
        const metrics = this.generatePersonaMetrics();
        
        return `
            <div class="persona-dashboard-content ${this.currentPersona.replace('_', '-')}-view">
                <div class="dashboard-header">
                    <h2>${persona.icon} ${persona.name} Dashboard</h2>
                    <p>Tailored insights for your role</p>
                </div>
                
                <div class="persona-metrics">
                    ${metrics.map(metric => `
                        <div class="persona-metric">
                            <h4>${metric.title}</h4>
                            <div class="value">${metric.value}</div>
                            <div class="description">${metric.description}</div>
                        </div>
                    `).join('')}
                </div>

                <div class="persona-actions">
                    <h3>Recommended Actions</h3>
                    <div class="action-list">
                        ${this.generatePersonaActions().map(action => `
                            <div class="action-item">
                                <span class="action-icon">${action.icon}</span>
                                <span class="action-text">${action.text}</span>
                                <span class="action-priority ${action.priority}">${action.priority.toUpperCase()}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <style>
                .dashboard-header {
                    text-align: center;
                    margin-bottom: 30px;
                }

                .dashboard-header h2 {
                    color: var(--primary-color);
                    margin: 0 0 10px 0;
                }

                .persona-metrics {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 15px;
                    margin-bottom: 30px;
                }

                .action-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .action-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: var(--secondary-color);
                    border-radius: 8px;
                    border-left: 4px solid var(--primary-color);
                }

                .action-icon {
                    font-size: 18px;
                }

                .action-text {
                    flex: 1;
                    font-weight: 500;
                }

                .action-priority {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: bold;
                }

                .action-priority.high {
                    background: #dc3545;
                    color: white;
                }

                .action-priority.medium {
                    background: #ffc107;
                    color: #212529;
                }

                .action-priority.low {
                    background: #28a745;
                    color: white;
                }
            </style>
        `;
    }

    /**
     * Generate persona-specific metrics
     */
    generatePersonaMetrics() {
        const metricsMap = {
            'qa_manager': [
                { title: 'Risk Score', value: '7.2/10', description: 'Current testing risk level across all projects' },
                { title: 'Budget Utilization', value: '73%', description: 'Testing budget used this quarter' },
                { title: 'Coverage Target', value: '89%', description: 'Test coverage achievement vs. target' },
                { title: 'Team Productivity', value: '+24%', description: 'Improvement in testing efficiency' }
            ],
            'developer': [
                { title: 'Code Coverage', value: '89.2%', description: 'Percentage of code covered by automated tests' },
                { title: 'Build Success Rate', value: '94.7%', description: 'Successful builds in the last 30 days' },
                { title: 'Performance Score', value: '8.6/10', description: 'Application performance benchmarks' },
                { title: 'Technical Debt', value: '14 hours', description: 'Estimated time to resolve technical debt' }
            ],
            'business_user': [
                { title: 'Process Efficiency', value: '+31%', description: 'Improvement in business process speed' },
                { title: 'User Satisfaction', value: '4.7/5', description: 'End user satisfaction with system quality' },
                { title: 'Business Impact', value: '$2.1M', description: 'Annual savings from quality improvements' },
                { title: 'Compliance Score', value: '98%', description: 'Regulatory compliance achievement' }
            ]
        };

        return metricsMap[this.currentPersona] || [];
    }

    /**
     * Generate persona-specific recommended actions
     */
    generatePersonaActions() {
        const actionsMap = {
            'qa_manager': [
                { icon: '⚠️', text: 'Review high-risk test scenarios for ME21N transaction', priority: 'high' },
                { icon: '📊', text: 'Analyze quarterly testing budget variance', priority: 'medium' },
                { icon: '👥', text: 'Schedule team training on automation tools', priority: 'medium' },
                { icon: '📈', text: 'Update executive dashboard metrics', priority: 'low' }
            ],
            'developer': [
                { icon: '🔧', text: 'Optimize slow-running integration tests', priority: 'high' },
                { icon: '📝', text: 'Update API documentation for testing framework', priority: 'medium' },
                { icon: '🚀', text: 'Deploy performance monitoring improvements', priority: 'medium' },
                { icon: '🔍', text: 'Review code coverage gaps in utility modules', priority: 'low' }
            ],
            'business_user': [
                { icon: '📋', text: 'Validate new procurement workflow changes', priority: 'high' },
                { icon: '✅', text: 'Approve updated test scenarios for user acceptance', priority: 'medium' },
                { icon: '📞', text: 'Provide feedback on system usability improvements', priority: 'medium' },
                { icon: '🎯', text: 'Review business impact metrics for stakeholders', priority: 'low' }
            ]
        };

        return actionsMap[this.currentPersona] || [];
    }

    /**
     * Render default dashboard when API fails
     */
    renderDefaultDashboard() {
        return `
            <div class="default-dashboard">
                <h3>Dashboard Loading...</h3>
                <p>Default ${this.personaProfiles[this.currentPersona].name} view will be displayed here.</p>
                <div class="default-metrics">
                    ${this.generatePersonaMetrics().map(metric => `
                        <div class="persona-metric">
                            <h4>${metric.title}</h4>
                            <div class="value">${metric.value}</div>
                            <div class="description">${metric.description}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Toggle customization panel
     */
    toggleCustomization() {
        const panel = document.getElementById('personaCustomization');
        if (panel) {
            const isVisible = panel.style.display !== 'none';
            panel.style.display = isVisible ? 'none' : 'block';
        }
    }

    /**
     * Apply customization settings
     */
    applyCustomization() {
        const checkboxes = document.querySelectorAll('#personaCustomization input[type="checkbox"]');
        const selectedFocus = Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        // Save customization
        this.personaProfiles[this.currentPersona].focus = selectedFocus;
        
        // Reload dashboard with new settings
        this.loadPersonaDashboard();
        
        // Hide customization panel
        this.toggleCustomization();
    }

    /**
     * Reset customization to defaults
     */
    resetCustomization() {
        // Reset to default focus areas
        const defaults = {
            'qa_manager': ['risk', 'budget', 'timeline', 'coverage'],
            'developer': ['technical', 'performance', 'integration', 'debug'],
            'business_user': ['process', 'workflow', 'business_impact', 'outcomes']
        };

        this.personaProfiles[this.currentPersona].focus = defaults[this.currentPersona];
        
        // Update checkboxes
        const checkboxes = document.querySelectorAll('#personaCustomization input[type="checkbox"]');
        checkboxes.forEach(cb => {
            cb.checked = defaults[this.currentPersona].includes(cb.value);
        });
    }

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Listen for content adaptation requests
        document.addEventListener('adaptContent', (event) => {
            this.adaptContentForPersona(event.detail);
        });
    }

    /**
     * Adapt content based on current persona
     */
    async adaptContentForPersona(content) {
        if (!content) return content;

        try {
            const response = await window.apiClient.adaptContent(
                content.type || 'text',
                content,
                this.currentPersona
            );

            if (response.success) {
                return response.adapted_content;
            }
        } catch (error) {
            console.error('Content adaptation failed:', error);
        }

        return content;
    }

    /**
     * Dispatch persona change event
     */
    dispatchPersonaChangeEvent(persona) {
        const event = new CustomEvent('personaChanged', {
            detail: {
                persona: persona,
                profile: this.personaProfiles[persona]
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * Get current persona
     */
    getCurrentPersona() {
        return this.currentPersona;
    }

    /**
     * Get persona profile
     */
    getPersonaProfile(persona = null) {
        return this.personaProfiles[persona || this.currentPersona];
    }
}

// Global instance
window.personaSwitcher = new PersonaSwitcher();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('personaSwitcher');
    if (container) {
        window.personaSwitcher.init('personaSwitcher');
    }
}); 
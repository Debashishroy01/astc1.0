/**
 * Test Execution Results Component
 * Real-time test execution monitoring with auto-healing and results analysis
 */

class TestExecutionResults {
    constructor() {
        this.executions = [];
        this.activeExecutions = [];
        this.updateInterval = null;
        this.selectedExecution = null;
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadExecutionHistory();
        this.startRealTimeMonitoring();
    }

    initializeElements() {
        this.executionsList = document.getElementById('executionsList');
        this.executionDetails = document.getElementById('executionDetails');
        this.summaryStats = document.getElementById('executionSummaryStats');
        this.realTimeStats = document.getElementById('realTimeStats');
        this.autoHealingPanel = document.getElementById('autoHealingPanel');
    }

    attachEventListeners() {
        // Filter controls
        const statusFilter = document.getElementById('executionStatusFilter');
        const transactionFilter = document.getElementById('executionTransactionFilter');
        
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.applyFilters());
        }
        
        if (transactionFilter) {
            transactionFilter.addEventListener('change', () => this.applyFilters());
        }

        // Auto-refresh toggle
        const autoRefreshToggle = document.getElementById('autoRefreshToggle');
        if (autoRefreshToggle) {
            autoRefreshToggle.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.startRealTimeMonitoring();
                } else {
                    this.stopRealTimeMonitoring();
                }
            });
        }
    }

    async loadExecutionHistory() {
        try {
            const response = await api.getExecutionHistory();
            
            if (response.success) {
                this.executions = response.data.executions || [];
                this.renderExecutionsList();
                this.updateSummaryStats(response.data.summary_stats);
                this.updateRealTimeStats(response.data.real_time_monitoring);
            }
        } catch (error) {
            console.error('Failed to load execution history:', error);
            this.showError('Failed to load execution history');
        }
    }

    startRealTimeMonitoring() {
        if (this.updateInterval) return;
        
        // Update every 5 seconds
        this.updateInterval = setInterval(async () => {
            await this.refreshExecutionData();
        }, 5000);
    }

    stopRealTimeMonitoring() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    async refreshExecutionData() {
        try {
            const response = await api.getExecutionHistory();
            
            if (response.success) {
                const newExecutions = response.data.executions || [];
                
                // Check for new or updated executions
                this.updateExecutionData(newExecutions);
                this.updateRealTimeStats(response.data.real_time_monitoring);
                
                // Update selected execution if it's running
                if (this.selectedExecution && this.selectedExecution.status === 'running') {
                    const updated = newExecutions.find(e => e.execution_id === this.selectedExecution.execution_id);
                    if (updated) {
                        this.selectedExecution = updated;
                        this.renderExecutionDetails(updated);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to refresh execution data:', error);
        }
    }

    updateExecutionData(newExecutions) {
        // Find newly completed or updated executions
        const updatedIds = [];
        
        newExecutions.forEach(newExec => {
            const existing = this.executions.find(e => e.execution_id === newExec.execution_id);
            
            if (!existing) {
                // New execution
                this.executions.unshift(newExec);
                updatedIds.push(newExec.execution_id);
            } else if (existing.status !== newExec.status || existing.current_step !== newExec.current_step) {
                // Updated execution
                Object.assign(existing, newExec);
                updatedIds.push(newExec.execution_id);
            }
        });
        
        if (updatedIds.length > 0) {
            this.renderExecutionsList();
            this.highlightUpdatedExecutions(updatedIds);
        }
    }

    highlightUpdatedExecutions(executionIds) {
        executionIds.forEach(id => {
            const element = document.querySelector(`[data-execution-id="${id}"]`);
            if (element) {
                element.classList.add('execution-updated');
                setTimeout(() => {
                    element.classList.remove('execution-updated');
                }, 3000);
            }
        });
    }

    renderExecutionsList() {
        if (!this.executionsList) return;

        if (this.executions.length === 0) {
            this.executionsList.innerHTML = `
                <div class="no-executions-placeholder">
                    <div class="placeholder-icon">⚡</div>
                    <p>No test executions yet</p>
                    <p>Run some tests to see execution results here</p>
                </div>
            `;
            return;
        }

        const executionsHtml = this.executions.map(execution => {
            return this.renderExecutionItem(execution);
        }).join('');

        this.executionsList.innerHTML = executionsHtml;
    }

    renderExecutionItem(execution) {
        const statusIcon = this.getStatusIcon(execution.status, execution.result);
        const statusColor = this.getStatusColor(execution.status, execution.result);
        const duration = this.formatDuration(execution);
        const progress = this.calculateProgress(execution);

        return `
            <div class="execution-item" data-execution-id="${execution.execution_id}" 
                 onclick="testExecutionResults.showExecutionDetails('${execution.execution_id}')">
                <div class="execution-header">
                    <div class="execution-status">
                        <span class="status-icon" style="color: ${statusColor}">${statusIcon}</span>
                        <span class="status-text">${execution.status.toUpperCase()}</span>
                    </div>
                    <div class="execution-transaction">
                        <span class="transaction-code">${execution.transaction}</span>
                    </div>
                    <div class="execution-time">
                        <span class="duration">${duration}</span>
                    </div>
                </div>
                
                <div class="execution-content">
                    <h4 class="execution-name">${execution.test_name}</h4>
                    
                    ${execution.status === 'running' ? `
                        <div class="execution-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${progress}%"></div>
                            </div>
                            <span class="progress-text">Step ${execution.current_step || 1} of ${execution.total_steps || execution.execution_steps.length}</span>
                        </div>
                    ` : ''}
                    
                    <div class="execution-meta">
                        <span class="meta-item">
                            <strong>ID:</strong> ${execution.execution_id}
                        </span>
                        <span class="meta-item">
                            <strong>Started:</strong> ${this.formatTimestamp(execution.start_time)}
                        </span>
                        ${execution.end_time ? `
                            <span class="meta-item">
                                <strong>Completed:</strong> ${this.formatTimestamp(execution.end_time)}
                            </span>
                        ` : ''}
                    </div>
                    
                    ${execution.auto_healing ? `
                        <div class="auto-healing-indicator">
                            <span class="healing-icon">🔄</span>
                            Auto-healing applied
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    showExecutionDetails(executionId) {
        const execution = this.executions.find(e => e.execution_id === executionId);
        if (!execution) return;

        this.selectedExecution = execution;
        this.renderExecutionDetails(execution);
        
        // Highlight selected execution
        document.querySelectorAll('.execution-item').forEach(item => {
            item.classList.remove('selected');
        });
        document.querySelector(`[data-execution-id="${executionId}"]`)?.classList.add('selected');
    }

    renderExecutionDetails(execution) {
        if (!this.executionDetails) return;

        const content = `
            <div class="execution-details-content">
                <div class="execution-details-header">
                    <h3>${execution.test_name}</h3>
                    <div class="execution-badges">
                        <span class="badge badge-${execution.status}">${execution.status}</span>
                        <span class="badge badge-${execution.result || 'neutral'}">${execution.result || 'pending'}</span>
                        <span class="badge badge-transaction">${execution.transaction}</span>
                    </div>
                </div>

                <div class="execution-details-tabs">
                    <button class="tab-button active" onclick="testExecutionResults.showDetailsTab('steps')">
                        Execution Steps
                    </button>
                    <button class="tab-button" onclick="testExecutionResults.showDetailsTab('performance')">
                        Performance
                    </button>
                    <button class="tab-button" onclick="testExecutionResults.showDetailsTab('validations')">
                        Validations
                    </button>
                    ${execution.auto_healing ? `
                        <button class="tab-button" onclick="testExecutionResults.showDetailsTab('healing')">
                            Auto-Healing
                        </button>
                    ` : ''}
                </div>

                <div class="execution-details-body">
                    <div id="detailsTab-steps" class="details-tab active">
                        ${this.renderExecutionSteps(execution)}
                    </div>
                    
                    <div id="detailsTab-performance" class="details-tab">
                        ${this.renderPerformanceMetrics(execution)}
                    </div>
                    
                    <div id="detailsTab-validations" class="details-tab">
                        ${this.renderValidations(execution)}
                    </div>
                    
                    ${execution.auto_healing ? `
                        <div id="detailsTab-healing" class="details-tab">
                            ${this.renderAutoHealing(execution)}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        this.executionDetails.innerHTML = content;
    }

    renderExecutionSteps(execution) {
        const steps = execution.execution_steps || [];
        
        return `
            <div class="execution-steps">
                <h4>Execution Steps</h4>
                <div class="steps-list">
                    ${steps.map((step, index) => `
                        <div class="step-item step-${step.status}">
                            <div class="step-number">${step.step}</div>
                            <div class="step-content">
                                <div class="step-header">
                                    <span class="step-description">${step.description}</span>
                                    <span class="step-status ${step.status}">
                                        ${this.getStepStatusIcon(step.status)} ${step.status}
                                    </span>
                                    ${step.duration_ms ? `
                                        <span class="step-duration">${step.duration_ms}ms</span>
                                    ` : ''}
                                </div>
                                ${step.details ? `
                                    <div class="step-details">${step.details}</div>
                                ` : ''}
                                ${step.error_message ? `
                                    <div class="step-error">
                                        <strong>Error:</strong> ${step.error_message}
                                        ${step.error_code ? ` (${step.error_code})` : ''}
                                    </div>
                                ` : ''}
                                ${step.screenshot ? `
                                    <div class="step-screenshot">
                                        <small>📸 Screenshot: ${step.screenshot}</small>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderPerformanceMetrics(execution) {
        const metrics = execution.performance_metrics || {};
        
        return `
            <div class="performance-metrics">
                <h4>Performance Metrics</h4>
                
                <div class="metrics-grid">
                    <div class="metric-card">
                        <h5>Execution Time</h5>
                        <div class="metric-value">${this.formatDuration(execution)}</div>
                        <div class="metric-label">Total Duration</div>
                    </div>
                    
                    <div class="metric-card">
                        <h5>Response Time</h5>
                        <div class="metric-value">${metrics.response_time_avg || 'N/A'}ms</div>
                        <div class="metric-label">Average</div>
                        <div class="metric-details">
                            Min: ${metrics.response_time_min || 'N/A'}ms | 
                            Max: ${metrics.response_time_max || 'N/A'}ms
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <h5>Resource Usage</h5>
                        <div class="metric-value">${metrics.cpu_usage_avg || 'N/A'}%</div>
                        <div class="metric-label">CPU Average</div>
                        <div class="metric-details">
                            Memory: ${metrics.memory_usage_mb || 'N/A'}MB
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <h5>Network</h5>
                        <div class="metric-value">${metrics.network_latency_ms || 'N/A'}ms</div>
                        <div class="metric-label">Latency</div>
                    </div>
                </div>
                
                <div class="environment-info">
                    <h5>Environment</h5>
                    <div class="env-details">
                        <span><strong>System:</strong> ${execution.environment?.system || 'Unknown'}</span>
                        <span><strong>Client:</strong> ${execution.environment?.client || 'Unknown'}</span>
                        <span><strong>Server:</strong> ${execution.environment?.server || 'Unknown'}</span>
                        <span><strong>Response:</strong> ${execution.environment?.response_time || 'Unknown'}</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderValidations(execution) {
        const validations = execution.validations || [];
        
        return `
            <div class="validations-section">
                <h4>Test Validations</h4>
                
                ${validations.length === 0 ? `
                    <p>No validations defined for this test.</p>
                ` : `
                    <div class="validations-list">
                        ${validations.map(validation => `
                            <div class="validation-item validation-${validation.status}">
                                <div class="validation-header">
                                    <span class="validation-name">${validation.validation}</span>
                                    <span class="validation-status ${validation.status}">
                                        ${this.getValidationStatusIcon(validation.status)} ${validation.status}
                                    </span>
                                </div>
                                <div class="validation-details">
                                    <div class="validation-expected">
                                        <strong>Expected:</strong> ${validation.expected}
                                    </div>
                                    <div class="validation-actual">
                                        <strong>Actual:</strong> ${validation.actual}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        `;
    }

    renderAutoHealing(execution) {
        const healing = execution.auto_healing;
        if (!healing) return '<p>No auto-healing data available.</p>';
        
        return `
            <div class="auto-healing-section">
                <h4>Auto-Healing Analysis</h4>
                
                <div class="healing-analysis">
                    <div class="analysis-item">
                        <strong>Analysis:</strong> ${healing.analysis}
                    </div>
                    <div class="analysis-item">
                        <strong>Root Cause:</strong> ${healing.root_cause}
                    </div>
                </div>
                
                <div class="healing-recommendations">
                    <h5>Recommendations</h5>
                    <div class="recommendations-list">
                        ${healing.recommendations.map(rec => `
                            <div class="recommendation-item priority-${rec.priority}">
                                <div class="rec-header">
                                    <span class="rec-action">${rec.action}</span>
                                    <span class="rec-priority badge-${rec.priority}">${rec.priority} priority</span>
                                </div>
                                <div class="rec-details">
                                    <span class="rec-time">⏱️ ${rec.estimated_fix_time}</span>
                                    <span class="rec-automation">
                                        ${rec.automation_available ? '🤖 Automation available' : '👤 Manual action required'}
                                    </span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                ${healing.auto_retry_attempted ? `
                    <div class="auto-retry-section">
                        <h5>Auto-Retry Results</h5>
                        <div class="retry-status ${healing.auto_retry_result}">
                            <span class="retry-icon">
                                ${healing.auto_retry_result === 'success' ? '✅' : '❌'}
                            </span>
                            <span class="retry-text">Auto-retry ${healing.auto_retry_result}</span>
                        </div>
                        <div class="retry-details">
                            ${healing.auto_retry_details}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    showDetailsTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.details-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.getElementById(`detailsTab-${tabName}`)?.classList.add('active');
    }

    updateSummaryStats(stats) {
        if (!this.summaryStats || !stats) return;

        const content = `
            <div class="summary-stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${stats.total_executions}</div>
                    <div class="stat-label">Total Executions</div>
                </div>
                
                <div class="stat-card success">
                    <div class="stat-value">${stats.passed}</div>
                    <div class="stat-label">Passed</div>
                </div>
                
                <div class="stat-card error">
                    <div class="stat-value">${stats.failed}</div>
                    <div class="stat-label">Failed</div>
                </div>
                
                <div class="stat-card info">
                    <div class="stat-value">${stats.success_rate.toFixed(1)}%</div>
                    <div class="stat-label">Success Rate</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-value">${stats.average_duration.toFixed(1)}s</div>
                    <div class="stat-label">Avg Duration</div>
                </div>
                
                <div class="stat-card healing">
                    <div class="stat-value">${stats.auto_healing_success_rate.toFixed(0)}%</div>
                    <div class="stat-label">Auto-Healing Success</div>
                </div>
            </div>
        `;

        this.summaryStats.innerHTML = content;
    }

    updateRealTimeStats(stats) {
        if (!this.realTimeStats || !stats) return;

        const content = `
            <div class="real-time-stats">
                <div class="stats-header">
                    <h4>Real-Time Monitoring</h4>
                    <div class="last-updated">
                        Last updated: ${this.formatTimestamp(stats.last_updated)}
                    </div>
                </div>
                
                <div class="real-time-grid">
                    <div class="rt-stat">
                        <span class="rt-label">Active Executions:</span>
                        <span class="rt-value">${stats.active_executions}</span>
                    </div>
                    
                    <div class="rt-stat">
                        <span class="rt-label">Queue Length:</span>
                        <span class="rt-value">${stats.queue_length}</span>
                    </div>
                    
                    <div class="rt-stat">
                        <span class="rt-label">System Health:</span>
                        <span class="rt-value health-${stats.system_health}">${stats.system_health}</span>
                    </div>
                </div>
                
                <div class="resource-usage">
                    <h5>Resource Usage</h5>
                    <div class="usage-bars">
                        <div class="usage-item">
                            <span class="usage-label">CPU</span>
                            <div class="usage-bar">
                                <div class="usage-fill" style="width: ${stats.resource_usage.cpu_percent}%"></div>
                            </div>
                            <span class="usage-value">${stats.resource_usage.cpu_percent}%</span>
                        </div>
                        
                        <div class="usage-item">
                            <span class="usage-label">Memory</span>
                            <div class="usage-bar">
                                <div class="usage-fill" style="width: ${stats.resource_usage.memory_percent}%"></div>
                            </div>
                            <span class="usage-value">${stats.resource_usage.memory_percent}%</span>
                        </div>
                        
                        <div class="usage-item">
                            <span class="usage-label">Disk I/O</span>
                            <div class="usage-bar">
                                <div class="usage-fill" style="width: ${stats.resource_usage.disk_io_percent}%"></div>
                            </div>
                            <span class="usage-value">${stats.resource_usage.disk_io_percent}%</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.realTimeStats.innerHTML = content;
    }

    // Utility methods
    getStatusIcon(status, result) {
        if (status === 'running') return '⏳';
        if (status === 'completed') {
            return result === 'passed' ? '✅' : '❌';
        }
        if (status === 'failed') return '❌';
        return '⏸️';
    }

    getStatusColor(status, result) {
        if (status === 'running') return '#ffc107';
        if (status === 'completed') {
            return result === 'passed' ? '#28a745' : '#dc3545';
        }
        if (status === 'failed') return '#dc3545';
        return '#6c757d';
    }

    getStepStatusIcon(status) {
        const icons = {
            passed: '✅',
            failed: '❌',
            running: '⏳',
            pending: '⏸️'
        };
        return icons[status] || '❓';
    }

    getValidationStatusIcon(status) {
        return status === 'passed' ? '✅' : '❌';
    }

    formatDuration(execution) {
        if (execution.status === 'running') {
            const elapsed = (Date.now() - new Date(execution.start_time).getTime()) / 1000;
            return `${elapsed.toFixed(1)}s (running)`;
        }
        
        if (execution.duration_seconds) {
            return `${execution.duration_seconds.toFixed(1)}s`;
        }
        
        return 'N/A';
    }

    formatTimestamp(timestamp) {
        if (!timestamp) return 'N/A';
        
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    calculateProgress(execution) {
        if (execution.status !== 'running') return 100;
        
        const currentStep = execution.current_step || 1;
        const totalSteps = execution.total_steps || execution.execution_steps.length || 1;
        
        return Math.round((currentStep / totalSteps) * 100);
    }

    applyFilters() {
        // Implement filtering logic here
        const statusFilter = document.getElementById('executionStatusFilter')?.value;
        const transactionFilter = document.getElementById('executionTransactionFilter')?.value;
        
        // Filter and re-render list
        // Implementation depends on filter requirements
    }

    showError(message) {
        console.error(message);
        // Could show toast notification or error panel
    }

    async startTestExecution(testCaseId) {
        try {
            const response = await api.startTestExecution(testCaseId);
            
            if (response.success) {
                console.log('Test execution started:', response.data);
                await this.refreshExecutionData();
            }
        } catch (error) {
            console.error('Failed to start test execution:', error);
            this.showError('Failed to start test execution');
        }
    }

    destroy() {
        this.stopRealTimeMonitoring();
    }
}

// Global functions for HTML event handlers
function startExecution(testCaseId) {
    if (window.testExecutionResults) {
        window.testExecutionResults.startTestExecution(testCaseId);
    }
}

function retryExecution(executionId) {
    console.log('Retrying execution:', executionId);
    // Implementation for retry functionality
}

function downloadExecutionReport(executionId) {
    console.log('Downloading report for execution:', executionId);
    // Implementation for report download
}

// Initialize when DOM is ready
let testExecutionResults;

document.addEventListener('DOMContentLoaded', () => {
    testExecutionResults = new TestExecutionResults();
    window.testExecutionResults = testExecutionResults;
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TestExecutionResults;
} else {
    window.TestExecutionResults = TestExecutionResults;
} 
/**
 * Dashboard Component for ASTC
 * Handles both traditional dashboard elements and SAP Change Intelligence cards
 * Provides robust error handling to prevent appendChild errors
 */

class Dashboard {
    constructor() {
        console.log('Dashboard: Constructor called');
        this.isTraditionalDashboard = false;
        this.isMockMode = true;
        this.activities = [];
        this.metrics = {
            totalAnalyses: 0,
            totalTestCases: 0,
            dependenciesAnalyzed: 0,
            timesSaved: 0
        };
        
        // Don't initialize elements in constructor - wait for DOM ready
        this.elements = {};
        this.initialized = false;
    }

    initializeElements() {
        console.log('Dashboard: Checking for dashboard elements...');
        
        // Try to find traditional dashboard elements
        const traditionalElements = {
            totalAnalyses: document.getElementById('totalAnalyses'),
            totalTestCases: document.getElementById('totalTestCases'),
            dependenciesAnalyzed: document.getElementById('dependenciesAnalyzed'),
            timesSaved: document.getElementById('timesSaved'),
            activityList: document.getElementById('activityList')
        };

        // Check if we have traditional dashboard elements
        const hasTraditionalElements = Object.values(traditionalElements).some(el => el !== null);
        
        if (hasTraditionalElements) {
            console.log('Dashboard: Traditional dashboard elements found');
            this.isTraditionalDashboard = true;
            this.isMockMode = false;
            this.elements = traditionalElements;
            
            // Verify all elements exist
            const missingElements = [];
            Object.entries(traditionalElements).forEach(([key, element]) => {
                if (!element) {
                    missingElements.push(key);
                }
            });
            
            if (missingElements.length > 0) {
                console.warn('Dashboard: Missing traditional elements:', missingElements);
                return false;
            }
            
            console.log('Dashboard: Traditional dashboard initialized successfully');
            return true;
        } else {
            // Check for SAP Change Intelligence cards
            const intelligenceCards = document.querySelectorAll('.intelligence-card');
            if (intelligenceCards.length > 0) {
                console.log('Dashboard: SAP Change Intelligence cards found');
                this.isTraditionalDashboard = false;
                this.isMockMode = false;
                this.elements.intelligenceCards = intelligenceCards;
                console.log('Dashboard: SAP Change Intelligence mode initialized');
                return true;
            } else {
                console.log('Dashboard: No dashboard elements found, using mock mode');
                this.isTraditionalDashboard = false;
                this.isMockMode = true;
                return true; // Mock mode always succeeds
            }
        }
    }

    updateMetrics(data) {
        if (this.isMockMode) {
            console.log('Dashboard: Mock mode - metrics update ignored', data);
            return;
        }

        if (!this.isTraditionalDashboard) {
            console.log('Dashboard: SAP Change Intelligence mode - metrics update not applicable');
            return;
        }

        try {
            if (data.totalAnalyses !== undefined && this.elements.totalAnalyses) {
                this.elements.totalAnalyses.textContent = data.totalAnalyses;
                this.metrics.totalAnalyses = data.totalAnalyses;
            }
            
            if (data.totalTestCases !== undefined && this.elements.totalTestCases) {
                this.elements.totalTestCases.textContent = data.totalTestCases;
                this.metrics.totalTestCases = data.totalTestCases;
            }
            
            if (data.dependenciesAnalyzed !== undefined && this.elements.dependenciesAnalyzed) {
                this.elements.dependenciesAnalyzed.textContent = data.dependenciesAnalyzed;
                this.metrics.dependenciesAnalyzed = data.dependenciesAnalyzed;
            }
            
            if (data.timesSaved !== undefined && this.elements.timesSaved) {
                this.elements.timesSaved.textContent = data.timesSaved;
                this.metrics.timesSaved = data.timesSaved;
            }
            
            console.log('Dashboard: Metrics updated successfully');
        } catch (error) {
            console.error('Dashboard: Error updating metrics:', error);
        }
    }

    addActivity(activity) {
        if (this.isMockMode) {
            console.log('Dashboard: Mock mode - activity ignored', activity);
            this.activities.push(activity); // Store for potential future use
            return;
        }

        if (!this.isTraditionalDashboard) {
            console.log('Dashboard: SAP Change Intelligence mode - activity display not applicable');
            return;
        }

        if (!this.elements.activityList) {
            console.warn('Dashboard: Cannot add activity - activityList element not found');
            return;
        }

        try {
            const activityElement = document.createElement('div');
            activityElement.className = 'activity-item';
            activityElement.innerHTML = `
                <div class="activity-icon">${activity.icon || '📊'}</div>
                <div class="activity-content">
                    <p>${this.escapeHtml(activity.message || 'Activity')}</p>
                    <span class="activity-time">${activity.time || new Date().toLocaleTimeString()}</span>
                </div>
            `;
            
            this.elements.activityList.appendChild(activityElement);
            this.activities.push(activity);
            
            // Keep only last 10 activities
            if (this.activities.length > 10) {
                this.activities = this.activities.slice(-10);
                const activityItems = this.elements.activityList.querySelectorAll('.activity-item');
                if (activityItems.length > 10) {
                    activityItems[0].remove();
                }
            }
            
            console.log('Dashboard: Activity added successfully');
        } catch (error) {
            console.error('Dashboard: Error adding activity:', error);
        }
    }

    updateWithAnalysisData(data) {
        console.log('Dashboard: Analysis data received', data);
        
        if (this.isMockMode) {
            console.log('Dashboard: Mock mode - analysis data stored but not displayed');
            return;
        }

        try {
            // Update metrics if we have traditional dashboard
            if (this.isTraditionalDashboard && data) {
                const metrics = {};
                
                if (data.analysis) {
                    metrics.totalAnalyses = (this.metrics.totalAnalyses || 0) + 1;
                }
                
                if (data.tests && data.tests.test_suite && data.tests.test_suite.test_cases) {
                    metrics.totalTestCases = (this.metrics.totalTestCases || 0) + data.tests.test_suite.test_cases.length;
                }
                
                if (data.dependencies) {
                    metrics.dependenciesAnalyzed = (this.metrics.dependenciesAnalyzed || 0) + 1;
                }
                
                metrics.timesSaved = (this.metrics.timesSaved || 0) + 1;
                
                this.updateMetrics(metrics);
            }

            // Add activity
            const activity = {
                icon: '🤖',
                message: data.analysis ? 
                    `Analysis completed: ${data.analysis.intent || 'SAP requirement analyzed'}` :
                    'ASTC analysis completed',
                time: new Date().toLocaleTimeString()
            };
            
            this.addActivity(activity);
            
        } catch (error) {
            console.error('Dashboard: Error updating with analysis data:', error);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Utility methods for external access
    getMetrics() {
        return { ...this.metrics };
    }

    getActivities() {
        return [...this.activities];
    }

    isInitialized() {
        return this.initialized;
    }

    getMode() {
        if (this.isMockMode) return 'mock';
        if (this.isTraditionalDashboard) return 'traditional';
        return 'intelligence-cards';
    }
}

// Global dashboard instance and initialization
let dashboard = null;

// Robust initialization function
function initializeDashboard() {
    console.log('Dashboard: Starting initialization...');
    
    try {
        if (!dashboard) {
            dashboard = new Dashboard();
        }
        
        const success = dashboard.initializeElements();
        dashboard.initialized = success;
        
        // Always create global dashboard object to prevent errors
        window.dashboard = {
            updateWithAnalysisData: function(data) {
                try {
                    if (dashboard) {
                        dashboard.updateWithAnalysisData(data);
                    } else {
                        console.log('Dashboard: No dashboard instance - data ignored', data);
                    }
                } catch (error) {
                    console.error('Dashboard: Error in updateWithAnalysisData:', error);
                }
            },
            
            addActivity: function(activity) {
                try {
                    if (dashboard) {
                        dashboard.addActivity(activity);
                    } else {
                        console.log('Dashboard: No dashboard instance - activity ignored', activity);
                    }
                } catch (error) {
                    console.error('Dashboard: Error in addActivity:', error);
                }
            },
            
            updateMetrics: function(metrics) {
                try {
                    if (dashboard) {
                        dashboard.updateMetrics(metrics);
                    } else {
                        console.log('Dashboard: No dashboard instance - metrics ignored', metrics);
                    }
                } catch (error) {
                    console.error('Dashboard: Error in updateMetrics:', error);
                }
            },
            
            getStatus: function() {
                return dashboard ? {
                    initialized: dashboard.isInitialized(),
                    mode: dashboard.getMode(),
                    metrics: dashboard.getMetrics(),
                    activities: dashboard.getActivities()
                } : {
                    initialized: false,
                    mode: 'none',
                    metrics: {},
                    activities: []
                };
            }
        };
        
        console.log('Dashboard: Global dashboard object created successfully');
        console.log('Dashboard: Mode =', dashboard.getMode());
        
        return dashboard;
        
    } catch (error) {
        console.error('Dashboard: Initialization error:', error);
        
        // Create emergency fallback dashboard
        window.dashboard = {
            updateWithAnalysisData: (data) => console.log('Dashboard: Emergency fallback - analysis data ignored', data),
            addActivity: (activity) => console.log('Dashboard: Emergency fallback - activity ignored', activity),
            updateMetrics: (metrics) => console.log('Dashboard: Emergency fallback - metrics ignored', metrics),
            getStatus: () => ({ initialized: false, mode: 'error', metrics: {}, activities: [] })
        };
        
        return null;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard: DOM ready, initializing...');
    initializeDashboard();
});

// Also initialize immediately if DOM is already ready
if (document.readyState === 'loading') {
    console.log('Dashboard: DOM still loading, waiting for DOMContentLoaded');
} else {
    console.log('Dashboard: DOM already ready, initializing immediately');
    initializeDashboard();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Dashboard, initializeDashboard };
} 
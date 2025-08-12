"""
ASTC Agents Package
Agentic SAP Testing Copilot - Specialized Agent Implementations

This package contains the specialized agents for SAP testing intelligence:
- SAPIntelligenceAgent: Natural language processing and SAP domain analysis  
- TestGenerationAgent: Test case creation and validation
- DependencyAnalysisAgent: SAP dependency graph analysis and impact assessment
- TestExecutionAgent: Real test execution with simulation and auto-healing
- ScriptGenerationAgent: Automated SAP BAPI/GUI script generation
- PersonaAdaptationAgent: Role-based content adaptation and dashboard generation
- DependencyIntelligenceAgent: Advanced dependency analysis with interactive graphs and risk intelligence
- BusinessImpactAgent: ROI calculation, competitive analysis, and executive business case generation
"""

__version__ = "1.0.0"
__author__ = "ASTC Development Team"

from .sap_intelligence import SAPIntelligenceAgent
from .test_generation import TestGenerationAgent  
from .dependency_analysis import DependencyAnalysisAgent
from .test_execution import TestExecutionAgent
from .script_generation import ScriptGenerationAgent
from .persona_adaptation import PersonaAdaptationAgent
from .dependency_intelligence import DependencyIntelligenceAgent
from .business_impact import BusinessImpactAgent

__all__ = [
    'SAPIntelligenceAgent',
    'TestGenerationAgent',
    'DependencyAnalysisAgent',
    'TestExecutionAgent',
    'ScriptGenerationAgent',
    'PersonaAdaptationAgent',
    'DependencyIntelligenceAgent',
    'BusinessImpactAgent'
] 
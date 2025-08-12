"""
ASTC Framework Package
Agentic SAP Testing Copilot - Mock Agent Framework

This package contains the core framework components for simulating
multi-agent communication and workflow orchestration.
"""

__version__ = "1.0.0"
__author__ = "ASTC Development Team"

from .mock_neuro_san import MockAgentFramework, Agent
from .communication import MessageRouter, AgentMessage

__all__ = [
    'MockAgentFramework',
    'Agent', 
    'MessageRouter',
    'AgentMessage'
] 
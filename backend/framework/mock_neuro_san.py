"""
Mock Neuro-SAN Agent Framework
Simulates multi-agent architecture for SAP testing intelligence
"""

import asyncio
import json
import uuid
import time
from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional
from enum import Enum

# Import the agent monitor
from .agent_monitor import get_agent_monitor, AgentState


class Agent(ABC):
    """
    Abstract base class for all ASTC agents
    Now includes real-time monitoring integration
    """
    
    def __init__(self, agent_id: str, name: str, capabilities: List[str]):
        self.agent_id = agent_id
        self.name = name
        self.capabilities = capabilities
        self.message_history: List[Dict[str, Any]] = []
        self.is_processing = False
        
        # Register with monitor
        monitor = get_agent_monitor()
        monitor.register_agent(self.agent_id, self.name, self.capabilities)
        
        print(f"🤖 Agent initialized: {self.name} ({self.agent_id})")
    
    @abstractmethod
    async def process_message(self, message: Dict[str, Any]) -> Dict[str, Any]:
        """Process an incoming message and return a response"""
        pass
    
    async def send_message_to_agent(self, target_agent_id: str, message: Dict[str, Any]) -> Dict[str, Any]:
        """Send a message to another agent with monitoring"""
        monitor = get_agent_monitor()
        message_id = str(uuid.uuid4())
        
        # Log message being sent
        monitor.log_message_sent(
            from_agent=self.agent_id,
            to_agent=target_agent_id,
            message_id=message_id,
            message_type=message.get('action', 'unknown'),
            payload_size=len(json.dumps(message, default=str))
        )
        
        # Simulate sending (in a real system, this would be actual network communication)
        start_time = time.time()
        
        try:
            # Get target agent from framework
            framework = get_framework()
            if target_agent_id in framework.agents:
                target_agent = framework.agents[target_agent_id]
                
                # Log message being received
                monitor.log_message_received(
                    to_agent=target_agent_id,
                    from_agent=self.agent_id,
                    message_id=message_id,
                    message_type=message.get('action', 'unknown'),
                    payload_size=len(json.dumps(message, default=str))
                )
                
                # Process the message
                response = await target_agent.process_message(message)
                
                processing_time = time.time() - start_time
                
                # Log successful completion
                monitor.log_processing_complete(
                    agent_id=target_agent_id,
                    task_type=message.get('action', 'unknown'),
                    processing_time=processing_time,
                    result_summary={"status": "success", "response_size": len(json.dumps(response, default=str))}
                )
                
                return response
            else:
                # Log error
                monitor.log_processing_error(
                    agent_id=self.agent_id,
                    task_type="send_message",
                    error_message=f"Target agent {target_agent_id} not found"
                )
                return {"success": False, "error": f"Agent {target_agent_id} not found"}
                
        except Exception as e:
            # Log error
            monitor.log_processing_error(
                agent_id=target_agent_id,
                task_type=message.get('action', 'unknown'),
                error_message=str(e)
            )
            return {"success": False, "error": str(e)}
    
    def start_processing(self, task_type: str, task_details: Dict[str, Any]):
        """Mark agent as starting processing with monitoring"""
        self.is_processing = True
        monitor = get_agent_monitor()
        monitor.log_processing_start(self.agent_id, task_type, task_details)
    
    def complete_processing(self, task_type: str, processing_time: float, result_summary: Dict[str, Any]):
        """Mark agent as completing processing with monitoring"""
        self.is_processing = False
        monitor = get_agent_monitor()
        monitor.log_processing_complete(self.agent_id, task_type, processing_time, result_summary)
    
    def error_processing(self, task_type: str, error_message: str):
        """Mark agent as having processing error with monitoring"""
        self.is_processing = False
        monitor = get_agent_monitor()
        monitor.log_processing_error(self.agent_id, task_type, error_message)


class MockAgentFramework:
    """
    Mock implementation of the Neuro-SAN agent framework
    Now includes comprehensive monitoring integration
    """
    
    def __init__(self):
        self.agents: Dict[str, Agent] = {}
        self.message_router = None
        self.conversation_manager = None
        
        print("🚀 ASTC Agent Framework initialized with real-time monitoring")
    
    def register_agent(self, agent: Agent):
        """Register an agent with the framework"""
        self.agents[agent.agent_id] = agent
        print(f"✅ Agent registered: {agent.name} ({agent.agent_id})")
    
    def get_agent(self, agent_id: str) -> Optional[Agent]:
        """Get an agent by ID"""
        return self.agents.get(agent_id)
    
    def list_agents(self) -> List[Dict[str, Any]]:
        """List all registered agents with their current status"""
        monitor = get_agent_monitor()
        real_time_state = monitor.get_real_time_state()
        
        agents_list = []
        for agent_id, agent in self.agents.items():
            agent_state = real_time_state["agents"].get(agent_id, {})
            agents_list.append({
                "id": agent_id,
                "name": agent.name,
                "capabilities": agent.capabilities,
                "is_processing": agent.is_processing,
                "current_state": agent_state.get("state", "idle"),
                "metrics": agent_state.get("metrics", {}),
                "message_count": len(agent.message_history)
            })
        
        return agents_list
    
    def get_all_agents_status(self) -> List[Dict[str, Any]]:
        """Get all registered agents with their status (compatible with server expectations)"""
        monitor = get_agent_monitor()
        real_time_state = monitor.get_real_time_state()
        
        agents_status = []
        for agent_id, agent in self.agents.items():
            agent_state = real_time_state["agents"].get(agent_id, {})
            current_state = agent_state.get("state", "idle")
            
            # Map current_state to status expected by server
            status = "active" if current_state in ["processing", "busy"] or agent.is_processing else "idle"
            
            agents_status.append({
                "id": agent_id,
                "name": agent.name,
                "capabilities": agent.capabilities,
                "is_processing": agent.is_processing,
                "status": status,
                "current_state": current_state,
                "metrics": agent_state.get("metrics", {}),
                "message_count": len(agent.message_history)
            })
        
        return agents_status
    
    def get_framework_status(self) -> Dict[str, Any]:
        """Get overall framework status including agents and monitoring"""
        monitor = get_agent_monitor()
        real_time_data = monitor.get_real_time_state()
        
        total_agents = len(self.agents)
        active_agents = sum(1 for agent in self.agents.values() if agent.is_processing)
        total_messages = sum(len(agent.message_history) for agent in self.agents.values())
        
        return {
            "framework_version": "1.0.0",
            "status": "operational",
            "total_agents": total_agents,
            "active_agents": active_agents,
            "total_messages_processed": total_messages,
            "uptime_seconds": real_time_data.get("uptime_seconds", 0),
            "agents": [
                {
                    "id": agent_id,
                    "name": agent.name,
                    "status": "active" if agent.is_processing else "idle",
                    "capabilities": agent.capabilities
                }
                for agent_id, agent in self.agents.items()
            ],
            "monitoring": {
                "real_time_tracking": True,
                "message_flow_tracking": True,
                "performance_metrics": True
            }
        }
    
    async def route_message(self, from_agent_id: str, to_agent_id: str, message: Dict[str, Any]) -> Dict[str, Any]:
        """Route a message between agents with full monitoring"""
        monitor = get_agent_monitor()
        
        if from_agent_id in self.agents and to_agent_id in self.agents:
            from_agent = self.agents[from_agent_id]
            return await from_agent.send_message_to_agent(to_agent_id, message)
        else:
            error_msg = f"One or both agents not found: {from_agent_id}, {to_agent_id}"
            monitor.log_processing_error("framework", "route_message", error_msg)
            return {"success": False, "error": error_msg}
    
    def start_workflow(self, workflow_id: str, workflow_type: str, participating_agents: List[str], workflow_data: Dict[str, Any]):
        """Start a multi-agent workflow with monitoring"""
        monitor = get_agent_monitor()
        monitor.start_workflow(workflow_id, workflow_type, participating_agents, workflow_data)
    
    def complete_workflow(self, workflow_id: str, result_summary: Dict[str, Any]):
        """Complete a multi-agent workflow with monitoring"""
        monitor = get_agent_monitor()
        monitor.complete_workflow(workflow_id, result_summary)
    
    def get_real_time_monitoring_data(self) -> Dict[str, Any]:
        """Get real-time monitoring data for visualization"""
        monitor = get_agent_monitor()
        return monitor.get_real_time_state()
    
    def get_agent_network_topology(self) -> Dict[str, Any]:
        """Get agent network topology for visualization"""
        monitor = get_agent_monitor()
        return monitor.get_agent_network_topology()


# Global framework instance
_global_framework: Optional[MockAgentFramework] = None


def get_framework() -> MockAgentFramework:
    """Get the global framework instance"""
    global _global_framework
    if _global_framework is None:
        _global_framework = MockAgentFramework()
    return _global_framework


def initialize_framework() -> MockAgentFramework:
    """Initialize the global framework"""
    global _global_framework
    _global_framework = MockAgentFramework()
    return _global_framework 
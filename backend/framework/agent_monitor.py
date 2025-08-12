"""
Agent Monitor System for Real-Time Visualization
Tracks all agent activities, messages, and collaboration workflows
"""

import json
import time
import threading
from datetime import datetime
from enum import Enum
from typing import Dict, List, Any, Optional, Set
from dataclasses import dataclass, asdict
from collections import defaultdict, deque


class AgentState(Enum):
    """Agent processing states"""
    IDLE = "idle"
    PROCESSING = "processing"
    WAITING = "waiting"
    COMPLETE = "complete"
    ERROR = "error"
    COMMUNICATING = "communicating"


class MessageDirection(Enum):
    """Message flow direction"""
    INCOMING = "incoming"
    OUTGOING = "outgoing"
    INTERNAL = "internal"


@dataclass
class AgentActivity:
    """Single agent activity record"""
    agent_id: str
    timestamp: str
    activity_type: str  # "message_sent", "message_received", "state_change", "processing_start", etc.
    state: AgentState
    details: Dict[str, Any]
    message_id: Optional[str] = None
    target_agent: Optional[str] = None
    processing_time: Optional[float] = None


@dataclass
class MessageFlow:
    """Message flow between agents"""
    message_id: str
    from_agent: str
    to_agent: str
    message_type: str
    timestamp: str
    direction: MessageDirection
    payload_size: int
    processing_time: Optional[float] = None
    response_message_id: Optional[str] = None


@dataclass
class AgentMetrics:
    """Agent performance metrics"""
    agent_id: str
    total_messages_sent: int = 0
    total_messages_received: int = 0
    average_processing_time: float = 0.0
    current_state: AgentState = AgentState.IDLE
    last_activity: Optional[str] = None
    active_collaborations: Set[str] = None
    error_count: int = 0
    
    def __post_init__(self):
        if self.active_collaborations is None:
            self.active_collaborations = set()


class AgentMonitor:
    """
    Real-time agent monitoring and visualization system
    Tracks all agent activities, message flows, and collaboration patterns
    """
    
    def __init__(self, max_history_size: int = 1000):
        self.max_history_size = max_history_size
        
        # Activity tracking
        self.activity_history: deque = deque(maxlen=max_history_size)
        self.message_flows: deque = deque(maxlen=max_history_size)
        
        # Agent state tracking
        self.agent_states: Dict[str, AgentState] = {}
        self.agent_metrics: Dict[str, AgentMetrics] = {}
        self.agent_relationships: Dict[str, Set[str]] = defaultdict(set)
        
        # Real-time tracking
        self.active_workflows: Dict[str, Dict[str, Any]] = {}
        self.message_chains: Dict[str, List[str]] = defaultdict(list)
        
        # WebSocket clients for real-time updates
        self.websocket_clients: Set[Any] = set()
        
        # Thread safety
        self.lock = threading.RLock()
        
        print("🔍 Agent Monitor initialized - Real-time tracking active")
    
    def register_agent(self, agent_id: str, agent_name: str, capabilities: List[str]):
        """Register a new agent with the monitor"""
        with self.lock:
            self.agent_states[agent_id] = AgentState.IDLE
            self.agent_metrics[agent_id] = AgentMetrics(agent_id=agent_id)
            
            # Log registration activity
            activity = AgentActivity(
                agent_id=agent_id,
                timestamp=self._get_timestamp(),
                activity_type="agent_registered",
                state=AgentState.IDLE,
                details={
                    "agent_name": agent_name,
                    "capabilities": capabilities,
                    "registration_time": self._get_timestamp()
                }
            )
            
            self.activity_history.append(activity)
            self._broadcast_activity(activity)
            
            print(f"📋 Agent registered: {agent_id} ({agent_name})")
    
    def log_message_sent(self, from_agent: str, to_agent: str, message_id: str, 
                        message_type: str, payload_size: int):
        """Log a message being sent between agents"""
        with self.lock:
            timestamp = self._get_timestamp()
            
            # Update agent state to communicating
            self._update_agent_state(from_agent, AgentState.COMMUNICATING)
            
            # Create message flow record
            message_flow = MessageFlow(
                message_id=message_id,
                from_agent=from_agent,
                to_agent=to_agent,
                message_type=message_type,
                timestamp=timestamp,
                direction=MessageDirection.OUTGOING,
                payload_size=payload_size
            )
            
            self.message_flows.append(message_flow)
            
            # Update metrics
            if from_agent not in self.agent_metrics:
                self.agent_metrics[from_agent] = AgentMetrics(agent_id=from_agent)
            self.agent_metrics[from_agent].total_messages_sent += 1
            
            # Track relationships
            self.agent_relationships[from_agent].add(to_agent)
            self.agent_relationships[to_agent].add(from_agent)
            
            # Log activity
            activity = AgentActivity(
                agent_id=from_agent,
                timestamp=timestamp,
                activity_type="message_sent",
                state=AgentState.COMMUNICATING,
                details={
                    "to_agent": to_agent,
                    "message_type": message_type,
                    "payload_size": payload_size
                },
                message_id=message_id,
                target_agent=to_agent
            )
            
            self.activity_history.append(activity)
            self._broadcast_message_flow(message_flow)
            self._broadcast_activity(activity)
    
    def log_message_received(self, to_agent: str, from_agent: str, message_id: str, 
                           message_type: str, payload_size: int):
        """Log a message being received by an agent"""
        with self.lock:
            timestamp = self._get_timestamp()
            
            # Update agent state to processing
            self._update_agent_state(to_agent, AgentState.PROCESSING)
            
            # Update metrics
            if to_agent not in self.agent_metrics:
                self.agent_metrics[to_agent] = AgentMetrics(agent_id=to_agent)
            self.agent_metrics[to_agent].total_messages_received += 1
            
            # Log activity
            activity = AgentActivity(
                agent_id=to_agent,
                timestamp=timestamp,
                activity_type="message_received",
                state=AgentState.PROCESSING,
                details={
                    "from_agent": from_agent,
                    "message_type": message_type,
                    "payload_size": payload_size
                },
                message_id=message_id,
                target_agent=from_agent
            )
            
            self.activity_history.append(activity)
            self._broadcast_activity(activity)
    
    def log_processing_start(self, agent_id: str, task_type: str, task_details: Dict[str, Any]):
        """Log when an agent starts processing"""
        with self.lock:
            self._update_agent_state(agent_id, AgentState.PROCESSING)
            
            activity = AgentActivity(
                agent_id=agent_id,
                timestamp=self._get_timestamp(),
                activity_type="processing_start",
                state=AgentState.PROCESSING,
                details={
                    "task_type": task_type,
                    "task_details": task_details
                }
            )
            
            self.activity_history.append(activity)
            self._broadcast_activity(activity)
    
    def log_processing_complete(self, agent_id: str, task_type: str, 
                              processing_time: float, result_summary: Dict[str, Any]):
        """Log when an agent completes processing"""
        with self.lock:
            self._update_agent_state(agent_id, AgentState.COMPLETE)
            
            # Update metrics
            if agent_id in self.agent_metrics:
                current_avg = self.agent_metrics[agent_id].average_processing_time
                count = (self.agent_metrics[agent_id].total_messages_sent + 
                        self.agent_metrics[agent_id].total_messages_received)
                if count > 0:
                    self.agent_metrics[agent_id].average_processing_time = (
                        (current_avg * (count - 1) + processing_time) / count
                    )
                else:
                    self.agent_metrics[agent_id].average_processing_time = processing_time
            
            activity = AgentActivity(
                agent_id=agent_id,
                timestamp=self._get_timestamp(),
                activity_type="processing_complete",
                state=AgentState.COMPLETE,
                details={
                    "task_type": task_type,
                    "result_summary": result_summary,
                    "success": True
                },
                processing_time=processing_time
            )
            
            self.activity_history.append(activity)
            self._broadcast_activity(activity)
            
            # Return to idle after brief delay
            threading.Timer(1.0, lambda: self._update_agent_state(agent_id, AgentState.IDLE)).start()
    
    def log_processing_error(self, agent_id: str, task_type: str, error_message: str):
        """Log when an agent encounters an error"""
        with self.lock:
            self._update_agent_state(agent_id, AgentState.ERROR)
            
            # Update error count
            if agent_id in self.agent_metrics:
                self.agent_metrics[agent_id].error_count += 1
            
            activity = AgentActivity(
                agent_id=agent_id,
                timestamp=self._get_timestamp(),
                activity_type="processing_error",
                state=AgentState.ERROR,
                details={
                    "task_type": task_type,
                    "error_message": error_message,
                    "success": False
                }
            )
            
            self.activity_history.append(activity)
            self._broadcast_activity(activity)
            
            # Return to idle after error
            threading.Timer(2.0, lambda: self._update_agent_state(agent_id, AgentState.IDLE)).start()
    
    def start_workflow(self, workflow_id: str, workflow_type: str, 
                      participating_agents: List[str], workflow_data: Dict[str, Any]):
        """Start tracking a multi-agent workflow"""
        with self.lock:
            self.active_workflows[workflow_id] = {
                "workflow_type": workflow_type,
                "participating_agents": participating_agents,
                "start_time": self._get_timestamp(),
                "status": "active",
                "workflow_data": workflow_data,
                "message_chain": []
            }
            
            # Broadcast workflow start
            self._broadcast_workflow_update(workflow_id, "workflow_started")
    
    def complete_workflow(self, workflow_id: str, result_summary: Dict[str, Any]):
        """Complete a multi-agent workflow"""
        with self.lock:
            if workflow_id in self.active_workflows:
                self.active_workflows[workflow_id]["status"] = "completed"
                self.active_workflows[workflow_id]["end_time"] = self._get_timestamp()
                self.active_workflows[workflow_id]["result_summary"] = result_summary
                
                self._broadcast_workflow_update(workflow_id, "workflow_completed")
    
    def get_real_time_state(self) -> Dict[str, Any]:
        """Get current real-time state for visualization"""
        with self.lock:
            # Helper function to make objects JSON serializable
            def make_json_serializable(obj):
                if isinstance(obj, dict):
                    return {k: make_json_serializable(v) for k, v in obj.items()}
                elif isinstance(obj, list):
                    return [make_json_serializable(item) for item in obj]
                elif isinstance(obj, AgentState):
                    return obj.value
                elif isinstance(obj, MessageDirection):
                    return obj.value
                elif isinstance(obj, set):
                    return list(obj)
                else:
                    return obj
            
            # Convert agent metrics to dict and make JSON serializable
            serializable_agents = {}
            for agent_id, state in self.agent_states.items():
                metrics = self.agent_metrics.get(agent_id, AgentMetrics(agent_id=agent_id))
                metrics_dict = asdict(metrics)
                serializable_agents[agent_id] = {
                    "state": state.value,
                    "metrics": make_json_serializable(metrics_dict)
                }
            
            # Convert activities and message flows to be JSON serializable
            serializable_activities = []
            for activity in list(self.activity_history)[-20:]:
                activity_dict = asdict(activity)
                serializable_activities.append(make_json_serializable(activity_dict))
            
            serializable_message_flows = []
            for flow in list(self.message_flows)[-20:]:
                flow_dict = asdict(flow)
                serializable_message_flows.append(make_json_serializable(flow_dict))
            
            return {
                "timestamp": self._get_timestamp(),
                "agents": serializable_agents,
                "relationships": {
                    agent_id: list(connections) 
                    for agent_id, connections in self.agent_relationships.items()
                },
                "active_workflows": self.active_workflows,
                "recent_activities": serializable_activities,
                "recent_message_flows": serializable_message_flows
            }
    
    def get_agent_network_topology(self) -> Dict[str, Any]:
        """Get agent network topology for visualization"""
        with self.lock:
            # Helper function to make objects JSON serializable
            def make_json_serializable(obj):
                if isinstance(obj, dict):
                    return {k: make_json_serializable(v) for k, v in obj.items()}
                elif isinstance(obj, list):
                    return [make_json_serializable(item) for item in obj]
                elif isinstance(obj, AgentState):
                    return obj.value
                elif isinstance(obj, MessageDirection):
                    return obj.value
                elif isinstance(obj, set):
                    return list(obj)
                else:
                    return obj
            
            nodes = []
            edges = []
            
            # Create nodes
            for agent_id, state in self.agent_states.items():
                metrics = self.agent_metrics.get(agent_id, AgentMetrics(agent_id=agent_id))
                metrics_dict = asdict(metrics)
                nodes.append({
                    "id": agent_id,
                    "state": state.value,
                    "metrics": make_json_serializable(metrics_dict),
                    "total_messages": metrics.total_messages_sent + metrics.total_messages_received
                })
            
            # Create edges
            for agent_id, connections in self.agent_relationships.items():
                for connected_agent in connections:
                    edges.append({
                        "source": agent_id,
                        "target": connected_agent,
                        "message_count": self._get_message_count_between(agent_id, connected_agent)
                    })
            
            return {
                "nodes": nodes,
                "edges": edges,
                "timestamp": self._get_timestamp()
            }
    
    def add_websocket_client(self, client):
        """Add WebSocket client for real-time updates"""
        self.websocket_clients.add(client)
    
    def remove_websocket_client(self, client):
        """Remove WebSocket client"""
        self.websocket_clients.discard(client)
    
    def _update_agent_state(self, agent_id: str, new_state: AgentState):
        """Internal method to update agent state"""
        old_state = self.agent_states.get(agent_id, AgentState.IDLE)
        self.agent_states[agent_id] = new_state
        
        if agent_id in self.agent_metrics:
            self.agent_metrics[agent_id].current_state = new_state
            self.agent_metrics[agent_id].last_activity = self._get_timestamp()
        
        # Broadcast state change if different
        if old_state != new_state:
            self._broadcast_state_change(agent_id, old_state, new_state)
    
    def _get_message_count_between(self, agent1: str, agent2: str) -> int:
        """Get message count between two agents"""
        count = 0
        for flow in self.message_flows:
            if ((flow.from_agent == agent1 and flow.to_agent == agent2) or
                (flow.from_agent == agent2 and flow.to_agent == agent1)):
                count += 1
        return count
    
    def _get_timestamp(self) -> str:
        """Get current timestamp in ISO format"""
        return datetime.now().isoformat()
    
    def _broadcast_activity(self, activity: AgentActivity):
        """Broadcast activity to all WebSocket clients"""
        message = {
            "type": "agent_activity",
            "data": asdict(activity)
        }
        self._broadcast_to_clients(message)
    
    def _broadcast_message_flow(self, message_flow: MessageFlow):
        """Broadcast message flow to all WebSocket clients"""
        message = {
            "type": "message_flow",
            "data": asdict(message_flow)
        }
        self._broadcast_to_clients(message)
    
    def _broadcast_state_change(self, agent_id: str, old_state: AgentState, new_state: AgentState):
        """Broadcast state change to all WebSocket clients"""
        message = {
            "type": "state_change",
            "data": {
                "agent_id": agent_id,
                "old_state": old_state.value,
                "new_state": new_state.value,
                "timestamp": self._get_timestamp()
            }
        }
        self._broadcast_to_clients(message)
    
    def _broadcast_workflow_update(self, workflow_id: str, update_type: str):
        """Broadcast workflow update to all WebSocket clients"""
        message = {
            "type": "workflow_update",
            "data": {
                "workflow_id": workflow_id,
                "update_type": update_type,
                "workflow_data": self.active_workflows.get(workflow_id, {}),
                "timestamp": self._get_timestamp()
            }
        }
        self._broadcast_to_clients(message)
    
    def _broadcast_to_clients(self, message: Dict[str, Any]):
        """Broadcast message to all connected WebSocket clients"""
        if not self.websocket_clients:
            return
            
        message_json = json.dumps(message, default=str)
        
        # Remove disconnected clients
        disconnected_clients = set()
        for client in self.websocket_clients:
            try:
                # This would be implemented with actual WebSocket library
                # For now, we'll just store the message for polling
                pass
            except Exception:
                disconnected_clients.add(client)
        
        for client in disconnected_clients:
            self.websocket_clients.discard(client)


# Global agent monitor instance
_global_monitor: Optional[AgentMonitor] = None


def get_agent_monitor() -> AgentMonitor:
    """Get the global agent monitor instance"""
    global _global_monitor
    if _global_monitor is None:
        _global_monitor = AgentMonitor()
    return _global_monitor


def initialize_agent_monitor(max_history_size: int = 1000) -> AgentMonitor:
    """Initialize the global agent monitor"""
    global _global_monitor
    _global_monitor = AgentMonitor(max_history_size)
    return _global_monitor 
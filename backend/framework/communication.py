"""
Agent Communication Module
Handles message routing, coordination, and inter-agent communication
"""

import json
import time
import uuid
from datetime import datetime
from typing import Dict, List, Any, Optional, Callable
from dataclasses import dataclass
from enum import Enum


class MessageType(Enum):
    """Types of messages that can be sent between agents"""
    REQUEST = "request"
    RESPONSE = "response"
    NOTIFICATION = "notification"
    BROADCAST = "broadcast"
    ERROR = "error"


class Priority(Enum):
    """Message priority levels"""
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4


@dataclass
class AgentMessage:
    """Structured message format for agent communication"""
    message_id: str
    from_agent: str
    to_agent: str
    message_type: MessageType
    priority: Priority
    timestamp: str
    payload: Dict[str, Any]
    correlation_id: Optional[str] = None
    reply_to: Optional[str] = None
    expires_at: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert message to dictionary for serialization"""
        return {
            "message_id": self.message_id,
            "from_agent": self.from_agent,
            "to_agent": self.to_agent,
            "message_type": self.message_type.value,
            "priority": self.priority.value,
            "timestamp": self.timestamp,
            "payload": self.payload,
            "correlation_id": self.correlation_id,
            "reply_to": self.reply_to,
            "expires_at": self.expires_at
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'AgentMessage':
        """Create message from dictionary"""
        return cls(
            message_id=data["message_id"],
            from_agent=data["from_agent"],
            to_agent=data["to_agent"],
            message_type=MessageType(data["message_type"]),
            priority=Priority(data["priority"]),
            timestamp=data["timestamp"],
            payload=data["payload"],
            correlation_id=data.get("correlation_id"),
            reply_to=data.get("reply_to"),
            expires_at=data.get("expires_at")
        )


class MessageRouter:
    """
    Routes messages between agents and manages communication patterns
    """
    
    def __init__(self):
        self.message_queue: List[AgentMessage] = []
        self.delivery_handlers: Dict[str, Callable] = {}
        self.subscription_patterns: Dict[str, List[str]] = {}
        self.message_history: List[AgentMessage] = []
        self.delivery_stats: Dict[str, int] = {
            "sent": 0,
            "delivered": 0,
            "failed": 0,
            "expired": 0
        }
    
    def register_agent(self, agent_id: str, delivery_handler: Callable):
        """Register an agent's message delivery handler"""
        self.delivery_handlers[agent_id] = delivery_handler
    
    def unregister_agent(self, agent_id: str):
        """Unregister an agent"""
        if agent_id in self.delivery_handlers:
            del self.delivery_handlers[agent_id]
        
        # Remove from subscription patterns
        for pattern in self.subscription_patterns:
            if agent_id in self.subscription_patterns[pattern]:
                self.subscription_patterns[pattern].remove(agent_id)
    
    def subscribe(self, agent_id: str, message_pattern: str):
        """Subscribe an agent to messages matching a pattern"""
        if message_pattern not in self.subscription_patterns:
            self.subscription_patterns[message_pattern] = []
        
        if agent_id not in self.subscription_patterns[message_pattern]:
            self.subscription_patterns[message_pattern].append(agent_id)
    
    def unsubscribe(self, agent_id: str, message_pattern: str):
        """Unsubscribe an agent from a message pattern"""
        if message_pattern in self.subscription_patterns:
            if agent_id in self.subscription_patterns[message_pattern]:
                self.subscription_patterns[message_pattern].remove(agent_id)
    
    async def send_message(self, message: AgentMessage) -> bool:
        """Send a message to target agent"""
        try:
            # Check if message has expired
            if self._is_expired(message):
                self.delivery_stats["expired"] += 1
                return False
            
            # Add to history
            self._add_to_history(message)
            
            # Deliver to target agent
            if message.to_agent in self.delivery_handlers:
                handler = self.delivery_handlers[message.to_agent]
                success = await handler(message)
                
                if success:
                    self.delivery_stats["delivered"] += 1
                else:
                    self.delivery_stats["failed"] += 1
                
                return success
            else:
                # Target agent not found
                self.delivery_stats["failed"] += 1
                return False
                
        except Exception as e:
            self.delivery_stats["failed"] += 1
            print(f"Message delivery error: {e}")
            return False
    
    async def broadcast_message(self, message: AgentMessage) -> Dict[str, bool]:
        """Broadcast message to all subscribed agents"""
        results = {}
        
        # Find subscribers based on message patterns
        subscribers = set()
        
        # Simple pattern matching - in a real system this would be more sophisticated
        for pattern, agents in self.subscription_patterns.items():
            if self._matches_pattern(message, pattern):
                subscribers.update(agents)
        
        # Send to all subscribers
        for agent_id in subscribers:
            if agent_id != message.from_agent:  # Don't send back to sender
                broadcast_msg = AgentMessage(
                    message_id=str(uuid.uuid4()),
                    from_agent=message.from_agent,
                    to_agent=agent_id,
                    message_type=MessageType.BROADCAST,
                    priority=message.priority,
                    timestamp=datetime.now().isoformat(),
                    payload=message.payload,
                    correlation_id=message.correlation_id
                )
                
                results[agent_id] = await self.send_message(broadcast_msg)
        
        return results
    
    def create_message(self, from_agent: str, to_agent: str, payload: Dict[str, Any],
                      message_type: MessageType = MessageType.REQUEST,
                      priority: Priority = Priority.MEDIUM,
                      correlation_id: Optional[str] = None) -> AgentMessage:
        """Create a new message with proper formatting"""
        return AgentMessage(
            message_id=str(uuid.uuid4()),
            from_agent=from_agent,
            to_agent=to_agent,
            message_type=message_type,
            priority=priority,
            timestamp=datetime.now().isoformat(),
            payload=payload,
            correlation_id=correlation_id
        )
    
    def create_reply(self, original_message: AgentMessage, from_agent: str, 
                    payload: Dict[str, Any]) -> AgentMessage:
        """Create a reply to an existing message"""
        return AgentMessage(
            message_id=str(uuid.uuid4()),
            from_agent=from_agent,
            to_agent=original_message.from_agent,
            message_type=MessageType.RESPONSE,
            priority=original_message.priority,
            timestamp=datetime.now().isoformat(),
            payload=payload,
            correlation_id=original_message.correlation_id,
            reply_to=original_message.message_id
        )
    
    def get_conversation_history(self, agent1: str, agent2: str, limit: int = 50) -> List[AgentMessage]:
        """Get conversation history between two agents"""
        conversation = []
        
        for message in reversed(self.message_history):
            if ((message.from_agent == agent1 and message.to_agent == agent2) or
                (message.from_agent == agent2 and message.to_agent == agent1)):
                conversation.append(message)
                
                if len(conversation) >= limit:
                    break
        
        return list(reversed(conversation))
    
    def get_message_stats(self) -> Dict[str, Any]:
        """Get message delivery statistics"""
        total_messages = sum(self.delivery_stats.values())
        
        return {
            "total_messages": total_messages,
            "delivery_stats": self.delivery_stats.copy(),
            "success_rate": (self.delivery_stats["delivered"] / total_messages * 100) if total_messages > 0 else 0,
            "active_agents": len(self.delivery_handlers),
            "subscription_patterns": len(self.subscription_patterns),
            "queue_size": len(self.message_queue)
        }
    
    def _is_expired(self, message: AgentMessage) -> bool:
        """Check if message has expired"""
        if not message.expires_at:
            return False
        
        try:
            expires_time = datetime.fromisoformat(message.expires_at.replace('Z', '+00:00'))
            return datetime.now() > expires_time
        except:
            return False
    
    def _add_to_history(self, message: AgentMessage):
        """Add message to history with size limit"""
        self.message_history.append(message)
        
        # Keep only last 1000 messages
        if len(self.message_history) > 1000:
            self.message_history = self.message_history[-1000:]
    
    def _matches_pattern(self, message: AgentMessage, pattern: str) -> bool:
        """Simple pattern matching for subscriptions"""
        # This is a simplified pattern matcher
        # In a real system, this would support regex or more complex patterns
        
        if pattern == "*":  # Match all
            return True
        
        if pattern in message.payload.get("type", ""):
            return True
        
        if pattern in message.message_type.value:
            return True
        
        return False


class ConversationManager:
    """Manages multi-turn conversations between agents"""
    
    def __init__(self, router: MessageRouter):
        self.router = router
        self.active_conversations: Dict[str, Dict[str, Any]] = {}
    
    def start_conversation(self, initiator: str, participants: List[str], 
                          topic: str, context: Dict[str, Any] = None) -> str:
        """Start a new multi-agent conversation"""
        conversation_id = str(uuid.uuid4())
        
        conversation = {
            "conversation_id": conversation_id,
            "initiator": initiator,
            "participants": participants,
            "topic": topic,
            "context": context or {},
            "status": "active",
            "start_time": datetime.now().isoformat(),
            "message_count": 0,
            "last_activity": datetime.now().isoformat()
        }
        
        self.active_conversations[conversation_id] = conversation
        return conversation_id
    
    def add_message_to_conversation(self, conversation_id: str, message: AgentMessage):
        """Add a message to a conversation"""
        if conversation_id in self.active_conversations:
            conv = self.active_conversations[conversation_id]
            conv["message_count"] += 1
            conv["last_activity"] = datetime.now().isoformat()
    
    def end_conversation(self, conversation_id: str, reason: str = "completed"):
        """End a conversation"""
        if conversation_id in self.active_conversations:
            conv = self.active_conversations[conversation_id]
            conv["status"] = "completed"
            conv["end_time"] = datetime.now().isoformat()
            conv["end_reason"] = reason
    
    def get_active_conversations(self) -> List[Dict[str, Any]]:
        """Get all active conversations"""
        return [conv for conv in self.active_conversations.values() 
                if conv["status"] == "active"]


class WorkflowCoordinator:
    """Coordinates complex multi-agent workflows"""
    
    def __init__(self, router: MessageRouter):
        self.router = router
        self.workflows: Dict[str, Dict[str, Any]] = {}
        self.workflow_templates: Dict[str, Dict[str, Any]] = {}
    
    def register_workflow_template(self, template_name: str, template: Dict[str, Any]):
        """Register a workflow template"""
        self.workflow_templates[template_name] = template
    
    def start_workflow(self, template_name: str, initiator: str, 
                      parameters: Dict[str, Any]) -> str:
        """Start a workflow from a template"""
        if template_name not in self.workflow_templates:
            raise ValueError(f"Workflow template '{template_name}' not found")
        
        workflow_id = str(uuid.uuid4())
        template = self.workflow_templates[template_name]
        
        workflow = {
            "workflow_id": workflow_id,
            "template_name": template_name,
            "initiator": initiator,
            "parameters": parameters,
            "status": "running",
            "start_time": datetime.now().isoformat(),
            "current_step": 0,
            "steps": template["steps"].copy(),
            "results": {},
            "errors": []
        }
        
        self.workflows[workflow_id] = workflow
        return workflow_id
    
    async def execute_workflow_step(self, workflow_id: str) -> bool:
        """Execute the next step in a workflow"""
        if workflow_id not in self.workflows:
            return False
        
        workflow = self.workflows[workflow_id]
        
        if workflow["status"] != "running":
            return False
        
        current_step = workflow["current_step"]
        steps = workflow["steps"]
        
        if current_step >= len(steps):
            workflow["status"] = "completed"
            workflow["end_time"] = datetime.now().isoformat()
            return True
        
        step = steps[current_step]
        
        try:
            # Execute step (simplified - in real system would be more complex)
            message = self.router.create_message(
                from_agent="workflow_coordinator",
                to_agent=step["agent"],
                payload=step["payload"],
                message_type=MessageType.REQUEST,
                priority=Priority.HIGH,
                correlation_id=workflow_id
            )
            
            success = await self.router.send_message(message)
            
            if success:
                workflow["current_step"] += 1
                workflow["results"][f"step_{current_step}"] = {"status": "completed"}
            else:
                workflow["errors"].append(f"Step {current_step} failed")
                workflow["status"] = "failed"
            
            return success
            
        except Exception as e:
            workflow["errors"].append(f"Step {current_step} error: {str(e)}")
            workflow["status"] = "failed"
            return False
    
    def get_workflow_status(self, workflow_id: str) -> Optional[Dict[str, Any]]:
        """Get workflow status"""
        return self.workflows.get(workflow_id)


# Global instances
_router_instance = None
_conversation_manager = None
_workflow_coordinator = None

def get_router() -> MessageRouter:
    """Get the global message router instance"""
    global _router_instance
    if _router_instance is None:
        _router_instance = MessageRouter()
    return _router_instance

def get_conversation_manager() -> ConversationManager:
    """Get the global conversation manager"""
    global _conversation_manager, _router_instance
    if _conversation_manager is None:
        if _router_instance is None:
            _router_instance = MessageRouter()
        _conversation_manager = ConversationManager(_router_instance)
    return _conversation_manager

def get_workflow_coordinator() -> WorkflowCoordinator:
    """Get the global workflow coordinator"""
    global _workflow_coordinator, _router_instance
    if _workflow_coordinator is None:
        if _router_instance is None:
            _router_instance = MessageRouter()
        _workflow_coordinator = WorkflowCoordinator(_router_instance)
    return _workflow_coordinator 
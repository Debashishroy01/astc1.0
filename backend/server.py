"""
ASTC HTTP Server
Main HTTP server providing REST API endpoints for the frontend
"""

import json
import asyncio
import time
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler
from datetime import datetime
from typing import Dict, Any, Optional
import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from framework.mock_neuro_san import get_framework
from framework.communication import get_router, MessageType, Priority
from agents.sap_intelligence import SAPIntelligenceAgent
from agents.test_generation import TestGenerationAgent
from agents.dependency_analysis import DependencyAnalysisAgent
from agents.test_execution import TestExecutionAgent
from agents.script_generation import ScriptGenerationAgent
from agents.persona_adaptation import PersonaAdaptationAgent
from agents.dependency_intelligence import DependencyIntelligenceAgent
from agents.business_impact import BusinessImpactAgent
from framework.agent_monitor import get_agent_monitor, initialize_agent_monitor


class ASTCRequestHandler(BaseHTTPRequestHandler):
    """HTTP request handler for ASTC API endpoints"""
    
    def __init__(self, *args, **kwargs):
        # Initialize agents and framework on first request
        super().__init__(*args, **kwargs)
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()
    
    def do_GET(self):
        """Handle GET requests"""
        path = urllib.parse.urlparse(self.path).path
        query_params = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        
        try:
            if path == "/api/health":
                self.handle_health_check()
            elif path == "/api/agents/status":
                self.handle_agents_status()
            elif path == "/api/dependencies":
                transaction_code = query_params.get('transaction', [''])[0]
                self.handle_get_dependencies(transaction_code)
            elif path == "/api/framework/status":
                self.handle_framework_status()
            elif path == "/api/message/history":
                limit = int(query_params.get('limit', ['100'])[0])
                self.handle_message_history(limit)
            elif path == "/api/execution/history":
                limit = int(query_params.get('limit', ['100'])[0])
                self.handle_execution_history(limit)
            elif path == "/api/monitoring/real-time":
                self.handle_real_time_monitoring()
            elif path == "/api/monitoring/network-topology":
                self.handle_network_topology()
            elif path == "/api/monitoring/activity-history":
                limit = int(query_params.get('limit', ['100'])[0])
                self.handle_activity_history(limit)
            else:
                self.send_error_response(404, "Endpoint not found")
        except Exception as e:
            self.send_error_response(500, f"Server error: {str(e)}")
    
    def do_POST(self):
        """Handle POST requests"""
        path = urllib.parse.urlparse(self.path).path
        
        try:
            # Read request body
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8') if content_length > 0 else '{}'
            data = json.loads(body) if body else {}
            
            if path == "/api/analyze":
                asyncio.run(self.handle_analyze_requirement(data))
            elif path == "/api/generate-tests":
                asyncio.run(self.handle_generate_tests(data))
            elif path == "/api/analyze-dependencies":
                asyncio.run(self.handle_analyze_dependencies(data))
            elif path == "/api/impact-assessment":
                asyncio.run(self.handle_impact_assessment(data))
            elif path == "/api/simulate-change":
                asyncio.run(self.handle_simulate_change(data))
            elif path == "/api/workflow/start":
                asyncio.run(self.handle_start_workflow(data))
            elif path == "/api/execution/start":
                asyncio.run(self.handle_start_execution(data))
            elif path == "/api/execute-tests":
                asyncio.run(self.handle_execute_tests(data))
            elif path == "/api/generate-and-execute":
                asyncio.run(self.handle_generate_and_execute(data))
            elif path == "/api/generate-scripts":
                asyncio.run(self.handle_generate_scripts(data))
            elif path == "/api/generate-bapi-script":
                asyncio.run(self.handle_generate_bapi_script(data))
            elif path == "/api/generate-gui-script":
                asyncio.run(self.handle_generate_gui_script(data))
            elif path == "/api/optimize-script":
                asyncio.run(self.handle_optimize_script(data))
            elif path == "/api/validate-script":
                asyncio.run(self.handle_validate_script(data))
            elif path == "/api/adapt-content":
                asyncio.run(self.handle_adapt_content(data))
            elif path == "/api/get-persona-dashboard":
                asyncio.run(self.handle_get_persona_dashboard(data))
            elif path == "/api/transform-language":
                asyncio.run(self.handle_transform_language(data))
            elif path == "/api/switch-persona":
                asyncio.run(self.handle_switch_persona(data))
            elif path == "/api/analyze-advanced-dependencies":
                asyncio.run(self.handle_analyze_advanced_dependencies(data))
            elif path == "/api/generate-interactive-graph":
                asyncio.run(self.handle_generate_interactive_graph(data))
            elif path == "/api/calculate-risk-heatmap":
                asyncio.run(self.handle_calculate_risk_heatmap(data))
            elif path == "/api/simulate-change-impact":
                asyncio.run(self.handle_simulate_change_impact(data))
            elif path == "/api/analyze-what-if-scenario":
                asyncio.run(self.handle_analyze_what_if_scenario(data))
            elif path == "/api/optimize-dependency-structure":
                asyncio.run(self.handle_optimize_dependency_structure(data))
            elif path == "/api/generate-impact-radius":
                asyncio.run(self.handle_generate_impact_radius(data))
            elif path == "/api/calculate-roi":
                asyncio.run(self.handle_calculate_roi(data))
            elif path == "/api/generate-business-case":
                asyncio.run(self.handle_generate_business_case(data))
            elif path == "/api/competitive-analysis":
                asyncio.run(self.handle_competitive_analysis(data))
            elif path == "/api/market-benchmarking":
                asyncio.run(self.handle_market_benchmarking(data))
            elif path == "/api/executive-dashboard":
                asyncio.run(self.handle_executive_dashboard(data))
            elif path == "/api/value-realization-tracking":
                asyncio.run(self.handle_value_realization_tracking(data))
            elif path == "/api/strategic-impact-analysis":
                asyncio.run(self.handle_strategic_impact_analysis(data))
            else:
                self.send_error_response(404, "Endpoint not found")
        except json.JSONDecodeError:
            self.send_error_response(400, "Invalid JSON in request body")
        except Exception as e:
            self.send_error_response(500, f"Server error: {str(e)}")
    
    def send_cors_headers(self):
        """Send CORS headers for cross-origin requests"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID')
        self.send_header('Access-Control-Max-Age', '86400')
    
    def send_json_response(self, data: Dict[str, Any], status_code: int = 200):
        """Send JSON response with proper headers"""
        response = json.dumps(data, indent=2)
        
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(response)))
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(response.encode('utf-8'))
    
    def send_error_response(self, status_code: int, message: str):
        """Send error response"""
        error_data = {
            "error": True,
            "status_code": status_code,
            "message": message,
            "timestamp": datetime.now().isoformat()
        }
        self.send_json_response(error_data, status_code)
    
    def handle_health_check(self):
        """Handle health check endpoint"""
        framework = get_framework()
        
        health_data = {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "version": "1.0.0",
            "framework": framework.get_framework_status(),
            "agents": {
                "sap_intelligence": "active",
                "test_generation": "active", 
                "dependency_analysis": "active"
            }
        }
        
        self.send_json_response(health_data)
    
    def handle_agents_status(self):
        """Handle agents status endpoint"""
        framework = get_framework()
        agents_status = framework.get_all_agents_status()
        
        response_data = {
            "agents": agents_status,
            "total_agents": len(agents_status),
            "active_agents": sum(1 for agent in agents_status if agent["status"] == "active"),
            "timestamp": datetime.now().isoformat()
        }
        
        self.send_json_response(response_data)
    
    def handle_framework_status(self):
        """Handle framework status endpoint"""
        framework = get_framework()
        router = get_router()
        
        status_data = {
            "framework": framework.get_framework_status(),
            "message_router": router.get_message_stats(),
            "timestamp": datetime.now().isoformat()
        }
        
        self.send_json_response(status_data)
    
    def handle_message_history(self, limit: int):
        """Handle message history endpoint"""
        framework = get_framework()
        history = framework.get_message_history(limit)
        
        response_data = {
            "messages": [msg for msg in history if isinstance(msg, dict)],
            "total_messages": len(history),
            "limit": limit,
            "timestamp": datetime.now().isoformat()
        }
        
        self.send_json_response(response_data)
    
    def handle_execution_history(self, limit: int):
        """Handle test execution history endpoint using real TestExecutionAgent"""
        try:
            framework = get_framework()
            
            # Create TestExecutionAgent if not exists and get history
            if "test_execution" in framework.agents:
                agent = framework.agents["test_execution"]
                result = agent.get_execution_history(limit)
                
                if result["success"]:
                    self.send_json_response(result)
                    return
            
            # Fallback to static data if agent not available
            data_dir = os.path.join(os.path.dirname(__file__), 'data')
            try:
                with open(os.path.join(data_dir, 'test_execution_history.json'), 'r') as f:
                    execution_data = json.load(f)
                
                # Limit the executions returned
                executions = execution_data.get("executions", [])[:limit]
                
                response_data = {
                    "executions": executions,
                    "summary_stats": execution_data.get("summary_stats", {}),
                    "real_time_monitoring": execution_data.get("real_time_monitoring", {}),
                    "total_executions": len(execution_data.get("executions", [])),
                    "limit": limit,
                    "timestamp": datetime.now().isoformat()
                }
                
                self.send_json_response(response_data)
                
            except FileNotFoundError:
                # Return empty data if no static file and no agent
                response_data = {
                    "executions": [],
                    "summary_stats": {
                        "total_executions": 0,
                        "passed": 0,
                        "failed": 0,
                        "success_rate": 0.0,
                        "average_duration": 0.0
                    },
                    "real_time_monitoring": {
                        "active_executions": 0,
                        "system_health": "good",
                        "last_updated": datetime.now().isoformat()
                    },
                    "total_executions": 0,
                    "limit": limit,
                    "timestamp": datetime.now().isoformat()
                }
                self.send_json_response(response_data)
            
        except Exception as e:
            self.send_error_response(500, f"Error retrieving execution history: {str(e)}")
    
    async def handle_start_execution(self, data: Dict[str, Any]):
        """Handle start test execution endpoint"""
        test_case_id = data.get("test_case_id", "")
        test_config = data.get("config", {})
        
        if not test_case_id:
            self.send_error_response(400, "Test case ID is required")
            return
        
        try:
            # Generate a new execution ID
            execution_id = f"exec_{int(time.time() * 1000)}"
            
            # Create mock execution entry
            new_execution = {
                "execution_id": execution_id,
                "test_case_id": test_case_id,
                "test_name": f"Test execution for {test_case_id}",
                "transaction": test_config.get("transaction", "ME21N"),
                "status": "running",
                "result": "in_progress",
                "start_time": datetime.now().isoformat(),
                "current_step": 1,
                "total_steps": 5,
                "execution_steps": [
                    {
                        "step": 1,
                        "description": "Initializing test environment",
                        "status": "running",
                        "start_time": datetime.now().isoformat()
                    }
                ],
                "environment": {
                    "system": "SAP ECC 6.0",
                    "client": "100",
                    "server": "SAPDEV01",
                    "response_time": "Good"
                }
            }
            
            # In a real implementation, this would:
            # 1. Queue the test for execution
            # 2. Start the actual test runner
            # 3. Update execution status in real-time
            
            response_data = {
                "execution_id": execution_id,
                "status": "started",
                "test_case_id": test_case_id,
                "estimated_duration": "2-3 minutes",
                "monitoring_url": f"/api/execution/status/{execution_id}",
                "timestamp": datetime.now().isoformat()
            }
            
            self.send_json_response(response_data)
            
        except Exception as e:
            self.send_error_response(500, f"Error starting test execution: {str(e)}")
    
    async def handle_execute_tests(self, data: Dict[str, Any]):
        """Handle test execution request using real TestExecutionAgent"""
        test_cases = data.get("test_cases", [])
        execution_type = data.get("execution_type", "suite")  # "suite" or "single"
        
        if not test_cases:
            self.send_error_response(400, "Test cases are required for execution")
            return
        
        try:
            framework = get_framework()
            router = get_router()
            
            # Create TestExecutionAgent if not exists
            if "test_execution" not in framework.agents:
                agent = TestExecutionAgent()
                framework.register_agent(agent)
            
            # Prepare message payload
            if execution_type == "suite":
                message_payload = {
                    "type": "execute_test_suite",
                    "test_cases": test_cases
                }
            else:
                message_payload = {
                    "type": "execute_single_test", 
                    "test_case": test_cases[0] if test_cases else {}
                }
            
            # Send execution message to agent
            message = router.create_message(
                from_agent="api_server",
                to_agent="test_execution",
                payload=message_payload,
                message_type=MessageType.REQUEST,
                priority=Priority.HIGH
            )
            
            # Process message through agent
            agent = framework.agents["test_execution"]
            result = await agent.process_message(message.payload)
            
            # Add metadata
            result["request_id"] = message.message_id
            result["processed_at"] = datetime.now().isoformat()
            
            self.send_json_response(result)
            
        except Exception as e:
            self.send_error_response(500, f"Test execution error: {str(e)}")
    
    async def handle_generate_and_execute(self, data: Dict[str, Any]):
        """Handle combined test generation and execution using agent-to-agent communication"""
        requirement = data.get("requirement", "")
        context = data.get("context", {})
        
        if not requirement:
            self.send_error_response(400, "Requirement text is required")
            return
        
        try:
            framework = get_framework()
            router = get_router()
            
            # Create TestGenerationAgent if not exists
            if "test_generation" not in framework.agents:
                agent = TestGenerationAgent()
                framework.register_agent(agent)
            
            # Create TestExecutionAgent if not exists
            if "test_execution" not in framework.agents:
                exec_agent = TestExecutionAgent()
                framework.register_agent(exec_agent)
            
            # Send generate-and-execute message to TestGenerationAgent
            message = router.create_message(
                from_agent="api_server",
                to_agent="test_generation",
                payload={
                    "type": "generate_and_execute_tests",
                    "analysis": data.get("analysis", {"extracted_transactions": [{"code": "ME21N", "confidence": 0.95}]}),
                    "requirements": {"requirement": requirement, "context": context}
                },
                message_type=MessageType.REQUEST,
                priority=Priority.HIGH
            )
            
            # Process message through TestGenerationAgent (which will communicate with TestExecutionAgent)
            agent = framework.agents["test_generation"]
            result = await agent.process_message(message.payload)
            
            # Add metadata
            result["request_id"] = message.message_id
            result["processed_at"] = datetime.now().isoformat()
            result["workflow_type"] = "generate_and_execute"
            
            self.send_json_response(result)
            
        except Exception as e:
            self.send_error_response(500, f"Generate and execute error: {str(e)}")
    
    async def handle_generate_scripts(self, data: Dict[str, Any]):
        """Handle automation script generation request using real ScriptGenerationAgent"""
        test_cases = data.get("test_cases", [])
        
        if not test_cases:
            self.send_error_response(400, "Test cases are required for script generation")
            return
        
        try:
            framework = get_framework()
            router = get_router()
            
            # Create ScriptGenerationAgent if not exists
            if "script_generation" not in framework.agents:
                agent = ScriptGenerationAgent()
                framework.register_agent(agent)
            
            # Send script generation message to agent
            message = router.create_message(
                from_agent="api_server",
                to_agent="script_generation",
                payload={
                    "type": "generate_automation_scripts",
                    "test_cases": test_cases
                },
                message_type=MessageType.REQUEST,
                priority=Priority.HIGH
            )
            
            # Process message through agent
            agent = framework.agents["script_generation"]
            result = await agent.process_message(message.payload)
            
            # Add metadata
            result["request_id"] = message.message_id
            result["processed_at"] = datetime.now().isoformat()
            
            self.send_json_response(result)
            
        except Exception as e:
            self.send_error_response(500, f"Script generation error: {str(e)}")
    
    async def handle_generate_bapi_script(self, data: Dict[str, Any]):
        """Handle BAPI script generation request"""
        transaction = data.get("transaction", "")
        parameters = data.get("parameters", {})
        
        if not transaction:
            self.send_error_response(400, "Transaction code is required")
            return
        
        try:
            framework = get_framework()
            router = get_router()
            
            if "script_generation" not in framework.agents:
                agent = ScriptGenerationAgent()
                framework.register_agent(agent)
            
            message = router.create_message(
                from_agent="api_server",
                to_agent="script_generation",
                payload={
                    "type": "generate_bapi_script",
                    "transaction": transaction,
                    "parameters": parameters
                },
                message_type=MessageType.REQUEST,
                priority=Priority.HIGH
            )
            
            agent = framework.agents["script_generation"]
            result = await agent.process_message(message.payload)
            
            result["request_id"] = message.message_id
            result["processed_at"] = datetime.now().isoformat()
            
            self.send_json_response(result)
            
        except Exception as e:
            self.send_error_response(500, f"BAPI script generation error: {str(e)}")
    
    async def handle_generate_gui_script(self, data: Dict[str, Any]):
        """Handle GUI script generation request"""
        transaction = data.get("transaction", "")
        steps = data.get("steps", [])
        
        if not transaction:
            self.send_error_response(400, "Transaction code is required")
            return
        
        try:
            framework = get_framework()
            router = get_router()
            
            if "script_generation" not in framework.agents:
                agent = ScriptGenerationAgent()
                framework.register_agent(agent)
            
            message = router.create_message(
                from_agent="api_server",
                to_agent="script_generation",
                payload={
                    "type": "generate_gui_script",
                    "transaction": transaction,
                    "steps": steps
                },
                message_type=MessageType.REQUEST,
                priority=Priority.HIGH
            )
            
            agent = framework.agents["script_generation"]
            result = await agent.process_message(message.payload)
            
            result["request_id"] = message.message_id
            result["processed_at"] = datetime.now().isoformat()
            
            self.send_json_response(result)
            
        except Exception as e:
            self.send_error_response(500, f"GUI script generation error: {str(e)}")
    
    async def handle_optimize_script(self, data: Dict[str, Any]):
        """Handle script optimization request"""
        script_code = data.get("script_code", "")
        optimization_goals = data.get("optimization_goals", [])
        
        if not script_code:
            self.send_error_response(400, "Script code is required for optimization")
            return
        
        try:
            framework = get_framework()
            router = get_router()
            
            if "script_generation" not in framework.agents:
                agent = ScriptGenerationAgent()
                framework.register_agent(agent)
            
            message = router.create_message(
                from_agent="api_server",
                to_agent="script_generation",
                payload={
                    "type": "optimize_script",
                    "script_code": script_code,
                    "optimization_goals": optimization_goals
                },
                message_type=MessageType.REQUEST,
                priority=Priority.MEDIUM
            )
            
            agent = framework.agents["script_generation"]
            result = await agent.process_message(message.payload)
            
            result["request_id"] = message.message_id
            result["processed_at"] = datetime.now().isoformat()
            
            self.send_json_response(result)
            
        except Exception as e:
            self.send_error_response(500, f"Script optimization error: {str(e)}")
    
    async def handle_validate_script(self, data: Dict[str, Any]):
        """Handle script validation request"""
        script_code = data.get("script_code", "")
        script_type = data.get("script_type", "")
        
        if not script_code:
            self.send_error_response(400, "Script code is required for validation")
            return
        
        try:
            framework = get_framework()
            router = get_router()
            
            if "script_generation" not in framework.agents:
                agent = ScriptGenerationAgent()
                framework.register_agent(agent)
            
            message = router.create_message(
                from_agent="api_server",
                to_agent="script_generation",
                payload={
                    "type": "validate_script",
                    "script_code": script_code,
                    "script_type": script_type
                },
                message_type=MessageType.REQUEST,
                priority=Priority.MEDIUM
            )
            
            agent = framework.agents["script_generation"]
            result = await agent.process_message(message.payload)
            
            result["request_id"] = message.message_id
            result["processed_at"] = datetime.now().isoformat()
            
            self.send_json_response(result)
            
        except Exception as e:
            self.send_error_response(500, f"Script validation error: {str(e)}")
    
    async def handle_adapt_content(self, data: Dict[str, Any]):
        """Handle content adaptation request using real PersonaAdaptationAgent"""
        content = data.get("content", {})
        persona = data.get("persona", "qa_manager")
        content_type = data.get("content_type", "general_message")
        
        if not content:
            self.send_error_response(400, "Content is required for adaptation")
            return
        
        try:
            framework = get_framework()
            router = get_router()
            
            # Create PersonaAdaptationAgent if not exists
            if "persona_adaptation" not in framework.agents:
                agent = PersonaAdaptationAgent()
                framework.register_agent(agent)
            
            # Send adaptation message to agent
            message = router.create_message(
                from_agent="api_server",
                to_agent="persona_adaptation",
                payload={
                    "type": "adapt_content",
                    "content": content,
                    "persona": persona,
                    "content_type": content_type
                },
                message_type=MessageType.REQUEST,
                priority=Priority.HIGH
            )
            
            # Process message through agent
            agent = framework.agents["persona_adaptation"]
            result = await agent.process_message(message.payload)
            
            # Add metadata
            result["request_id"] = message.message_id
            result["processed_at"] = datetime.now().isoformat()
            
            self.send_json_response(result)
            
        except Exception as e:
            self.send_error_response(500, f"Content adaptation error: {str(e)}")
    
    async def handle_get_persona_dashboard(self, data: Dict[str, Any]):
        """Handle persona dashboard generation request"""
        persona = data.get("persona", "qa_manager")
        data_sources = data.get("data_sources", {})
        
        try:
            framework = get_framework()
            router = get_router()
            
            if "persona_adaptation" not in framework.agents:
                agent = PersonaAdaptationAgent()
                framework.register_agent(agent)
            
            message = router.create_message(
                from_agent="api_server",
                to_agent="persona_adaptation",
                payload={
                    "type": "get_persona_dashboard",
                    "persona": persona,
                    "data_sources": data_sources
                },
                message_type=MessageType.REQUEST,
                priority=Priority.HIGH
            )
            
            agent = framework.agents["persona_adaptation"]
            result = await agent.process_message(message.payload)
            
            result["request_id"] = message.message_id
            result["processed_at"] = datetime.now().isoformat()
            
            self.send_json_response(result)
            
        except Exception as e:
            self.send_error_response(500, f"Persona dashboard generation error: {str(e)}")
    
    async def handle_transform_language(self, data: Dict[str, Any]):
        """Handle language transformation request"""
        text = data.get("text", "")
        from_persona = data.get("from_persona", "developer")
        to_persona = data.get("to_persona", "business_user")
        
        if not text:
            self.send_error_response(400, "Text is required for language transformation")
            return
        
        try:
            framework = get_framework()
            router = get_router()
            
            if "persona_adaptation" not in framework.agents:
                agent = PersonaAdaptationAgent()
                framework.register_agent(agent)
            
            message = router.create_message(
                from_agent="api_server",
                to_agent="persona_adaptation",
                payload={
                    "type": "transform_language",
                    "text": text,
                    "from_persona": from_persona,
                    "to_persona": to_persona
                },
                message_type=MessageType.REQUEST,
                priority=Priority.MEDIUM
            )
            
            agent = framework.agents["persona_adaptation"]
            result = await agent.process_message(message.payload)
            
            result["request_id"] = message.message_id
            result["processed_at"] = datetime.now().isoformat()
            
            self.send_json_response(result)
            
        except Exception as e:
            self.send_error_response(500, f"Language transformation error: {str(e)}")
    
    async def handle_switch_persona(self, data: Dict[str, Any]):
        """Handle persona view switching request"""
        current_data = data.get("current_data", {})
        from_persona = data.get("from_persona", "qa_manager")
        to_persona = data.get("to_persona", "developer")
        
        if not current_data:
            self.send_error_response(400, "Current data is required for persona switching")
            return
        
        try:
            framework = get_framework()
            router = get_router()
            
            if "persona_adaptation" not in framework.agents:
                agent = PersonaAdaptationAgent()
                framework.register_agent(agent)
            
            message = router.create_message(
                from_agent="api_server",
                to_agent="persona_adaptation",
                payload={
                    "type": "switch_persona_view",
                    "current_data": current_data,
                    "from_persona": from_persona,
                    "to_persona": to_persona
                },
                message_type=MessageType.REQUEST,
                priority=Priority.HIGH
            )
            
            agent = framework.agents["persona_adaptation"]
            result = await agent.process_message(message.payload)
            
            result["request_id"] = message.message_id
            result["processed_at"] = datetime.now().isoformat()
            
            self.send_json_response(result)
            
        except Exception as e:
            self.send_error_response(500, f"Persona switching error: {str(e)}")
    
    async def handle_analyze_advanced_dependencies(self, data: Dict[str, Any]):
        """Handle advanced dependency analysis request using real DependencyIntelligenceAgent"""
        target_node = data.get("target_node", "")
        analysis_depth = data.get("analysis_depth", 3)
        include_custom_code = data.get("include_custom_code", True)
        
        if not target_node:
            self.send_error_response(400, "Target node is required for advanced dependency analysis")
            return
        
        try:
            framework = get_framework()
            router = get_router()
            
            if "dependency_intelligence" not in framework.agents:
                agent = DependencyIntelligenceAgent()
                framework.register_agent(agent)
            
            message = router.create_message(
                from_agent="api_server",
                to_agent="dependency_intelligence",
                payload={
                    "type": "analyze_advanced_dependencies",
                    "target_node": target_node,
                    "analysis_depth": analysis_depth,
                    "include_custom_code": include_custom_code
                },
                message_type=MessageType.REQUEST,
                priority=Priority.HIGH
            )
            
            agent = framework.agents["dependency_intelligence"]
            result = await agent.process_message(message.payload)
            
            result["request_id"] = message.message_id
            result["processed_at"] = datetime.now().isoformat()
            
            self.send_json_response(result)
            
        except Exception as e:
            self.send_error_response(500, f"Advanced dependency analysis error: {str(e)}")
    
    async def handle_generate_interactive_graph(self, data: Dict[str, Any]):
        """Handle interactive graph generation request"""
        nodes = data.get("nodes", [])
        focus_area = data.get("focus_area", "")
        visualization_options = data.get("visualization_options", {})
        
        try:
            framework = get_framework()
            router = get_router()
            
            if "dependency_intelligence" not in framework.agents:
                agent = DependencyIntelligenceAgent()
                framework.register_agent(agent)
            
            message = router.create_message(
                from_agent="api_server",
                to_agent="dependency_intelligence",
                payload={
                    "type": "generate_interactive_graph",
                    "nodes": nodes,
                    "focus_area": focus_area,
                    "visualization_options": visualization_options
                },
                message_type=MessageType.REQUEST,
                priority=Priority.HIGH
            )
            
            agent = framework.agents["dependency_intelligence"]
            result = await agent.process_message(message.payload)
            
            result["request_id"] = message.message_id
            result["processed_at"] = datetime.now().isoformat()
            
            self.send_json_response(result)
            
        except Exception as e:
            self.send_error_response(500, f"Interactive graph generation error: {str(e)}")
    
    async def handle_calculate_risk_heatmap(self, data: Dict[str, Any]):
        """Handle risk heatmap calculation request"""
        dependency_graph = data.get("dependency_graph", {})
        change_scenario = data.get("change_scenario", {})
        business_context = data.get("business_context", {})
        
        try:
            framework = get_framework()
            router = get_router()
            
            if "dependency_intelligence" not in framework.agents:
                agent = DependencyIntelligenceAgent()
                framework.register_agent(agent)
            
            message = router.create_message(
                from_agent="api_server",
                to_agent="dependency_intelligence",
                payload={
                    "type": "calculate_risk_heatmap",
                    "dependency_graph": dependency_graph,
                    "change_scenario": change_scenario,
                    "business_context": business_context
                },
                message_type=MessageType.REQUEST,
                priority=Priority.HIGH
            )
            
            agent = framework.agents["dependency_intelligence"]
            result = await agent.process_message(message.payload)
            
            result["request_id"] = message.message_id
            result["processed_at"] = datetime.now().isoformat()
            
            self.send_json_response(result)
            
        except Exception as e:
            self.send_error_response(500, f"Risk heatmap calculation error: {str(e)}")
    
    async def handle_simulate_change_impact(self, data: Dict[str, Any]):
        """Handle change impact simulation request"""
        change_type = data.get("change_type", "modification")
        target_nodes = data.get("target_nodes", [])
        change_details = data.get("change_details", {})
        
        try:
            framework = get_framework()
            router = get_router()
            
            if "dependency_intelligence" not in framework.agents:
                agent = DependencyIntelligenceAgent()
                framework.register_agent(agent)
            
            message = router.create_message(
                from_agent="api_server",
                to_agent="dependency_intelligence",
                payload={
                    "type": "simulate_change_impact",
                    "change_type": change_type,
                    "target_nodes": target_nodes,
                    "change_details": change_details
                },
                message_type=MessageType.REQUEST,
                priority=Priority.HIGH
            )
            
            agent = framework.agents["dependency_intelligence"]
            result = await agent.process_message(message.payload)
            
            result["request_id"] = message.message_id
            result["processed_at"] = datetime.now().isoformat()
            
            self.send_json_response(result)
            
        except Exception as e:
            self.send_error_response(500, f"Change impact simulation error: {str(e)}")
    
    async def handle_analyze_what_if_scenario(self, data: Dict[str, Any]):
        """Handle what-if scenario analysis request"""
        scenario_definition = data.get("scenario_definition", {})
        baseline_state = data.get("baseline_state", {})
        analysis_parameters = data.get("analysis_parameters", {})
        
        try:
            framework = get_framework()
            router = get_router()
            
            if "dependency_intelligence" not in framework.agents:
                agent = DependencyIntelligenceAgent()
                framework.register_agent(agent)
            
            message = router.create_message(
                from_agent="api_server",
                to_agent="dependency_intelligence",
                payload={
                    "type": "analyze_what_if_scenario",
                    "scenario_definition": scenario_definition,
                    "baseline_state": baseline_state,
                    "analysis_parameters": analysis_parameters
                },
                message_type=MessageType.REQUEST,
                priority=Priority.HIGH
            )
            
            agent = framework.agents["dependency_intelligence"]
            result = await agent.process_message(message.payload)
            
            result["request_id"] = message.message_id
            result["processed_at"] = datetime.now().isoformat()
            
            self.send_json_response(result)
            
        except Exception as e:
            self.send_error_response(500, f"What-if scenario analysis error: {str(e)}")
    
    async def handle_optimize_dependency_structure(self, data: Dict[str, Any]):
        """Handle dependency structure optimization request"""
        current_structure = data.get("current_structure", {})
        optimization_goals = data.get("optimization_goals", [])
        constraints = data.get("constraints", {})
        
        try:
            framework = get_framework()
            router = get_router()
            
            if "dependency_intelligence" not in framework.agents:
                agent = DependencyIntelligenceAgent()
                framework.register_agent(agent)
            
            message = router.create_message(
                from_agent="api_server",
                to_agent="dependency_intelligence",
                payload={
                    "type": "optimize_dependency_structure",
                    "current_structure": current_structure,
                    "optimization_goals": optimization_goals,
                    "constraints": constraints
                },
                message_type=MessageType.REQUEST,
                priority=Priority.MEDIUM
            )
            
            agent = framework.agents["dependency_intelligence"]
            result = await agent.process_message(message.payload)
            
            result["request_id"] = message.message_id
            result["processed_at"] = datetime.now().isoformat()
            
            self.send_json_response(result)
            
        except Exception as e:
            self.send_error_response(500, f"Dependency structure optimization error: {str(e)}")
    
    async def handle_generate_impact_radius(self, data: Dict[str, Any]):
        """Handle impact radius generation request"""
        change_point = data.get("change_point", "")
        radius_parameters = data.get("radius_parameters", {})
        include_probability = data.get("include_probability", True)
        
        if not change_point:
            self.send_error_response(400, "Change point is required for impact radius analysis")
            return
        
        try:
            framework = get_framework()
            router = get_router()
            
            if "dependency_intelligence" not in framework.agents:
                agent = DependencyIntelligenceAgent()
                framework.register_agent(agent)
            
            message = router.create_message(
                from_agent="api_server",
                to_agent="dependency_intelligence",
                payload={
                    "type": "generate_impact_radius",
                    "change_point": change_point,
                    "radius_parameters": radius_parameters,
                    "include_probability": include_probability
                },
                message_type=MessageType.REQUEST,
                priority=Priority.MEDIUM
            )
            
            agent = framework.agents["dependency_intelligence"]
            result = await agent.process_message(message.payload)
            
            result["request_id"] = message.message_id
            result["processed_at"] = datetime.now().isoformat()
            
            self.send_json_response(result)
            
        except Exception as e:
            self.send_error_response(500, f"Impact radius generation error: {str(e)}")
    
    async def handle_calculate_roi(self, data: Dict[str, Any]):
        """Handle ROI calculation request using real BusinessImpactAgent"""
        roi_parameters = data.get("roi_parameters", {})
        company_profile = data.get("company_profile", {})
        current_tool = data.get("current_tool", "manual")
        
        try:
            framework = get_framework()
            router = get_router()
            
            if "business_impact" not in framework.agents:
                agent = BusinessImpactAgent()
                framework.register_agent(agent)
            
            message = router.create_message(
                from_agent="api_server",
                to_agent="business_impact",
                payload={
                    "type": "calculate_roi",
                    "roi_parameters": roi_parameters,
                    "company_profile": company_profile,
                    "current_tool": current_tool
                },
                message_type=MessageType.REQUEST,
                priority=Priority.HIGH
            )
            
            agent = framework.agents["business_impact"]
            result = await agent.process_message(message.payload)
            
            result["request_id"] = message.message_id
            result["processed_at"] = datetime.now().isoformat()
            
            self.send_json_response(result)
            
        except Exception as e:
            self.send_error_response(500, f"ROI calculation error: {str(e)}")
    
    async def handle_generate_business_case(self, data: Dict[str, Any]):
        """Handle business case generation request"""
        company_profile = data.get("company_profile", {})
        project_scope = data.get("project_scope", {})
        stakeholder_priorities = data.get("stakeholder_priorities", {})
        
        try:
            framework = get_framework()
            router = get_router()
            
            if "business_impact" not in framework.agents:
                agent = BusinessImpactAgent()
                framework.register_agent(agent)
            
            message = router.create_message(
                from_agent="api_server",
                to_agent="business_impact",
                payload={
                    "type": "generate_business_case",
                    "company_profile": company_profile,
                    "project_scope": project_scope,
                    "stakeholder_priorities": stakeholder_priorities
                },
                message_type=MessageType.REQUEST,
                priority=Priority.HIGH
            )
            
            agent = framework.agents["business_impact"]
            result = await agent.process_message(message.payload)
            
            result["request_id"] = message.message_id
            result["processed_at"] = datetime.now().isoformat()
            
            self.send_json_response(result)
            
        except Exception as e:
            self.send_error_response(500, f"Business case generation error: {str(e)}")
    
    async def handle_competitive_analysis(self, data: Dict[str, Any]):
        """Handle competitive analysis request"""
        current_tools = data.get("current_tools", [])
        evaluation_criteria = data.get("evaluation_criteria", {})
        industry_context = data.get("industry_context", {})
        
        try:
            framework = get_framework()
            router = get_router()
            
            if "business_impact" not in framework.agents:
                agent = BusinessImpactAgent()
                framework.register_agent(agent)
            
            message = router.create_message(
                from_agent="api_server",
                to_agent="business_impact",
                payload={
                    "type": "competitive_analysis",
                    "current_tools": current_tools,
                    "evaluation_criteria": evaluation_criteria,
                    "industry_context": industry_context
                },
                message_type=MessageType.REQUEST,
                priority=Priority.HIGH
            )
            
            agent = framework.agents["business_impact"]
            result = await agent.process_message(message.payload)
            
            result["request_id"] = message.message_id
            result["processed_at"] = datetime.now().isoformat()
            
            self.send_json_response(result)
            
        except Exception as e:
            self.send_error_response(500, f"Competitive analysis error: {str(e)}")
    
    async def handle_market_benchmarking(self, data: Dict[str, Any]):
        """Handle market benchmarking request"""
        company_profile = data.get("company_profile", {})
        performance_metrics = data.get("performance_metrics", {})
        benchmark_categories = data.get("benchmark_categories", [])
        
        try:
            framework = get_framework()
            router = get_router()
            
            if "business_impact" not in framework.agents:
                agent = BusinessImpactAgent()
                framework.register_agent(agent)
            
            message = router.create_message(
                from_agent="api_server",
                to_agent="business_impact",
                payload={
                    "type": "market_benchmarking",
                    "company_profile": company_profile,
                    "performance_metrics": performance_metrics,
                    "benchmark_categories": benchmark_categories
                },
                message_type=MessageType.REQUEST,
                priority=Priority.HIGH
            )
            
            agent = framework.agents["business_impact"]
            result = await agent.process_message(message.payload)
            
            result["request_id"] = message.message_id
            result["processed_at"] = datetime.now().isoformat()
            
            self.send_json_response(result)
            
        except Exception as e:
            self.send_error_response(500, f"Market benchmarking error: {str(e)}")
    
    async def handle_executive_dashboard(self, data: Dict[str, Any]):
        """Handle executive dashboard generation request"""
        dashboard_type = data.get("dashboard_type", "overview")
        time_period = data.get("time_period", "12_months")
        focus_areas = data.get("focus_areas", [])
        
        try:
            framework = get_framework()
            router = get_router()
            
            if "business_impact" not in framework.agents:
                agent = BusinessImpactAgent()
                framework.register_agent(agent)
            
            message = router.create_message(
                from_agent="api_server",
                to_agent="business_impact",
                payload={
                    "type": "executive_dashboard",
                    "dashboard_type": dashboard_type,
                    "time_period": time_period,
                    "focus_areas": focus_areas
                },
                message_type=MessageType.REQUEST,
                priority=Priority.HIGH
            )
            
            agent = framework.agents["business_impact"]
            result = await agent.process_message(message.payload)
            
            result["request_id"] = message.message_id
            result["processed_at"] = datetime.now().isoformat()
            
            self.send_json_response(result)
            
        except Exception as e:
            self.send_error_response(500, f"Executive dashboard generation error: {str(e)}")
    
    async def handle_value_realization_tracking(self, data: Dict[str, Any]):
        """Handle value realization tracking request"""
        baseline_metrics = data.get("baseline_metrics", {})
        current_metrics = data.get("current_metrics", {})
        target_metrics = data.get("target_metrics", {})
        
        try:
            framework = get_framework()
            router = get_router()
            
            if "business_impact" not in framework.agents:
                agent = BusinessImpactAgent()
                framework.register_agent(agent)
            
            message = router.create_message(
                from_agent="api_server",
                to_agent="business_impact",
                payload={
                    "type": "value_realization_tracking",
                    "baseline_metrics": baseline_metrics,
                    "current_metrics": current_metrics,
                    "target_metrics": target_metrics
                },
                message_type=MessageType.REQUEST,
                priority=Priority.MEDIUM
            )
            
            agent = framework.agents["business_impact"]
            result = await agent.process_message(message.payload)
            
            result["request_id"] = message.message_id
            result["processed_at"] = datetime.now().isoformat()
            
            self.send_json_response(result)
            
        except Exception as e:
            self.send_error_response(500, f"Value realization tracking error: {str(e)}")
    
    async def handle_strategic_impact_analysis(self, data: Dict[str, Any]):
        """Handle strategic impact analysis request"""
        business_objectives = data.get("business_objectives", [])
        technology_roadmap = data.get("technology_roadmap", {})
        market_conditions = data.get("market_conditions", {})
        
        try:
            framework = get_framework()
            router = get_router()
            
            if "business_impact" not in framework.agents:
                agent = BusinessImpactAgent()
                framework.register_agent(agent)
            
            message = router.create_message(
                from_agent="api_server",
                to_agent="business_impact",
                payload={
                    "type": "strategic_impact_analysis",
                    "business_objectives": business_objectives,
                    "technology_roadmap": technology_roadmap,
                    "market_conditions": market_conditions
                },
                message_type=MessageType.REQUEST,
                priority=Priority.HIGH
            )
            
            agent = framework.agents["business_impact"]
            result = await agent.process_message(message.payload)
            
            result["request_id"] = message.message_id
            result["processed_at"] = datetime.now().isoformat()
            
            self.send_json_response(result)
            
        except Exception as e:
            self.send_error_response(500, f"Strategic impact analysis error: {str(e)}")
    
    def handle_get_dependencies(self, transaction_code: str):
        """Handle get dependencies endpoint"""
        if not transaction_code:
            self.send_error_response(400, "Transaction code is required")
            return
        
        # Create a simple synchronous dependency lookup
        try:
            # Load dependency data directly
            data_dir = os.path.join(os.path.dirname(__file__), 'data')
            with open(os.path.join(data_dir, 'dependency_graph.json'), 'r') as f:
                dependency_data = json.load(f)
            
            # Find dependencies for the transaction
            dependencies = []
            dependents = []
            
            for edge in dependency_data.get("edges", []):
                if edge["source"] == transaction_code:
                    dependencies.append(edge["target"])
                if edge["target"] == transaction_code:
                    dependents.append(edge["source"])
            
            # Get impact analysis
            impact_analysis = dependency_data.get("impact_analysis", {}).get(transaction_code, {})
            
            response_data = {
                "transaction_code": transaction_code,
                "dependencies": dependencies,
                "dependents": dependents,
                "impact_analysis": impact_analysis,
                "timestamp": datetime.now().isoformat()
            }
            
            self.send_json_response(response_data)
            
        except Exception as e:
            self.send_error_response(500, f"Error retrieving dependencies: {str(e)}")
    
    async def handle_analyze_requirement(self, data: Dict[str, Any]):
        """Handle requirement analysis endpoint"""
        requirement = data.get("requirement", "")
        context = data.get("context", {})
        
        if not requirement:
            self.send_error_response(400, "Requirement text is required")
            return
        
        try:
            # Get or create SAP Intelligence agent
            framework = get_framework()
            router = get_router()
            
            # Create agent if not exists
            if "sap_intelligence" not in framework.agents:
                agent = SAPIntelligenceAgent()
                framework.register_agent(agent)
            
            # Send analysis message
            message = router.create_message(
                from_agent="api_server",
                to_agent="sap_intelligence",
                payload={
                    "type": "analyze_requirement",
                    "requirement": requirement,
                    "context": context
                },
                message_type=MessageType.REQUEST,
                priority=Priority.HIGH
            )
            
            # Process message
            agent = framework.agents["sap_intelligence"]
            result = await agent.process_message(message.payload)
            
            # Add metadata
            result["request_id"] = message.message_id
            result["processed_at"] = datetime.now().isoformat()
            
            self.send_json_response(result)
            
        except Exception as e:
            self.send_error_response(500, f"Analysis error: {str(e)}")
    
    async def handle_generate_tests(self, data: Dict[str, Any]):
        """Handle test generation endpoint"""
        analysis = data.get("analysis", {})
        requirements = data.get("requirements", {})
        
        if not analysis:
            self.send_error_response(400, "Analysis data is required")
            return
        
        try:
            framework = get_framework()
            router = get_router()
            
            # Create agent if not exists
            if "test_generation" not in framework.agents:
                agent = TestGenerationAgent()
                framework.register_agent(agent)
            
            # Send test generation message
            message = router.create_message(
                from_agent="api_server",
                to_agent="test_generation",
                payload={
                    "type": "generate_tests",
                    "analysis": analysis,
                    "requirements": requirements
                },
                message_type=MessageType.REQUEST,
                priority=Priority.HIGH
            )
            
            # Process message
            agent = framework.agents["test_generation"]
            result = await agent.process_message(message.payload)
            
            # Add metadata
            result["request_id"] = message.message_id
            result["processed_at"] = datetime.now().isoformat()
            
            self.send_json_response(result)
            
        except Exception as e:
            self.send_error_response(500, f"Test generation error: {str(e)}")
    
    async def handle_analyze_dependencies(self, data: Dict[str, Any]):
        """Handle dependency analysis endpoint"""
        components = data.get("components", [])
        depth = data.get("depth", 2)
        include_indirect = data.get("include_indirect", True)
        
        if not components:
            self.send_error_response(400, "Components list is required")
            return
        
        try:
            framework = get_framework()
            router = get_router()
            
            # Create agent if not exists
            if "dependency_analysis" not in framework.agents:
                agent = DependencyAnalysisAgent()
                framework.register_agent(agent)
            
            # Send dependency analysis message
            message = router.create_message(
                from_agent="api_server",
                to_agent="dependency_analysis",
                payload={
                    "type": "analyze_dependencies",
                    "components": components,
                    "depth": depth,
                    "include_indirect": include_indirect
                },
                message_type=MessageType.REQUEST,
                priority=Priority.HIGH
            )
            
            # Process message
            agent = framework.agents["dependency_analysis"]
            result = await agent.process_message(message.payload)
            
            # Add metadata
            result["request_id"] = message.message_id
            result["processed_at"] = datetime.now().isoformat()
            
            self.send_json_response(result)
            
        except Exception as e:
            self.send_error_response(500, f"Dependency analysis error: {str(e)}")
    
    async def handle_impact_assessment(self, data: Dict[str, Any]):
        """Handle impact assessment endpoint"""
        change_type = data.get("change_type", "configuration")
        components = data.get("components", [])
        scope = data.get("scope", "minor")
        
        try:
            framework = get_framework()
            router = get_router()
            
            # Create agent if not exists
            if "dependency_analysis" not in framework.agents:
                agent = DependencyAnalysisAgent()
                framework.register_agent(agent)
            
            # Send impact assessment message
            message = router.create_message(
                from_agent="api_server",
                to_agent="dependency_analysis",
                payload={
                    "type": "impact_assessment",
                    "change_type": change_type,
                    "components": components,
                    "scope": scope
                },
                message_type=MessageType.REQUEST,
                priority=Priority.HIGH
            )
            
            # Process message
            agent = framework.agents["dependency_analysis"]
            result = await agent.process_message(message.payload)
            
            # Add metadata
            result["request_id"] = message.message_id
            result["processed_at"] = datetime.now().isoformat()
            
            self.send_json_response(result)
            
        except Exception as e:
            self.send_error_response(500, f"Impact assessment error: {str(e)}")
    
    async def handle_simulate_change(self, data: Dict[str, Any]):
        """Handle change simulation endpoint"""
        changes = data.get("changes", [])
        scope = data.get("scope", "immediate")
        
        if not changes:
            self.send_error_response(400, "Changes list is required")
            return
        
        try:
            framework = get_framework()
            router = get_router()
            
            # Create agent if not exists
            if "dependency_analysis" not in framework.agents:
                agent = DependencyAnalysisAgent()
                framework.register_agent(agent)
            
            # Send simulation message
            message = router.create_message(
                from_agent="api_server",
                to_agent="dependency_analysis",
                payload={
                    "type": "change_simulation",
                    "changes": changes,
                    "scope": scope
                },
                message_type=MessageType.REQUEST,
                priority=Priority.HIGH
            )
            
            # Process message
            agent = framework.agents["dependency_analysis"]
            result = await agent.process_message(message.payload)
            
            # Add metadata
            result["request_id"] = message.message_id
            result["processed_at"] = datetime.now().isoformat()
            
            self.send_json_response(result)
            
        except Exception as e:
            self.send_error_response(500, f"Change simulation error: {str(e)}")
    
    async def handle_start_workflow(self, data: Dict[str, Any]):
        """Handle workflow start endpoint"""
        workflow_type = data.get("workflow_type", "sap_testing")
        initiator = data.get("initiator", "api_user")
        parameters = data.get("parameters", {})
        
        try:
            framework = get_framework()
            
            # Start workflow
            workflow_id = framework.start_workflow(
                workflow_id=f"{workflow_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                initiator=initiator,
                parameters=parameters
            )
            
            result = {
                "status": "success",
                "workflow_id": workflow_id,
                "workflow_type": workflow_type,
                "started_at": datetime.now().isoformat()
            }
            
            self.send_json_response(result)
            
        except Exception as e:
            self.send_error_response(500, f"Workflow start error: {str(e)}")
    
    def log_message(self, format, *args):
        """Override to customize logging"""
        print(f"[{datetime.now().isoformat()}] {format % args}")
    
    def handle_real_time_monitoring(self):
        """Handle real-time monitoring data endpoint"""
        try:
            monitor = get_agent_monitor()
            real_time_data = monitor.get_real_time_state()
            
            response = {
                "success": True,
                "data": real_time_data,
                "timestamp": datetime.now().isoformat()
            }
            
            self.send_json_response(response)
            
        except Exception as e:
            self.send_error_response(500, f"Real-time monitoring error: {str(e)}")
    
    def handle_network_topology(self):
        """Handle agent network topology endpoint"""
        try:
            monitor = get_agent_monitor()
            topology_data = monitor.get_agent_network_topology()
            
            response = {
                "success": True,
                "data": topology_data,
                "timestamp": datetime.now().isoformat()
            }
            
            self.send_json_response(response)
            
        except Exception as e:
            self.send_error_response(500, f"Network topology error: {str(e)}")
    
    def handle_activity_history(self, limit: int = 100):
        """Handle agent activity history endpoint"""
        try:
            monitor = get_agent_monitor()
            real_time_data = monitor.get_real_time_state()
            
            # Get recent activities and message flows from real-time data
            recent_activities = real_time_data.get("recent_activities", [])[-limit:]
            recent_message_flows = real_time_data.get("recent_message_flows", [])[-limit:]
            
            response = {
                "success": True,
                "data": {
                    "activities": recent_activities,
                    "message_flows": recent_message_flows,
                    "limit": limit,
                    "total_activities": len(recent_activities),
                    "total_message_flows": len(recent_message_flows)
                },
                "timestamp": datetime.now().isoformat()
            }
            
            self.send_json_response(response)
            
        except Exception as e:
            self.send_error_response(500, f"Activity history error: {str(e)}")


class ASTCServer:
    """Main ASTC server class that coordinates the HTTP server and agent framework"""
    
    def __init__(self, host='localhost', port=8000):
        self.host = host
        self.port = port
        self.server = None
        self.framework = None
        
        # Initialize agent monitoring
        initialize_agent_monitor()
        
        # Initialize framework
        self.framework = get_framework()
        self._register_agents()
    
    def _register_agents(self):
        """Register all agents with the framework"""
        # Create and register agents
        sap_agent = SAPIntelligenceAgent()
        test_agent = TestGenerationAgent()
        dep_agent = DependencyAnalysisAgent()
        exec_agent = TestExecutionAgent()
        script_agent = ScriptGenerationAgent()
        persona_agent = PersonaAdaptationAgent()
        dep_intel_agent = DependencyIntelligenceAgent()
        business_agent = BusinessImpactAgent()
        
        self.framework.register_agent(sap_agent)
        self.framework.register_agent(test_agent)
        self.framework.register_agent(dep_agent)
        self.framework.register_agent(exec_agent)
        self.framework.register_agent(script_agent)
        self.framework.register_agent(persona_agent)
        self.framework.register_agent(dep_intel_agent)
        self.framework.register_agent(business_agent)
        
        print(f"Registered {len(self.framework.agents)} agents:")
        for agent_id, agent_obj in self.framework.agents.items():
            print(f"  - {agent_id}: {agent_obj.__class__.__name__}")
    
    def start(self):
        """Start the HTTP server"""
        try:
            print("Initializing ASTC Agent Framework...")
            
            # Create HTTP server
            self.server = HTTPServer((self.host, self.port), ASTCRequestHandler)
            
            print(f"ASTC Server starting on http://{self.host}:{self.port}")
            print("Available endpoints:")
            print("  GET  /api/health - Health check")
            print("  GET  /api/agents/status - Agent status")
            print("  GET  /api/framework/status - Framework status")
            print("  GET  /api/dependencies?transaction=<code> - Get dependencies")
            print("  POST /api/analyze - Analyze SAP requirements")
            print("  POST /api/generate-tests - Generate test cases")
            print("  POST /api/analyze-dependencies - Analyze dependencies")
            print("  POST /api/impact-assessment - Assess change impact")
            print("  POST /api/simulate-change - Simulate changes")
            print("  GET  /api/monitoring/real-time - Real-time monitoring")
            print("  GET  /api/monitoring/network-topology - Agent network topology")
            print("  GET  /api/monitoring/activity-history - Agent activity history")
            print("")
            print("Press Ctrl+C to stop the server")
            
            self.server.serve_forever()
            
        except KeyboardInterrupt:
            print("\nShutting down ASTC Server...")
            self.stop()
        except Exception as e:
            print(f"Server error: {e}")
            self.stop()
    
    def stop(self):
        """Stop the HTTP server"""
        if self.server:
            self.server.shutdown()
            self.server.server_close()
        
        print("ASTC Server stopped")


if __name__ == "__main__":
    server = ASTCServer()
    server.start() 
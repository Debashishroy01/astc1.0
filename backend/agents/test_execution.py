"""
Test Execution Agent
Real agent implementation for executing SAP test cases with simulation and auto-healing
"""

import json
import time
import random
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

from framework.mock_neuro_san import Agent
from framework.communication import MessageType, Priority, get_router


class ExecutionStatus(Enum):
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class TestResult(Enum):
    PASSED = "passed"
    FAILED = "failed"
    SKIPPED = "skipped"
    ERROR = "error"


@dataclass
class ExecutionStep:
    step_number: int
    description: str
    status: str
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    duration_ms: Optional[int] = None
    details: Optional[str] = None
    error_message: Optional[str] = None
    error_code: Optional[str] = None
    screenshot: Optional[str] = None


@dataclass
class TestExecution:
    execution_id: str
    test_case_id: str
    test_name: str
    transaction: str
    status: ExecutionStatus
    result: Optional[TestResult]
    start_time: str
    end_time: Optional[str] = None
    duration_seconds: Optional[float] = None
    current_step: int = 0
    total_steps: int = 0
    execution_steps: List[ExecutionStep] = None
    performance_metrics: Dict[str, Any] = None
    validations: List[Dict[str, Any]] = None
    auto_healing: Optional[Dict[str, Any]] = None
    environment: Dict[str, str] = None

    def __post_init__(self):
        if self.execution_steps is None:
            self.execution_steps = []
        if self.performance_metrics is None:
            self.performance_metrics = {}
        if self.validations is None:
            self.validations = []
        if self.environment is None:
            self.environment = {
                "system": "SAP ECC 6.0",
                "client": "100",
                "server": "SAPDEV01",
                "response_time": "Good"
            }


class TestExecutionAgent(Agent):
    """
    Real Test Execution Agent with SAP-specific execution logic
    """
    
    def __init__(self):
        super().__init__(
            agent_id="test_execution",
            name="Test Execution Agent",
            capabilities=[
                "test_suite_execution",
                "sap_transaction_simulation",
                "execution_result_analysis", 
                "auto_healing_recommendations",
                "performance_monitoring",
                "failure_pattern_recognition"
            ]
        )
        
        # Execution state management
        self.active_executions: Dict[str, TestExecution] = {}
        self.execution_queue: List[str] = []
        self.execution_history: List[TestExecution] = []
        self.max_concurrent_executions = 3
        
        # SAP-specific knowledge base
        self.sap_transaction_complexity = {
            "ME21N": {"base_time": 45, "complexity": "medium", "failure_rate": 0.15},
            "MIGO": {"base_time": 30, "complexity": "low", "failure_rate": 0.08},
            "VA01": {"base_time": 60, "complexity": "high", "failure_rate": 0.22},
            "FB60": {"base_time": 40, "complexity": "medium", "failure_rate": 0.12},
            "ME28": {"base_time": 25, "complexity": "low", "failure_rate": 0.05},
            "MIRO": {"base_time": 50, "complexity": "high", "failure_rate": 0.18},
            "VF01": {"base_time": 35, "complexity": "medium", "failure_rate": 0.10},
            "VL01N": {"base_time": 55, "complexity": "high", "failure_rate": 0.20}
        }
        
        # Common SAP error patterns and healing strategies
        self.error_patterns = {
            "approval_timeout": {
                "description": "Workflow approval timeout",
                "frequency": 0.35,
                "healing_strategies": [
                    {"action": "retry_with_alternative_approver", "success_rate": 0.85},
                    {"action": "extend_timeout_period", "success_rate": 0.60},
                    {"action": "use_emergency_approval", "success_rate": 0.95}
                ]
            },
            "vendor_invalid": {
                "description": "Invalid or blocked vendor",
                "frequency": 0.25,
                "healing_strategies": [
                    {"action": "suggest_alternative_vendor", "success_rate": 0.90},
                    {"action": "unblock_vendor_temporarily", "success_rate": 0.75},
                    {"action": "create_new_vendor_record", "success_rate": 0.95}
                ]
            },
            "material_not_found": {
                "description": "Material master not maintained",
                "frequency": 0.20,
                "healing_strategies": [
                    {"action": "suggest_similar_material", "success_rate": 0.80},
                    {"action": "create_material_master", "success_rate": 0.90},
                    {"action": "use_material_substitution", "success_rate": 0.70}
                ]
            },
            "authorization_missing": {
                "description": "User lacks required authorization",
                "frequency": 0.15,
                "healing_strategies": [
                    {"action": "assign_temporary_authorization", "success_rate": 0.85},
                    {"action": "use_authorized_user", "success_rate": 0.95},
                    {"action": "request_authorization_from_admin", "success_rate": 0.70}
                ]
            },
            "network_timeout": {
                "description": "Network connection timeout",
                "frequency": 0.05,
                "healing_strategies": [
                    {"action": "retry_with_backoff", "success_rate": 0.75},
                    {"action": "switch_to_backup_server", "success_rate": 0.90},
                    {"action": "reduce_transaction_complexity", "success_rate": 0.60}
                ]
            }
        }

    async def process_message(self, message: Dict[str, Any]) -> Dict[str, Any]:
        """Process incoming messages for test execution requests"""
        message_type = message.get("type", "")
        
        try:
            if message_type == "execute_test_suite":
                return await self.execute_test_suite(message.get("test_cases", []))
            
            elif message_type == "execute_single_test":
                return await self.execute_single_test(message.get("test_case", {}))
            
            elif message_type == "get_execution_status":
                return self.get_execution_status(message.get("execution_id", ""))
            
            elif message_type == "cancel_execution":
                return self.cancel_execution(message.get("execution_id", ""))
            
            elif message_type == "analyze_execution_results":
                return await self.analyze_execution_results(message.get("execution_id", ""))
            
            elif message_type == "get_execution_history":
                return self.get_execution_history(message.get("limit", 50))
            
            else:
                return {
                    "success": False,
                    "error": f"Unknown message type: {message_type}",
                    "agent": self.agent_id
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Error processing message: {str(e)}",
                "agent": self.agent_id,
                "message_type": message_type
            }

    async def execute_test_suite(self, test_cases: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Execute a complete test suite with multiple test cases"""
        
        if not test_cases:
            return {
                "success": False,
                "error": "No test cases provided for execution",
                "agent": self.agent_id
            }
        
        suite_id = f"suite_{int(time.time() * 1000)}"
        executions = []
        
        # Create executions for each test case
        for test_case in test_cases:
            execution = await self._create_test_execution(test_case, suite_id)
            executions.append(execution)
            
            # Add to queue if we're at capacity
            if len(self.active_executions) >= self.max_concurrent_executions:
                self.execution_queue.append(execution.execution_id)
            else:
                # Start execution immediately
                await self._start_execution(execution)
        
        return {
            "success": True,
            "suite_id": suite_id,
            "total_tests": len(test_cases),
            "executions": [
                {
                    "execution_id": exec.execution_id,
                    "test_name": exec.test_name,
                    "status": exec.status.value,
                    "estimated_duration": self._estimate_duration(exec.transaction)
                }
                for exec in executions
            ],
            "agent": self.agent_id,
            "timestamp": datetime.now().isoformat()
        }

    async def execute_single_test(self, test_case: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a single test case"""
        
        if not test_case:
            return {
                "success": False,
                "error": "No test case provided for execution",
                "agent": self.agent_id
            }
        
        execution = await self._create_test_execution(test_case)
        
        # Start execution immediately if capacity allows
        if len(self.active_executions) < self.max_concurrent_executions:
            await self._start_execution(execution)
            status = "running"
        else:
            self.execution_queue.append(execution.execution_id)
            status = "queued"
        
        return {
            "success": True,
            "execution_id": execution.execution_id,
            "test_name": execution.test_name,
            "status": status,
            "estimated_duration": self._estimate_duration(execution.transaction),
            "monitoring_url": f"/api/execution/status/{execution.execution_id}",
            "agent": self.agent_id,
            "timestamp": datetime.now().isoformat()
        }

    async def _create_test_execution(self, test_case: Dict[str, Any], suite_id: str = None) -> TestExecution:
        """Create a new test execution instance"""
        
        execution_id = f"exec_{int(time.time() * 1000)}_{random.randint(100, 999)}"
        transaction = test_case.get("transaction_code", test_case.get("transaction", "ME21N"))
        
        # Generate execution steps based on transaction type
        steps = self._generate_execution_steps(transaction, test_case)
        
        execution = TestExecution(
            execution_id=execution_id,
            test_case_id=test_case.get("test_id", test_case.get("id", f"test_{random.randint(1000, 9999)}")),
            test_name=test_case.get("name", f"Test execution for {transaction}"),
            transaction=transaction,
            status=ExecutionStatus.QUEUED,
            result=None,
            start_time=datetime.now().isoformat(),
            total_steps=len(steps),
            execution_steps=steps
        )
        
        # Store the execution
        self.active_executions[execution_id] = execution
        
        return execution

    def _generate_execution_steps(self, transaction: str, test_case: Dict[str, Any]) -> List[ExecutionStep]:
        """Generate realistic execution steps for SAP transactions"""
        
        base_steps = [
            "Login to SAP system",
            f"Navigate to {transaction} transaction",
            "Enter transaction data",
            "Validate input fields",
            "Save transaction",
            "Verify transaction completion"
        ]
        
        # Add transaction-specific steps
        transaction_steps = {
            "ME21N": [
                "Enter vendor information",
                "Add material line items",
                "Set delivery details",
                "Check approval workflow",
                "Generate purchase order number"
            ],
            "MIGO": [
                "Reference purchase order",
                "Enter received quantities",
                "Check quality inspection",
                "Post goods receipt",
                "Generate material document"
            ],
            "VA01": [
                "Enter customer information",
                "Add product line items",
                "Check ATP availability",
                "Calculate pricing",
                "Generate sales order number"
            ],
            "FB60": [
                "Enter vendor invoice details",
                "Reference purchase order",
                "Validate tax calculations",
                "Check approval limits",
                "Post invoice document"
            ]
        }
        
        # Combine base steps with transaction-specific steps
        all_steps = base_steps[:2]  # Login and navigation
        if transaction in transaction_steps:
            all_steps.extend(transaction_steps[transaction])
        all_steps.extend(base_steps[2:])  # Remaining base steps
        
        # Convert to ExecutionStep objects
        steps = []
        for i, description in enumerate(all_steps, 1):
            steps.append(ExecutionStep(
                step_number=i,
                description=description,
                status="pending"
            ))
        
        return steps

    async def _start_execution(self, execution: TestExecution):
        """Start the actual test execution process"""
        
        execution.status = ExecutionStatus.RUNNING
        execution.current_step = 1
        
        # Simulate the execution process
        await self._simulate_sap_execution(execution)

    async def _simulate_sap_execution(self, execution: TestExecution):
        """Simulate realistic SAP transaction execution with timing and potential failures"""
        
        transaction = execution.transaction
        complexity = self.sap_transaction_complexity.get(transaction, {
            "base_time": 45, "complexity": "medium", "failure_rate": 0.15
        })
        
        total_duration = 0
        current_time = datetime.now()
        
        # Process each execution step
        for i, step in enumerate(execution.execution_steps):
            execution.current_step = i + 1
            
            # Calculate step timing based on complexity
            base_step_time = complexity["base_time"] / len(execution.execution_steps)
            step_time = base_step_time * random.uniform(0.7, 1.8)  # Add variance
            
            # Start step
            step.status = "running"
            step.start_time = current_time.isoformat()
            
            # Simulate step execution time (in real implementation, this would be actual SAP interaction)
            await self._simulate_step_delay(step_time / 10)  # Scale down for demo
            
            # Determine if step should fail
            should_fail = self._should_step_fail(transaction, step, i)
            
            if should_fail:
                # Handle step failure
                error_info = self._generate_step_error(transaction, step)
                step.status = "failed"
                step.error_message = error_info["message"]
                step.error_code = error_info["code"]
                step.details = error_info["details"]
                
                # Attempt auto-healing
                healing_result = await self._attempt_auto_healing(execution, step, error_info)
                
                if healing_result["success"]:
                    # Healing successful, continue
                    step.status = "passed"
                    step.details += f" | Auto-healed: {healing_result['action']}"
                    execution.auto_healing = healing_result
                else:
                    # Healing failed, mark execution as failed
                    execution.status = ExecutionStatus.FAILED
                    execution.result = TestResult.FAILED
                    break
            else:
                # Step passed
                step.status = "passed"
                step.details = self._generate_step_success_details(transaction, step)
            
            # Complete step timing
            current_time = datetime.now()
            step.end_time = current_time.isoformat()
            step.duration_ms = int(step_time * 1000)
            total_duration += step_time
            
            # Generate screenshot reference
            step.screenshot = f"{execution.execution_id}_step_{i+1}.png"
        
        # Complete execution
        if execution.status == ExecutionStatus.RUNNING:
            execution.status = ExecutionStatus.COMPLETED
            execution.result = TestResult.PASSED
        
        execution.end_time = datetime.now().isoformat()
        execution.duration_seconds = total_duration
        
        # Generate performance metrics
        execution.performance_metrics = self._calculate_performance_metrics(execution)
        
        # Generate validations
        execution.validations = self._generate_validations(execution)
        
        # Move to history and clean up
        self.execution_history.append(execution)
        del self.active_executions[execution.execution_id]
        
        # Start next queued execution if any
        await self._process_execution_queue()

    async def _simulate_step_delay(self, seconds: float):
        """Simulate step execution delay (scaled for demo purposes)"""
        await self._async_sleep(seconds)

    async def _async_sleep(self, seconds: float):
        """Async sleep implementation"""
        # In a real implementation, this would use asyncio.sleep()
        # For this demo, we'll use a simple time delay
        time.sleep(max(0.1, min(seconds, 2.0)))  # Cap at 2 seconds for demo

    def _should_step_fail(self, transaction: str, step: ExecutionStep, step_index: int) -> bool:
        """Determine if a step should fail based on transaction complexity and patterns"""
        
        complexity = self.sap_transaction_complexity.get(transaction, {})
        base_failure_rate = complexity.get("failure_rate", 0.15)
        
        # Higher failure rates for certain steps
        critical_steps = ["Enter transaction data", "Save transaction", "Check approval workflow"]
        if step.description in critical_steps:
            failure_rate = base_failure_rate * 1.5
        else:
            failure_rate = base_failure_rate * 0.5
        
        # Reduce failure rate for early steps (login, navigation)
        if step_index < 2:
            failure_rate *= 0.2
        
        return random.random() < failure_rate

    def _generate_step_error(self, transaction: str, step: ExecutionStep) -> Dict[str, str]:
        """Generate realistic SAP error for failed step"""
        
        # Select error pattern based on step and transaction
        error_patterns = list(self.error_patterns.keys())
        weights = [self.error_patterns[pattern]["frequency"] for pattern in error_patterns]
        
        selected_pattern = random.choices(error_patterns, weights=weights)[0]
        pattern_info = self.error_patterns[selected_pattern]
        
        error_codes = {
            "approval_timeout": "ME_APPROVAL_TIMEOUT",
            "vendor_invalid": "ME_VENDOR_INVALID", 
            "material_not_found": "MM_MATERIAL_NOT_FOUND",
            "authorization_missing": "SY_NO_AUTHORIZATION",
            "network_timeout": "SY_NETWORK_TIMEOUT"
        }
        
        error_messages = {
            "approval_timeout": f"Approval workflow timeout - {step.description} requires manager approval",
            "vendor_invalid": f"Vendor validation failed - vendor does not exist or is blocked",
            "material_not_found": f"Material master not maintained for requested item",
            "authorization_missing": f"User lacks required authorization for {transaction}",
            "network_timeout": f"Network timeout during {step.description}"
        }
        
        return {
            "code": error_codes[selected_pattern],
            "message": error_messages[selected_pattern],
            "details": pattern_info["description"],
            "pattern": selected_pattern
        }

    async def _attempt_auto_healing(self, execution: TestExecution, failed_step: ExecutionStep, error_info: Dict[str, str]) -> Dict[str, Any]:
        """Attempt to auto-heal failed test execution"""
        
        pattern = error_info["pattern"]
        healing_strategies = self.error_patterns[pattern]["healing_strategies"]
        
        # Try healing strategies in order of success rate
        sorted_strategies = sorted(healing_strategies, key=lambda x: x["success_rate"], reverse=True)
        
        for strategy in sorted_strategies:
            success_rate = strategy["success_rate"]
            
            if random.random() < success_rate:
                return {
                    "success": True,
                    "action": strategy["action"],
                    "pattern": pattern,
                    "analysis": f"Auto-healing successful using {strategy['action']}",
                    "root_cause": error_info["details"],
                    "auto_retry_attempted": True,
                    "auto_retry_result": "success",
                    "auto_retry_details": f"Automatically resolved {pattern} by applying {strategy['action']}",
                    "recommendations": [
                        {
                            "action": strategy["action"],
                            "priority": "high",
                            "estimated_fix_time": "30 seconds",
                            "automation_available": True
                        }
                    ]
                }
        
        # All healing strategies failed
        return {
            "success": False,
            "action": "manual_intervention_required",
            "pattern": pattern,
            "analysis": f"Auto-healing failed for {pattern}",
            "root_cause": error_info["details"],
            "auto_retry_attempted": True,
            "auto_retry_result": "failed",
            "auto_retry_details": "All automated healing strategies failed",
            "recommendations": [
                {
                    "action": "manual_investigation_required",
                    "priority": "high",
                    "estimated_fix_time": "10 minutes",
                    "automation_available": False
                }
            ]
        }

    def _generate_step_success_details(self, transaction: str, step: ExecutionStep) -> str:
        """Generate realistic success details for completed steps"""
        
        details_templates = {
            "Login to SAP system": "Successful login with user credentials",
            "Navigate to {transaction} transaction": f"Transaction {transaction} loaded successfully",
            "Enter transaction data": "All required fields populated successfully",
            "Save transaction": "Transaction saved successfully",
            "Enter vendor information": "Vendor V001 validated and accepted",
            "Add material line items": "Material M001 added, price determined automatically",
            "Generate purchase order number": "Purchase order 4500123456 created successfully",
            "Post goods receipt": "Material document 5000654321 created successfully",
            "Generate sales order number": "Sales order 1000567890 created successfully"
        }
        
        return details_templates.get(step.description, f"Step '{step.description}' completed successfully")

    def _calculate_performance_metrics(self, execution: TestExecution) -> Dict[str, Any]:
        """Calculate realistic performance metrics for execution"""
        
        total_duration = execution.duration_seconds or 0
        step_durations = [step.duration_ms for step in execution.execution_steps if step.duration_ms]
        
        if not step_durations:
            return {}
        
        return {
            "total_duration": total_duration,
            "response_time_avg": sum(step_durations) // len(step_durations),
            "response_time_max": max(step_durations),
            "response_time_min": min(step_durations),
            "cpu_usage_avg": random.uniform(10.0, 25.0),
            "memory_usage_mb": random.randint(180, 300),
            "network_latency_ms": random.randint(15, 50)
        }

    def _generate_validations(self, execution: TestExecution) -> List[Dict[str, Any]]:
        """Generate realistic validations for the execution"""
        
        validations = []
        transaction = execution.transaction
        
        # Common validations for all transactions
        validations.append({
            "validation": "Transaction completion",
            "expected": f"{transaction} transaction completed successfully",
            "actual": f"{transaction} completed with success status",
            "status": "passed" if execution.result == TestResult.PASSED else "failed"
        })
        
        # Transaction-specific validations
        transaction_validations = {
            "ME21N": [
                {
                    "validation": "PO number generated",
                    "expected": "4500xxxxxx format",
                    "actual": "4500123456",
                    "status": "passed"
                },
                {
                    "validation": "Vendor validation",
                    "expected": "Active vendor status",
                    "actual": "Active vendor V001",
                    "status": "passed"
                }
            ],
            "MIGO": [
                {
                    "validation": "Material document created",
                    "expected": "5000xxxxxx format",
                    "actual": "5000654321",
                    "status": "passed"
                },
                {
                    "validation": "Quantity validation",
                    "expected": "Received quantity matches PO",
                    "actual": "100 units received",
                    "status": "passed"
                }
            ],
            "VA01": [
                {
                    "validation": "Sales order number generated",
                    "expected": "1000xxxxxx format",
                    "actual": "1000567890",
                    "status": "passed"
                },
                {
                    "validation": "ATP check",
                    "expected": "Sufficient stock available",
                    "actual": "Stock: 150 units available",
                    "status": "passed"
                }
            ]
        }
        
        if transaction in transaction_validations:
            validations.extend(transaction_validations[transaction])
        
        # If execution failed, mark some validations as failed
        if execution.result == TestResult.FAILED:
            for validation in validations[1:]:  # Keep first one as passed
                if random.random() < 0.4:  # 40% chance to fail validation
                    validation["status"] = "failed"
                    validation["actual"] = "Failed due to execution error"
        
        return validations

    def _estimate_duration(self, transaction: str) -> str:
        """Estimate execution duration for a transaction"""
        
        complexity = self.sap_transaction_complexity.get(transaction, {})
        base_time = complexity.get("base_time", 45)
        
        min_time = int(base_time * 0.8)
        max_time = int(base_time * 1.5)
        
        return f"{min_time}-{max_time} seconds"

    async def _process_execution_queue(self):
        """Process queued executions when capacity becomes available"""
        
        while (len(self.active_executions) < self.max_concurrent_executions and 
               self.execution_queue):
            
            execution_id = self.execution_queue.pop(0)
            
            # Find execution in history or create new one
            execution = None
            for exec in self.execution_history:
                if exec.execution_id == execution_id:
                    execution = exec
                    break
            
            if execution:
                self.active_executions[execution_id] = execution
                await self._start_execution(execution)

    def get_execution_status(self, execution_id: str) -> Dict[str, Any]:
        """Get current status of a specific execution"""
        
        # Check active executions
        if execution_id in self.active_executions:
            execution = self.active_executions[execution_id]
            return {
                "success": True,
                "execution": self._execution_to_dict(execution),
                "agent": self.agent_id
            }
        
        # Check execution history
        for execution in self.execution_history:
            if execution.execution_id == execution_id:
                return {
                    "success": True,
                    "execution": self._execution_to_dict(execution),
                    "agent": self.agent_id
                }
        
        return {
            "success": False,
            "error": f"Execution {execution_id} not found",
            "agent": self.agent_id
        }

    def cancel_execution(self, execution_id: str) -> Dict[str, Any]:
        """Cancel a running or queued execution"""
        
        # Remove from queue if queued
        if execution_id in self.execution_queue:
            self.execution_queue.remove(execution_id)
            return {
                "success": True,
                "message": f"Execution {execution_id} removed from queue",
                "agent": self.agent_id
            }
        
        # Cancel active execution
        if execution_id in self.active_executions:
            execution = self.active_executions[execution_id]
            execution.status = ExecutionStatus.CANCELLED
            execution.result = TestResult.SKIPPED
            execution.end_time = datetime.now().isoformat()
            
            # Move to history
            self.execution_history.append(execution)
            del self.active_executions[execution_id]
            
            return {
                "success": True,
                "message": f"Execution {execution_id} cancelled",
                "agent": self.agent_id
            }
        
        return {
            "success": False,
            "error": f"Execution {execution_id} not found or cannot be cancelled",
            "agent": self.agent_id
        }

    async def analyze_execution_results(self, execution_id: str) -> Dict[str, Any]:
        """Analyze execution results and provide insights"""
        
        execution = None
        
        # Find execution
        if execution_id in self.active_executions:
            execution = self.active_executions[execution_id]
        else:
            for exec in self.execution_history:
                if exec.execution_id == execution_id:
                    execution = exec
                    break
        
        if not execution:
            return {
                "success": False,
                "error": f"Execution {execution_id} not found",
                "agent": self.agent_id
            }
        
        # Perform analysis
        analysis = {
            "execution_id": execution_id,
            "overall_status": execution.status.value,
            "result": execution.result.value if execution.result else "in_progress",
            "performance_analysis": self._analyze_performance(execution),
            "quality_metrics": self._calculate_quality_metrics(execution),
            "improvement_recommendations": self._generate_improvement_recommendations(execution),
            "risk_assessment": self._assess_execution_risk(execution)
        }
        
        return {
            "success": True,
            "analysis": analysis,
            "agent": self.agent_id,
            "timestamp": datetime.now().isoformat()
        }

    def _analyze_performance(self, execution: TestExecution) -> Dict[str, Any]:
        """Analyze performance characteristics of the execution"""
        
        if not execution.performance_metrics:
            return {"status": "no_metrics_available"}
        
        metrics = execution.performance_metrics
        
        # Performance thresholds
        thresholds = {
            "response_time_good": 2000,  # ms
            "response_time_acceptable": 5000,  # ms
            "cpu_usage_good": 20.0,  # %
            "cpu_usage_high": 50.0,  # %
            "memory_usage_good": 200,  # MB
            "memory_usage_high": 400  # MB
        }
        
        avg_response = metrics.get("response_time_avg", 0)
        cpu_usage = metrics.get("cpu_usage_avg", 0)
        memory_usage = metrics.get("memory_usage_mb", 0)
        
        # Categorize performance
        if avg_response <= thresholds["response_time_good"]:
            response_rating = "excellent"
        elif avg_response <= thresholds["response_time_acceptable"]:
            response_rating = "good"
        else:
            response_rating = "poor"
        
        if cpu_usage <= thresholds["cpu_usage_good"]:
            cpu_rating = "excellent"
        elif cpu_usage <= thresholds["cpu_usage_high"]:
            cpu_rating = "acceptable"
        else:
            cpu_rating = "high"
        
        if memory_usage <= thresholds["memory_usage_good"]:
            memory_rating = "excellent"
        elif memory_usage <= thresholds["memory_usage_high"]:
            memory_rating = "acceptable"
        else:
            memory_rating = "high"
        
        return {
            "overall_rating": min(response_rating, cpu_rating, memory_rating, key=["excellent", "good", "acceptable", "poor"].index),
            "response_time_rating": response_rating,
            "cpu_usage_rating": cpu_rating,
            "memory_usage_rating": memory_rating,
            "metrics": metrics
        }

    def _calculate_quality_metrics(self, execution: TestExecution) -> Dict[str, Any]:
        """Calculate quality metrics for the execution"""
        
        total_steps = len(execution.execution_steps)
        passed_steps = len([s for s in execution.execution_steps if s.status == "passed"])
        failed_steps = len([s for s in execution.execution_steps if s.status == "failed"])
        
        passed_validations = len([v for v in execution.validations if v.get("status") == "passed"])
        total_validations = len(execution.validations)
        
        return {
            "step_success_rate": (passed_steps / total_steps * 100) if total_steps > 0 else 0,
            "validation_success_rate": (passed_validations / total_validations * 100) if total_validations > 0 else 0,
            "total_steps": total_steps,
            "passed_steps": passed_steps,
            "failed_steps": failed_steps,
            "auto_healing_applied": execution.auto_healing is not None,
            "auto_healing_success": execution.auto_healing.get("success", False) if execution.auto_healing else False
        }

    def _generate_improvement_recommendations(self, execution: TestExecution) -> List[Dict[str, Any]]:
        """Generate recommendations for improving test execution"""
        
        recommendations = []
        
        # Performance-based recommendations
        if execution.performance_metrics:
            avg_response = execution.performance_metrics.get("response_time_avg", 0)
            if avg_response > 3000:
                recommendations.append({
                    "category": "performance",
                    "priority": "medium",
                    "recommendation": "Consider optimizing transaction data entry to reduce response times",
                    "potential_improvement": "20-30% faster execution"
                })
        
        # Error-based recommendations
        failed_steps = [s for s in execution.execution_steps if s.status == "failed"]
        if failed_steps:
            recommendations.append({
                "category": "reliability",
                "priority": "high",
                "recommendation": "Implement pre-validation checks for transaction data",
                "potential_improvement": "50% reduction in execution failures"
            })
        
        # Auto-healing recommendations
        if execution.auto_healing and not execution.auto_healing.get("success", False):
            recommendations.append({
                "category": "automation",
                "priority": "high",
                "recommendation": "Enhance auto-healing strategies for detected error patterns",
                "potential_improvement": "Automated resolution of similar issues"
            })
        
        return recommendations

    def _assess_execution_risk(self, execution: TestExecution) -> Dict[str, Any]:
        """Assess risk factors in the execution"""
        
        risk_factors = []
        risk_score = 0
        
        # Transaction complexity risk
        transaction = execution.transaction
        complexity = self.sap_transaction_complexity.get(transaction, {})
        if complexity.get("complexity") == "high":
            risk_factors.append("High transaction complexity")
            risk_score += 3
        
        # Failure rate risk
        failure_rate = complexity.get("failure_rate", 0)
        if failure_rate > 0.2:
            risk_factors.append("High historical failure rate")
            risk_score += 2
        
        # Performance risk
        if execution.performance_metrics:
            avg_response = execution.performance_metrics.get("response_time_avg", 0)
            if avg_response > 5000:
                risk_factors.append("Poor response time performance")
                risk_score += 2
        
        # Auto-healing risk
        if execution.auto_healing and not execution.auto_healing.get("success", False):
            risk_factors.append("Auto-healing failures detected")
            risk_score += 1
        
        # Calculate risk level
        if risk_score >= 6:
            risk_level = "high"
        elif risk_score >= 3:
            risk_level = "medium"
        else:
            risk_level = "low"
        
        return {
            "risk_level": risk_level,
            "risk_score": risk_score,
            "risk_factors": risk_factors,
            "mitigation_required": risk_score >= 3
        }

    def get_execution_history(self, limit: int = 50) -> Dict[str, Any]:
        """Get execution history with summary statistics"""
        
        # Get recent executions
        recent_executions = self.execution_history[-limit:] if self.execution_history else []
        
        # Calculate summary statistics
        total_executions = len(self.execution_history)
        passed_executions = len([e for e in self.execution_history if e.result == TestResult.PASSED])
        failed_executions = len([e for e in self.execution_history if e.result == TestResult.FAILED])
        
        success_rate = (passed_executions / total_executions * 100) if total_executions > 0 else 0
        
        durations = [e.duration_seconds for e in self.execution_history if e.duration_seconds]
        avg_duration = sum(durations) / len(durations) if durations else 0
        
        auto_healing_attempts = len([e for e in self.execution_history if e.auto_healing])
        auto_healing_successes = len([e for e in self.execution_history 
                                    if e.auto_healing and e.auto_healing.get("success", False)])
        auto_healing_success_rate = (auto_healing_successes / auto_healing_attempts * 100) if auto_healing_attempts > 0 else 0
        
        return {
            "success": True,
            "executions": [self._execution_to_dict(e) for e in recent_executions],
            "summary_stats": {
                "total_executions": total_executions,
                "passed": passed_executions,
                "failed": failed_executions,
                "in_progress": len(self.active_executions),
                "success_rate": success_rate,
                "average_duration": avg_duration,
                "auto_healing_success_rate": auto_healing_success_rate
            },
            "real_time_monitoring": {
                "active_executions": len(self.active_executions),
                "queue_length": len(self.execution_queue),
                "system_health": "good",
                "resource_usage": {
                    "cpu_percent": random.uniform(15, 35),
                    "memory_percent": random.uniform(25, 55),
                    "disk_io_percent": random.uniform(5, 25)
                },
                "last_updated": datetime.now().isoformat()
            },
            "agent": self.agent_id,
            "timestamp": datetime.now().isoformat()
        }

    def _execution_to_dict(self, execution: TestExecution) -> Dict[str, Any]:
        """Convert TestExecution object to dictionary"""
        
        return {
            "execution_id": execution.execution_id,
            "test_case_id": execution.test_case_id,
            "test_name": execution.test_name,
            "transaction": execution.transaction,
            "status": execution.status.value,
            "result": execution.result.value if execution.result else None,
            "start_time": execution.start_time,
            "end_time": execution.end_time,
            "duration_seconds": execution.duration_seconds,
            "current_step": execution.current_step,
            "total_steps": execution.total_steps,
            "execution_steps": [
                {
                    "step": step.step_number,
                    "description": step.description,
                    "status": step.status,
                    "start_time": step.start_time,
                    "end_time": step.end_time,
                    "duration_ms": step.duration_ms,
                    "details": step.details,
                    "error_message": step.error_message,
                    "error_code": step.error_code,
                    "screenshot": step.screenshot
                }
                for step in execution.execution_steps
            ],
            "performance_metrics": execution.performance_metrics,
            "validations": execution.validations,
            "auto_healing": execution.auto_healing,
            "environment": execution.environment
        }

    def get_agent_status(self) -> Dict[str, Any]:
        """Get current status of the Test Execution Agent"""
        
        return {
            "agent_id": self.agent_id,
            "name": self.name,
            "status": "active",
            "capabilities": self.capabilities,
            "current_executions": len(self.active_executions),
            "queued_executions": len(self.execution_queue),
            "total_executed": len(self.execution_history),
            "last_activity": datetime.now().isoformat()
        } 
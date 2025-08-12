"""
Test Generation Agent
Creates comprehensive SAP test cases based on requirements analysis
"""

import json
import os
import time
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from framework.mock_neuro_san import Agent
from framework.communication import get_router, MessageType, Priority


class TestGenerationAgent(Agent):
    """
    Agent specialized in generating comprehensive SAP test cases
    Creates test scripts, data, and validation criteria based on analysis
    """
    
    def __init__(self):
        super().__init__(
            agent_id="test_generation",
            name="Test Generation Agent",
            capabilities=[
                "test_case_generation",
                "test_data_creation",
                "validation_criteria",
                "test_automation_scripting",
                "coverage_analysis"
            ]
        )
        self.test_templates = None
        self.sap_data = None
        self.load_test_knowledge()
    
    def load_test_knowledge(self):
        """Load test templates and SAP data"""
        try:
            data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
            
            with open(os.path.join(data_dir, 'test_templates.json'), 'r') as f:
                self.test_templates = json.load(f)
            
            with open(os.path.join(data_dir, 'sap_transactions.json'), 'r') as f:
                self.sap_data = json.load(f)
                
        except Exception as e:
            print(f"Error loading test knowledge: {e}")
            self.test_templates = {"templates": {}}
            self.sap_data = {"transactions": []}
    
    async def process_message(self, message: Dict[str, Any]) -> Dict[str, Any]:
        """Process incoming message and generate tests with monitoring"""
        start_time = time.time()
        message_type = message.get("type", "generate_tests")
        
        # Start processing with monitoring
        self.start_processing(message_type, {
            "requirements": message.get("requirements", {}),
            "analysis": message.get("analysis", {})
        })
        
        try:
            if message_type == "generate_tests":
                result = await self._generate_tests(message)
            elif message_type == "generate_and_execute_tests":
                result = await self._generate_and_execute_tests(message)
            elif message_type == "create_test_data":
                result = await self._create_test_data(message)
            elif message_type == "validate_coverage":
                result = await self._validate_coverage(message)
            elif message_type == "generate_automation_script":
                result = await self._generate_automation_script(message)
            else:
                result = {
                    "status": "error",
                    "error": f"Unknown message type: {message_type}",
                    "agent_id": self.agent_id
                }
            
            # Complete processing with monitoring
            processing_time = time.time() - start_time
            self.complete_processing(message_type, processing_time, {
                "success": result.get("status") != "error",
                "tests_generated": len(result.get("test_cases", [])),
                "message_type": message_type
            })
            
            return result
                
        except Exception as e:
            # Error processing with monitoring
            self.error_processing(message_type, str(e))
            return {
                "status": "error",
                "error": str(e),
                "agent_id": self.agent_id
            }
    
    async def _generate_tests(self, message: Dict[str, Any]) -> Dict[str, Any]:
        """Generate comprehensive test cases based on analysis"""
        analysis = message.get("analysis", {})
        requirements = message.get("requirements", {})
        
        test_cases = []
        
        # Generate tests for each identified transaction
        transactions = analysis.get("extracted_transactions", [])
        for transaction in transactions:
            transaction_tests = self._generate_transaction_tests(transaction, requirements)
            test_cases.extend(transaction_tests)
        
        # Generate integration tests if multiple transactions
        if len(transactions) > 1:
            integration_tests = self._generate_integration_tests(transactions, requirements)
            test_cases.extend(integration_tests)
        
        # Generate edge case and error tests
        error_tests = self._generate_error_tests(transactions, requirements)
        test_cases.extend(error_tests)
        
        # Calculate coverage metrics
        coverage = self._calculate_coverage(test_cases, transactions)
        
        return {
            "status": "success",
            "agent_id": self.agent_id,
            "test_suite": {
                "test_cases": test_cases,
                "total_tests": len(test_cases),
                "coverage_metrics": coverage,
                "estimated_execution_time": self._estimate_execution_time(test_cases),
                "generated_at": datetime.now().isoformat()
            },
            "recommendations": self._generate_test_recommendations(test_cases, analysis)
        }
    
    async def _generate_and_execute_tests(self, message: Dict[str, Any]) -> Dict[str, Any]:
        """Generate tests and send them to TestExecutionAgent for execution"""
        # First generate the test cases
        generation_result = await self._generate_tests(message)
        
        if generation_result.get("status") != "success":
            return generation_result
        
        test_cases = generation_result["test_suite"]["test_cases"]
        
        # Send test cases to TestExecutionAgent
        try:
            router = get_router()
            
            # Create message for TestExecutionAgent
            execution_message = router.create_message(
                from_agent=self.agent_id,
                to_agent="test_execution",
                payload={
                    "type": "execute_test_suite",
                    "test_cases": test_cases,
                    "originating_request": message
                },
                message_type=MessageType.REQUEST,
                priority=Priority.HIGH
            )
            
            # Get framework to route message to TestExecutionAgent
            from framework.mock_neuro_san import get_framework
            framework = get_framework()
            
            if "test_execution" in framework.agents:
                exec_agent = framework.agents["test_execution"]
                execution_result = await exec_agent.process_message(execution_message.payload)
                
                # Combine generation and execution results
                return {
                    "status": "success",
                    "agent_id": self.agent_id,
                    "test_generation": generation_result,
                    "test_execution": execution_result,
                    "workflow_completed": True,
                    "message_id": execution_message.message_id,
                    "timestamp": datetime.now().isoformat()
                }
            else:
                # TestExecutionAgent not available, return generation results only
                return {
                    "status": "success",
                    "agent_id": self.agent_id,
                    "test_generation": generation_result,
                    "test_execution": {
                        "status": "error",
                        "error": "TestExecutionAgent not available"
                    },
                    "workflow_completed": False,
                    "timestamp": datetime.now().isoformat()
                }
                
        except Exception as e:
            # Return generation results with execution error
            return {
                "status": "success",
                "agent_id": self.agent_id,
                "test_generation": generation_result,
                "test_execution": {
                    "status": "error",
                    "error": f"Failed to communicate with TestExecutionAgent: {str(e)}"
                },
                "workflow_completed": False,
                "timestamp": datetime.now().isoformat()
            }
    
    def _generate_transaction_tests(self, transaction: Dict[str, Any], requirements: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate test cases for a specific transaction"""
        transaction_code = transaction["code"]
        test_cases = []
        
        # Find template for this transaction
        template_name = self._find_template_for_transaction(transaction_code)
        if not template_name:
            # Generate generic test case
            test_cases.append(self._generate_generic_test(transaction, requirements))
            return test_cases
        
        template = self.test_templates["templates"].get(template_name, {})
        
        # Generate positive test case
        positive_test = self._create_test_case(
            test_id=str(uuid.uuid4()),
            name=f"{transaction_code} - {template.get('name', 'Standard Test')}",
            description=template.get('description', f"Test {transaction_code} functionality"),
            transaction_code=transaction_code,
            test_type="functional",
            priority="high",
            steps=template.get('steps', []),
            test_data=template.get('test_data', {}),
            validations=template.get('validations', []),
            expected_result=template.get('expected_result', 'Transaction completes successfully'),
            prerequisites=template.get('prerequisites', [])
        )
        test_cases.append(positive_test)
        
        # Generate negative test cases
        negative_tests = self._generate_negative_tests(transaction, template)
        test_cases.extend(negative_tests)
        
        # Generate authorization test
        auth_test = self._generate_authorization_test(transaction, template)
        test_cases.append(auth_test)
        
        return test_cases
    
    def _find_template_for_transaction(self, transaction_code: str) -> Optional[str]:
        """Find appropriate template for transaction"""
        # Map transaction codes to templates
        transaction_template_map = {
            "ME21N": "standard_po_creation",
            "FB60": "invoice_entry",
            "VA01": "sales_order_creation",
            "MIGO": "goods_receipt",
            "MIRO": "three_way_match"
        }
        
        return transaction_template_map.get(transaction_code)
    
    def _create_test_case(self, test_id: str, name: str, description: str, 
                         transaction_code: str, test_type: str, priority: str,
                         steps: List[str], test_data: Dict[str, Any],
                         validations: List[str], expected_result: str,
                         prerequisites: List[str]) -> Dict[str, Any]:
        """Create a structured test case"""
        return {
            "test_id": test_id,
            "name": name,
            "description": description,
            "transaction_code": transaction_code,
            "test_type": test_type,
            "priority": priority,
            "status": "draft",
            "steps": steps,
            "test_data": test_data,
            "validations": validations,
            "expected_result": expected_result,
            "prerequisites": prerequisites,
            "estimated_duration_minutes": len(steps) * 2,
            "created_at": datetime.now().isoformat(),
            "tags": self._generate_tags(transaction_code, test_type),
            "risk_level": self._get_transaction_risk(transaction_code)
        }
    
    def _generate_negative_tests(self, transaction: Dict[str, Any], template: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate negative test cases"""
        transaction_code = transaction["code"]
        negative_tests = []
        
        # Invalid data test
        invalid_data_test = self._create_test_case(
            test_id=str(uuid.uuid4()),
            name=f"{transaction_code} - Invalid Data Test",
            description=f"Test {transaction_code} with invalid input data",
            transaction_code=transaction_code,
            test_type="negative",
            priority="medium",
            steps=self._modify_steps_for_invalid_data(template.get('steps', [])),
            test_data=self._generate_invalid_test_data(template.get('test_data', {})),
            validations=[
                "System displays appropriate error message",
                "No data is saved to the system",
                "User is prompted to correct the input"
            ],
            expected_result="System rejects invalid data with clear error message",
            prerequisites=template.get('prerequisites', [])
        )
        negative_tests.append(invalid_data_test)
        
        # Missing mandatory fields test
        missing_fields_test = self._create_test_case(
            test_id=str(uuid.uuid4()),
            name=f"{transaction_code} - Missing Mandatory Fields",
            description=f"Test {transaction_code} with missing required fields",
            transaction_code=transaction_code,
            test_type="negative",
            priority="medium",
            steps=self._modify_steps_for_missing_fields(template.get('steps', [])),
            test_data=self._generate_incomplete_test_data(template.get('test_data', {})),
            validations=[
                "System highlights missing mandatory fields",
                "Error message indicates which fields are required",
                "Transaction cannot be saved until fields are completed"
            ],
            expected_result="System prevents submission and shows validation errors",
            prerequisites=template.get('prerequisites', [])
        )
        negative_tests.append(missing_fields_test)
        
        return negative_tests
    
    def _generate_authorization_test(self, transaction: Dict[str, Any], template: Dict[str, Any]) -> Dict[str, Any]:
        """Generate authorization test case"""
        transaction_code = transaction["code"]
        
        return self._create_test_case(
            test_id=str(uuid.uuid4()),
            name=f"{transaction_code} - Authorization Test",
            description=f"Test {transaction_code} with insufficient user authorization",
            transaction_code=transaction_code,
            test_type="security",
            priority="high",
            steps=[
                "Login with user having insufficient authorization",
                f"Attempt to access transaction {transaction_code}",
                "Verify access is denied",
                "Check authorization error message"
            ],
            test_data={"user": "LIMITED_USER", "transaction": transaction_code},
            validations=[
                "Access to transaction is denied",
                "Appropriate authorization error is displayed",
                "User is not able to proceed with transaction",
                "Security log entry is created"
            ],
            expected_result="System denies access and logs security event",
            prerequisites=["Limited authorization user account available"]
        )
    
    def _generate_integration_tests(self, transactions: List[Dict[str, Any]], requirements: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate integration test cases for multiple transactions"""
        integration_tests = []
        
        if len(transactions) < 2:
            return integration_tests
        
        # Generate end-to-end process test
        e2e_test = self._create_test_case(
            test_id=str(uuid.uuid4()),
            name="End-to-End Process Integration Test",
            description="Test complete business process across multiple transactions",
            transaction_code="INTEGRATION",
            test_type="integration",
            priority="high",
            steps=self._generate_integration_steps(transactions),
            test_data=self._generate_integration_test_data(transactions),
            validations=self._generate_integration_validations(transactions),
            expected_result="Complete business process executes successfully",
            prerequisites=["All master data is maintained", "System integrations are active"]
        )
        integration_tests.append(e2e_test)
        
        # Generate data flow test
        data_flow_test = self._create_test_case(
            test_id=str(uuid.uuid4()),
            name="Cross-Transaction Data Flow Test",
            description="Verify data consistency across transaction boundaries",
            transaction_code="DATA_FLOW",
            test_type="integration",
            priority="medium",
            steps=self._generate_data_flow_steps(transactions),
            test_data=self._generate_integration_test_data(transactions),
            validations=[
                "Data is consistently maintained across transactions",
                "Document relationships are properly established",
                "No data corruption occurs during process flow"
            ],
            expected_result="Data integrity maintained throughout process",
            prerequisites=["Clean test environment", "Valid master data"]
        )
        integration_tests.append(data_flow_test)
        
        return integration_tests
    
    def _generate_error_tests(self, transactions: List[Dict[str, Any]], requirements: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate error handling and edge case tests"""
        error_tests = []
        
        # System error simulation test
        error_test = self._create_test_case(
            test_id=str(uuid.uuid4()),
            name="System Error Handling Test",
            description="Test system behavior during error conditions",
            transaction_code="ERROR_HANDLING",
            test_type="error",
            priority="medium",
            steps=[
                "Start transaction in normal mode",
                "Simulate system error condition",
                "Verify error handling behavior",
                "Check system recovery capabilities"
            ],
            test_data={"error_type": "simulated", "recovery_expected": True},
            validations=[
                "System displays user-friendly error message",
                "No data corruption occurs",
                "System can recover gracefully",
                "Error is logged for support analysis"
            ],
            expected_result="System handles errors gracefully with proper user communication",
            prerequisites=["Error simulation capability available"]
        )
        error_tests.append(error_test)
        
        return error_tests
    
    def _generate_generic_test(self, transaction: Dict[str, Any], requirements: Dict[str, Any]) -> Dict[str, Any]:
        """Generate generic test case when no template is available"""
        transaction_code = transaction["code"]
        
        return self._create_test_case(
            test_id=str(uuid.uuid4()),
            name=f"{transaction_code} - Basic Functionality Test",
            description=f"Basic functional test for transaction {transaction_code}",
            transaction_code=transaction_code,
            test_type="functional",
            priority="medium",
            steps=[
                "Login to SAP system",
                f"Navigate to transaction {transaction_code}",
                "Enter valid test data",
                "Execute the transaction",
                "Verify successful completion",
                "Check system response"
            ],
            test_data={"transaction": transaction_code, "test_mode": "basic"},
            validations=[
                "Transaction executes without errors",
                "System displays success message",
                "Data is saved correctly"
            ],
            expected_result=f"Transaction {transaction_code} completes successfully",
            prerequisites=["Valid SAP system access", "Basic test data available"]
        )
    
    def _calculate_coverage(self, test_cases: List[Dict[str, Any]], transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate test coverage metrics"""
        total_transactions = len(transactions)
        tested_transactions = len(set(tc["transaction_code"] for tc in test_cases if tc["transaction_code"] != "INTEGRATION"))
        
        test_types = {}
        for test_case in test_cases:
            test_type = test_case["test_type"]
            test_types[test_type] = test_types.get(test_type, 0) + 1
        
        return {
            "transaction_coverage": (tested_transactions / total_transactions * 100) if total_transactions > 0 else 0,
            "total_test_cases": len(test_cases),
            "test_type_distribution": test_types,
            "coverage_completeness": self._assess_coverage_completeness(test_cases, transactions)
        }
    
    def _estimate_execution_time(self, test_cases: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Estimate test execution time"""
        total_minutes = sum(tc.get("estimated_duration_minutes", 10) for tc in test_cases)
        
        return {
            "total_minutes": total_minutes,
            "total_hours": round(total_minutes / 60, 2),
            "by_priority": {
                "high": sum(tc.get("estimated_duration_minutes", 10) for tc in test_cases if tc["priority"] == "high"),
                "medium": sum(tc.get("estimated_duration_minutes", 10) for tc in test_cases if tc["priority"] == "medium"),
                "low": sum(tc.get("estimated_duration_minutes", 10) for tc in test_cases if tc["priority"] == "low")
            }
        }
    
    def _generate_test_recommendations(self, test_cases: List[Dict[str, Any]], analysis: Dict[str, Any]) -> List[str]:
        """Generate recommendations for test execution"""
        recommendations = []
        
        high_priority_tests = [tc for tc in test_cases if tc["priority"] == "high"]
        if len(high_priority_tests) > 5:
            recommendations.append("Consider executing high-priority tests in phases")
        
        integration_tests = [tc for tc in test_cases if tc["test_type"] == "integration"]
        if integration_tests:
            recommendations.append("Execute integration tests after unit tests complete successfully")
        
        security_tests = [tc for tc in test_cases if tc["test_type"] == "security"]
        if security_tests:
            recommendations.append("Coordinate with security team for authorization testing")
        
        complexity = analysis.get("scope", {}).get("complexity_level", "Medium")
        if complexity == "High":
            recommendations.append("Consider additional stakeholder review due to high complexity")
        
        return recommendations
    
    # Helper methods for test data generation
    def _modify_steps_for_invalid_data(self, steps: List[str]) -> List[str]:
        """Modify steps to use invalid data"""
        modified_steps = []
        for step in steps:
            if "enter" in step.lower() and any(field in step.lower() for field in ["number", "code", "amount"]):
                modified_steps.append(step.replace("Enter", "Enter invalid"))
            else:
                modified_steps.append(step)
        return modified_steps
    
    def _generate_invalid_test_data(self, valid_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate invalid test data based on valid data"""
        invalid_data = valid_data.copy()
        
        # Make numeric fields invalid
        for key, value in invalid_data.items():
            if isinstance(value, str) and value.isdigit():
                invalid_data[key] = "INVALID"
            elif key.lower() in ["email", "mail"]:
                invalid_data[key] = "invalid-email"
            elif key.lower() in ["phone", "telephone"]:
                invalid_data[key] = "123"
        
        return invalid_data
    
    def _modify_steps_for_missing_fields(self, steps: List[str]) -> List[str]:
        """Modify steps to skip mandatory fields"""
        modified_steps = []
        skip_next = False
        
        for step in steps:
            if skip_next:
                modified_steps.append(f"Skip: {step}")
                skip_next = False
                continue
            
            if "enter" in step.lower() and any(field in step.lower() for field in ["mandatory", "required"]):
                skip_next = True
            
            modified_steps.append(step)
        
        return modified_steps
    
    def _generate_incomplete_test_data(self, complete_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate incomplete test data by removing required fields"""
        incomplete_data = complete_data.copy()
        
        # Remove some fields to simulate missing data
        required_fields = ["vendor", "material", "customer", "amount"]
        for field in required_fields:
            if field in incomplete_data:
                del incomplete_data[field]
                break  # Remove only one field
        
        return incomplete_data
    
    def _generate_integration_steps(self, transactions: List[Dict[str, Any]]) -> List[str]:
        """Generate steps for integration testing"""
        steps = ["Setup test environment with clean data"]
        
        for i, transaction in enumerate(transactions):
            steps.extend([
                f"Execute {transaction['code']} - {transaction['name']}",
                f"Verify {transaction['code']} completion and data creation",
                f"Validate data consistency after {transaction['code']}"
            ])
            
            if i < len(transactions) - 1:
                steps.append("Verify data is available for next transaction")
        
        steps.append("Validate end-to-end process completion")
        return steps
    
    def _generate_integration_test_data(self, transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate test data for integration testing"""
        return {
            "test_scenario": "integration",
            "transactions": [t["code"] for t in transactions],
            "data_consistency_check": True,
            "cleanup_required": True
        }
    
    def _generate_integration_validations(self, transactions: List[Dict[str, Any]]) -> List[str]:
        """Generate validations for integration testing"""
        validations = ["All transactions complete successfully"]
        
        for transaction in transactions:
            validations.append(f"{transaction['code']} creates expected data and documents")
        
        validations.extend([
            "Data flows correctly between transactions",
            "No data inconsistencies exist",
            "Business process completes end-to-end"
        ])
        
        return validations
    
    def _generate_data_flow_steps(self, transactions: List[Dict[str, Any]]) -> List[str]:
        """Generate steps for data flow testing"""
        return [
            "Initialize test with baseline data",
            "Execute first transaction and capture data state",
            "Verify data changes in relevant tables",
            "Execute subsequent transactions",
            "Validate data propagation between transactions",
            "Check for data integrity violations",
            "Verify final data state matches expectations"
        ]
    
    def _generate_tags(self, transaction_code: str, test_type: str) -> List[str]:
        """Generate tags for test case categorization"""
        tags = [transaction_code, test_type]
        
        # Add module tag
        module = self._get_transaction_module(transaction_code)
        if module:
            tags.append(module)
        
        # Add risk-based tags
        risk = self._get_transaction_risk(transaction_code)
        tags.append(f"risk-{risk.lower()}")
        
        return tags
    
    def _get_transaction_module(self, transaction_code: str) -> Optional[str]:
        """Get module for transaction code"""
        for transaction in self.sap_data.get("transactions", []):
            if transaction["code"] == transaction_code:
                return transaction.get("module")
        return None
    
    def _get_transaction_risk(self, transaction_code: str) -> str:
        """Get risk level for transaction code"""
        for transaction in self.sap_data.get("transactions", []):
            if transaction["code"] == transaction_code:
                return transaction.get("risk_level", "Medium")
        return "Medium"
    
    def _assess_coverage_completeness(self, test_cases: List[Dict[str, Any]], transactions: List[Dict[str, Any]]) -> str:
        """Assess completeness of test coverage"""
        if not test_cases:
            return "None"
        
        has_positive = any(tc["test_type"] == "functional" for tc in test_cases)
        has_negative = any(tc["test_type"] == "negative" for tc in test_cases)
        has_security = any(tc["test_type"] == "security" for tc in test_cases)
        
        coverage_score = sum([has_positive, has_negative, has_security])
        
        if coverage_score >= 3:
            return "Comprehensive"
        elif coverage_score >= 2:
            return "Good"
        elif coverage_score >= 1:
            return "Basic"
        else:
            return "Minimal"
    
    async def _create_test_data(self, message: Dict[str, Any]) -> Dict[str, Any]:
        """Create test data for specific scenarios"""
        scenario = message.get("scenario", "")
        transaction_code = message.get("transaction_code", "")
        
        test_data = self._generate_scenario_test_data(scenario, transaction_code)
        
        return {
            "status": "success",
            "agent_id": self.agent_id,
            "test_data": test_data
        }
    
    def _generate_scenario_test_data(self, scenario: str, transaction_code: str) -> Dict[str, Any]:
        """Generate test data for a specific scenario"""
        base_data = {
            "scenario": scenario,
            "transaction": transaction_code,
            "created_at": datetime.now().isoformat()
        }
        
        # Add transaction-specific data
        if transaction_code == "ME21N":
            base_data.update({
                "vendor": "V001",
                "material": "M001",
                "quantity": "10",
                "price": "100.00"
            })
        elif transaction_code == "VA01":
            base_data.update({
                "customer": "C001",
                "material": "M001",
                "quantity": "5",
                "delivery_date": (datetime.now() + timedelta(days=7)).isoformat()
            })
        
        return base_data
    
    async def _validate_coverage(self, message: Dict[str, Any]) -> Dict[str, Any]:
        """Validate test coverage for requirements"""
        test_cases = message.get("test_cases", [])
        requirements = message.get("requirements", {})
        
        coverage_report = {
            "overall_coverage": "Good",
            "coverage_gaps": [],
            "recommendations": []
        }
        
        return {
            "status": "success",
            "agent_id": self.agent_id,
            "coverage_report": coverage_report
        }
    
    async def _generate_automation_script(self, message: Dict[str, Any]) -> Dict[str, Any]:
        """Generate test automation script"""
        test_case = message.get("test_case", {})
        
        script = self._create_automation_script(test_case)
        
        return {
            "status": "success",
            "agent_id": self.agent_id,
            "automation_script": script
        }
    
    def _create_automation_script(self, test_case: Dict[str, Any]) -> Dict[str, Any]:
        """Create automation script for test case"""
        return {
            "script_id": str(uuid.uuid4()),
            "test_case_id": test_case.get("test_id"),
            "script_language": "Python",
            "framework": "SAP GUI Scripting",
            "script_content": "# Automated test script placeholder",
            "created_at": datetime.now().isoformat()
        } 
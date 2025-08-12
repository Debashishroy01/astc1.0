"""
Basic validation tests for ASTC agents
"""

import unittest
import sys
import os
import asyncio

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents.sap_intelligence import SAPIntelligenceAgent
from agents.test_generation import TestGenerationAgent
from agents.dependency_analysis import DependencyAnalysisAgent
from framework.mock_neuro_san import MockAgentFramework


class TestSAPIntelligenceAgent(unittest.TestCase):
    """Test cases for SAP Intelligence Agent"""
    
    def setUp(self):
        self.agent = SAPIntelligenceAgent()
    
    def test_agent_initialization(self):
        """Test agent initializes correctly"""
        self.assertEqual(self.agent.agent_id, "sap_intelligence")
        self.assertEqual(self.agent.name, "SAP Intelligence Agent")
        self.assertIn("natural_language_processing", self.agent.capabilities)
        self.assertIsNotNone(self.agent.sap_data)
    
    def test_transaction_extraction(self):
        """Test transaction code extraction from text"""
        text = "Test ME21N purchase order creation and FB60 invoice processing"
        transactions = self.agent._extract_transactions(text)
        
        self.assertGreater(len(transactions), 0)
        transaction_codes = [t["code"] for t in transactions]
        self.assertIn("ME21N", transaction_codes)
    
    def test_module_identification(self):
        """Test SAP module identification"""
        text = "procurement and purchase order processing"
        transactions = [{"code": "ME21N", "module": "MM"}]
        modules = self.agent._identify_modules(text, transactions)
        
        self.assertIn("MM", modules)
    
    def test_intent_analysis(self):
        """Test intent analysis"""
        text = "I need to test the purchase order creation process"
        intent = self.agent._analyze_intent(text)
        
        self.assertEqual(intent["primary_intent"], "test_creation")
        self.assertGreater(intent["confidence"], 0)
    
    async def test_analyze_requirement_message(self):
        """Test requirement analysis message processing"""
        message = {
            "type": "analyze_requirement",
            "requirement": "Test ME21N purchase order creation with approval workflow",
            "context": {}
        }
        
        result = await self.agent.process_message(message)
        
        self.assertEqual(result["status"], "success")
        self.assertEqual(result["agent_id"], "sap_intelligence")
        self.assertIn("analysis", result)
        self.assertIn("extracted_transactions", result["analysis"])


class TestTestGenerationAgent(unittest.TestCase):
    """Test cases for Test Generation Agent"""
    
    def setUp(self):
        self.agent = TestGenerationAgent()
    
    def test_agent_initialization(self):
        """Test agent initializes correctly"""
        self.assertEqual(self.agent.agent_id, "test_generation")
        self.assertEqual(self.agent.name, "Test Generation Agent")
        self.assertIn("test_case_generation", self.agent.capabilities)
        self.assertIsNotNone(self.agent.test_templates)
    
    def test_template_finding(self):
        """Test finding templates for transactions"""
        template_name = self.agent._find_template_for_transaction("ME21N")
        self.assertEqual(template_name, "standard_po_creation")
        
        template_name = self.agent._find_template_for_transaction("FB60")
        self.assertEqual(template_name, "invoice_entry")
    
    def test_test_case_creation(self):
        """Test test case creation"""
        test_case = self.agent._create_test_case(
            test_id="test123",
            name="Test Case",
            description="Test description",
            transaction_code="ME21N",
            test_type="functional",
            priority="high",
            steps=["Step 1", "Step 2"],
            test_data={"field": "value"},
            validations=["Validation 1"],
            expected_result="Success",
            prerequisites=["Prereq 1"]
        )
        
        self.assertEqual(test_case["test_id"], "test123")
        self.assertEqual(test_case["transaction_code"], "ME21N")
        self.assertEqual(test_case["test_type"], "functional")
        self.assertEqual(len(test_case["steps"]), 2)
    
    def test_coverage_calculation(self):
        """Test coverage calculation"""
        test_cases = [
            {"transaction_code": "ME21N", "test_type": "functional", "estimated_duration_minutes": 10},
            {"transaction_code": "FB60", "test_type": "negative", "estimated_duration_minutes": 15}
        ]
        transactions = [{"code": "ME21N"}, {"code": "FB60"}]
        
        coverage = self.agent._calculate_coverage(test_cases, transactions)
        
        self.assertEqual(coverage["transaction_coverage"], 100.0)
        self.assertEqual(coverage["total_test_cases"], 2)
        self.assertIn("functional", coverage["test_type_distribution"])
    
    async def test_generate_tests_message(self):
        """Test test generation message processing"""
        analysis = {
            "extracted_transactions": [
                {"code": "ME21N", "name": "Create Purchase Order", "module": "MM"}
            ]
        }
        
        message = {
            "type": "generate_tests",
            "analysis": analysis,
            "requirements": {}
        }
        
        result = await self.agent.process_message(message)
        
        self.assertEqual(result["status"], "success")
        self.assertEqual(result["agent_id"], "test_generation")
        self.assertIn("test_suite", result)
        self.assertGreater(result["test_suite"]["total_tests"], 0)


class TestDependencyAnalysisAgent(unittest.TestCase):
    """Test cases for Dependency Analysis Agent"""
    
    def setUp(self):
        self.agent = DependencyAnalysisAgent()
    
    def test_agent_initialization(self):
        """Test agent initializes correctly"""
        self.assertEqual(self.agent.agent_id, "dependency_analysis")
        self.assertEqual(self.agent.name, "Dependency Analysis Agent")
        self.assertIn("dependency_graph_analysis", self.agent.capabilities)
        self.assertIsNotNone(self.agent.dependency_data)
    
    def test_direct_dependencies(self):
        """Test getting direct dependencies"""
        dependencies = self.agent._get_direct_dependencies("ME21N")
        
        # Should have some dependencies
        self.assertGreater(len(dependencies), 0)
        
        # Check structure
        if dependencies:
            dep = dependencies[0]
            self.assertIn("component", dep)
            self.assertIn("relationship_type", dep)
            self.assertIn("impact_level", dep)
    
    def test_dependent_components(self):
        """Test getting dependent components"""
        dependents = self.agent._get_dependent_components("VENDOR_MASTER")
        
        # Vendor master should have dependents
        self.assertGreater(len(dependents), 0)
        
        # Check if ME21N is a dependent (should depend on vendor master)
        dependent_components = [d["component"] for d in dependents]
        self.assertIn("ME21N", dependent_components)
    
    def test_node_finding(self):
        """Test finding nodes in dependency data"""
        node = self.agent._find_node("ME21N")
        
        self.assertIsNotNone(node)
        self.assertEqual(node["id"], "ME21N")
        self.assertIn("type", node)
        self.assertIn("module", node)
    
    def test_risk_assessment(self):
        """Test component risk assessment"""
        dependencies = {
            "direct_dependencies": [
                {"impact_level": "high", "component": "TEST1"},
                {"impact_level": "medium", "component": "TEST2"}
            ],
            "dependent_components": []
        }
        
        risk_assessment = self.agent._assess_component_risk("ME21N", dependencies)
        
        self.assertIn("risk_level", risk_assessment)
        self.assertIn("business_impact", risk_assessment)
        self.assertIn("risk_mitigation_strategies", risk_assessment)
    
    async def test_analyze_dependencies_message(self):
        """Test dependency analysis message processing"""
        message = {
            "type": "analyze_dependencies",
            "components": ["ME21N", "FB60"],
            "depth": 2,
            "include_indirect": True
        }
        
        result = await self.agent.process_message(message)
        
        self.assertEqual(result["status"], "success")
        self.assertEqual(result["agent_id"], "dependency_analysis")
        self.assertIn("dependency_analysis", result)
        self.assertIn("visualization_data", result)


class TestAgentFramework(unittest.TestCase):
    """Test cases for Mock Agent Framework"""
    
    def setUp(self):
        self.framework = MockAgentFramework()
    
    def test_framework_initialization(self):
        """Test framework initializes correctly"""
        self.assertIsNotNone(self.framework.framework_id)
        self.assertEqual(len(self.framework.agents), 0)
        self.assertFalse(self.framework.is_running)
    
    def test_agent_registration(self):
        """Test agent registration"""
        agent = SAPIntelligenceAgent()
        result = self.framework.register_agent(agent)
        
        self.assertTrue(result)
        self.assertIn(agent.agent_id, self.framework.agents)
        self.assertEqual(agent.status, "active")
        self.assertEqual(agent.framework, self.framework)
    
    def test_framework_start_stop(self):
        """Test framework start and stop"""
        self.framework.start_framework()
        self.assertTrue(self.framework.is_running)
        self.assertIsNotNone(self.framework.start_time)
        
        self.framework.stop_framework()
        self.assertFalse(self.framework.is_running)
    
    def test_framework_status(self):
        """Test framework status reporting"""
        # Add some agents
        agent1 = SAPIntelligenceAgent()
        agent2 = TestGenerationAgent()
        
        self.framework.register_agent(agent1)
        self.framework.register_agent(agent2)
        self.framework.start_framework()
        
        status = self.framework.get_framework_status()
        
        self.assertEqual(status["total_agents"], 2)
        self.assertEqual(status["active_agents"], 2)
        self.assertTrue(status["is_running"])


class TestIntegration(unittest.TestCase):
    """Integration tests for complete workflows"""
    
    def setUp(self):
        self.framework = MockAgentFramework()
        self.sap_agent = SAPIntelligenceAgent()
        self.test_agent = TestGenerationAgent()
        self.dep_agent = DependencyAnalysisAgent()
        
        # Register all agents
        self.framework.register_agent(self.sap_agent)
        self.framework.register_agent(self.test_agent)
        self.framework.register_agent(self.dep_agent)
        self.framework.start_framework()
    
    async def test_complete_workflow(self):
        """Test complete workflow from requirement to tests"""
        # Step 1: Analyze requirement
        analysis_message = {
            "type": "analyze_requirement",
            "requirement": "Test ME21N purchase order creation with approval workflow",
            "context": {}
        }
        
        analysis_result = await self.sap_agent.process_message(analysis_message)
        self.assertEqual(analysis_result["status"], "success")
        
        # Step 2: Generate tests based on analysis
        test_message = {
            "type": "generate_tests",
            "analysis": analysis_result["analysis"],
            "requirements": {}
        }
        
        test_result = await self.test_agent.process_message(test_message)
        self.assertEqual(test_result["status"], "success")
        self.assertGreater(test_result["test_suite"]["total_tests"], 0)
        
        # Step 3: Analyze dependencies
        transactions = analysis_result["analysis"]["extracted_transactions"]
        if transactions:
            dep_message = {
                "type": "analyze_dependencies",
                "components": [t["code"] for t in transactions],
                "depth": 2,
                "include_indirect": True
            }
            
            dep_result = await self.dep_agent.process_message(dep_message)
            self.assertEqual(dep_result["status"], "success")
    
    def test_agent_communication_through_framework(self):
        """Test agents can communicate through framework"""
        # This would test the message routing functionality
        # For now, we verify agents are properly registered
        
        all_agents = self.framework.get_all_agents_status()
        self.assertEqual(len(all_agents), 3)
        
        agent_ids = [agent["agent_id"] for agent in all_agents]
        self.assertIn("sap_intelligence", agent_ids)
        self.assertIn("test_generation", agent_ids)
        self.assertIn("dependency_analysis", agent_ids)


def run_tests():
    """Run all tests"""
    print("Running ASTC Agent Tests...")
    print("=" * 50)
    
    # Create test suite
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    # Add test cases
    suite.addTests(loader.loadTestsFromTestCase(TestSAPIntelligenceAgent))
    suite.addTests(loader.loadTestsFromTestCase(TestTestGenerationAgent))
    suite.addTests(loader.loadTestsFromTestCase(TestDependencyAnalysisAgent))
    suite.addTests(loader.loadTestsFromTestCase(TestAgentFramework))
    suite.addTests(loader.loadTestsFromTestCase(TestIntegration))
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Print summary
    print("\n" + "=" * 50)
    print(f"Tests run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    
    if result.failures:
        print("\nFailures:")
        for test, traceback in result.failures:
            print(f"  {test}: {traceback}")
    
    if result.errors:
        print("\nErrors:")
        for test, traceback in result.errors:
            print(f"  {test}: {traceback}")
    
    success = len(result.failures) == 0 and len(result.errors) == 0
    print(f"\nOverall result: {'PASS' if success else 'FAIL'}")
    
    return success


if __name__ == "__main__":
    # Handle async tests
    import asyncio
    
    # Create a test runner that handles async tests
    class AsyncTestCase(unittest.TestCase):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, **kwargs)
            self.loop = asyncio.new_event_loop()
            asyncio.set_event_loop(self.loop)
        
        def tearDown(self):
            self.loop.close()
    
    # Run async tests separately
    async def run_async_tests():
        print("Running async tests...")
        
        # Test SAP Intelligence Agent
        agent = SAPIntelligenceAgent()
        message = {
            "type": "analyze_requirement",
            "requirement": "Test ME21N purchase order creation",
            "context": {}
        }
        result = await agent.process_message(message)
        assert result["status"] == "success"
        print("✓ SAP Intelligence Agent async test passed")
        
        # Test Test Generation Agent
        test_agent = TestGenerationAgent()
        analysis = {
            "extracted_transactions": [
                {"code": "ME21N", "name": "Create Purchase Order", "module": "MM"}
            ]
        }
        message = {
            "type": "generate_tests",
            "analysis": analysis,
            "requirements": {}
        }
        result = await test_agent.process_message(message)
        assert result["status"] == "success"
        print("✓ Test Generation Agent async test passed")
        
        # Test Dependency Analysis Agent
        dep_agent = DependencyAnalysisAgent()
        message = {
            "type": "analyze_dependencies",
            "components": ["ME21N"],
            "depth": 2,
            "include_indirect": True
        }
        result = await dep_agent.process_message(message)
        assert result["status"] == "success"
        print("✓ Dependency Analysis Agent async test passed")
    
    # Run async tests
    asyncio.run(run_async_tests())
    
    # Run regular tests
    success = run_tests()
    
    sys.exit(0 if success else 1) 
"""
SAP Intelligence Agent
Natural language processing and SAP domain expertise for test requirement analysis
"""

import json
import re
import os
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
from framework.mock_neuro_san import Agent


class SAPIntelligenceAgent(Agent):
    """
    Agent specialized in SAP domain knowledge and natural language processing
    Converts natural language requirements into structured SAP testing scenarios
    """
    
    def __init__(self):
        super().__init__(
            agent_id="sap_intelligence",
            name="SAP Intelligence Agent",
            capabilities=[
                "natural_language_processing",
                "sap_transaction_analysis", 
                "business_process_identification",
                "risk_assessment",
                "requirement_parsing"
            ]
        )
        self.sap_data = None
        self.dependency_data = None
        self.load_sap_knowledge()
    
    def load_sap_knowledge(self):
        """Load SAP transaction and dependency data"""
        try:
            # Load SAP transactions data
            data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
            
            with open(os.path.join(data_dir, 'sap_transactions.json'), 'r') as f:
                self.sap_data = json.load(f)
            
            with open(os.path.join(data_dir, 'dependency_graph.json'), 'r') as f:
                self.dependency_data = json.load(f)
                
        except Exception as e:
            print(f"Error loading SAP knowledge base: {e}")
            # Fallback minimal data
            self.sap_data = {"transactions": [], "modules": {}, "risk_levels": {}}
            self.dependency_data = {"nodes": [], "edges": [], "impact_analysis": {}}
    
    async def process_message(self, message: Dict[str, Any]) -> Dict[str, Any]:
        """Process incoming message and analyze SAP requirements"""
        try:
            message_type = message.get("type", "analyze_requirement")
            
            if message_type == "analyze_requirement":
                return await self._analyze_requirement(message)
            elif message_type == "identify_transactions":
                return await self._identify_transactions(message)
            elif message_type == "assess_risk":
                return await self._assess_risk(message)
            elif message_type == "get_business_context":
                return await self._get_business_context(message)
            else:
                return {
                    "status": "error",
                    "error": f"Unknown message type: {message_type}",
                    "agent_id": self.agent_id
                }
                
        except Exception as e:
            return {
                "status": "error", 
                "error": str(e),
                "agent_id": self.agent_id
            }
    
    async def _analyze_requirement(self, message: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze natural language requirement and extract structured information"""
        requirement = message.get("requirement", "")
        context = message.get("context", {})
        
        # Extract SAP entities from requirement
        transactions = self._extract_transactions(requirement)
        modules = self._identify_modules(requirement, transactions)
        business_processes = self._identify_business_processes(requirement, transactions)
        entities = self._extract_entities(requirement)
        
        # Analyze intent and scope
        intent = self._analyze_intent(requirement)
        scope = self._determine_scope(requirement, transactions)
        
        # Generate analysis result
        analysis = {
            "requirement_text": requirement,
            "extracted_transactions": transactions,
            "modules_involved": modules,
            "business_processes": business_processes,
            "entities": entities,
            "intent": intent,
            "scope": scope,
            "confidence_score": self._calculate_confidence(requirement, transactions),
            "recommendations": self._generate_recommendations(transactions, intent),
            "analysis_timestamp": datetime.now().isoformat()
        }
        
        return {
            "status": "success",
            "agent_id": self.agent_id,
            "analysis": analysis,
            "next_steps": [
                "Generate test cases based on identified transactions",
                "Analyze dependencies for identified processes",
                "Assess risk and impact"
            ]
        }
    
    def _extract_transactions(self, text: str) -> List[Dict[str, Any]]:
        """Extract SAP transaction codes from text"""
        transactions = []
        text_upper = text.upper()
        
        # Look for known transaction codes
        for transaction in self.sap_data.get("transactions", []):
            code = transaction["code"]
            name = transaction["name"]
            
            # Check for transaction code
            if code in text_upper:
                transactions.append({
                    "code": code,
                    "name": name,
                    "module": transaction["module"],
                    "found_by": "exact_code_match",
                    "confidence": 0.95
                })
                continue
            
            # Check for transaction name or description
            if any(word in text_upper for word in name.upper().split()):
                transactions.append({
                    "code": code,
                    "name": name,
                    "module": transaction["module"],
                    "found_by": "name_match",
                    "confidence": 0.7
                })
                continue
            
            # Check for business process keywords
            description = transaction.get("description", "").upper()
            if any(word in description for word in text_upper.split() if len(word) > 3):
                transactions.append({
                    "code": code,
                    "name": name,
                    "module": transaction["module"],
                    "found_by": "description_match",
                    "confidence": 0.5
                })
        
        # Remove duplicates and sort by confidence
        seen_codes = set()
        unique_transactions = []
        for t in sorted(transactions, key=lambda x: x["confidence"], reverse=True):
            if t["code"] not in seen_codes:
                unique_transactions.append(t)
                seen_codes.add(t["code"])
        
        return unique_transactions[:5]  # Limit to top 5 matches
    
    def _identify_modules(self, text: str, transactions: List[Dict[str, Any]]) -> List[str]:
        """Identify SAP modules involved"""
        modules = set()
        
        # Add modules from identified transactions
        for transaction in transactions:
            modules.add(transaction["module"])
        
        # Check for module keywords in text
        text_upper = text.upper()
        module_keywords = {
            "MM": ["PROCUREMENT", "PURCHASE", "MATERIAL", "VENDOR", "GOODS"],
            "FI": ["FINANCIAL", "ACCOUNTING", "INVOICE", "PAYMENT", "GENERAL LEDGER"],
            "SD": ["SALES", "CUSTOMER", "ORDER", "BILLING", "DELIVERY"],
            "CO": ["CONTROLLING", "COST", "PROFIT CENTER", "BUDGET"],
            "HR": ["HUMAN RESOURCES", "PAYROLL", "EMPLOYEE", "PERSONNEL"],
            "WM": ["WAREHOUSE", "INVENTORY", "STOCK", "STORAGE"]
        }
        
        for module, keywords in module_keywords.items():
            if any(keyword in text_upper for keyword in keywords):
                modules.add(module)
        
        return list(modules)
    
    def _identify_business_processes(self, text: str, transactions: List[Dict[str, Any]]) -> List[str]:
        """Identify business processes mentioned in text"""
        processes = set()
        
        # Add processes from transactions
        for transaction in transactions:
            if "business_process" in transaction:
                for t in self.sap_data.get("transactions", []):
                    if t["code"] == transaction["code"]:
                        processes.add(t.get("business_process", ""))
        
        # Process keywords mapping
        text_upper = text.upper()
        process_keywords = {
            "Procurement": ["PROCUREMENT", "PURCHASE", "BUYING", "SOURCING"],
            "Order to Cash": ["SALES", "ORDER", "CUSTOMER", "BILLING", "DELIVERY"],
            "Accounts Payable": ["INVOICE", "PAYMENT", "VENDOR", "PAYABLE"],
            "Accounts Receivable": ["RECEIVABLE", "CUSTOMER PAYMENT", "COLLECTION"],
            "Inventory Management": ["INVENTORY", "STOCK", "GOODS MOVEMENT", "WAREHOUSE"],
            "Financial Accounting": ["FINANCIAL", "ACCOUNTING", "JOURNAL", "LEDGER"]
        }
        
        for process, keywords in process_keywords.items():
            if any(keyword in text_upper for keyword in keywords):
                processes.add(process)
        
        return list(processes)
    
    def _extract_entities(self, text: str) -> Dict[str, List[str]]:
        """Extract SAP entities like vendor numbers, material codes, etc."""
        entities = {
            "vendors": [],
            "materials": [],
            "customers": [],
            "amounts": [],
            "dates": []
        }
        
        # Simple pattern matching for common SAP entities
        patterns = {
            "vendors": [r'\bV\d{3,6}\b', r'VENDOR\s+(\w+)', r'SUPPLIER\s+(\w+)'],
            "materials": [r'\bM\d{3,6}\b', r'MATERIAL\s+(\w+)', r'ITEM\s+(\w+)'],
            "customers": [r'\bC\d{3,6}\b', r'CUSTOMER\s+(\w+)', r'CLIENT\s+(\w+)'],
            "amounts": [r'\$[\d,]+\.?\d*', r'\b\d+\.\d{2}\b', r'\b\d{1,3}(,\d{3})*\b'],
            "dates": [r'\d{4}-\d{2}-\d{2}', r'\d{2}\/\d{2}\/\d{4}', r'\d{2}-\d{2}-\d{4}']
        }
        
        for entity_type, pattern_list in patterns.items():
            for pattern in pattern_list:
                matches = re.findall(pattern, text, re.IGNORECASE)
                entities[entity_type].extend(matches)
        
        # Remove duplicates
        for entity_type in entities:
            entities[entity_type] = list(set(entities[entity_type]))
        
        return entities
    
    def _analyze_intent(self, text: str) -> Dict[str, Any]:
        """Analyze the intent of the requirement"""
        text_lower = text.lower()
        
        intent_patterns = {
            "test_creation": ["test", "testing", "validate", "verify", "check"],
            "dependency_analysis": ["dependency", "dependencies", "depend", "relationship", "connection", "link", "reference"],
            "impact_analysis": ["impact", "affect", "change", "modify", "update"],
            "process_documentation": ["document", "process", "flow", "procedure"],
            "troubleshooting": ["error", "issue", "problem", "fix", "debug"],
            "training": ["train", "learn", "guide", "tutorial", "help"]
        }
        
        intent_scores = {}
        for intent, keywords in intent_patterns.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            if score > 0:
                intent_scores[intent] = score / len(keywords)
        
        primary_intent = max(intent_scores.items(), key=lambda x: x[1])[0] if intent_scores else "general_inquiry"
        
        return {
            "primary_intent": primary_intent,
            "confidence": max(intent_scores.values()) if intent_scores else 0.3,
            "all_intents": intent_scores,
            "complexity": self._assess_complexity(text)
        }
    
    def _determine_scope(self, text: str, transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Determine the scope of testing required"""
        text_lower = text.lower()
        
        scope_indicators = {
            "unit": ["single", "one", "individual", "specific"],
            "integration": ["integration", "end-to-end", "process", "workflow", "multiple"],
            "regression": ["regression", "existing", "all", "complete", "full"],
            "performance": ["performance", "load", "stress", "volume", "speed"]
        }
        
        scope_scores = {}
        for scope, keywords in scope_indicators.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            if score > 0:
                scope_scores[scope] = score
        
        estimated_effort = self._estimate_effort(transactions, scope_scores)
        
        return {
            "scope_type": max(scope_scores.items(), key=lambda x: x[1])[0] if scope_scores else "unit",
            "transaction_count": len(transactions),
            "estimated_effort_hours": estimated_effort,
            "complexity_level": self._assess_complexity(text),
            "scope_indicators": scope_scores
        }
    
    def _assess_complexity(self, text: str) -> str:
        """Assess complexity of the requirement"""
        complexity_factors = 0
        text_lower = text.lower()
        
        # Check for complexity indicators
        complex_keywords = ["approval", "workflow", "integration", "custom", "complex", "multiple", "dependent"]
        complexity_factors += sum(1 for keyword in complex_keywords if keyword in text_lower)
        
        # Check for simple indicators
        simple_keywords = ["simple", "basic", "standard", "single", "create", "display"]
        complexity_factors -= sum(1 for keyword in simple_keywords if keyword in text_lower)
        
        if complexity_factors >= 3:
            return "High"
        elif complexity_factors >= 1:
            return "Medium"
        else:
            return "Low"
    
    def _calculate_confidence(self, text: str, transactions: List[Dict[str, Any]]) -> float:
        """Calculate confidence score for the analysis"""
        confidence = 0.5  # Base confidence
        
        # Increase confidence based on transaction matches
        for transaction in transactions:
            confidence += transaction["confidence"] * 0.1
        
        # Increase confidence for specific SAP terminology
        sap_terms = ["transaction", "tcode", "sap", "module", "business process"]
        term_matches = sum(1 for term in sap_terms if term in text.lower())
        confidence += term_matches * 0.05
        
        # Cap at 0.95
        return min(confidence, 0.95)
    
    def _generate_recommendations(self, transactions: List[Dict[str, Any]], intent: Dict[str, Any]) -> List[str]:
        """Generate recommendations based on analysis"""
        recommendations = []
        
        if not transactions:
            recommendations.append("Consider providing more specific SAP transaction codes or business process details")
        
        if intent["primary_intent"] == "test_creation":
            recommendations.append("Generate comprehensive test cases covering happy path and error scenarios")
            recommendations.append("Include prerequisite data setup and validation steps")
        
        if intent["primary_intent"] == "impact_analysis":
            recommendations.append("Analyze downstream dependencies and affected systems")
            recommendations.append("Consider regression testing for dependent processes")
        
        if len(transactions) > 3:
            recommendations.append("Consider breaking down into smaller, focused test scenarios")
        
        high_risk_transactions = [t for t in transactions if self._get_transaction_risk(t["code"]) == "High"]
        if high_risk_transactions:
            recommendations.append("Pay special attention to high-risk transactions: " + 
                                  ", ".join([t["code"] for t in high_risk_transactions]))
        
        return recommendations
    
    def _get_transaction_risk(self, transaction_code: str) -> str:
        """Get risk level for a transaction"""
        for transaction in self.sap_data.get("transactions", []):
            if transaction["code"] == transaction_code:
                return transaction.get("risk_level", "Medium")
        return "Medium"
    
    def _estimate_effort(self, transactions: List[Dict[str, Any]], scope_scores: Dict[str, int]) -> int:
        """Estimate testing effort in hours"""
        base_effort = len(transactions) * 2  # 2 hours per transaction
        
        # Adjust based on scope
        if "integration" in scope_scores:
            base_effort *= 1.5
        if "regression" in scope_scores:
            base_effort *= 2
        if "performance" in scope_scores:
            base_effort *= 1.3
        
        return int(base_effort)
    
    async def _identify_transactions(self, message: Dict[str, Any]) -> Dict[str, Any]:
        """Identify transactions mentioned in text"""
        text = message.get("text", "")
        transactions = self._extract_transactions(text)
        
        return {
            "status": "success",
            "agent_id": self.agent_id,
            "transactions": transactions,
            "total_found": len(transactions)
        }
    
    async def _assess_risk(self, message: Dict[str, Any]) -> Dict[str, Any]:
        """Assess risk for given transactions or changes"""
        transactions = message.get("transactions", [])
        change_type = message.get("change_type", "configuration")
        
        risk_assessment = {
            "overall_risk": "Medium",
            "risk_factors": [],
            "mitigation_strategies": [],
            "testing_recommendations": []
        }
        
        high_risk_count = 0
        for transaction_code in transactions:
            risk = self._get_transaction_risk(transaction_code)
            if risk == "High":
                high_risk_count += 1
                risk_assessment["risk_factors"].append(f"High-risk transaction: {transaction_code}")
        
        if high_risk_count >= 2:
            risk_assessment["overall_risk"] = "High"
        elif high_risk_count >= 1:
            risk_assessment["overall_risk"] = "Medium"
        else:
            risk_assessment["overall_risk"] = "Low"
        
        # Add recommendations based on risk level
        if risk_assessment["overall_risk"] == "High":
            risk_assessment["testing_recommendations"].extend([
                "Comprehensive regression testing required",
                "Include error handling and edge case testing",
                "Consider parallel testing environment"
            ])
        
        return {
            "status": "success",
            "agent_id": self.agent_id,
            "risk_assessment": risk_assessment
        }
    
    async def _get_business_context(self, message: Dict[str, Any]) -> Dict[str, Any]:
        """Get business context for transactions or processes"""
        transaction_code = message.get("transaction_code", "")
        
        context = {
            "business_impact": "Medium",
            "user_roles": [],
            "business_processes": [],
            "integration_points": []
        }
        
        # Find transaction details
        for transaction in self.sap_data.get("transactions", []):
            if transaction["code"] == transaction_code:
                context["business_impact"] = transaction.get("risk_level", "Medium")
                context["business_processes"] = [transaction.get("business_process", "")]
                context["integration_points"] = transaction.get("dependencies", [])
                break
        
        return {
            "status": "success",
            "agent_id": self.agent_id,
            "business_context": context
        } 
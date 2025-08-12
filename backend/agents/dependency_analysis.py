"""
Dependency Analysis Agent
Analyzes SAP transaction dependencies and generates impact assessments
"""

import json
import os
import uuid
from datetime import datetime
from typing import Dict, List, Any, Optional, Set, Tuple
from framework.mock_neuro_san import Agent


class DependencyAnalysisAgent(Agent):
    """
    Agent specialized in SAP dependency analysis and impact assessment
    Generates dependency graphs and analyzes change impact across SAP components
    """
    
    def __init__(self):
        super().__init__(
            agent_id="dependency_analysis",
            name="Dependency Analysis Agent",
            capabilities=[
                "dependency_graph_analysis",
                "impact_assessment",
                "risk_propagation",
                "change_impact_simulation",
                "visualization_data_generation"
            ]
        )
        self.dependency_data = None
        self.sap_data = None
        self.load_dependency_knowledge()
    
    def load_dependency_knowledge(self):
        """Load dependency graph and SAP transaction data"""
        try:
            data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
            
            with open(os.path.join(data_dir, 'dependency_graph.json'), 'r') as f:
                self.dependency_data = json.load(f)
            
            with open(os.path.join(data_dir, 'sap_transactions.json'), 'r') as f:
                self.sap_data = json.load(f)
                
        except Exception as e:
            print(f"Error loading dependency knowledge: {e}")
            self.dependency_data = {"nodes": [], "edges": [], "impact_analysis": {}}
            self.sap_data = {"transactions": []}
    
    async def process_message(self, message: Dict[str, Any]) -> Dict[str, Any]:
        """Process incoming message and analyze dependencies"""
        try:
            message_type = message.get("type", "analyze_dependencies")
            
            if message_type == "analyze_dependencies":
                return await self._analyze_dependencies(message)
            elif message_type == "impact_assessment":
                return await self._perform_impact_assessment(message)
            elif message_type == "generate_graph":
                return await self._generate_dependency_graph(message)
            elif message_type == "risk_propagation":
                return await self._analyze_risk_propagation(message)
            elif message_type == "change_simulation":
                return await self._simulate_change_impact(message)
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
    
    async def _analyze_dependencies(self, message: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze dependencies for given transactions or components"""
        target_components = message.get("components", [])
        analysis_depth = message.get("depth", 2)
        include_indirect = message.get("include_indirect", True)
        
        analysis_results = {}
        
        for component in target_components:
            component_analysis = self._analyze_component_dependencies(
                component, analysis_depth, include_indirect
            )
            analysis_results[component] = component_analysis
        
        # Generate consolidated analysis
        consolidated = self._consolidate_dependency_analysis(analysis_results)
        
        return {
            "status": "success",
            "agent_id": self.agent_id,
            "dependency_analysis": {
                "individual_components": analysis_results,
                "consolidated_analysis": consolidated,
                "analysis_parameters": {
                    "depth": analysis_depth,
                    "include_indirect": include_indirect,
                    "components_analyzed": len(target_components)
                },
                "analysis_timestamp": datetime.now().isoformat()
            },
            "visualization_data": self._generate_visualization_data(analysis_results)
        }
    
    def _analyze_component_dependencies(self, component: str, depth: int, include_indirect: bool) -> Dict[str, Any]:
        """Analyze dependencies for a single component"""
        dependencies = {
            "direct_dependencies": [],
            "dependent_components": [],
            "indirect_dependencies": [],
            "dependency_chains": [],
            "risk_level": "Medium",
            "business_impact": "Medium"
        }
        
        # Find direct dependencies (components this component depends on)
        direct_deps = self._get_direct_dependencies(component)
        dependencies["direct_dependencies"] = direct_deps
        
        # Find dependent components (components that depend on this one)
        dependents = self._get_dependent_components(component)
        dependencies["dependent_components"] = dependents
        
        # Find indirect dependencies if requested
        if include_indirect:
            indirect_deps = self._get_indirect_dependencies(component, depth)
            dependencies["indirect_dependencies"] = indirect_deps
            
            # Generate dependency chains
            chains = self._trace_dependency_chains(component, depth)
            dependencies["dependency_chains"] = chains
        
        # Assess risk and business impact
        risk_assessment = self._assess_component_risk(component, dependencies)
        dependencies.update(risk_assessment)
        
        return dependencies
    
    def _get_direct_dependencies(self, component: str) -> List[Dict[str, Any]]:
        """Get direct dependencies for a component"""
        dependencies = []
        
        for edge in self.dependency_data.get("edges", []):
            if edge["source"] == component:
                target_node = self._find_node(edge["target"])
                if target_node:
                    dependencies.append({
                        "component": edge["target"],
                        "relationship_type": edge["type"],
                        "dependency_type": edge["dependency_type"],
                        "impact_level": edge["impact_level"],
                        "node_details": target_node
                    })
        
        return dependencies
    
    def _get_dependent_components(self, component: str) -> List[Dict[str, Any]]:
        """Get components that depend on this component"""
        dependents = []
        
        for edge in self.dependency_data.get("edges", []):
            if edge["target"] == component:
                source_node = self._find_node(edge["source"])
                if source_node:
                    dependents.append({
                        "component": edge["source"],
                        "relationship_type": edge["type"],
                        "dependency_type": edge["dependency_type"],
                        "impact_level": edge["impact_level"],
                        "node_details": source_node
                    })
        
        return dependents
    
    def _get_indirect_dependencies(self, component: str, max_depth: int) -> List[Dict[str, Any]]:
        """Get indirect dependencies using breadth-first search"""
        visited = set()
        queue = [(component, 0)]
        indirect_deps = []
        
        while queue:
            current_component, depth = queue.pop(0)
            
            if depth >= max_depth or current_component in visited:
                continue
            
            visited.add(current_component)
            
            # Get direct dependencies of current component
            direct_deps = self._get_direct_dependencies(current_component)
            
            for dep in direct_deps:
                dep_component = dep["component"]
                if dep_component not in visited and depth + 1 <= max_depth:
                    queue.append((dep_component, depth + 1))
                    
                    if depth > 0:  # Don't include direct dependencies in indirect list
                        indirect_deps.append({
                            "component": dep_component,
                            "depth": depth + 1,
                            "path_from_root": current_component,
                            "relationship_type": dep["relationship_type"],
                            "node_details": dep["node_details"]
                        })
        
        return indirect_deps
    
    def _trace_dependency_chains(self, component: str, max_depth: int) -> List[Dict[str, Any]]:
        """Trace complete dependency chains from component"""
        chains = []
        
        def dfs_chains(current, path, depth):
            if depth >= max_depth:
                return
            
            direct_deps = self._get_direct_dependencies(current)
            
            if not direct_deps:
                # End of chain
                if len(path) > 1:
                    chains.append({
                        "chain": path.copy(),
                        "length": len(path),
                        "end_component": current,
                        "impact_assessment": self._assess_chain_impact(path)
                    })
                return
            
            for dep in direct_deps:
                if dep["component"] not in path:  # Avoid cycles
                    path.append(dep["component"])
                    dfs_chains(dep["component"], path, depth + 1)
                    path.pop()
        
        dfs_chains(component, [component], 0)
        return chains
    
    def _assess_component_risk(self, component: str, dependencies: Dict[str, Any]) -> Dict[str, Any]:
        """Assess risk level for a component based on its dependencies"""
        risk_factors = 0
        
        # Count high-impact dependencies
        high_impact_deps = sum(1 for dep in dependencies["direct_dependencies"] 
                              if dep["impact_level"] == "high")
        risk_factors += high_impact_deps * 2
        
        # Count total dependencies
        total_deps = len(dependencies["direct_dependencies"]) + len(dependencies["dependent_components"])
        if total_deps > 5:
            risk_factors += 1
        
        # Check for custom components (higher risk)
        node = self._find_node(component)
        if node and node.get("type") == "custom_program":
            risk_factors += 2
        
        # Determine risk level
        if risk_factors >= 5:
            risk_level = "High"
        elif risk_factors >= 3:
            risk_level = "Medium"
        else:
            risk_level = "Low"
        
        # Assess business impact
        business_impact = self._assess_business_impact(component, dependencies)
        
        return {
            "risk_level": risk_level,
            "risk_factors": risk_factors,
            "business_impact": business_impact,
            "risk_mitigation_strategies": self._generate_risk_mitigation(risk_level, component)
        }
    
    def _assess_business_impact(self, component: str, dependencies: Dict[str, Any]) -> str:
        """Assess business impact of changes to component"""
        impact_score = 0
        
        # Check impact analysis data
        impact_data = self.dependency_data.get("impact_analysis", {}).get(component, {})
        if impact_data.get("impact_level") == "Critical":
            impact_score += 3
        elif impact_data.get("impact_level") == "High":
            impact_score += 2
        
        # Count affected business processes
        affected_processes = len(impact_data.get("business_processes", []))
        impact_score += min(affected_processes, 2)
        
        # Count dependent components
        dependent_count = len(dependencies["dependent_components"])
        if dependent_count > 3:
            impact_score += 1
        
        if impact_score >= 4:
            return "High"
        elif impact_score >= 2:
            return "Medium"
        else:
            return "Low"
    
    def _assess_chain_impact(self, chain: List[str]) -> Dict[str, Any]:
        """Assess impact of a dependency chain"""
        max_risk = "Low"
        critical_components = []
        
        for component in chain:
            node = self._find_node(component)
            if node:
                risk = node.get("risk", "Low")
                if risk == "High" and max_risk != "High":
                    max_risk = "High"
                elif risk == "Medium" and max_risk == "Low":
                    max_risk = "Medium"
                
                if node.get("type") == "custom_program":
                    critical_components.append(component)
        
        return {
            "overall_risk": max_risk,
            "chain_length": len(chain),
            "critical_components": critical_components,
            "recommended_testing": self._recommend_chain_testing(chain, max_risk)
        }
    
    def _generate_risk_mitigation(self, risk_level: str, component: str) -> List[str]:
        """Generate risk mitigation strategies"""
        strategies = []
        
        if risk_level == "High":
            strategies.extend([
                "Implement comprehensive regression testing",
                "Create detailed rollback procedures",
                "Schedule change during low-impact time window",
                "Conduct parallel testing in staging environment"
            ])
        elif risk_level == "Medium":
            strategies.extend([
                "Perform focused regression testing on dependent components",
                "Validate key business processes",
                "Monitor system performance after change"
            ])
        else:
            strategies.extend([
                "Perform standard testing procedures",
                "Monitor for unexpected impacts"
            ])
        
        # Component-specific strategies
        node = self._find_node(component)
        if node and node.get("type") == "master_data":
            strategies.append("Validate all transactions using this master data")
        
        return strategies
    
    def _recommend_chain_testing(self, chain: List[str], risk_level: str) -> List[str]:
        """Recommend testing approach for dependency chain"""
        recommendations = []
        
        if len(chain) > 3:
            recommendations.append("Test complete end-to-end process flow")
        
        if risk_level == "High":
            recommendations.append("Test each component in the chain individually")
            recommendations.append("Validate data flow at each integration point")
        
        recommendations.append("Perform integration testing for chain components")
        
        return recommendations
    
    def _consolidate_dependency_analysis(self, individual_analyses: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
        """Consolidate individual component analyses into overall assessment"""
        all_components = set()
        high_risk_components = []
        critical_dependencies = []
        
        for component, analysis in individual_analyses.items():
            # Collect all components involved
            all_components.add(component)
            for dep in analysis["direct_dependencies"]:
                all_components.add(dep["component"])
            for dep in analysis["dependent_components"]:
                all_components.add(dep["component"])
            
            # Identify high-risk components
            if analysis["risk_level"] == "High":
                high_risk_components.append(component)
            
            # Identify critical dependencies
            for dep in analysis["direct_dependencies"]:
                if dep["impact_level"] == "high":
                    critical_dependencies.append({
                        "from": component,
                        "to": dep["component"],
                        "type": dep["relationship_type"]
                    })
        
        return {
            "total_components_involved": len(all_components),
            "high_risk_components": high_risk_components,
            "critical_dependencies": critical_dependencies,
            "overall_complexity": self._assess_overall_complexity(individual_analyses),
            "recommended_approach": self._recommend_overall_approach(individual_analyses),
            "estimated_impact_scope": self._estimate_impact_scope(all_components)
        }
    
    def _assess_overall_complexity(self, analyses: Dict[str, Dict[str, Any]]) -> str:
        """Assess overall complexity of the dependency landscape"""
        complexity_score = 0
        
        for analysis in analyses.values():
            # Add points for dependencies
            complexity_score += len(analysis["direct_dependencies"])
            complexity_score += len(analysis["indirect_dependencies"]) * 0.5
            
            # Add points for risk
            if analysis["risk_level"] == "High":
                complexity_score += 3
            elif analysis["risk_level"] == "Medium":
                complexity_score += 1
        
        if complexity_score >= 15:
            return "Very High"
        elif complexity_score >= 10:
            return "High"
        elif complexity_score >= 5:
            return "Medium"
        else:
            return "Low"
    
    def _recommend_overall_approach(self, analyses: Dict[str, Dict[str, Any]]) -> List[str]:
        """Recommend overall testing and implementation approach"""
        recommendations = []
        
        high_risk_count = sum(1 for a in analyses.values() if a["risk_level"] == "High")
        
        if high_risk_count > 1:
            recommendations.extend([
                "Implement changes in phases to reduce risk",
                "Create comprehensive test environment",
                "Plan for extended testing period"
            ])
        
        if len(analyses) > 3:
            recommendations.append("Coordinate testing across multiple teams")
        
        recommendations.extend([
            "Document all dependency relationships",
            "Establish clear rollback procedures",
            "Plan for post-implementation monitoring"
        ])
        
        return recommendations
    
    def _estimate_impact_scope(self, components: Set[str]) -> Dict[str, Any]:
        """Estimate the scope of impact"""
        modules_affected = set()
        business_processes_affected = set()
        
        for component in components:
            node = self._find_node(component)
            if node:
                modules_affected.add(node.get("module", "Unknown"))
        
        # Get business processes from impact analysis
        for component in components:
            impact_data = self.dependency_data.get("impact_analysis", {}).get(component, {})
            processes = impact_data.get("business_processes", [])
            business_processes_affected.update(processes)
        
        return {
            "modules_affected": list(modules_affected),
            "business_processes_affected": list(business_processes_affected),
            "estimated_testing_effort_hours": len(components) * 4,
            "recommended_timeline_days": max(len(components), 5)
        }
    
    def _generate_visualization_data(self, analyses: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
        """Generate data for dependency graph visualization"""
        nodes = []
        edges = []
        node_ids = set()
        
        # Create nodes for all components
        for component, analysis in analyses.items():
            if component not in node_ids:
                node = self._create_visualization_node(component)
                nodes.append(node)
                node_ids.add(component)
            
            # Add dependency nodes
            for dep in analysis["direct_dependencies"]:
                dep_component = dep["component"]
                if dep_component not in node_ids:
                    node = self._create_visualization_node(dep_component)
                    nodes.append(node)
                    node_ids.add(dep_component)
                
                # Create edge
                edge = {
                    "source": component,
                    "target": dep_component,
                    "type": dep["relationship_type"],
                    "impact": dep["impact_level"],
                    "dependency_type": dep["dependency_type"]
                }
                edges.append(edge)
        
        return {
            "nodes": nodes,
            "edges": edges,
            "layout_suggestions": {
                "algorithm": "force-directed",
                "group_by": "module",
                "highlight_critical_path": True
            },
            "styling": {
                "node_colors": {
                    "High": "#ff4444",
                    "Medium": "#ffaa00", 
                    "Low": "#44ff44"
                },
                "edge_styles": {
                    "mandatory": "solid",
                    "conditional": "dashed"
                }
            }
        }
    
    def _create_visualization_node(self, component: str) -> Dict[str, Any]:
        """Create a node for visualization"""
        node = self._find_node(component)
        if not node:
            return {
                "id": component,
                "label": component,
                "type": "unknown",
                "risk": "Medium",
                "module": "Unknown"
            }
        
        return {
            "id": component,
            "label": node.get("name", component),
            "type": node.get("type", "unknown"),
            "risk": node.get("risk", "Medium"),
            "module": node.get("module", "Unknown"),
            "category": node.get("category", "Unknown")
        }
    
    def _find_node(self, node_id: str) -> Optional[Dict[str, Any]]:
        """Find node in dependency data"""
        for node in self.dependency_data.get("nodes", []):
            if node["id"] == node_id:
                return node
        return None
    
    async def _perform_impact_assessment(self, message: Dict[str, Any]) -> Dict[str, Any]:
        """Perform comprehensive impact assessment"""
        change_type = message.get("change_type", "configuration")
        affected_components = message.get("components", [])
        change_scope = message.get("scope", "minor")
        
        assessment = {
            "change_details": {
                "type": change_type,
                "scope": change_scope,
                "components": affected_components
            },
            "impact_summary": {},
            "affected_areas": {},
            "risk_assessment": {},
            "recommendations": []
        }
        
        # Analyze impact for each component
        for component in affected_components:
            component_impact = self._assess_component_change_impact(component, change_type, change_scope)
            assessment["impact_summary"][component] = component_impact
        
        # Generate overall assessment
        assessment["affected_areas"] = self._identify_affected_areas(affected_components)
        assessment["risk_assessment"] = self._assess_overall_change_risk(assessment["impact_summary"])
        assessment["recommendations"] = self._generate_change_recommendations(assessment)
        
        return {
            "status": "success",
            "agent_id": self.agent_id,
            "impact_assessment": assessment
        }
    
    def _assess_component_change_impact(self, component: str, change_type: str, scope: str) -> Dict[str, Any]:
        """Assess impact of change to specific component"""
        base_impact = {
            "direct_impact": "Medium",
            "downstream_effects": [],
            "testing_requirements": [],
            "rollback_complexity": "Medium"
        }
        
        # Get component dependencies
        dependents = self._get_dependent_components(component)
        
        # Assess downstream effects
        for dependent in dependents:
            effect = {
                "component": dependent["component"],
                "effect_type": self._determine_effect_type(change_type, dependent["relationship_type"]),
                "severity": dependent["impact_level"]
            }
            base_impact["downstream_effects"].append(effect)
        
        # Determine testing requirements
        base_impact["testing_requirements"] = self._determine_testing_requirements(component, change_type, dependents)
        
        # Assess rollback complexity
        base_impact["rollback_complexity"] = self._assess_rollback_complexity(component, change_type, len(dependents))
        
        return base_impact
    
    def _determine_effect_type(self, change_type: str, relationship_type: str) -> str:
        """Determine type of effect based on change and relationship"""
        effect_mapping = {
            ("configuration", "reads"): "validation_required",
            ("configuration", "posts"): "data_integrity_check",
            ("master_data", "reads"): "reference_validation",
            ("master_data", "updates"): "data_synchronization",
            ("custom_code", "calls"): "interface_testing"
        }
        
        return effect_mapping.get((change_type, relationship_type), "general_testing")
    
    def _determine_testing_requirements(self, component: str, change_type: str, dependents: List[Dict[str, Any]]) -> List[str]:
        """Determine testing requirements for component change"""
        requirements = ["Unit testing for modified component"]
        
        if dependents:
            requirements.append("Integration testing with dependent components")
        
        if change_type == "master_data":
            requirements.append("Data integrity validation")
        elif change_type == "custom_code":
            requirements.append("Code review and security testing")
        elif change_type == "configuration":
            requirements.append("Configuration validation testing")
        
        if len(dependents) > 2:
            requirements.append("Regression testing of affected business processes")
        
        return requirements
    
    def _assess_rollback_complexity(self, component: str, change_type: str, dependent_count: int) -> str:
        """Assess complexity of rolling back changes"""
        complexity_score = 0
        
        if change_type == "master_data":
            complexity_score += 2
        elif change_type == "custom_code":
            complexity_score += 3
        else:
            complexity_score += 1
        
        complexity_score += min(dependent_count, 3)
        
        if complexity_score >= 5:
            return "High"
        elif complexity_score >= 3:
            return "Medium"
        else:
            return "Low"
    
    def _identify_affected_areas(self, components: List[str]) -> Dict[str, List[str]]:
        """Identify business areas affected by component changes"""
        affected_areas = {
            "modules": set(),
            "business_processes": set(),
            "transactions": set()
        }
        
        for component in components:
            # Get module
            node = self._find_node(component)
            if node:
                affected_areas["modules"].add(node.get("module", "Unknown"))
            
            # Get business processes and transactions from impact analysis
            impact_data = self.dependency_data.get("impact_analysis", {}).get(component, {})
            affected_areas["business_processes"].update(impact_data.get("business_processes", []))
            affected_areas["transactions"].update(impact_data.get("affected_transactions", []))
        
        # Convert sets to lists
        return {k: list(v) for k, v in affected_areas.items()}
    
    def _assess_overall_change_risk(self, impact_summary: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
        """Assess overall risk of proposed changes"""
        risk_score = 0
        high_risk_components = []
        
        for component, impact in impact_summary.items():
            if impact["direct_impact"] == "High":
                risk_score += 3
                high_risk_components.append(component)
            elif impact["direct_impact"] == "Medium":
                risk_score += 1
            
            if impact["rollback_complexity"] == "High":
                risk_score += 2
        
        overall_risk = "High" if risk_score >= 6 else "Medium" if risk_score >= 3 else "Low"
        
        return {
            "overall_risk": overall_risk,
            "risk_score": risk_score,
            "high_risk_components": high_risk_components,
            "risk_factors": self._identify_risk_factors(impact_summary)
        }
    
    def _identify_risk_factors(self, impact_summary: Dict[str, Dict[str, Any]]) -> List[str]:
        """Identify key risk factors"""
        factors = []
        
        high_impact_count = sum(1 for impact in impact_summary.values() if impact["direct_impact"] == "High")
        if high_impact_count > 1:
            factors.append("Multiple high-impact components affected")
        
        complex_rollback_count = sum(1 for impact in impact_summary.values() if impact["rollback_complexity"] == "High")
        if complex_rollback_count > 0:
            factors.append("Complex rollback procedures required")
        
        total_downstream = sum(len(impact["downstream_effects"]) for impact in impact_summary.values())
        if total_downstream > 5:
            factors.append("Extensive downstream effects expected")
        
        return factors
    
    def _generate_change_recommendations(self, assessment: Dict[str, Any]) -> List[str]:
        """Generate recommendations for change implementation"""
        recommendations = []
        
        risk_level = assessment["risk_assessment"]["overall_risk"]
        
        if risk_level == "High":
            recommendations.extend([
                "Implement changes in phases to minimize risk",
                "Create comprehensive rollback plan before implementation",
                "Schedule extended testing period",
                "Consider implementation during maintenance window"
            ])
        elif risk_level == "Medium":
            recommendations.extend([
                "Perform thorough testing of dependent components",
                "Prepare rollback procedures",
                "Monitor system closely after implementation"
            ])
        
        affected_modules = assessment["affected_areas"]["modules"]
        if len(affected_modules) > 2:
            recommendations.append("Coordinate with multiple module teams")
        
        recommendations.append("Document all changes and dependencies")
        
        return recommendations
    
    async def _generate_dependency_graph(self, message: Dict[str, Any]) -> Dict[str, Any]:
        """Generate dependency graph for visualization"""
        components = message.get("components", [])
        include_indirect = message.get("include_indirect", True)
        max_depth = message.get("max_depth", 2)
        
        # Perform dependency analysis for visualization
        analysis_message = {
            "components": components,
            "depth": max_depth,
            "include_indirect": include_indirect
        }
        
        analysis_result = await self._analyze_dependencies(analysis_message)
        
        return {
            "status": "success",
            "agent_id": self.agent_id,
            "graph_data": analysis_result["visualization_data"],
            "metadata": {
                "generated_at": datetime.now().isoformat(),
                "components_analyzed": len(components),
                "max_depth": max_depth
            }
        }
    
    async def _analyze_risk_propagation(self, message: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze how risk propagates through dependency network"""
        source_component = message.get("source_component", "")
        risk_level = message.get("initial_risk", "Medium")
        
        propagation_analysis = self._trace_risk_propagation(source_component, risk_level)
        
        return {
            "status": "success",
            "agent_id": self.agent_id,
            "risk_propagation": propagation_analysis
        }
    
    def _trace_risk_propagation(self, source: str, initial_risk: str) -> Dict[str, Any]:
        """Trace how risk propagates through dependencies"""
        risk_levels = {"Low": 1, "Medium": 2, "High": 3}
        propagated_risks = {source: risk_levels[initial_risk]}
        
        # Simple risk propagation model
        queue = [(source, risk_levels[initial_risk])]
        visited = set()
        
        while queue:
            current, current_risk = queue.pop(0)
            if current in visited:
                continue
            visited.add(current)
            
            dependents = self._get_dependent_components(current)
            for dependent in dependents:
                dep_component = dependent["component"]
                
                # Risk diminishes with propagation but impact level affects it
                impact_multiplier = {"high": 0.8, "medium": 0.6, "low": 0.4}
                propagated_risk = current_risk * impact_multiplier.get(dependent["impact_level"], 0.5)
                
                if dep_component not in propagated_risks or propagated_risks[dep_component] < propagated_risk:
                    propagated_risks[dep_component] = propagated_risk
                    queue.append((dep_component, propagated_risk))
        
        # Convert back to risk levels
        risk_map = {v: k for k, v in risk_levels.items()}
        result_risks = {}
        for component, risk_score in propagated_risks.items():
            if risk_score >= 2.5:
                result_risks[component] = "High"
            elif risk_score >= 1.5:
                result_risks[component] = "Medium"
            else:
                result_risks[component] = "Low"
        
        return {
            "source_component": source,
            "initial_risk": initial_risk,
            "propagated_risks": result_risks,
            "highest_risk_components": [k for k, v in result_risks.items() if v == "High"],
            "risk_propagation_paths": self._identify_risk_paths(source, result_risks)
        }
    
    def _identify_risk_paths(self, source: str, risks: Dict[str, str]) -> List[Dict[str, Any]]:
        """Identify paths through which risk propagates"""
        paths = []
        high_risk_components = [k for k, v in risks.items() if v == "High" and k != source]
        
        for target in high_risk_components:
            path = self._find_path(source, target)
            if path:
                paths.append({
                    "from": source,
                    "to": target,
                    "path": path,
                    "risk_level": risks[target]
                })
        
        return paths
    
    def _find_path(self, source: str, target: str) -> Optional[List[str]]:
        """Find path between two components"""
        queue = [(source, [source])]
        visited = set()
        
        while queue:
            current, path = queue.pop(0)
            
            if current == target:
                return path
            
            if current in visited:
                continue
            visited.add(current)
            
            dependents = self._get_dependent_components(current)
            for dependent in dependents:
                dep_component = dependent["component"]
                if dep_component not in visited:
                    queue.append((dep_component, path + [dep_component]))
        
        return None
    
    async def _simulate_change_impact(self, message: Dict[str, Any]) -> Dict[str, Any]:
        """Simulate impact of proposed changes"""
        changes = message.get("changes", [])
        simulation_scope = message.get("scope", "immediate")
        
        simulation_results = {
            "simulation_id": str(uuid.uuid4()),
            "changes_simulated": changes,
            "scope": simulation_scope,
            "results": {},
            "overall_impact": {},
            "recommendations": []
        }
        
        for change in changes:
            change_result = self._simulate_single_change(change)
            simulation_results["results"][change["component"]] = change_result
        
        # Generate overall impact assessment
        simulation_results["overall_impact"] = self._assess_simulation_overall_impact(simulation_results["results"])
        simulation_results["recommendations"] = self._generate_simulation_recommendations(simulation_results)
        
        return {
            "status": "success",
            "agent_id": self.agent_id,
            "simulation": simulation_results
        }
    
    def _simulate_single_change(self, change: Dict[str, Any]) -> Dict[str, Any]:
        """Simulate impact of a single change"""
        component = change["component"]
        change_type = change["type"]
        
        return {
            "component": component,
            "change_type": change_type,
            "immediate_effects": self._predict_immediate_effects(component, change_type),
            "cascading_effects": self._predict_cascading_effects(component, change_type),
            "testing_impact": self._estimate_testing_impact(component, change_type),
            "business_continuity": self._assess_business_continuity_impact(component, change_type)
        }
    
    def _predict_immediate_effects(self, component: str, change_type: str) -> List[str]:
        """Predict immediate effects of change"""
        effects = []
        
        dependents = self._get_dependent_components(component)
        for dependent in dependents:
            if dependent["dependency_type"] == "mandatory":
                effects.append(f"Immediate impact on {dependent['component']}")
        
        return effects
    
    def _predict_cascading_effects(self, component: str, change_type: str) -> List[str]:
        """Predict cascading effects through dependency chain"""
        effects = []
        
        # Get indirect dependencies
        indirect_deps = self._get_indirect_dependencies(component, 3)
        for dep in indirect_deps:
            if dep["depth"] <= 2:  # Focus on near-term cascading effects
                effects.append(f"Cascading effect on {dep['component']} at depth {dep['depth']}")
        
        return effects
    
    def _estimate_testing_impact(self, component: str, change_type: str) -> Dict[str, Any]:
        """Estimate testing effort and scope"""
        base_testing_hours = {"configuration": 4, "master_data": 8, "custom_code": 16}
        base_hours = base_testing_hours.get(change_type, 6)
        
        dependents = self._get_dependent_components(component)
        additional_hours = len(dependents) * 2
        
        return {
            "estimated_hours": base_hours + additional_hours,
            "testing_scope": ["Unit testing", "Integration testing"] + 
                           (["Regression testing"] if len(dependents) > 2 else []),
            "automation_feasibility": "High" if change_type == "configuration" else "Medium"
        }
    
    def _assess_business_continuity_impact(self, component: str, change_type: str) -> Dict[str, Any]:
        """Assess impact on business continuity"""
        impact_data = self.dependency_data.get("impact_analysis", {}).get(component, {})
        
        return {
            "business_processes_affected": impact_data.get("business_processes", []),
            "downtime_required": change_type in ["custom_code", "master_data"],
            "recommended_timing": "maintenance_window" if change_type == "custom_code" else "business_hours",
            "rollback_time_estimate": {"configuration": "< 1 hour", "master_data": "2-4 hours", "custom_code": "4-8 hours"}.get(change_type, "2 hours")
        }
    
    def _assess_simulation_overall_impact(self, results: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
        """Assess overall impact from simulation results"""
        total_testing_hours = sum(r["testing_impact"]["estimated_hours"] for r in results.values())
        
        all_affected_processes = set()
        for result in results.values():
            all_affected_processes.update(result["business_continuity"]["business_processes_affected"])
        
        requires_downtime = any(r["business_continuity"]["downtime_required"] for r in results.values())
        
        return {
            "total_components_changed": len(results),
            "total_testing_hours": total_testing_hours,
            "business_processes_affected": list(all_affected_processes),
            "requires_system_downtime": requires_downtime,
            "overall_complexity": "High" if total_testing_hours > 40 else "Medium" if total_testing_hours > 20 else "Low"
        }
    
    def _generate_simulation_recommendations(self, simulation: Dict[str, Any]) -> List[str]:
        """Generate recommendations based on simulation"""
        recommendations = []
        
        overall_impact = simulation["overall_impact"]
        
        if overall_impact["requires_system_downtime"]:
            recommendations.append("Schedule changes during planned maintenance window")
        
        if overall_impact["total_testing_hours"] > 40:
            recommendations.append("Consider phased implementation to reduce testing burden")
        
        if len(overall_impact["business_processes_affected"]) > 3:
            recommendations.append("Coordinate with multiple business stakeholders")
        
        recommendations.extend([
            "Create comprehensive test plan covering all affected components",
            "Prepare detailed rollback procedures",
            "Plan for post-implementation monitoring"
        ])
        
        return recommendations 
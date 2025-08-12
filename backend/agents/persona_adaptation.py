"""
Persona Adaptation Agent
Real agent implementation for transforming ASTC content and responses based on user personas
"""

import json
import time
import random
import uuid
from datetime import datetime
from typing import Dict, List, Any, Optional, Union
from dataclasses import dataclass
from enum import Enum

from framework.mock_neuro_san import Agent
from framework.communication import MessageType, Priority, get_router


class UserPersona(Enum):
    QA_MANAGER = "qa_manager"
    DEVELOPER = "developer"
    BUSINESS_USER = "business_user"


class ContentType(Enum):
    DASHBOARD = "dashboard"
    TEST_RESULTS = "test_results"
    DEPENDENCY_ANALYSIS = "dependency_analysis"
    SCRIPT_GENERATION = "script_generation"
    RISK_ASSESSMENT = "risk_assessment"
    EXECUTION_REPORT = "execution_report"
    AGENT_STATUS = "agent_status"
    GENERAL_MESSAGE = "general_message"


@dataclass
class PersonaProfile:
    persona_id: str
    name: str
    description: str
    primary_concerns: List[str]
    preferred_metrics: List[str]
    language_style: str
    detail_level: str
    focus_areas: List[str]
    terminology_preferences: Dict[str, str]
    dashboard_priorities: List[str]


@dataclass
class AdaptedContent:
    original_content: Dict[str, Any]
    persona: UserPersona
    content_type: ContentType
    adapted_data: Dict[str, Any]
    persona_insights: List[str]
    recommended_actions: List[str]
    contextual_explanations: Dict[str, str]
    adapted_terminology: Dict[str, str]
    priority_highlights: List[Dict[str, Any]]
    timestamp: str


class PersonaAdaptationAgent(Agent):
    """
    Real Persona Adaptation Agent with intelligent content transformation
    """
    
    def __init__(self):
        super().__init__(
            agent_id="persona_adaptation",
            name="Persona Adaptation Agent",
            capabilities=[
                "content_transformation",
                "persona_aware_language",
                "role_specific_insights",
                "dashboard_adaptation",
                "terminology_translation",
                "priority_assessment",
                "contextual_explanations",
                "metric_filtering"
            ]
        )
        
        # Persona profiles with detailed characteristics
        self.persona_profiles = {
            UserPersona.QA_MANAGER: PersonaProfile(
                persona_id="qa_manager",
                name="QA Manager",
                description="Quality Assurance leadership focused on risk management and resource optimization",
                primary_concerns=[
                    "Risk mitigation",
                    "Resource allocation",
                    "Timeline adherence",
                    "Coverage completeness",
                    "Budget optimization",
                    "Team productivity",
                    "Compliance requirements",
                    "Executive reporting"
                ],
                preferred_metrics=[
                    "Risk score",
                    "Coverage percentage",
                    "Defect density",
                    "Cost per test",
                    "ROI calculations",
                    "Resource utilization",
                    "Timeline variance",
                    "Quality gates"
                ],
                language_style="executive",
                detail_level="strategic",
                focus_areas=[
                    "Business impact",
                    "Resource optimization",
                    "Risk assessment",
                    "Strategic planning"
                ],
                terminology_preferences={
                    "test_case": "quality validation scenario",
                    "bug": "business risk issue",
                    "automation": "efficiency optimization",
                    "coverage": "quality assurance completeness",
                    "execution": "validation process",
                    "dependency": "business process interdependency"
                },
                dashboard_priorities=[
                    "Risk heat map",
                    "Resource allocation",
                    "Budget tracking",
                    "Executive KPIs",
                    "Timeline monitoring"
                ]
            ),
            
            UserPersona.DEVELOPER: PersonaProfile(
                persona_id="developer",
                name="Developer",
                description="Technical team member focused on implementation details and code-level information",
                primary_concerns=[
                    "Technical accuracy",
                    "Code quality",
                    "Integration points",
                    "Performance optimization",
                    "Debugging information",
                    "API specifications",
                    "Error handling",
                    "Documentation"
                ],
                preferred_metrics=[
                    "Execution time",
                    "Memory usage",
                    "API response codes",
                    "Error rates",
                    "Code coverage",
                    "Performance benchmarks",
                    "Integration success",
                    "Technical debt"
                ],
                language_style="technical",
                detail_level="implementation",
                focus_areas=[
                    "Code implementation",
                    "Technical specifications",
                    "Performance details",
                    "Integration mechanics"
                ],
                terminology_preferences={
                    "test_case": "test method",
                    "bug": "defect",
                    "automation": "automated testing framework",
                    "coverage": "code coverage",
                    "execution": "test execution",
                    "dependency": "module dependency"
                },
                dashboard_priorities=[
                    "Technical metrics",
                    "Performance data",
                    "Error logs",
                    "Code quality",
                    "Integration status"
                ]
            ),
            
            UserPersona.BUSINESS_USER: PersonaProfile(
                persona_id="business_user",
                name="Business User",
                description="Business stakeholder focused on process impact and operational outcomes",
                primary_concerns=[
                    "Process efficiency",
                    "User experience",
                    "Business continuity",
                    "Workflow impact",
                    "Training requirements",
                    "Change management",
                    "Operational benefits",
                    "User adoption"
                ],
                preferred_metrics=[
                    "Process completion time",
                    "User satisfaction",
                    "Error reduction",
                    "Efficiency gains",
                    "Training time",
                    "Adoption rates",
                    "Workflow improvements",
                    "Business value"
                ],
                language_style="conversational",
                detail_level="operational",
                focus_areas=[
                    "Business processes",
                    "User workflows",
                    "Operational impact",
                    "Change implications"
                ],
                terminology_preferences={
                    "test_case": "quality check",
                    "bug": "issue",
                    "automation": "automated process",
                    "coverage": "process validation",
                    "execution": "system check",
                    "dependency": "process connection"
                },
                dashboard_priorities=[
                    "Process status",
                    "User impact",
                    "Business benefits",
                    "Workflow health",
                    "Change readiness"
                ]
            )
        }
        
        # Content transformation rules
        self.transformation_rules = {
            ContentType.DASHBOARD: {
                UserPersona.QA_MANAGER: {
                    "highlight_metrics": ["risk_score", "coverage", "budget_impact", "timeline"],
                    "hide_details": ["technical_logs", "code_snippets", "api_calls"],
                    "add_sections": ["executive_summary", "roi_analysis", "resource_planning"],
                    "chart_types": ["risk_heatmap", "trend_analysis", "budget_tracking"]
                },
                UserPersona.DEVELOPER: {
                    "highlight_metrics": ["execution_time", "error_rates", "performance", "coverage"],
                    "hide_details": ["business_justification", "executive_summary"],
                    "add_sections": ["technical_details", "code_analysis", "integration_points"],
                    "chart_types": ["performance_graphs", "error_distribution", "technical_metrics"]
                },
                UserPersona.BUSINESS_USER: {
                    "highlight_metrics": ["process_time", "user_impact", "efficiency_gains"],
                    "hide_details": ["technical_implementation", "code_details", "system_metrics"],
                    "add_sections": ["business_impact", "process_workflow", "user_benefits"],
                    "chart_types": ["process_flow", "impact_summary", "benefit_visualization"]
                }
            },
            ContentType.TEST_RESULTS: {
                UserPersona.QA_MANAGER: {
                    "focus": "risk_assessment_and_coverage",
                    "language": "strategic_business_impact",
                    "metrics": ["quality_gates", "risk_mitigation", "resource_efficiency"]
                },
                UserPersona.DEVELOPER: {
                    "focus": "technical_implementation",
                    "language": "detailed_technical_analysis",
                    "metrics": ["code_coverage", "performance_benchmarks", "error_analysis"]
                },
                UserPersona.BUSINESS_USER: {
                    "focus": "process_validation",
                    "language": "plain_english_outcomes",
                    "metrics": ["process_health", "user_experience", "business_continuity"]
                }
            }
        }
        
        # Language adaptation patterns
        self.language_patterns = {
            "executive": {
                "tone": "authoritative",
                "complexity": "strategic",
                "focus": "outcomes",
                "sentence_structure": "concise",
                "jargon_level": "business"
            },
            "technical": {
                "tone": "precise",
                "complexity": "detailed",
                "focus": "implementation",
                "sentence_structure": "detailed",
                "jargon_level": "technical"
            },
            "conversational": {
                "tone": "friendly",
                "complexity": "simple",
                "focus": "practical",
                "sentence_structure": "clear",
                "jargon_level": "minimal"
            }
        }
        
        # Insight generation templates
        self.insight_templates = {
            UserPersona.QA_MANAGER: {
                "risk_assessment": "Based on the analysis, {risk_level} risk level indicates {business_impact}. Recommend {action} to mitigate exposure.",
                "resource_optimization": "Current resource allocation shows {efficiency}% efficiency. {recommendation} could improve ROI by {improvement}%.",
                "timeline_impact": "Testing timeline is {status}. {adjustment} recommended to maintain delivery commitments."
            },
            UserPersona.DEVELOPER: {
                "technical_analysis": "Code analysis reveals {finding}. Performance impact: {impact}. Recommended optimization: {solution}.",
                "integration_status": "Integration point {endpoint} shows {status}. Error rate: {rate}%. Debugging focus: {area}.",
                "implementation_guidance": "Technical implementation requires {requirement}. Complexity level: {level}. Estimated effort: {effort}."
            },
            UserPersona.BUSINESS_USER: {
                "process_impact": "This change affects your {process} workflow. Expected improvement: {benefit}. Transition time: {duration}.",
                "user_experience": "Users will experience {change}. Training requirement: {training}. Support needed: {support}.",
                "business_benefit": "This update delivers {value} to your business operations. Key benefit: {advantage}."
            }
        }

    async def process_message(self, message: Dict[str, Any]) -> Dict[str, Any]:
        """Process incoming messages for persona adaptation requests"""
        message_type = message.get("type", "")
        
        try:
            if message_type == "adapt_content":
                return await self.adapt_content(
                    message.get("content", {}),
                    message.get("persona", "qa_manager"),
                    message.get("content_type", "general_message")
                )
            
            elif message_type == "get_persona_dashboard":
                return await self.generate_persona_dashboard(
                    message.get("persona", "qa_manager"),
                    message.get("data_sources", {})
                )
            
            elif message_type == "transform_language":
                return await self.transform_language(
                    message.get("text", ""),
                    message.get("from_persona", "developer"),
                    message.get("to_persona", "business_user")
                )
            
            elif message_type == "generate_insights":
                return await self.generate_persona_insights(
                    message.get("data", {}),
                    message.get("persona", "qa_manager"),
                    message.get("context", {})
                )
            
            elif message_type == "get_persona_recommendations":
                return await self.get_persona_recommendations(
                    message.get("analysis_results", {}),
                    message.get("persona", "qa_manager")
                )
            
            elif message_type == "switch_persona_view":
                return await self.switch_persona_view(
                    message.get("current_data", {}),
                    message.get("from_persona", "qa_manager"),
                    message.get("to_persona", "developer")
                )
            
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

    async def adapt_content(self, content: Dict[str, Any], persona: str, content_type: str) -> Dict[str, Any]:
        """Adapt content for specific persona"""
        
        try:
            user_persona = UserPersona(persona)
            content_enum = ContentType(content_type)
        except ValueError as e:
            return {
                "success": False,
                "error": f"Invalid persona or content type: {str(e)}",
                "agent": self.agent_id
            }
        
        profile = self.persona_profiles[user_persona]
        
        # Transform content structure
        adapted_data = await self._transform_content_structure(content, user_persona, content_enum)
        
        # Generate persona-specific insights
        insights = await self._generate_contextual_insights(content, user_persona, content_enum)
        
        # Create recommendations
        recommendations = await self._generate_recommendations(content, user_persona)
        
        # Adapt terminology
        adapted_terminology = self._adapt_terminology(content, profile.terminology_preferences)
        
        # Generate explanations
        explanations = await self._generate_explanations(content, user_persona)
        
        # Highlight priorities
        priority_highlights = await self._extract_priority_highlights(content, user_persona)
        
        adapted_content = AdaptedContent(
            original_content=content,
            persona=user_persona,
            content_type=content_enum,
            adapted_data=adapted_data,
            persona_insights=insights,
            recommended_actions=recommendations,
            contextual_explanations=explanations,
            adapted_terminology=adapted_terminology,
            priority_highlights=priority_highlights,
            timestamp=datetime.now().isoformat()
        )
        
        return {
            "success": True,
            "adapted_content": self._adapted_content_to_dict(adapted_content),
            "persona_profile": self._profile_to_dict(profile),
            "transformation_applied": self._get_transformation_summary(user_persona, content_enum),
            "agent": self.agent_id,
            "timestamp": datetime.now().isoformat()
        }

    async def _transform_content_structure(self, content: Dict[str, Any], persona: UserPersona, content_type: ContentType) -> Dict[str, Any]:
        """Transform content structure based on persona preferences"""
        
        adapted = content.copy()
        
        if content_type in self.transformation_rules and persona in self.transformation_rules[content_type]:
            rules = self.transformation_rules[content_type][persona]
            
            # Highlight preferred metrics
            if "highlight_metrics" in rules and "metrics" in adapted:
                highlighted_metrics = {}
                for metric in rules["highlight_metrics"]:
                    if metric in adapted["metrics"]:
                        highlighted_metrics[metric] = adapted["metrics"][metric]
                adapted["priority_metrics"] = highlighted_metrics
            
            # Hide irrelevant details
            if "hide_details" in rules:
                for detail_key in rules["hide_details"]:
                    adapted.pop(detail_key, None)
            
            # Add persona-specific sections
            if "add_sections" in rules:
                for section in rules["add_sections"]:
                    adapted[section] = await self._generate_section_content(section, content, persona)
            
            # Adapt chart types
            if "chart_types" in rules:
                adapted["recommended_visualizations"] = rules["chart_types"]
        
        # Apply persona-specific data filtering
        adapted = await self._apply_persona_filtering(adapted, persona)
        
        return adapted

    async def _apply_persona_filtering(self, data: Dict[str, Any], persona: UserPersona) -> Dict[str, Any]:
        """Apply persona-specific data filtering"""
        
        filtered_data = data.copy()
        profile = self.persona_profiles[persona]
        
        # Filter metrics based on persona preferences
        if "metrics" in filtered_data:
            filtered_metrics = {}
            for metric_name, metric_value in filtered_data["metrics"].items():
                # Check if this metric is relevant to the persona
                if any(preferred in metric_name for preferred in profile.preferred_metrics):
                    filtered_metrics[metric_name] = metric_value
            
            if filtered_metrics:
                filtered_data["filtered_metrics"] = filtered_metrics
        
        # Add persona-specific context
        filtered_data["persona_context"] = {
            "focus_areas": profile.focus_areas,
            "primary_concerns": profile.primary_concerns[:3],  # Top 3 concerns
            "language_style": profile.language_style
        }
        
        return filtered_data

    async def _generate_section_content(self, section_name: str, content: Dict[str, Any], persona: UserPersona) -> Dict[str, Any]:
        """Generate content for persona-specific sections"""
        
        section_generators = {
            "executive_summary": {
                "title": "Executive Summary",
                "content": f"Overall system performance shows {content.get('success_rate', 95)}% success rate with strategic opportunities for optimization.",
                "metrics": ["success_rate", "risk_score", "efficiency"]
            },
            "roi_analysis": {
                "title": "ROI Analysis", 
                "content": "Current automation investment shows positive ROI with 40% reduction in manual testing effort.",
                "metrics": ["cost_savings", "time_reduction", "resource_efficiency"]
            },
            "resource_planning": {
                "title": "Resource Planning",
                "content": "Resource allocation optimization opportunities identified across testing workflows.",
                "metrics": ["team_utilization", "capacity_planning", "skill_gaps"]
            },
            "technical_details": {
                "title": "Technical Implementation Details",
                "content": f"System performance metrics indicate {content.get('avg_execution_time', 2.3)}s average execution time.",
                "metrics": ["execution_time", "memory_usage", "cpu_utilization"]
            },
            "code_analysis": {
                "title": "Code Quality Analysis",
                "content": f"Code coverage at {content.get('coverage', 87)}% with performance optimization opportunities.",
                "metrics": ["code_coverage", "complexity", "maintainability"]
            },
            "integration_points": {
                "title": "Integration Analysis",
                "content": "System integration points show stable connectivity with external services.",
                "metrics": ["api_response_time", "error_rates", "uptime"]
            },
            "business_impact": {
                "title": "Business Impact Assessment",
                "content": "Process improvements deliver measurable business value and operational efficiency.",
                "metrics": ["process_efficiency", "user_satisfaction", "business_value"]
            },
            "process_workflow": {
                "title": "Process Workflow Analysis",
                "content": "Streamlined workflows reduce processing time and improve user experience.",
                "metrics": ["workflow_time", "step_reduction", "automation_rate"]
            },
            "user_benefits": {
                "title": "User Benefits",
                "content": "Enhanced user experience with reduced training time and improved productivity.",
                "metrics": ["user_satisfaction", "training_time", "productivity_gain"]
            }
        }
        
        return section_generators.get(section_name, {
            "title": section_name.replace("_", " ").title(),
            "content": f"Analysis results for {section_name}",
            "metrics": ["general_metrics"]
        })

    async def _generate_contextual_insights(self, content: Dict[str, Any], persona: UserPersona, content_type: ContentType) -> List[str]:
        """Generate insights tailored to persona concerns"""
        
        insights = []
        profile = self.persona_profiles[persona]
        templates = self.insight_templates.get(persona, {})
        
        # Analyze content for persona-relevant patterns
        if persona == UserPersona.QA_MANAGER:
            # Risk-focused insights
            if "risk_level" in content:
                risk_level = content["risk_level"]
                business_impact = "significant operational exposure" if risk_level == "high" else "manageable business risk"
                action = "immediate risk mitigation strategy" if risk_level == "high" else "continued monitoring"
                
                if "risk_assessment" in templates:
                    insights.append(templates["risk_assessment"].format(
                        risk_level=risk_level,
                        business_impact=business_impact,
                        action=action
                    ))
            
            # Resource optimization insights
            if "resource_utilization" in content:
                efficiency = content.get("resource_utilization", 75)
                recommendation = "resource reallocation" if efficiency < 80 else "current allocation optimization"
                improvement = max(5, 100 - efficiency)
                
                if "resource_optimization" in templates:
                    insights.append(templates["resource_optimization"].format(
                        efficiency=efficiency,
                        recommendation=recommendation,
                        improvement=improvement
                    ))
        
        elif persona == UserPersona.DEVELOPER:
            # Technical analysis insights
            if "performance_metrics" in content:
                metrics = content["performance_metrics"]
                finding = "performance bottleneck identified" if metrics.get("avg_duration", 0) > 5000 else "optimal performance"
                impact = "high" if metrics.get("avg_duration", 0) > 5000 else "minimal"
                solution = "code optimization required" if impact == "high" else "maintain current implementation"
                
                if "technical_analysis" in templates:
                    insights.append(templates["technical_analysis"].format(
                        finding=finding,
                        impact=impact,
                        solution=solution
                    ))
            
            # Integration analysis
            if "integration_status" in content:
                status = content["integration_status"]
                endpoint = content.get("endpoint", "API")
                rate = content.get("error_rate", 2)
                area = "error handling" if rate > 5 else "performance optimization"
                
                if "integration_status" in templates:
                    insights.append(templates["integration_status"].format(
                        endpoint=endpoint,
                        status=status,
                        rate=rate,
                        area=area
                    ))
        
        elif persona == UserPersona.BUSINESS_USER:
            # Process impact insights
            if "process_changes" in content:
                process = content.get("affected_process", "business workflow")
                benefit = content.get("expected_benefit", "improved efficiency")
                duration = content.get("transition_time", "2-3 days")
                
                if "process_impact" in templates:
                    insights.append(templates["process_impact"].format(
                        process=process,
                        benefit=benefit,
                        duration=duration
                    ))
            
            # User experience insights
            if "user_impact" in content:
                change = content.get("change_description", "workflow improvement")
                training = content.get("training_required", "minimal")
                support = content.get("support_level", "standard")
                
                if "user_experience" in templates:
                    insights.append(templates["user_experience"].format(
                        change=change,
                        training=training,
                        support=support
                    ))
        
        # Add general insights based on content patterns
        if "success_rate" in content:
            success_rate = content["success_rate"]
            if success_rate < 80:
                insights.append(f"Success rate of {success_rate}% indicates improvement opportunities in {profile.focus_areas[0]}.")
            elif success_rate > 95:
                insights.append(f"Excellent success rate of {success_rate}% demonstrates effective {profile.focus_areas[0]}.")
        
        return insights

    async def _generate_recommendations(self, content: Dict[str, Any], persona: UserPersona) -> List[str]:
        """Generate persona-specific recommendations"""
        
        recommendations = []
        profile = self.persona_profiles[persona]
        
        if persona == UserPersona.QA_MANAGER:
            # Executive-level recommendations
            if "risk_score" in content and content["risk_score"] > 7:
                recommendations.append("Implement immediate risk mitigation strategy with executive oversight")
                recommendations.append("Allocate additional QA resources to high-risk areas")
                recommendations.append("Schedule weekly risk assessment reviews with stakeholders")
            
            if "budget_variance" in content and abs(content["budget_variance"]) > 10:
                recommendations.append("Review resource allocation and budget optimization opportunities")
                recommendations.append("Consider process automation to reduce manual testing costs")
            
            if "coverage" in content and content["coverage"] < 85:
                recommendations.append("Expand test coverage to meet quality gate requirements")
                recommendations.append("Invest in automation tools to improve coverage efficiency")
        
        elif persona == UserPersona.DEVELOPER:
            # Technical recommendations
            if "performance_issues" in content and content["performance_issues"]:
                recommendations.append("Optimize database queries and API response times")
                recommendations.append("Implement caching mechanisms for frequently accessed data")
                recommendations.append("Review and refactor performance-critical code sections")
            
            if "integration_failures" in content and content["integration_failures"] > 2:
                recommendations.append("Enhance error handling and retry mechanisms")
                recommendations.append("Implement comprehensive integration testing")
                recommendations.append("Add monitoring and alerting for integration points")
            
            if "code_quality" in content and content["code_quality"] < 8:
                recommendations.append("Conduct code review sessions and implement quality gates")
                recommendations.append("Increase unit test coverage and quality metrics")
        
        elif persona == UserPersona.BUSINESS_USER:
            # Business-focused recommendations
            if "user_complaints" in content and content["user_complaints"] > 5:
                recommendations.append("Provide additional user training and support resources")
                recommendations.append("Simplify complex workflows to improve user experience")
                recommendations.append("Gather user feedback to identify pain points")
            
            if "process_efficiency" in content and content["process_efficiency"] < 70:
                recommendations.append("Streamline business processes to reduce manual steps")
                recommendations.append("Implement workflow automation for routine tasks")
                recommendations.append("Review and update process documentation")
            
            if "adoption_rate" in content and content["adoption_rate"] < 80:
                recommendations.append("Enhance change management and communication strategy")
                recommendations.append("Provide incentives for early adopters and champions")
        
        return recommendations

    def _adapt_terminology(self, content: Dict[str, Any], terminology_prefs: Dict[str, str]) -> Dict[str, str]:
        """Adapt technical terminology for persona"""
        
        adapted_terms = {}
        
        # Convert content to string for terminology scanning
        content_str = json.dumps(content).lower()
        
        for technical_term, preferred_term in terminology_prefs.items():
            if technical_term in content_str:
                adapted_terms[technical_term] = preferred_term
        
        return adapted_terms

    async def _generate_explanations(self, content: Dict[str, Any], persona: UserPersona) -> Dict[str, str]:
        """Generate contextual explanations for complex concepts"""
        
        explanations = {}
        profile = self.persona_profiles[persona]
        
        # Technical concept explanations
        if "dependency_analysis" in content:
            if persona == UserPersona.BUSINESS_USER:
                explanations["dependency_analysis"] = "This shows how different business processes are connected. When one process changes, it might affect other related processes."
            elif persona == UserPersona.QA_MANAGER:
                explanations["dependency_analysis"] = "Dependency analysis identifies business risks and resource planning needs when implementing changes across interconnected processes."
            else:
                explanations["dependency_analysis"] = "Dependency mapping reveals module interactions and integration points that require testing coordination."
        
        if "automation_scripts" in content:
            if persona == UserPersona.BUSINESS_USER:
                explanations["automation_scripts"] = "These are automated instructions that can perform repetitive tasks without manual intervention, saving time and reducing errors."
            elif persona == UserPersona.QA_MANAGER:
                explanations["automation_scripts"] = "Automation scripts provide cost-effective testing solutions with measurable ROI and reduced resource requirements."
            else:
                explanations["automation_scripts"] = "Automation scripts contain executable code for test case implementation with error handling and validation logic."
        
        if "risk_assessment" in content:
            if persona == UserPersona.BUSINESS_USER:
                explanations["risk_assessment"] = "This evaluation identifies potential issues that could affect your business operations and suggests preventive measures."
            elif persona == UserPersona.QA_MANAGER:
                explanations["risk_assessment"] = "Risk assessment quantifies business exposure and provides strategic guidance for quality investment decisions."
            else:
                explanations["risk_assessment"] = "Risk assessment analyzes technical vulnerabilities and implementation challenges with mitigation strategies."
        
        return explanations

    async def _extract_priority_highlights(self, content: Dict[str, Any], persona: UserPersona) -> List[Dict[str, Any]]:
        """Extract and prioritize information based on persona concerns"""
        
        highlights = []
        profile = self.persona_profiles[persona]
        
        # Scan content for persona priorities
        for concern in profile.primary_concerns[:3]:  # Top 3 concerns
            highlight = self._find_relevant_content(content, concern, persona)
            if highlight:
                highlights.append(highlight)
        
        return highlights

    def _find_relevant_content(self, content: Dict[str, Any], concern: str, persona: UserPersona) -> Optional[Dict[str, Any]]:
        """Find content relevant to specific persona concern"""
        
        concern_mappings = {
            "Risk mitigation": ["risk_score", "risk_level", "high_risk_areas"],
            "Resource allocation": ["resource_utilization", "team_capacity", "budget_usage"],
            "Timeline adherence": ["schedule_variance", "milestone_progress", "delivery_date"],
            "Technical accuracy": ["error_rate", "performance_metrics", "code_quality"],
            "Performance optimization": ["execution_time", "memory_usage", "response_time"],
            "Process efficiency": ["process_time", "automation_rate", "efficiency_score"],
            "User experience": ["user_satisfaction", "usability_score", "adoption_rate"]
        }
        
        if concern in concern_mappings:
            for key in concern_mappings[concern]:
                if key in content:
                    return {
                        "concern": concern,
                        "metric": key,
                        "value": content[key],
                        "priority": "high",
                        "persona_relevance": persona.value
                    }
        
        return None

    async def generate_persona_dashboard(self, persona: str, data_sources: Dict[str, Any]) -> Dict[str, Any]:
        """Generate complete dashboard adapted for persona"""
        
        try:
            user_persona = UserPersona(persona)
        except ValueError:
            return {
                "success": False,
                "error": f"Invalid persona: {persona}",
                "agent": self.agent_id
            }
        
        profile = self.persona_profiles[user_persona]
        
        # Generate dashboard sections
        dashboard_sections = {}
        
        for priority in profile.dashboard_priorities:
            section_data = await self._generate_dashboard_section(priority, data_sources, user_persona)
            dashboard_sections[priority.replace(" ", "_").lower()] = section_data
        
        # Generate KPIs
        kpis = await self._generate_persona_kpis(data_sources, user_persona)
        
        # Generate navigation
        navigation = self._generate_persona_navigation(user_persona)
        
        # Generate alerts
        alerts = await self._generate_persona_alerts(data_sources, user_persona)
        
        return {
            "success": True,
            "dashboard": {
                "persona": persona,
                "sections": dashboard_sections,
                "kpis": kpis,
                "navigation": navigation,
                "alerts": alerts,
                "theme": self._get_persona_theme(user_persona),
                "layout": self._get_persona_layout(user_persona)
            },
            "agent": self.agent_id,
            "timestamp": datetime.now().isoformat()
        }

    async def _generate_dashboard_section(self, section_name: str, data_sources: Dict[str, Any], persona: UserPersona) -> Dict[str, Any]:
        """Generate specific dashboard section for persona"""
        
        section_generators = {
            "Risk heat map": self._generate_risk_heatmap_section,
            "Resource allocation": self._generate_resource_section,
            "Technical metrics": self._generate_technical_metrics_section,
            "Process status": self._generate_process_status_section,
            "Executive KPIs": self._generate_executive_kpi_section,
            "Performance data": self._generate_performance_section,
            "User impact": self._generate_user_impact_section
        }
        
        generator = section_generators.get(section_name, self._generate_generic_section)
        return await generator(data_sources, persona)

    async def _generate_executive_kpi_section(self, data_sources: Dict[str, Any], persona: UserPersona) -> Dict[str, Any]:
        """Generate executive KPI section"""
        
        executive_data = data_sources.get("executive_metrics", {})
        
        return {
            "title": "Executive KPI Dashboard",
            "type": "kpi_grid",
            "data": {
                "quality_score": executive_data.get("quality_score", 92),
                "delivery_performance": executive_data.get("delivery_performance", 88),
                "cost_efficiency": executive_data.get("cost_efficiency", 78),
                "stakeholder_satisfaction": executive_data.get("stakeholder_satisfaction", 85)
            },
            "insights": [
                "Quality score exceeds industry benchmark",
                "Delivery performance tracking above target",
                "Cost efficiency opportunities identified"
            ],
            "actions": [
                "Review quarterly performance targets",
                "Optimize resource allocation strategy",
                "Schedule stakeholder review meeting"
            ]
        }

    async def _generate_performance_section(self, data_sources: Dict[str, Any], persona: UserPersona) -> Dict[str, Any]:
        """Generate performance data section"""
        
        perf_data = data_sources.get("performance_metrics", {})
        
        return {
            "title": "System Performance Analysis",
            "type": "performance_charts",
            "data": {
                "response_time": perf_data.get("avg_response_time", 1.8),
                "throughput": perf_data.get("throughput", 1250),
                "error_rate": perf_data.get("error_rate", 0.8),
                "availability": perf_data.get("availability", 99.7)
            },
            "insights": [
                "Response time improved by 25%",
                "Throughput within optimal range",
                "Error rate below threshold"
            ],
            "actions": [
                "Monitor peak load performance",
                "Optimize database queries",
                "Implement additional caching"
            ]
        }

    async def _generate_user_impact_section(self, data_sources: Dict[str, Any], persona: UserPersona) -> Dict[str, Any]:
        """Generate user impact section"""
        
        user_data = data_sources.get("user_metrics", {})
        
        return {
            "title": "User Experience Impact",
            "type": "user_metrics",
            "data": {
                "user_satisfaction": user_data.get("satisfaction", 4.2),
                "adoption_rate": user_data.get("adoption_rate", 85),
                "support_tickets": user_data.get("support_tickets", 23),
                "training_completion": user_data.get("training_completion", 78)
            },
            "insights": [
                "User satisfaction above 4.0 target",
                "Adoption rate shows positive trend",
                "Support ticket volume decreasing"
            ],
            "actions": [
                "Expand user training programs",
                "Gather detailed user feedback",
                "Implement user experience improvements"
            ]
        }

    async def _generate_risk_heatmap_section(self, data_sources: Dict[str, Any], persona: UserPersona) -> Dict[str, Any]:
        """Generate risk heatmap section"""
        
        risk_data = data_sources.get("risk_analysis", {})
        
        return {
            "title": "Business Risk Assessment" if persona == UserPersona.QA_MANAGER else "Risk Overview",
            "type": "heatmap",
            "data": {
                "high_risk_areas": risk_data.get("high_risk", []),
                "medium_risk_areas": risk_data.get("medium_risk", []),
                "low_risk_areas": risk_data.get("low_risk", []),
                "overall_risk_score": risk_data.get("overall_score", 6.5)
            },
            "insights": [
                "3 high-risk areas require immediate attention",
                "Risk trend improving by 15% this quarter",
                "Automated testing reduced risk by 40%"
            ],
            "actions": [
                "Review high-risk transaction dependencies",
                "Implement additional validation checkpoints",
                "Schedule risk assessment review meeting"
            ]
        }

    async def _generate_resource_section(self, data_sources: Dict[str, Any], persona: UserPersona) -> Dict[str, Any]:
        """Generate resource allocation section"""
        
        resource_data = data_sources.get("resource_metrics", {})
        
        return {
            "title": "Resource Optimization Dashboard",
            "type": "allocation_chart",
            "data": {
                "team_utilization": resource_data.get("utilization", 78),
                "budget_consumed": resource_data.get("budget_used", 65),
                "capacity_available": resource_data.get("available_capacity", 22),
                "efficiency_score": resource_data.get("efficiency", 85)
            },
            "insights": [
                "Team utilization at optimal 78%",
                "Budget tracking 5% under target",
                "Capacity available for Q4 initiatives"
            ],
            "actions": [
                "Reallocate resources to high-priority areas",
                "Consider additional automation investment",
                "Schedule capacity planning review"
            ]
        }

    async def _generate_technical_metrics_section(self, data_sources: Dict[str, Any], persona: UserPersona) -> Dict[str, Any]:
        """Generate technical metrics section"""
        
        tech_data = data_sources.get("technical_metrics", {})
        
        return {
            "title": "Technical Performance Dashboard",
            "type": "metrics_grid",
            "data": {
                "avg_execution_time": tech_data.get("avg_execution", 2.3),
                "error_rate": tech_data.get("error_rate", 1.2),
                "code_coverage": tech_data.get("coverage", 87),
                "integration_success": tech_data.get("integration_success", 96)
            },
            "insights": [
                "Execution time improved by 23%",
                "Error rate within acceptable limits",
                "Code coverage exceeds target threshold"
            ],
            "actions": [
                "Optimize remaining performance bottlenecks",
                "Increase error handling robustness",
                "Expand integration test coverage"
            ]
        }

    async def _generate_process_status_section(self, data_sources: Dict[str, Any], persona: UserPersona) -> Dict[str, Any]:
        """Generate process status section"""
        
        process_data = data_sources.get("process_metrics", {})
        
        return {
            "title": "Business Process Health",
            "type": "status_indicators",
            "data": {
                "processes_healthy": process_data.get("healthy", 12),
                "processes_warning": process_data.get("warning", 3),
                "processes_critical": process_data.get("critical", 1),
                "overall_health_score": process_data.get("health_score", 85)
            },
            "insights": [
                "85% of processes operating normally",
                "3 processes showing warning indicators",
                "1 critical process requires attention"
            ],
            "actions": [
                "Review critical process dependencies",
                "Update process documentation",
                "Schedule process improvement workshop"
            ]
        }

    async def _generate_generic_section(self, data_sources: Dict[str, Any], persona: UserPersona) -> Dict[str, Any]:
        """Generate generic dashboard section"""
        
        return {
            "title": "Summary Metrics",
            "type": "summary_cards",
            "data": {
                "total_items": len(data_sources),
                "success_rate": 92,
                "efficiency": 78,
                "status": "operational"
            },
            "insights": ["System operating within normal parameters"],
            "actions": ["Continue monitoring current metrics"]
        }

    async def _generate_persona_kpis(self, data_sources: Dict[str, Any], persona: UserPersona) -> List[Dict[str, Any]]:
        """Generate persona-specific KPIs"""
        
        kpi_definitions = {
            UserPersona.QA_MANAGER: [
                {"name": "Quality Gate Success", "value": 94, "unit": "%", "trend": "+2%", "status": "good"},
                {"name": "Risk Mitigation Score", "value": 8.2, "unit": "/10", "trend": "+0.5", "status": "excellent"},
                {"name": "Resource Efficiency", "value": 78, "unit": "%", "trend": "+5%", "status": "good"},
                {"name": "Budget Utilization", "value": 65, "unit": "%", "trend": "-3%", "status": "good"}
            ],
            UserPersona.DEVELOPER: [
                {"name": "Code Coverage", "value": 87, "unit": "%", "trend": "+3%", "status": "good"},
                {"name": "Avg Execution Time", "value": 2.3, "unit": "sec", "trend": "-0.4s", "status": "excellent"},
                {"name": "Error Rate", "value": 1.2, "unit": "%", "trend": "-0.3%", "status": "excellent"},
                {"name": "Integration Success", "value": 96, "unit": "%", "trend": "+1%", "status": "excellent"}
            ],
            UserPersona.BUSINESS_USER: [
                {"name": "Process Completion", "value": 98, "unit": "%", "trend": "+2%", "status": "excellent"},
                {"name": "User Satisfaction", "value": 4.2, "unit": "/5", "trend": "+0.3", "status": "good"},
                {"name": "Training Time", "value": 45, "unit": "min", "trend": "-10min", "status": "excellent"},
                {"name": "Adoption Rate", "value": 82, "unit": "%", "trend": "+8%", "status": "good"}
            ]
        }
        
        return kpi_definitions.get(persona, [])

    def _generate_persona_navigation(self, persona: UserPersona) -> List[Dict[str, Any]]:
        """Generate persona-specific navigation"""
        
        navigation_configs = {
            UserPersona.QA_MANAGER: [
                {"name": "Executive Dashboard", "icon": "dashboard", "route": "/dashboard"},
                {"name": "Risk Assessment", "icon": "warning", "route": "/risk"},
                {"name": "Resource Planning", "icon": "users", "route": "/resources"},
                {"name": "Budget Tracking", "icon": "dollar-sign", "route": "/budget"},
                {"name": "Reports", "icon": "file-text", "route": "/reports"}
            ],
            UserPersona.DEVELOPER: [
                {"name": "Technical Metrics", "icon": "activity", "route": "/metrics"},
                {"name": "Code Analysis", "icon": "code", "route": "/code"},
                {"name": "Performance", "icon": "zap", "route": "/performance"},
                {"name": "Integration", "icon": "git-merge", "route": "/integration"},
                {"name": "Debugging", "icon": "bug", "route": "/debug"}
            ],
            UserPersona.BUSINESS_USER: [
                {"name": "Process Overview", "icon": "layers", "route": "/processes"},
                {"name": "User Impact", "icon": "user", "route": "/impact"},
                {"name": "Training", "icon": "book", "route": "/training"},
                {"name": "Support", "icon": "help-circle", "route": "/support"},
                {"name": "Feedback", "icon": "message-circle", "route": "/feedback"}
            ]
        }
        
        return navigation_configs.get(persona, [])

    async def _generate_persona_alerts(self, data_sources: Dict[str, Any], persona: UserPersona) -> List[Dict[str, Any]]:
        """Generate persona-specific alerts"""
        
        alerts = []
        
        if persona == UserPersona.QA_MANAGER:
            alerts.extend([
                {"type": "warning", "title": "Budget Alert", "message": "Q4 testing budget 85% consumed", "priority": "medium"},
                {"type": "success", "title": "Risk Reduction", "message": "High-risk areas decreased by 15%", "priority": "low"},
                {"type": "info", "title": "Resource Available", "message": "2 QA engineers available for new project", "priority": "low"}
            ])
        
        elif persona == UserPersona.DEVELOPER:
            alerts.extend([
                {"type": "error", "title": "Performance Issue", "message": "API response time exceeding 3s threshold", "priority": "high"},
                {"type": "warning", "title": "Integration Failure", "message": "External service showing 5% error rate", "priority": "medium"},
                {"type": "info", "title": "Code Quality", "message": "Code coverage improved to 87%", "priority": "low"}
            ])
        
        elif persona == UserPersona.BUSINESS_USER:
            alerts.extend([
                {"type": "info", "title": "Process Improvement", "message": "Order processing time reduced by 20%", "priority": "low"},
                {"type": "warning", "title": "Training Needed", "message": "15 users pending system training", "priority": "medium"},
                {"type": "success", "title": "Adoption Success", "message": "User adoption rate reached 82%", "priority": "low"}
            ])
        
        return alerts

    def _get_persona_theme(self, persona: UserPersona) -> Dict[str, str]:
        """Get theme configuration for persona"""
        
        themes = {
            UserPersona.QA_MANAGER: {
                "primary_color": "#1f4e79",
                "secondary_color": "#2e5e8a",
                "accent_color": "#e74c3c",
                "background": "#f8f9fa",
                "style": "executive"
            },
            UserPersona.DEVELOPER: {
                "primary_color": "#2c3e50",
                "secondary_color": "#34495e",
                "accent_color": "#27ae60",
                "background": "#ecf0f1",
                "style": "technical"
            },
            UserPersona.BUSINESS_USER: {
                "primary_color": "#3498db",
                "secondary_color": "#5dade2",
                "accent_color": "#f39c12",
                "background": "#ebf3fd",
                "style": "friendly"
            }
        }
        
        return themes.get(persona, themes[UserPersona.QA_MANAGER])

    def _get_persona_layout(self, persona: UserPersona) -> Dict[str, Any]:
        """Get layout configuration for persona"""
        
        layouts = {
            UserPersona.QA_MANAGER: {
                "sidebar_position": "left",
                "header_height": "80px",
                "card_style": "elevated",
                "chart_emphasis": "high",
                "density": "comfortable"
            },
            UserPersona.DEVELOPER: {
                "sidebar_position": "left",
                "header_height": "60px", 
                "card_style": "flat",
                "chart_emphasis": "medium",
                "density": "compact"
            },
            UserPersona.BUSINESS_USER: {
                "sidebar_position": "top",
                "header_height": "100px",
                "card_style": "rounded",
                "chart_emphasis": "low",
                "density": "spacious"
            }
        }
        
        return layouts.get(persona, layouts[UserPersona.QA_MANAGER])

    async def transform_language(self, text: str, from_persona: str, to_persona: str) -> Dict[str, Any]:
        """Transform language from one persona style to another"""
        
        try:
            source_persona = UserPersona(from_persona)
            target_persona = UserPersona(to_persona)
        except ValueError as e:
            return {
                "success": False,
                "error": f"Invalid persona: {str(e)}",
                "agent": self.agent_id
            }
        
        source_profile = self.persona_profiles[source_persona]
        target_profile = self.persona_profiles[target_persona]
        
        # Apply terminology transformation
        transformed_text = text
        for tech_term, preferred_term in target_profile.terminology_preferences.items():
            if tech_term in transformed_text.lower():
                transformed_text = transformed_text.replace(tech_term, preferred_term)
        
        # Apply language style transformation
        transformed_text = await self._apply_language_style_transformation(
            transformed_text, 
            source_profile.language_style,
            target_profile.language_style
        )
        
        return {
            "success": True,
            "original_text": text,
            "transformed_text": transformed_text,
            "from_persona": from_persona,
            "to_persona": to_persona,
            "transformation_details": {
                "terminology_changes": len(target_profile.terminology_preferences),
                "style_change": f"{source_profile.language_style} → {target_profile.language_style}",
                "complexity_change": f"{source_profile.detail_level} → {target_profile.detail_level}"
            },
            "agent": self.agent_id,
            "timestamp": datetime.now().isoformat()
        }

    async def _apply_language_style_transformation(self, text: str, from_style: str, to_style: str) -> str:
        """Apply language style transformation"""
        
        # Style transformation patterns
        transformations = {
            ("technical", "conversational"): {
                "replacements": {
                    "implementation": "setup",
                    "optimization": "improvement", 
                    "configuration": "settings",
                    "integration": "connection",
                    "validation": "checking"
                },
                "tone_shift": "simplify"
            },
            ("technical", "executive"): {
                "replacements": {
                    "bug": "business risk",
                    "performance issue": "operational concern",
                    "code quality": "system reliability",
                    "implementation": "deployment strategy"
                },
                "tone_shift": "elevate"
            },
            ("conversational", "technical"): {
                "replacements": {
                    "issue": "defect",
                    "setup": "configuration",
                    "improvement": "optimization",
                    "connection": "integration"
                },
                "tone_shift": "specify"
            }
        }
        
        transformation = transformations.get((from_style, to_style), {})
        transformed = text
        
        for old_term, new_term in transformation.get("replacements", {}).items():
            transformed = transformed.replace(old_term, new_term)
        
        return transformed

    async def switch_persona_view(self, current_data: Dict[str, Any], from_persona: str, to_persona: str) -> Dict[str, Any]:
        """Switch entire view from one persona to another"""
        
        # Adapt content for new persona
        adapted_content_result = await self.adapt_content(
            current_data, to_persona, "dashboard"
        )
        
        if not adapted_content_result["success"]:
            return adapted_content_result
        
        # Generate new dashboard
        dashboard_result = await self.generate_persona_dashboard(
            to_persona, current_data
        )
        
        return {
            "success": True,
            "view_switch": {
                "from_persona": from_persona,
                "to_persona": to_persona,
                "adapted_content": adapted_content_result["adapted_content"],
                "new_dashboard": dashboard_result.get("dashboard", {}),
                "transition_guidance": await self._generate_transition_guidance(from_persona, to_persona)
            },
            "agent": self.agent_id,
            "timestamp": datetime.now().isoformat()
        }

    async def _generate_transition_guidance(self, from_persona: str, to_persona: str) -> Dict[str, Any]:
        """Generate guidance for persona transition"""
        
        guidance_texts = {
            ("qa_manager", "developer"): {
                "message": "Switching to technical implementation view",
                "focus_change": "From strategic oversight to technical details",
                "new_priorities": ["Code quality", "Performance metrics", "Integration status"]
            },
            ("developer", "business_user"): {
                "message": "Switching to business process view", 
                "focus_change": "From technical implementation to business impact",
                "new_priorities": ["Process efficiency", "User experience", "Business value"]
            },
            ("business_user", "qa_manager"): {
                "message": "Switching to quality management view",
                "focus_change": "From operational impact to strategic quality planning",
                "new_priorities": ["Risk assessment", "Resource allocation", "Quality gates"]
            }
        }
        
        return guidance_texts.get((from_persona, to_persona), {
            "message": f"Switching from {from_persona} to {to_persona} view",
            "focus_change": "Adapting perspective and priorities",
            "new_priorities": ["Context-appropriate metrics and insights"]
        })

    def _adapted_content_to_dict(self, adapted_content: AdaptedContent) -> Dict[str, Any]:
        """Convert AdaptedContent to dictionary"""
        return {
            "original_content": adapted_content.original_content,
            "persona": adapted_content.persona.value,
            "content_type": adapted_content.content_type.value,
            "adapted_data": adapted_content.adapted_data,
            "persona_insights": adapted_content.persona_insights,
            "recommended_actions": adapted_content.recommended_actions,
            "contextual_explanations": adapted_content.contextual_explanations,
            "adapted_terminology": adapted_content.adapted_terminology,
            "priority_highlights": adapted_content.priority_highlights,
            "timestamp": adapted_content.timestamp
        }

    def _profile_to_dict(self, profile: PersonaProfile) -> Dict[str, Any]:
        """Convert PersonaProfile to dictionary"""
        return {
            "persona_id": profile.persona_id,
            "name": profile.name,
            "description": profile.description,
            "primary_concerns": profile.primary_concerns,
            "preferred_metrics": profile.preferred_metrics,
            "language_style": profile.language_style,
            "detail_level": profile.detail_level,
            "focus_areas": profile.focus_areas,
            "terminology_preferences": profile.terminology_preferences,
            "dashboard_priorities": profile.dashboard_priorities
        }

    def _get_transformation_summary(self, persona: UserPersona, content_type: ContentType) -> Dict[str, Any]:
        """Get summary of transformations applied"""
        
        rules = self.transformation_rules.get(content_type, {}).get(persona, {})
        
        return {
            "persona": persona.value,
            "content_type": content_type.value,
            "transformations_applied": {
                "metrics_highlighted": len(rules.get("highlight_metrics", [])),
                "details_hidden": len(rules.get("hide_details", [])),
                "sections_added": len(rules.get("add_sections", [])),
                "chart_types_recommended": len(rules.get("chart_types", []))
            },
            "language_adaptations": {
                "terminology_adapted": True,
                "style_applied": self.persona_profiles[persona].language_style,
                "detail_level": self.persona_profiles[persona].detail_level
            }
        }

    def get_agent_status(self) -> Dict[str, Any]:
        """Get current status of the Persona Adaptation Agent"""
        
        return {
            "agent_id": self.agent_id,
            "name": self.name,
            "status": "active",
            "capabilities": self.capabilities,
            "supported_personas": [persona.value for persona in UserPersona],
            "supported_content_types": [content_type.value for content_type in ContentType],
            "transformation_rules_loaded": len(self.transformation_rules),
            "persona_profiles_loaded": len(self.persona_profiles),
            "last_activity": datetime.now().isoformat()
        } 
# ASTC Enterprise Azure Deployment Guide

## 🏢 **Enterprise Deployment Overview**

This guide provides step-by-step instructions for deploying the ASTC (Agentic SAP Testing Copilot) platform to Azure in an enterprise environment with proper security, compliance, and monitoring.

## 📋 **Prerequisites**

### **Required Tools**
- Azure CLI 2.0+ installed
- Azure DevOps access with Project Administrator permissions
- Git with SSH key configured
- Docker (optional for containerized deployment)

### **Required Azure Resources**
- Azure Subscription with Contributor access
- Resource Group created
- App Service Plan (B1 or higher recommended)
- Azure DevOps Service Connection configured

### **Security Requirements**
- HTTPS enforced (TLS 1.2 minimum)
- Non-root container execution
- Environment variable encryption
- Access logging enabled

## 🚀 **Deployment Methods**

### **Method 1: Azure DevOps CI/CD Pipeline (Recommended)**

#### **Step 1: Configure Azure DevOps**

1. **Create Service Connection:**
   ```bash
   # In Azure DevOps → Project Settings → Service Connections
   # Create new Azure Resource Manager connection
   Name: Azure-ServiceConnection
   Subscription: [Your Azure Subscription]
   Resource Group: [Your Resource Group]
   ```

2. **Set Pipeline Variables:**
   ```yaml
   # In Azure DevOps → Pipelines → Library
   Variable Group: ASTC-Production
   Variables:
     - webAppName: astc-sap-testing-platform
     - resourceGroupName: [Your Resource Group]
     - azureServiceConnectionEndpoint: Azure-ServiceConnection
   ```

3. **Create Pipeline:**
   - Use the provided `azure-pipelines.yml`
   - Connect to your Azure DevOps repository
   - Run pipeline to deploy

#### **Step 2: Manual App Service Creation**

If you prefer manual setup:

```bash
# Login to Azure
az login

# Create Resource Group (if not exists)
az group create --name astc-rg --location "East US"

# Create App Service Plan
az appservice plan create \
  --name astc-app-service-plan \
  --resource-group astc-rg \
  --sku B1 \
  --is-linux

# Create Web App
az webapp create \
  --resource-group astc-rg \
  --plan astc-app-service-plan \
  --name astc-sap-testing-platform \
  --runtime "PYTHON|3.11"

# Configure App Settings
az webapp config appsettings set \
  --resource-group astc-rg \
  --name astc-sap-testing-platform \
  --settings \
    PYTHONPATH="/home/site/wwwroot" \
    SCM_DO_BUILD_DURING_DEPLOYMENT="true" \
    WEBSITES_PORT="8000" \
    WEBSITE_RUN_FROM_PACKAGE="0"

# Configure startup command
az webapp config set \
  --resource-group astc-rg \
  --name astc-sap-testing-platform \
  --startup-file "gunicorn --bind=0.0.0.0:8000 --timeout 600 app:app"

# Deploy from git
az webapp deployment source config \
  --resource-group astc-rg \
  --name astc-sap-testing-platform \
  --repo-url https://dev.azure.com/Vibects13/105676/_git/105676 \
  --branch main \
  --manual-integration
```

### **Method 2: Infrastructure as Code (ARM Template)**

Deploy using the provided ARM template:

```bash
# Deploy ARM template
az deployment group create \
  --resource-group astc-rg \
  --template-file deploy/azure-resources.json \
  --parameters webAppName=astc-sap-testing-platform
```

### **Method 3: Docker Container Deployment**

For containerized deployment:

```bash
# Build Docker image
docker build -t astc-sap-testing:latest .

# Tag for Azure Container Registry
docker tag astc-sap-testing:latest [your-acr].azurecr.io/astc-sap-testing:latest

# Push to ACR
docker push [your-acr].azurecr.io/astc-sap-testing:latest

# Deploy container to App Service
az webapp config container set \
  --resource-group astc-rg \
  --name astc-sap-testing-platform \
  --docker-custom-image-name [your-acr].azurecr.io/astc-sap-testing:latest
```

## 🔒 **Security Configuration**

### **Environment Variables (Required)**
```bash
# Production security settings
FLASK_ENV=production
PYTHONPATH=/home/site/wwwroot
PYTHONUNBUFFERED=1

# Azure App Service settings
WEBSITES_PORT=8000
SCM_DO_BUILD_DURING_DEPLOYMENT=true
WEBSITE_RUN_FROM_PACKAGE=0
```

### **HTTPS and TLS Configuration**
```bash
# Enforce HTTPS
az webapp update \
  --resource-group astc-rg \
  --name astc-sap-testing-platform \
  --https-only true

# Set minimum TLS version
az webapp config set \
  --resource-group astc-rg \
  --name astc-sap-testing-platform \
  --min-tls-version 1.2
```

### **Access Control**
```bash
# Configure IP restrictions (optional)
az webapp config access-restriction add \
  --resource-group astc-rg \
  --name astc-sap-testing-platform \
  --rule-name "Corporate Network" \
  --action Allow \
  --ip-address 203.0.113.0/24 \
  --priority 100
```

## 📊 **Monitoring and Logging**

### **Application Insights**
```bash
# Create Application Insights
az monitor app-insights component create \
  --app astc-insights \
  --location eastus \
  --resource-group astc-rg

# Get instrumentation key
INSTRUMENTATION_KEY=$(az monitor app-insights component show \
  --app astc-insights \
  --resource-group astc-rg \
  --query instrumentationKey -o tsv)

# Configure App Service to use Application Insights
az webapp config appsettings set \
  --resource-group astc-rg \
  --name astc-sap-testing-platform \
  --settings APPINSIGHTS_INSTRUMENTATIONKEY="$INSTRUMENTATION_KEY"
```

### **Log Analytics**
```bash
# Enable application logging
az webapp log config \
  --resource-group astc-rg \
  --name astc-sap-testing-platform \
  --application-logging true \
  --level information \
  --web-server-logging filesystem
```

## 🧪 **Testing and Validation**

### **Health Check Endpoints**
```bash
# Test application health
curl https://astc-sap-testing-platform.azurewebsites.net/health

# Expected response:
{
  "status": "healthy",
  "service": "ASTC - Agentic SAP Testing Copilot",
  "version": "1.0.0",
  "platform": "Azure App Service",
  "agents_status": "operational"
}
```

### **API Endpoint Testing**
```bash
# Test multi-agent API
curl https://astc-sap-testing-platform.azurewebsites.net/api/agents

# Test metrics endpoint
curl https://astc-sap-testing-platform.azurewebsites.net/api/metrics
```

### **Load Testing**
```bash
# Basic load test using Apache Bench
ab -n 100 -c 10 https://astc-sap-testing-platform.azurewebsites.net/

# Expected: Sub-2 second response times
```

## 🔧 **Troubleshooting**

### **Common Issues**

#### **Deployment Failures**
```bash
# Check deployment status
az webapp deployment list \
  --resource-group astc-rg \
  --name astc-sap-testing-platform

# View deployment logs
az webapp log download \
  --resource-group astc-rg \
  --name astc-sap-testing-platform
```

#### **Application Errors**
```bash
# Stream live logs
az webapp log tail \
  --resource-group astc-rg \
  --name astc-sap-testing-platform

# Check application logs
az webapp log show \
  --resource-group astc-rg \
  --name astc-sap-testing-platform
```

#### **Performance Issues**
```bash
# Scale up App Service Plan
az appservice plan update \
  --resource-group astc-rg \
  --name astc-app-service-plan \
  --sku S1

# Scale out instances
az appservice plan update \
  --resource-group astc-rg \
  --name astc-app-service-plan \
  --number-of-workers 2
```

## 📈 **Post-Deployment Validation**

### **Functionality Checklist**
- [ ] Main application loads (https://astc-sap-testing-platform.azurewebsites.net/)
- [ ] Health endpoint responds (GET /health)
- [ ] API endpoints functional (GET /api/agents, /api/metrics)
- [ ] HTTPS enforced and certificate valid
- [ ] Application logs accessible
- [ ] Monitoring and alerts configured

### **Performance Benchmarks**
- **Response Time**: < 2 seconds for main page
- **API Response**: < 1 second for JSON endpoints
- **Uptime**: 99.9% SLA target
- **Error Rate**: < 0.1% of requests

### **Security Validation**
- [ ] HTTPS enforced (HTTP redirects to HTTPS)
- [ ] TLS 1.2 minimum version
- [ ] Security headers present
- [ ] No sensitive data in logs
- [ ] Access restrictions configured (if required)

## 🎯 **Production URLs**

After successful deployment:

- **Main Application**: https://astc-sap-testing-platform.azurewebsites.net/
- **Health Check**: https://astc-sap-testing-platform.azurewebsites.net/health
- **API Documentation**: https://astc-sap-testing-platform.azurewebsites.net/api/agents
- **Metrics Dashboard**: https://astc-sap-testing-platform.azurewebsites.net/api/metrics

## 📞 **Support and Escalation**

### **Technical Contacts**
- Platform Team: platform-team@company.com
- Security Team: security@company.com
- Azure Admin: azure-admin@company.com

### **Escalation Matrix**
1. **Level 1**: Application Issues → Platform Team
2. **Level 2**: Infrastructure Issues → Azure Admin
3. **Level 3**: Security Issues → Security Team

---

## ✅ **Deployment Complete!**

Your ASTC platform is now deployed with enterprise-grade security, monitoring, and scalability configurations. 
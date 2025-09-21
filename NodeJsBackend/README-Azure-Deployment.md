# Node.js Backend Azure Deployment Guide

This guide will help you deploy your Smart Grade AI Node.js backend to Azure Cloud Services using Docker containers.

## 🏗️ Architecture Overview

The Node.js backend handles:

- User authentication and authorization
- File upload and management
- API endpoints for frontend communication
- Database operations (MongoDB)
- Cloudinary integration for file storage

## 📋 Prerequisites

1. **Azure Account**: Active Azure subscription
2. **Azure CLI**: Install from [Microsoft Docs](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
3. **Docker**: Install Docker Desktop or Docker Engine
4. **Environment Variables**: Prepare your API keys and connection strings

## 🔧 Environment Variables Setup

Create a `.env` file in the NodeJsBackend directory with the following variables:

```bash
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# Clerk Authentication
CLERK_SECRET_KEY=your_clerk_secret_key

# Cloudinary
CLOUDINARY_URL=your_cloudinary_url

# JWT Secret
JWT_SECRET=your_jwt_secret_key
```

## 🚀 Deployment Options

### Option 1: Azure Container Instances (Recommended)

Azure Container Instances (ACI) is the simplest way to run containers in Azure without managing servers.

#### Quick Deployment:

1. **Make the deployment script executable:**

   ```bash
   chmod +x deploy-aci.sh
   ```

2. **Login to Azure:**

   ```bash
   az login
   ```

3. **Run the deployment script:**
   ```bash
   ./deploy-aci.sh
   ```

#### Manual Deployment Steps:

1. **Create Resource Group:**

   ```bash
   az group create --name smart-grade-nodejs-rg --location eastus
   ```

2. **Create Azure Container Registry:**

   ```bash
   az acr create --resource-group smart-grade-nodejs-rg --name smartgradenodejsacr --sku Basic --admin-enabled true
   ```

3. **Build and push Docker image:**

   ```bash
   # Login to ACR
   az acr login --name smartgradenodejsacr

   # Build and push Node.js backend
   docker build -t smartgradenodejsacr.azurecr.io/smart-grade-nodejs-backend:latest .
   docker push smartgradenodejsacr.azurecr.io/smart-grade-nodejs-backend:latest
   ```

4. **Create Container Group:**
   ```bash
   az container create \
     --resource-group smart-grade-nodejs-rg \
     --name smart-grade-nodejs-cg \
     --image smartgradenodejsacr.azurecr.io/smart-grade-nodejs-backend:latest \
     --registry-login-server smartgradenodejsacr.azurecr.io \
     --registry-username $(az acr credential show --name smartgradenodejsacr --query username --output tsv) \
     --registry-password $(az acr credential show --name smartgradenodejsacr --query passwords[0].value --output tsv) \
     --dns-name-label smart-grade-nodejs \
     --ports 3000 \
     --environment-variables NODE_ENV=production PORT=3000 \
     --secure-environment-variables MONGODB_URI="your_mongodb_uri" CLERK_SECRET_KEY="your_clerk_key" CLOUDINARY_URL="your_cloudinary_url" JWT_SECRET="your_jwt_secret"
   ```

### Option 2: Azure Cloud Services

For more control and traditional cloud service deployment.

#### Quick Deployment:

1. **Make the deployment script executable:**

   ```bash
   chmod +x deploy-to-azure.sh
   ```

2. **Run the deployment script:**
   ```bash
   ./deploy-to-azure.sh
   ```

## 🔍 Verification and Testing

After deployment, verify your service is running:

1. **Check container status:**

   ```bash
   az container show --resource-group smart-grade-nodejs-rg --name smart-grade-nodejs-cg
   ```

2. **Get public endpoint:**

   ```bash
   FQDN=$(az container show --resource-group smart-grade-nodejs-rg --name smart-grade-nodejs-cg --query "ipAddress.fqdn" --output tsv)
   echo "Node.js Backend: http://$FQDN:3000"
   ```

3. **Test endpoint:**
   ```bash
   # Test Node.js backend
   curl http://$FQDN:3000/health
   ```

## 📊 Monitoring and Logs

### View Container Logs:

```bash
az container logs --resource-group smart-grade-nodejs-rg --name smart-grade-nodejs-cg
```

### Azure Monitor:

- Set up Application Insights for detailed monitoring
- Configure alerts for container health and performance

## 🔄 Continuous Deployment

### GitHub Actions Workflow:

Create `.github/workflows/nodejs-azure-deploy.yml`:

```yaml
name: Deploy Node.js Backend to Azure

on:
  push:
    branches: [main]
    paths: ["NodeJsBackend/**"]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Login to Azure
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: Build and push to ACR
        run: |
          az acr build --registry smartgradenodejsacr --image smart-grade-nodejs-backend:latest ./NodeJsBackend

      - name: Deploy to ACI
        run: |
          az container create --resource-group smart-grade-nodejs-rg --name smart-grade-nodejs-cg --image smartgradenodejsacr.azurecr.io/smart-grade-nodejs-backend:latest
```

## 🛠️ Troubleshooting

### Common Issues:

1. **Container fails to start:**

   - Check logs: `az container logs --resource-group smart-grade-nodejs-rg --name smart-grade-nodejs-cg`
   - Verify environment variables are set correctly
   - Check Docker image builds successfully

2. **Port access issues:**

   - Verify port 3000 is exposed in container configuration
   - Check Azure Network Security Groups

3. **Database connection issues:**

   - Verify MongoDB connection string is correct
   - Check network connectivity to MongoDB

4. **Image pull issues:**
   - Verify ACR credentials are correct
   - Check image exists in registry: `az acr repository list --name smartgradenodejsacr`

### Debug Commands:

```bash
# Check resource group
az group show --name smart-grade-nodejs-rg

# List containers
az container list --resource-group smart-grade-nodejs-rg

# Check ACR repositories
az acr repository list --name smartgradenodejsacr

# Check storage account
az storage account show --name smartgradenodejsstorage --resource-group smart-grade-nodejs-rg
```

## 💰 Cost Optimization

1. **Use Basic ACR SKU** for development
2. **Scale down during off-hours** using Azure Automation
3. **Monitor resource usage** with Azure Cost Management
4. **Use Spot Instances** for non-critical workloads

## 🔒 Security Best Practices

1. **Use Azure Key Vault** for sensitive environment variables
2. **Enable Azure Security Center** for container security
3. **Use Managed Identities** instead of service principals
4. **Enable network policies** for container communication
5. **Regular security updates** for base images

## 📞 Support

For issues specific to your deployment:

1. Check Azure Container Instances documentation
2. Review Azure CLI command reference
3. Monitor Azure Service Health for regional issues

## 🎯 Next Steps

After successful deployment:

1. Set up custom domain names
2. Configure SSL certificates
3. Set up monitoring and alerting
4. Implement backup strategies
5. Plan for scaling and high availability

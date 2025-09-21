#!/bin/bash

# Azure Container Instances Deployment Script for Smart Grade AI Node.js Backend
# This script deploys the Node.js backend to Azure Container Instances

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
RESOURCE_GROUP="smart-grade-nodejs-rg"
LOCATION="eastus"
STORAGE_ACCOUNT="smartgradenodejsstorage"
CONTAINER_REGISTRY="smartgradenodejsacr"
CONTAINER_GROUP_NAME="smart-grade-nodejs-cg"
SUBSCRIPTION_ID=""

echo -e "${GREEN}🚀 Starting Azure Container Instances Deployment for Smart Grade AI Node.js Backend${NC}"

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI is not installed. Please install it first.${NC}"
    echo "Visit: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if logged in to Azure
if ! az account show &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Azure. Please run 'az login' first.${NC}"
    exit 1
fi

# Set subscription if provided
if [ ! -z "$SUBSCRIPTION_ID" ]; then
    echo -e "${YELLOW}📋 Setting subscription to: $SUBSCRIPTION_ID${NC}"
    az account set --subscription $SUBSCRIPTION_ID
fi

# Create Resource Group
echo -e "${GREEN}📦 Creating Resource Group: $RESOURCE_GROUP${NC}"
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create Container Registry
echo -e "${GREEN}🐳 Creating Azure Container Registry: $CONTAINER_REGISTRY${NC}"
az acr create \
    --resource-group $RESOURCE_GROUP \
    --name $CONTAINER_REGISTRY \
    --sku Basic \
    --admin-enabled true

# Get ACR credentials
ACR_USERNAME=$(az acr credential show --name $CONTAINER_REGISTRY --query username --output tsv)
ACR_PASSWORD=$(az acr credential show --name $CONTAINER_REGISTRY --query passwords[0].value --output tsv)
ACR_LOGIN_SERVER=$(az acr show --name $CONTAINER_REGISTRY --query loginServer --output tsv)

# Login to ACR
echo -e "${GREEN}🔐 Logging in to Azure Container Registry${NC}"
az acr login --name $CONTAINER_REGISTRY

# Build and push Node.js backend
echo -e "${GREEN}🔨 Building and pushing Node.js backend image${NC}"
docker build -t $ACR_LOGIN_SERVER/smart-grade-nodejs-backend:latest .
docker push $ACR_LOGIN_SERVER/smart-grade-nodejs-backend:latest

# Create Storage Account for file uploads
echo -e "${GREEN}💾 Creating Storage Account: $STORAGE_ACCOUNT${NC}"
az storage account create \
    --name $STORAGE_ACCOUNT \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --sku Standard_LRS

# Get storage account key
STORAGE_KEY=$(az storage account keys list \
    --resource-group $RESOURCE_GROUP \
    --account-name $STORAGE_ACCOUNT \
    --query '[0].value' \
    --output tsv)

# Create file share for uploads
echo -e "${GREEN}📁 Creating file share for uploads${NC}"
az storage share create \
    --name smart-grade-uploads \
    --account-name $STORAGE_ACCOUNT \
    --account-key $STORAGE_KEY

# Create Container Group
echo -e "${GREEN}🚀 Creating Container Group: $CONTAINER_GROUP_NAME${NC}"
az container create \
    --resource-group $RESOURCE_GROUP \
    --name $CONTAINER_GROUP_NAME \
    --image $ACR_LOGIN_SERVER/smart-grade-nodejs-backend:latest \
    --registry-login-server $ACR_LOGIN_SERVER \
    --registry-username $ACR_USERNAME \
    --registry-password $ACR_PASSWORD \
    --dns-name-label smart-grade-nodejs \
    --ports 3000 \
    --environment-variables \
        NODE_ENV=production \
        PORT=3000 \
    --secure-environment-variables \
        MONGODB_URI="YOUR_MONGODB_CONNECTION_STRING" \
        CLERK_SECRET_KEY="YOUR_CLERK_SECRET_KEY" \
        CLOUDINARY_URL="YOUR_CLOUDINARY_URL" \
        JWT_SECRET="YOUR_JWT_SECRET" \
    --azure-file-volume-account-name $STORAGE_ACCOUNT \
    --azure-file-volume-account-key $STORAGE_KEY \
    --azure-file-volume-share-name smart-grade-uploads \
    --azure-file-volume-mount-path /app/uploads

# Get the public IP address
echo -e "${GREEN}🌐 Getting public IP address${NC}"
PUBLIC_IP=$(az container show \
    --resource-group $RESOURCE_GROUP \
    --name $CONTAINER_GROUP_NAME \
    --query "ipAddress.ip" \
    --output tsv)

FQDN=$(az container show \
    --resource-group $RESOURCE_GROUP \
    --name $CONTAINER_GROUP_NAME \
    --query "ipAddress.fqdn" \
    --output tsv)

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${YELLOW}📋 Deployment Summary:${NC}"
echo -e "   Resource Group: $RESOURCE_GROUP"
echo -e "   Container Registry: $CONTAINER_REGISTRY"
echo -e "   Container Group: $CONTAINER_GROUP_NAME"
echo -e "   Public IP: $PUBLIC_IP"
echo -e "   FQDN: $FQDN"
echo -e "   Node.js Backend: http://$FQDN:3000"
echo -e "   Storage Account: $STORAGE_ACCOUNT"

echo -e "${GREEN}🎉 Node.js Backend deployment completed!${NC}" 
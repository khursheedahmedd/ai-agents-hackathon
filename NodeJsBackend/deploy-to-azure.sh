#!/bin/bash

# Azure Cloud Service Deployment Script for Smart Grade AI Node.js Backend
# This script deploys the Node.js backend to Azure Cloud Services

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
CLOUD_SERVICE_NAME="smart-grade-nodejs-cs"
SUBSCRIPTION_ID=""

echo -e "${GREEN}🚀 Starting Azure Cloud Service Deployment for Smart Grade AI Node.js Backend${NC}"

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

# Create Storage Account
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

# Create container for deployment packages
echo -e "${GREEN}📁 Creating storage container for deployment packages${NC}"
az storage container create \
    --name deployment-packages \
    --account-name $STORAGE_ACCOUNT \
    --account-key $STORAGE_KEY

# Build and package Node.js backend
echo -e "${GREEN}🔨 Building Node.js backend Docker image${NC}"
docker build -t smart-grade-nodejs-backend .

# Create deployment package
echo -e "${GREEN}📦 Creating deployment package for Node.js backend${NC}"
mkdir -p ../deployment-packages/nodejs
cp -r * ../deployment-packages/nodejs/
cd ../deployment-packages/nodejs
zip -r ../nodejs-backend.zip .
cd ../../NodeJsBackend

# Upload deployment package to Azure Storage
echo -e "${GREEN}☁️  Uploading deployment package to Azure Storage${NC}"
az storage blob upload \
    --account-name $STORAGE_ACCOUNT \
    --account-key $STORAGE_KEY \
    --container-name deployment-packages \
    --name nodejs-backend.zip \
    --file ../deployment-packages/nodejs-backend.zip

# Get SAS URL for deployment package
NODEJS_PACKAGE_URL=$(az storage blob generate-sas \
    --account-name $STORAGE_ACCOUNT \
    --account-key $STORAGE_KEY \
    --container-name deployment-packages \
    --name nodejs-backend.zip \
    --permissions r \
    --expiry $(date -u -d "1 hour" '+%Y-%m-%dT%H:%MZ') \
    --as-user \
    --full-uri \
    --output tsv)

# Create Cloud Service
echo -e "${GREEN}☁️  Creating Cloud Service: $CLOUD_SERVICE_NAME${NC}"
az cloudservice create \
    --resource-group $RESOURCE_GROUP \
    --name $CLOUD_SERVICE_NAME \
    --location $LOCATION

# Deploy Node.js backend
echo -e "${GREEN}🚀 Deploying Node.js backend${NC}"
az cloudservice role create \
    --resource-group $RESOURCE_GROUP \
    --cloud-service-name $CLOUD_SERVICE_NAME \
    --name nodejs-backend \
    --package-url $NODEJS_PACKAGE_URL \
    --configuration-file azure-deployment.yml

# Get the public IP address
echo -e "${GREEN}🌐 Getting public IP address${NC}"
NODEJS_IP=$(az cloudservice show \
    --resource-group $RESOURCE_GROUP \
    --name $CLOUD_SERVICE_NAME \
    --query "properties.roleProfile.role[?name=='nodejs-backend'].publicIPAddress" \
    --output tsv)

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${YELLOW}📋 Deployment Summary:${NC}"
echo -e "   Resource Group: $RESOURCE_GROUP"
echo -e "   Cloud Service: $CLOUD_SERVICE_NAME"
echo -e "   Node.js Backend: http://$NODEJS_IP:3000"
echo -e "   Storage Account: $STORAGE_ACCOUNT"

# Cleanup local deployment packages
echo -e "${GREEN}🧹 Cleaning up local deployment packages${NC}"
rm -rf ../deployment-packages

echo -e "${GREEN}🎉 Node.js Backend deployment completed!${NC}" 
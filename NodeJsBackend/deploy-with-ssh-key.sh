#!/bin/bash

# Node.js Backend Azure Deployment Script using SSH Key
# This script deploys only the Node.js backend using your SSH key

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
RESOURCE_GROUP="smart-grade-nodejs-rg"
LOCATION="eastus"
SSH_KEY_PATH="$HOME/.ssh/smartgradeai-backend_key.pem"
SSH_PUB_KEY_PATH="$HOME/.ssh/smartgradeai-backend_key.pub"
VM_SIZE="Standard_D2s_v3"
VM_NAME="smart-grade-nodejs-vm"

echo -e "${GREEN}🚀 Starting Node.js Backend Azure Deployment using SSH Key${NC}"

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

# Check if SSH key exists
if [ ! -f "$SSH_KEY_PATH" ]; then
    echo -e "${RED}❌ SSH key not found at: $SSH_KEY_PATH${NC}"
    exit 1
fi

# Set proper permissions for SSH key
chmod 600 "$SSH_KEY_PATH"

# Create Resource Group
echo -e "${GREEN}📦 Creating Resource Group: $RESOURCE_GROUP${NC}"
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create Virtual Network
echo -e "${GREEN}🌐 Creating Virtual Network${NC}"
az network vnet create \
    --resource-group $RESOURCE_GROUP \
    --name smart-grade-nodejs-vnet \
    --subnet-name default \
    --address-prefix 10.0.0.0/16 \
    --subnet-prefix 10.0.0.0/24

# Create Network Security Group
echo -e "${GREEN}🔒 Creating Network Security Group${NC}"
az network nsg create \
    --resource-group $RESOURCE_GROUP \
    --name smart-grade-nodejs-nsg

# Add security rules
az network nsg rule create \
    --resource-group $RESOURCE_GROUP \
    --nsg-name smart-grade-nodejs-nsg \
    --name allow-ssh \
    --protocol tcp \
    --priority 1000 \
    --destination-port-range 22

az network nsg rule create \
    --resource-group $RESOURCE_GROUP \
    --nsg-name smart-grade-nodejs-nsg \
    --name allow-nodejs \
    --protocol tcp \
    --priority 1001 \
    --destination-port-range 3000

az network nsg rule create \
    --resource-group $RESOURCE_GROUP \
    --nsg-name smart-grade-nodejs-nsg \
    --name allow-http \
    --protocol tcp \
    --priority 1002 \
    --destination-port-range 80

az network nsg rule create \
    --resource-group $RESOURCE_GROUP \
    --nsg-name smart-grade-nodejs-nsg \
    --name allow-https \
    --protocol tcp \
    --priority 1003 \
    --destination-port-range 443

# Create Public IP
echo -e "${GREEN}🌍 Creating Public IP${NC}"
az network public-ip create \
    --resource-group $RESOURCE_GROUP \
    --name nodejs-public-ip \
    --allocation-method Static \
    --sku Standard

# Create Network Interface
echo -e "${GREEN}🔗 Creating Network Interface${NC}"
az network nic create \
    --resource-group $RESOURCE_GROUP \
    --name nodejs-nic \
    --vnet-name smart-grade-nodejs-vnet \
    --subnet default \
    --public-ip-address nodejs-public-ip \
    --network-security-group smart-grade-nodejs-nsg

# Create Node.js VM
echo -e "${GREEN}🖥️  Creating Node.js VM: $VM_NAME${NC}"
az vm create \
    --resource-group $RESOURCE_GROUP \
    --name $VM_NAME \
    --image Ubuntu2204 \
    --size $VM_SIZE \
    --nics nodejs-nic \
    --admin-username azureuser \
    --ssh-key-values "$SSH_PUB_KEY_PATH"

# Get VM IP address
echo -e "${GREEN}🌐 Getting VM IP address${NC}"
VM_IP=$(az vm show --resource-group $RESOURCE_GROUP --name $VM_NAME --show-details --query "publicIps" --output tsv)

echo -e "${GREEN}✅ Node.js VM created successfully!${NC}"
echo -e "${YELLOW}📋 VM Information:${NC}"
echo -e "   VM IP: $VM_IP"

# Wait for VM to be ready
echo -e "${GREEN}⏳ Waiting for VM to be ready...${NC}"
sleep 30

# Deploy Node.js Backend
echo -e "${GREEN}🚀 Deploying Node.js Backend to VM${NC}"

# Copy Node.js backend to VM
scp -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no -r ./* azureuser@$VM_IP:~/

# Deploy using SSH
ssh -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no azureuser@$VM_IP << 'EOF'
    # Update system
    sudo apt-get update
    
    # Install Docker
    sudo apt-get install -y docker.io
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker azureuser
    
    # Install Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    
    # Build and run Node.js backend
    cd ~
    sudo docker build -t smart-grade-nodejs-backend .
    sudo docker run -d -p 3000:3000 --name nodejs-backend --restart unless-stopped smart-grade-nodejs-backend
    
    # Show running containers
    sudo docker ps
EOF

echo -e "${GREEN}✅ Node.js Backend deployment completed successfully!${NC}"
echo -e "${YELLOW}📋 Deployment Summary:${NC}"
echo -e "   Resource Group: $RESOURCE_GROUP"
echo -e "   VM Name: $VM_NAME"
echo -e "   VM IP: $VM_IP"
echo -e "   Node.js Backend: http://$VM_IP:3000"
echo -e "   SSH Key: $SSH_KEY_PATH"

echo -e "${GREEN}🎉 Node.js Backend deployment completed!${NC}"
echo -e "${YELLOW}💡 Next Steps:${NC}"
echo -e "   1. SSH into the VM: ssh -i $SSH_KEY_PATH azureuser@$VM_IP"
echo -e "   2. Set up environment variables in the container"
echo -e "   3. Update your frontend configuration"
echo -e "   4. Configure monitoring and logging"
echo -e "   5. Set up SSL certificates"

echo -e "${YELLOW}🔧 Useful Commands:${NC}"
echo -e "   Check container: ssh -i $SSH_KEY_PATH azureuser@$VM_IP 'sudo docker ps'"
echo -e "   View logs: ssh -i $SSH_KEY_PATH azureuser@$VM_IP 'sudo docker logs nodejs-backend'"
echo -e "   Restart service: ssh -i $SSH_KEY_PATH azureuser@$VM_IP 'sudo docker restart nodejs-backend'" 
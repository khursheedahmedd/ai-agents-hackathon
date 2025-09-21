#!/usr/bin/env bash
set -e

# Coral Protocol Agent Startup Script for Smart Grade AI FastAPI
# This script starts all Coral-compatible agents

echo "🐠 Starting Coral Protocol Agents for Smart Grade AI..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please copy env.example to .env and configure it."
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Check required environment variables
required_vars=("CORAL_SSE_URL" "AZURE_OPENAI_API_KEY" "AZURE_OPENAI_ENDPOINT" "MISTRAL_API_KEY")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Required environment variable $var is not set"
        exit 1
    fi
done

echo "✅ Environment variables validated"

# Function to start an agent
start_agent() {
    local agent_name=$1
    local agent_dir="agents/coral-${agent_name}-agent"
    
    if [ ! -d "$agent_dir" ]; then
        echo "❌ Agent directory $agent_dir not found"
        return 1
    fi
    
    echo "🚀 Starting $agent_name agent..."
    cd "$agent_dir"
    
    # Make run script executable
    chmod +x run_agent.sh
    
    # Start agent in background
    ./run_agent.sh &
    local agent_pid=$!
    
    echo "✅ $agent_name agent started with PID: $agent_pid"
    
    # Store PID for cleanup
    echo $agent_pid >> ../coral_agent_pids.txt
    
    cd ..
    return 0
}

# Create PID file
echo "" > coral_agent_pids.txt

# Start all agents
echo "Starting all Coral agents..."

start_agent "ocr" || echo "❌ Failed to start OCR agent"
start_agent "grading" || echo "❌ Failed to start Grading agent"
start_agent "feedback" || echo "❌ Failed to start Feedback agent"
start_agent "document" || echo "❌ Failed to start Document agent"

echo ""
echo "🐠 Coral Protocol Agents Status:"
echo "================================"

# Check if agents are running
if [ -f coral_agent_pids.txt ]; then
    while read pid; do
        if [ ! -z "$pid" ] && kill -0 $pid 2>/dev/null; then
            echo "✅ Agent with PID $pid is running"
        else
            echo "❌ Agent with PID $pid is not running"
        fi
    done < coral_agent_pids.txt
fi

echo ""
echo "🎯 Coral agents are ready!"
echo "📊 Monitor agents at: http://localhost:3000 (Coral Studio)"
echo "🔗 FastAPI endpoints available at: http://localhost:8000/docs"
echo ""
echo "Available Coral endpoints:"
echo "  - POST /api/v1/coral/grade-with-coral"
echo "  - POST /api/v1/coral/process-document"
echo "  - GET  /api/v1/coral/agent-status"
echo "  - GET  /api/v1/coral/health"
echo ""
echo "To stop all agents, run: ./stop-coral-agents.sh"

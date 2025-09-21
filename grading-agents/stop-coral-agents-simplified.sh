#!/bin/bash
# fastapi/stop-coral-agents-simplified.sh
set -e

echo "🛑 Stopping Simplified Coral Protocol Agents..."

# Function to stop an agent
stop_agent() {
    local agent_name=$1
    local pid_file="agents/${agent_name}/${agent_name}.pid"
    
    if [ -f "$pid_file" ]; then
        pid=$(cat "$pid_file")
        if ps -p "$pid" > /dev/null 2>&1; then
            echo "🛑 Stopping $agent_name (PID: $pid)..."
            kill "$pid"
            rm "$pid_file"
            echo "✅ $agent_name stopped"
        else
            echo "❌ Agent with PID $pid is not running"
            rm "$pid_file"
        fi
    else
        echo "❌ No PID file found for $agent_name"
    fi
}

# Stop all agents
stop_agent "ocr-agent"
stop_agent "grading-agent"
stop_agent "feedback-agent"
stop_agent "document-agent"

echo ""
echo "🎯 All simplified Coral agents have been stopped!"

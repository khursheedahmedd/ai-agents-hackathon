#!/bin/bash
# fastapi/start-coral-agents-simplified.sh

echo "🐠 Starting Simplified Coral Protocol Agents for Smart Grade AI..."

# Check if virtual environment is activated
if [[ "$VIRTUAL_ENV" == "" ]]; then
    echo "❌ Virtual environment not activated. Please run: source venv/bin/activate"
    exit 1
fi

# Validate environment variables
echo "✅ Environment variables validated"

# Function to start a simplified agent
start_simplified_agent() {
    local agent_name=$1
    local agent_dir=$2
    local pid_file="${agent_name}.pid"
    local original_dir=$(pwd)
    
    echo "🚀 Starting $agent_name..."
    
    if [ -d "$agent_dir" ]; then
        cd "$agent_dir"
        nohup python main.py > "${agent_name}.log" 2>&1 &
        echo $! > "$pid_file"
        echo "✅ $agent_name started with PID: $(cat $pid_file)"
        cd "$original_dir"
    else
        echo "❌ Agent directory $agent_dir not found"
        echo "❌ Failed to start $agent_name"
        return 1
    fi
}

# Start simplified agents (they can run independently)
echo "Starting simplified Coral agents..."

# Start OCR agent
start_simplified_agent "ocr-agent" "agents/coral-ocr-agent"

# Start Grading agent  
start_simplified_agent "grading-agent" "agents/coral-grading-agent"

# Start Feedback agent
start_simplified_agent "feedback-agent" "agents/coral-feedback-agent"

# Start Document agent
start_simplified_agent "document-agent" "agents/coral-document-agent"

echo ""
echo "🐠 Simplified Coral Protocol Agents Status:"
echo "================================"

# Check agent status
for agent in "ocr-agent" "grading-agent" "feedback-agent" "document-agent"; do
    pid_file="agents/${agent}/${agent}.pid"
    if [ -f "$pid_file" ]; then
        pid=$(cat "$pid_file")
        if ps -p "$pid" > /dev/null 2>&1; then
            echo "✅ Agent with PID $pid is running"
        else
            echo "❌ Agent with PID $pid is not running"
        fi
    else
        echo "❌ No PID file found for $agent"
    fi
done

echo ""
echo "🎯 Simplified Coral agents are ready!"
echo "📊 FastAPI endpoints available at: http://localhost:8000/docs"
echo ""
echo "Available Simplified Coral endpoints:"
echo "  - POST /api/v1/coral/grade-with-coral"
echo "  - POST /api/v1/coral/process-document"
echo "  - GET  /api/v1/coral/agent-status"
echo "  - GET  /api/v1/coral/health"
echo "  - GET  /api/v1/coral/status"
echo ""
echo "To stop all agents, run: ./stop-coral-agents-simplified.sh"

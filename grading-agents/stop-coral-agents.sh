#!/usr/bin/env bash
set -e

# Coral Protocol Agent Stop Script for Smart Grade AI FastAPI
# This script stops all running Coral agents

echo "🛑 Stopping Coral Protocol Agents..."

# Check if PID file exists
if [ ! -f "coral_agent_pids.txt" ]; then
    echo "❌ No PID file found. Agents may not be running."
    exit 1
fi

echo "Stopping agents..."

# Stop all agents
while read pid; do
    if [ ! -z "$pid" ] && kill -0 $pid 2>/dev/null; then
        echo "🛑 Stopping agent with PID: $pid"
        kill $pid
        sleep 1
        
        # Force kill if still running
        if kill -0 $pid 2>/dev/null; then
            echo "🔨 Force stopping agent with PID: $pid"
            kill -9 $pid
        fi
        
        echo "✅ Agent with PID $pid stopped"
    else
        echo "⚠️  Agent with PID $pid was not running"
    fi
done < coral_agent_pids.txt

# Clean up PID file
rm -f coral_agent_pids.txt

echo ""
echo "🐠 All Coral Protocol Agents stopped!"
echo "📊 Coral Studio may still be running at: http://localhost:3000"

#!/usr/bin/env bash
set -e

# Change to the agent directory
cd "$(dirname "$0")"

# Run the document agent
python main.py

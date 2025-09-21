#!/usr/bin/env bash
set -e

# Change to the agent directory
cd "$(dirname "$0")"

# Run the grading agent
python main.py

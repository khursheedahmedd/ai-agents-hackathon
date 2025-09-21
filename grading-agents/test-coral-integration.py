#!/usr/bin/env python3
"""
Test script for Coral Protocol integration with FastAPI
"""

import requests
import json
import time

def test_endpoint(url, method="GET", data=None, headers=None):
    """Test a single endpoint"""
    try:
        if method == "GET":
            response = requests.get(url, headers=headers)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers)
        
        print(f"✅ {method} {url} - Status: {response.status_code}")
        if response.status_code == 200:
            try:
                result = response.json()
                print(f"   Response: {json.dumps(result, indent=2)[:200]}...")
            except:
                print(f"   Response: {response.text[:200]}...")
        else:
            print(f"   Error: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ {method} {url} - Error: {str(e)}")
        return False

def main():
    """Test all Coral Protocol endpoints"""
    base_url = "http://localhost:8000"
    
    print("🐠 Testing Coral Protocol Integration with FastAPI")
    print("=" * 60)
    
    # Test Coral Server endpoints
    print("\n📡 Testing Coral Server Endpoints:")
    print("-" * 40)
    
    test_endpoint(f"{base_url}/api/v1/agents")
    test_endpoint(f"{base_url}/api/v1/sessions")
    test_endpoint(f"{base_url}/api/v1/registry")
    test_endpoint(f"{base_url}/api/v1/health")
    
    # Test Coral Protocol endpoints
    print("\n🤖 Testing Coral Protocol Endpoints:")
    print("-" * 40)
    
    test_endpoint(f"{base_url}/api/v1/coral/health")
    test_endpoint(f"{base_url}/api/v1/coral/status")
    test_endpoint(f"{base_url}/api/v1/coral/agent-status")
    
    # Test integration
    print("\n🧪 Testing Integration:")
    print("-" * 40)
    
    test_endpoint(f"{base_url}/api/v1/coral/test-integration", method="POST")
    
    # Test session creation
    print("\n💬 Testing Session Management:")
    print("-" * 40)
    
    session_data = {
        "participants": ["ocr-agent", "grading-agent"],
        "metadata": {"type": "grading_session"}
    }
    test_endpoint(f"{base_url}/api/v1/sessions", method="POST", data=session_data)
    
    print("\n🎯 Integration Test Complete!")
    print("=" * 60)

if __name__ == "__main__":
    main()

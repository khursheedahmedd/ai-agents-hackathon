#!/usr/bin/env python3
"""
Test script for rubric extraction endpoint
"""

import requests
import json

def test_upload_key_endpoint():
    """Test the upload-key endpoint"""
    url = "http://localhost:8000/api/v1/grading/upload-key"
    
    # Create a simple test file (you can replace this with an actual file)
    test_data = {
        "key_file": ("test_key.txt", "Q1: What is 2+2?\nA1: 4\n\nQ2: What is the capital of France?\nA2: Paris", "text/plain")
    }
    
    try:
        print("Testing upload-key endpoint...")
        print(f"URL: {url}")
        
        response = requests.post(url, files=test_data)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Success!")
            print(f"Response: {json.dumps(data, indent=2)}")
        else:
            print("❌ Error!")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    test_upload_key_endpoint()

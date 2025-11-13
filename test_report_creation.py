#!/usr/bin/env python
"""
Test script to debug report creation endpoint
"""
import requests
import json
from pathlib import Path

BASE_URL = "http://localhost:8000/api"

# First, create a test user
def create_test_user():
    """Create a test citizen user"""
    response = requests.post(
        f"{BASE_URL}/auth/signup/citizen/",
        json={
            "username": "testuser_report",
            "email": "testuser_report@example.com",
            "password": "testpass123",
            "first_name": "Test",
            "last_name": "User"
        }
    )
    print(f"Create user status: {response.status_code}")
    print(f"Create user response: {response.text}")
    
    if response.status_code == 201:
        data = response.json()
        return data['token']
    return None

def test_report_creation(token):
    """Test creating a report with FormData"""
    # Create a simple test image
    test_image = Path("/tmp/test_image.jpg")
    # Create a minimal JPEG file
    jpeg_header = b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x11\x00\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xfb\xd1\xff\xd9'
    test_image.write_bytes(jpeg_header)
    
    headers = {
        "Authorization": f"Token {token}"
    }
    
    # Test with FormData
    files = {
        'location': (None, 'Test Location'),
        'description': (None, 'This is a test report'),
        'image': (test_image.name, open(test_image, 'rb'), 'image/jpeg'),
    }
    
    response = requests.post(
        f"{BASE_URL}/reports/create/",
        headers=headers,
        files=files
    )
    
    print(f"\n\nCreate report status: {response.status_code}")
    print(f"Create report response: {response.text}")
    print(f"Response length: {len(response.text)} bytes")
    
    if response.status_code == 201:
        data = response.json()
        print(f"\nSuccess! Created report: {json.dumps(data, indent=2)}")
    else:
        try:
            error_data = response.json()
            print(f"\nError details: {json.dumps(error_data, indent=2)}")
        except:
            print(f"Could not parse response as JSON")

if __name__ == "__main__":
    print("Testing report creation endpoint...")
    token = create_test_user()
    
    if token:
        print(f"Got token: {token[:20]}...")
        test_report_creation(token)
    else:
        print("Failed to create test user")

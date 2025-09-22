#!/usr/bin/env python3
"""
AI Farming Assistant Backend API Tests
Tests all backend endpoints with realistic Malayalam farming data
"""

import requests
import json
import base64
import uuid
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from frontend environment
BACKEND_URL = os.getenv('EXPO_PUBLIC_BACKEND_URL', 'http://localhost:8001')
API_BASE = f"{BACKEND_URL}/api"

print(f"Testing backend at: {API_BASE}")

class FarmingAssistantTester:
    def __init__(self):
        self.test_farmer_id = None
        self.test_session_id = str(uuid.uuid4())
        self.results = {
            'passed': 0,
            'failed': 0,
            'errors': []
        }
    
    def log_result(self, test_name, success, message=""):
        if success:
            self.results['passed'] += 1
            print(f"✅ {test_name}: PASSED {message}")
        else:
            self.results['failed'] += 1
            self.results['errors'].append(f"{test_name}: {message}")
            print(f"❌ {test_name}: FAILED - {message}")
    
    def test_health_check(self):
        """Test basic API health check"""
        try:
            response = requests.get(f"{API_BASE}/", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "AI Farming Assistant" in data.get('message', ''):
                    self.log_result("Health Check", True, f"Status: {response.status_code}")
                else:
                    self.log_result("Health Check", False, f"Unexpected response: {data}")
            else:
                self.log_result("Health Check", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Health Check", False, f"Connection error: {str(e)}")
    
    def test_create_farmer_profile(self):
        """Test creating a farmer profile with Malayalam context"""
        farmer_data = {
            "name": "രാജേഷ് കുമാർ",  # Rajesh Kumar in Malayalam
            "phone": "+91-9876543210",
            "location": "കൊച്ചി, കേരളം",  # Kochi, Kerala in Malayalam
            "crops": ["നെല്ല്", "തേങ്ങ", "കുരുമുളക്"],  # Rice, Coconut, Pepper in Malayalam
            "farm_size": "2 ഏക്കർ"  # 2 acres in Malayalam
        }
        
        try:
            response = requests.post(f"{API_BASE}/farmers", json=farmer_data, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if 'id' in data and data['name'] == farmer_data['name']:
                    self.test_farmer_id = data['id']
                    self.log_result("Create Farmer Profile", True, f"Created farmer ID: {self.test_farmer_id}")
                else:
                    self.log_result("Create Farmer Profile", False, f"Invalid response structure: {data}")
            else:
                self.log_result("Create Farmer Profile", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result("Create Farmer Profile", False, f"Error: {str(e)}")
    
    def test_get_farmer_profile(self):
        """Test retrieving a specific farmer profile"""
        if not self.test_farmer_id:
            self.log_result("Get Farmer Profile", False, "No farmer ID available from create test")
            return
        
        try:
            response = requests.get(f"{API_BASE}/farmers/{self.test_farmer_id}", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data['id'] == self.test_farmer_id and 'name' in data:
                    self.log_result("Get Farmer Profile", True, f"Retrieved farmer: {data['name']}")
                else:
                    self.log_result("Get Farmer Profile", False, f"Data mismatch: {data}")
            else:
                self.log_result("Get Farmer Profile", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Get Farmer Profile", False, f"Error: {str(e)}")
    
    def test_list_farmers(self):
        """Test listing all farmers"""
        try:
            response = requests.get(f"{API_BASE}/farmers", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("List Farmers", True, f"Found {len(data)} farmers")
                else:
                    self.log_result("List Farmers", False, f"Expected list, got: {type(data)}")
            else:
                self.log_result("List Farmers", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("List Farmers", False, f"Error: {str(e)}")
    
    def test_chat_malayalam(self):
        """Test AI chat with Malayalam farming question"""
        if not self.test_farmer_id:
            self.log_result("Chat Malayalam", False, "No farmer ID available")
            return
        
        chat_data = {
            "farmer_id": self.test_farmer_id,
            "message": "എന്റെ നെല്ല് വയലിൽ ഇലകൾ മഞ്ഞയായി മാറുന്നു. എന്താണ് കാരണം?",  # My rice field leaves are turning yellow. What's the reason?
            "message_type": "text",
            "session_id": self.test_session_id
        }
        
        try:
            response = requests.post(f"{API_BASE}/chat", json=chat_data, timeout=30)
            if response.status_code == 200:
                data = response.json()
                if 'response' in data and len(data['response']) > 10:
                    self.log_result("Chat Malayalam", True, f"AI responded with {len(data['response'])} characters")
                else:
                    self.log_result("Chat Malayalam", False, f"Invalid AI response: {data}")
            else:
                self.log_result("Chat Malayalam", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result("Chat Malayalam", False, f"Error: {str(e)}")
    
    def test_chat_english(self):
        """Test AI chat with English farming question"""
        if not self.test_farmer_id:
            self.log_result("Chat English", False, "No farmer ID available")
            return
        
        chat_data = {
            "farmer_id": self.test_farmer_id,
            "message": "What is the best time to plant coconut saplings in Kerala?",
            "message_type": "text",
            "session_id": self.test_session_id
        }
        
        try:
            response = requests.post(f"{API_BASE}/chat", json=chat_data, timeout=30)
            if response.status_code == 200:
                data = response.json()
                if 'response' in data and len(data['response']) > 10:
                    self.log_result("Chat English", True, f"AI responded with {len(data['response'])} characters")
                else:
                    self.log_result("Chat English", False, f"Invalid AI response: {data}")
            else:
                self.log_result("Chat English", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result("Chat English", False, f"Error: {str(e)}")
    
    def test_chat_with_image(self):
        """Test AI chat with base64 image data for plant disease detection"""
        if not self.test_farmer_id:
            self.log_result("Chat with Image", False, "No farmer ID available")
            return
        
        # Create a small test image (1x1 pixel PNG) encoded as base64
        test_image_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        
        chat_data = {
            "farmer_id": self.test_farmer_id,
            "message": "എന്റെ തേങ്ങയുടെ ഇലയിൽ പുള്ളികൾ കാണുന്നു. രോഗമാണോ?",  # I see spots on my coconut leaves. Is it a disease?
            "message_type": "image",
            "image_data": test_image_b64,
            "session_id": self.test_session_id
        }
        
        try:
            response = requests.post(f"{API_BASE}/chat", json=chat_data, timeout=30)
            if response.status_code == 200:
                data = response.json()
                if 'response' in data and len(data['response']) > 10:
                    self.log_result("Chat with Image", True, f"AI analyzed image and responded")
                else:
                    self.log_result("Chat with Image", False, f"Invalid AI response: {data}")
            else:
                self.log_result("Chat with Image", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result("Chat with Image", False, f"Error: {str(e)}")
    
    def test_chat_history(self):
        """Test retrieving chat history"""
        if not self.test_farmer_id:
            self.log_result("Chat History", False, "No farmer ID available")
            return
        
        try:
            response = requests.get(f"{API_BASE}/chat/{self.test_farmer_id}", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("Chat History", True, f"Retrieved {len(data)} chat messages")
                else:
                    self.log_result("Chat History", False, f"Expected list, got: {type(data)}")
            else:
                self.log_result("Chat History", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Chat History", False, f"Error: {str(e)}")
    
    def test_disease_detection(self):
        """Test plant disease detection API"""
        if not self.test_farmer_id:
            self.log_result("Disease Detection", False, "No farmer ID available")
            return
        
        # Create a small test image (1x1 pixel PNG) encoded as base64
        test_image_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        
        disease_data = {
            "farmer_id": self.test_farmer_id,
            "image_data": test_image_b64,
            "description": "കുരുമുളകിന്റെ ഇലയിൽ കറുത്ത പുള്ളികൾ"  # Black spots on pepper leaves
        }
        
        try:
            response = requests.post(f"{API_BASE}/detect-disease", params=disease_data, timeout=30)
            if response.status_code == 200:
                data = response.json()
                if 'analysis' in data and 'detection_id' in data:
                    self.log_result("Disease Detection", True, f"Disease analysis completed")
                else:
                    self.log_result("Disease Detection", False, f"Invalid response structure: {data}")
            else:
                self.log_result("Disease Detection", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result("Disease Detection", False, f"Error: {str(e)}")
    
    def test_weather_api(self):
        """Test weather API for Kerala locations"""
        kerala_locations = ["കൊച്ചി", "തിരുവനന്തപുരം", "കോഴിക്കോട്"]  # Kochi, Thiruvananthapuram, Kozhikode
        
        for location in kerala_locations:
            try:
                response = requests.get(f"{API_BASE}/weather/{location}", timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    if 'location' in data and 'temperature' in data and 'forecast' in data:
                        self.log_result(f"Weather API ({location})", True, f"Weather data retrieved")
                        break  # Test one location successfully
                    else:
                        self.log_result(f"Weather API ({location})", False, f"Invalid weather data: {data}")
                else:
                    self.log_result(f"Weather API ({location})", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result(f"Weather API ({location})", False, f"Error: {str(e)}")
    
    def test_escalate_to_officer(self):
        """Test escalating farmer query to agriculture officer"""
        if not self.test_farmer_id:
            self.log_result("Officer Escalation", False, "No farmer ID available")
            return
        
        escalation_data = {
            "farmer_id": self.test_farmer_id,
            "query": "എന്റെ നെല്ല് വയലിൽ വലിയ നാശനഷ്ടം സംഭവിച്ചിരിക്കുന്നു. ഉടനടി സഹായം ആവശ്യമാണ്.",  # Major damage in my rice field. Immediate help needed.
            "priority": "high"
        }
        
        try:
            response = requests.post(f"{API_BASE}/escalate", params=escalation_data, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if 'escalation_id' in data and 'message' in data:
                    self.log_result("Officer Escalation", True, f"Query escalated successfully")
                else:
                    self.log_result("Officer Escalation", False, f"Invalid response: {data}")
            else:
                self.log_result("Officer Escalation", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result("Officer Escalation", False, f"Error: {str(e)}")
    
    def test_get_escalations(self):
        """Test retrieving farmer escalations"""
        if not self.test_farmer_id:
            self.log_result("Get Escalations", False, "No farmer ID available")
            return
        
        try:
            response = requests.get(f"{API_BASE}/escalations/{self.test_farmer_id}", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("Get Escalations", True, f"Retrieved {len(data)} escalations")
                else:
                    self.log_result("Get Escalations", False, f"Expected list, got: {type(data)}")
            else:
                self.log_result("Get Escalations", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Get Escalations", False, f"Error: {str(e)}")
    
    def run_all_tests(self):
        """Run all backend API tests"""
        print("🌾 Starting AI Farming Assistant Backend API Tests")
        print("=" * 60)
        
        # Test in logical order
        self.test_health_check()
        self.test_create_farmer_profile()
        self.test_get_farmer_profile()
        self.test_list_farmers()
        self.test_chat_malayalam()
        self.test_chat_english()
        self.test_chat_with_image()
        self.test_chat_history()
        self.test_disease_detection()
        self.test_weather_api()
        self.test_escalate_to_officer()
        self.test_get_escalations()
        
        # Print summary
        print("\n" + "=" * 60)
        print("🌾 AI Farming Assistant Backend Test Summary")
        print("=" * 60)
        print(f"✅ Passed: {self.results['passed']}")
        print(f"❌ Failed: {self.results['failed']}")
        
        if self.results['errors']:
            print("\n🚨 Failed Tests:")
            for error in self.results['errors']:
                print(f"   • {error}")
        
        success_rate = (self.results['passed'] / (self.results['passed'] + self.results['failed'])) * 100
        print(f"\n📊 Success Rate: {success_rate:.1f}%")
        
        return self.results

if __name__ == "__main__":
    tester = FarmingAssistantTester()
    results = tester.run_all_tests()
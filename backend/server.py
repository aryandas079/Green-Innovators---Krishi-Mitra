from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from emergentintegrations.llm.chat import LlmChat, UserMessage
import os
import logging
import base64
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
import json

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="AI Farming Assistant API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Initialize LLM Chat
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# Pydantic Models
class FarmerProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    location: str
    crops: List[str] = []
    farm_size: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class FarmerProfileCreate(BaseModel):
    name: str
    phone: str
    location: str
    crops: List[str] = []
    farm_size: Optional[str] = None

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    farmer_id: str
    message: str
    response: str
    message_type: str = "text"  # text, image, voice
    image_data: Optional[str] = None  # base64 encoded image
    created_at: datetime = Field(default_factory=datetime.utcnow)
    session_id: str

class ChatRequest(BaseModel):
    farmer_id: str
    message: str
    message_type: str = "text"
    image_data: Optional[str] = None
    session_id: str

class WeatherData(BaseModel):
    location: str
    temperature: float
    humidity: float
    rainfall: float
    forecast: str
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class DiseaseDetection(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    farmer_id: str
    image_data: str  # base64
    detected_disease: str
    confidence: float
    treatment_advice: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class OfficerEscalation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    farmer_id: str
    query: str
    priority: str = "medium"  # low, medium, high
    status: str = "pending"  # pending, assigned, resolved
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Translation Models
class TranslationRequest(BaseModel):
    text: str
    source_language: str  # "english", "hindi", "malayalam"
    target_language: str  # "english", "hindi", "malayalam"

class TranslationResponse(BaseModel):
    original_text: str
    translated_text: str
    source_language: str
    target_language: str

# Helper functions
def get_farming_system_message(farmer_profile=None):
    base_message = """You are an AI farming assistant for Malayalam-speaking farmers in Kerala, India. 
    You provide practical, localized farming advice in simple Malayalam or English as preferred by the farmer.
    
    Your expertise includes:
    - Crop selection and planting schedules for Kerala's climate
    - Organic and traditional farming methods
    - Plant disease identification and treatment
    - Soil health and fertilizer recommendations
    - Irrigation and water management
    - Market prices and government schemes
    - Weather-based farming advice
    
    Always provide practical, actionable advice suitable for small to medium farmers in Kerala.
    Be encouraging and supportive in your responses."""
    
    if farmer_profile:
        base_message += f"\n\nFarmer Profile:\nName: {farmer_profile.get('name', 'Unknown')}\nLocation: {farmer_profile.get('location', 'Kerala')}\nCrops: {', '.join(farmer_profile.get('crops', []))}\nFarm Size: {farmer_profile.get('farm_size', 'Not specified')}"
    
    return base_message

async def get_ai_response(message: str, farmer_id: str, session_id: str, image_data: str = None):
    try:
        # Get farmer profile for context
        farmer_profile = await db.farmers.find_one({"id": farmer_id})
        system_message = get_farming_system_message(farmer_profile)
        
        # Initialize chat
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message=system_message
        ).with_model("openai", "gpt-4o-mini")
        
        # Create user message
        user_message = UserMessage(text=message)
        
        # If image is provided, add context about plant disease detection
        if image_data:
            enhanced_message = f"""The farmer has shared an image of their plant/crop along with this message: "{message}"
            
            Please analyze the image and provide:
            1. Plant/crop identification if possible
            2. Any visible diseases or issues
            3. Treatment recommendations
            4. Prevention advice
            
            Farmer's message: {message}"""
            user_message = UserMessage(text=enhanced_message)
        
        # Get AI response
        response = await chat.send_message(user_message)
        return response
        
    except Exception as e:
        logging.error(f"AI response error: {str(e)}")
        return "I'm sorry, I'm having trouble processing your request right now. Please try again or contact an agriculture officer for immediate assistance."

async def translate_text(text: str, source_lang: str, target_lang: str):
    """Translate text using Emergent LLM"""
    try:
        # Create translation prompt
        translation_prompt = f"""Translate the following text from {source_lang} to {target_lang}. 
        Provide only the translated text without any additional commentary or explanation.
        
        Text to translate: {text}
        
        Translation:"""
        
        # Initialize chat for translation
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"translation_{uuid.uuid4()}",
            system_message="You are a professional translator. Provide accurate translations without any additional text."
        ).with_model("openai", "gpt-4o-mini")
        
        # Get translation
        user_message = UserMessage(text=translation_prompt)
        response = await chat.send_message(user_message)
        
        return response.strip()
        
    except Exception as e:
        logging.error(f"Translation error: {str(e)}")
        return f"Translation failed: {str(e)}"

# API Routes
@api_router.get("/")
async def root():
    return {"message": "AI Farming Assistant API is running"}

# Farmer Profile Routes
@api_router.post("/farmers", response_model=FarmerProfile)
async def create_farmer_profile(farmer_data: FarmerProfileCreate):
    farmer_dict = farmer_data.dict()
    farmer_obj = FarmerProfile(**farmer_dict)
    await db.farmers.insert_one(farmer_obj.dict())
    return farmer_obj

@api_router.get("/farmers/{farmer_id}", response_model=FarmerProfile)
async def get_farmer_profile(farmer_id: str):
    farmer = await db.farmers.find_one({"id": farmer_id})
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    return FarmerProfile(**farmer)

@api_router.get("/farmers", response_model=List[FarmerProfile])
async def list_farmers():
    farmers = await db.farmers.find().to_list(100)
    return [FarmerProfile(**farmer) for farmer in farmers]

# Chat Routes
@api_router.post("/chat")
async def send_chat_message(chat_request: ChatRequest):
    try:
        # Get AI response
        ai_response = await get_ai_response(
            chat_request.message, 
            chat_request.farmer_id, 
            chat_request.session_id,
            chat_request.image_data
        )
        
        # Save chat message
        chat_message = ChatMessage(
            farmer_id=chat_request.farmer_id,
            message=chat_request.message,
            response=ai_response,
            message_type=chat_request.message_type,
            image_data=chat_request.image_data,
            session_id=chat_request.session_id
        )
        
        await db.chat_messages.insert_one(chat_message.dict())
        
        return {
            "response": ai_response,
            "message_id": chat_message.id,
            "timestamp": chat_message.created_at
        }
        
    except Exception as e:
        logging.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process message")

@api_router.get("/chat/{farmer_id}")
async def get_chat_history(farmer_id: str, session_id: Optional[str] = None):
    query = {"farmer_id": farmer_id}
    if session_id:
        query["session_id"] = session_id
    
    messages = await db.chat_messages.find(query).sort("created_at", -1).limit(50).to_list(50)
    return [ChatMessage(**msg) for msg in messages]

# Disease Detection Route
@api_router.post("/detect-disease")
async def detect_plant_disease(farmer_id: str, image_data: str, description: str = ""):
    try:
        # Use AI to analyze the plant image
        analysis_prompt = f"""Analyze this plant image for diseases or issues. The farmer says: "{description}"
        
        Please provide:
        1. Plant identification
        2. Disease/pest identification (if any)
        3. Severity level (mild/moderate/severe)
        4. Treatment recommendations (organic preferred)
        5. Prevention advice
        
        Format your response clearly for a farmer to understand."""
        
        session_id = f"disease_{farmer_id}_{uuid.uuid4()}"
        ai_response = await get_ai_response(analysis_prompt, farmer_id, session_id, image_data)
        
        # Save disease detection record
        detection = DiseaseDetection(
            farmer_id=farmer_id,
            image_data=image_data,
            detected_disease="AI Analysis",
            confidence=0.8,  # Placeholder
            treatment_advice=ai_response
        )
        
        await db.disease_detections.insert_one(detection.dict())
        
        return {
            "analysis": ai_response,
            "detection_id": detection.id,
            "timestamp": detection.created_at
        }
        
    except Exception as e:
        logging.error(f"Disease detection error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to analyze plant image")

# Weather Route (Mock data for now)
@api_router.get("/weather/{location}")
async def get_weather(location: str):
    # This would integrate with a real weather API
    # For now, returning mock data
    weather = WeatherData(
        location=location,
        temperature=28.5,
        humidity=75.0,
        rainfall=5.2,
        forecast="Partly cloudy with chance of light rain"
    )
    
    return weather

# Officer Escalation Route
@api_router.post("/escalate")
async def escalate_to_officer(farmer_id: str, query: str, priority: str = "medium"):
    escalation = OfficerEscalation(
        farmer_id=farmer_id,
        query=query,
        priority=priority
    )
    
    await db.escalations.insert_one(escalation.dict())
    
    # Here you would typically send an email/SMS to agriculture officers
    
    return {
        "message": "Your query has been forwarded to agriculture officers. They will contact you soon.",
        "escalation_id": escalation.id,
        "estimated_response": "24-48 hours"
    }

@api_router.get("/escalations/{farmer_id}")
async def get_farmer_escalations(farmer_id: str):
    escalations = await db.escalations.find({"farmer_id": farmer_id}).to_list(20)
    return [OfficerEscalation(**esc) for esc in escalations]

# Translation Route
@api_router.post("/translate", response_model=TranslationResponse)
async def translate_text_endpoint(translation_request: TranslationRequest):
    try:
        translated_text = await translate_text(
            translation_request.text,
            translation_request.source_language,
            translation_request.target_language
        )
        
        return TranslationResponse(
            original_text=translation_request.text,
            translated_text=translated_text,
            source_language=translation_request.source_language,
            target_language=translation_request.target_language
        )
        
    except Exception as e:
        logging.error(f"Translation endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail="Translation failed")

# Include the router in the main app
app.include_router(api_router)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
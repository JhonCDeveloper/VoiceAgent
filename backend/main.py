import os
import io
import logging
from fastapi import FastAPI, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv

# Load env variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nomad-ai-backend")

# Import our backend services
from agent import run_agent
from tts import text_to_speech
from rag.pipeline import ingest

app = FastAPI(title="Nomad AI Backend", version="1.0.0")

# CORS configuration
# Allow all origins for easy deployment (Railway/Vercel)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup Event
@app.on_event("startup")
def startup_event():
    logger.info("Starting Nomad AI Backend...")
    # Trigger RAG ingestion of default URL
    rag_url = os.getenv("RAG_SOURCE_URL")
    if rag_url:
        try:
            logger.info(f"Auto-ingesting RAG source: {rag_url}")
            ingest(rag_url)
        except Exception as e:
            logger.error(f"Failed to auto-ingest RAG source: {str(e)}")
            logger.warning("Swallowing RAG ingestion exception to prevent startup failure.")
    else:
        logger.warning("RAG_SOURCE_URL environment variable is not set. Skipping default ingestion.")

# Request models
class ChatRequest(BaseModel):
    message: str
    session_id: str
    mode: str  # "text" | "voice"

class TTSRequest(BaseModel):
    text: str

class IngestRequest(BaseModel):
    url: str = None

# Routes
@app.post("/api/chat")
async def chat(request: ChatRequest):
    if not request.message or not request.session_id:
        raise HTTPException(status_code=400, detail="Missing required message or session_id fields.")
    
    logger.info(f"Received chat request from session {request.session_id}")
    response = run_agent(request.session_id, request.message)
    return response

@app.post("/api/tts")
async def tts(request: TTSRequest):
    if not request.text:
        raise HTTPException(status_code=400, detail="Missing text for TTS.")
        
    logger.info("Received TTS request")
    try:
        audio_bytes = text_to_speech(request.text)
        return StreamingResponse(io.BytesIO(audio_bytes), media_type="audio/mpeg")
    except Exception as e:
        logger.error(f"TTS conversion failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/rag/ingest")
async def rag_ingest(request: IngestRequest):
    logger.info(f"Received manual RAG ingest request for URL: {request.url}")
    try:
        result = ingest(request.url)
        return result
    except Exception as e:
        logger.error(f"Manual RAG ingestion failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health():
    return {"status": "ok"}

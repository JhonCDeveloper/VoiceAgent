import os
import httpx
from openai import OpenAI

def text_to_speech(text: str) -> bytes:
    """
    Convert text to speech raw audio bytes using OpenAI's TTS service.
    
    Args:
        text (str): The input text to convert.
        
    Returns:
        bytes: Raw MP3 audio bytes.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY is not set.")
        
    client = OpenAI(api_key=api_key, http_client=httpx.Client())
    
    # Restrict input to a max of 4096 characters as per guidelines
    response = client.audio.speech.create(
        model="tts-1",
        voice="nova",
        input=text[:4096]
    )
    
    return response.content

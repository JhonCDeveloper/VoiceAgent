import type { ChatResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

export async function sendMessage(
  message: string,
  sessionId: string,
  mode: 'text' | 'voice'
): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      session_id: sessionId,
      mode,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Chat API error: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchTTS(text: string): Promise<Blob> {
  const response = await fetch(`${API_BASE}/api/tts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `TTS API error: ${response.statusText}`);
  }

  return response.blob();
}

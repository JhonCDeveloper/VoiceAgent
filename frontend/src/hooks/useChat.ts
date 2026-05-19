import { useState, useRef } from 'react';
import type { Message, Mode } from '../types';
import { sendMessage as sendChatMessage } from '../api/client';
import { useTTS } from './useTTS';

const predictTool = (query: string): string | null => {
  const q = query.toLowerCase();
  
  // Predict currency conversion
  if (
    q.includes('convert') ||
    q.includes('exchange') ||
    q.includes('rate') ||
    q.includes('usd') ||
    q.includes('eur') ||
    q.includes('yen') ||
    q.includes('currency') ||
    q.includes('coin') ||
    q.includes('money') ||
    q.includes('price') ||
    q.includes('conversión') ||
    q.includes('cambio') ||
    q.includes('dolar') ||
    q.includes('dólar') ||
    q.includes('euro') ||
    q.includes('yen') ||
    q.includes('divisa')
  ) {
    return 'currency_convert';
  }
  
  // Predict web search
  if (
    q.includes('search') ||
    q.includes('weather') ||
    q.includes('news') ||
    q.includes('what is') ||
    q.includes('find') ||
    q.includes('current') ||
    q.includes('latest') ||
    q.includes('tokyo') ||
    q.includes('japan') ||
    q.includes('buscar') ||
    q.includes('búsqueda') ||
    q.includes('clima') ||
    q.includes('tiempo') ||
    q.includes('noticias') ||
    q.includes('qué es') ||
    q.includes('quién') ||
    q.includes('dónde')
  ) {
    return 'web_search';
  }
  
  return null;
};

export function useChat(mode: Mode) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // session_id is generated once per page load and never reset when the user switches
  // between text and voice modes. This guarantees a single unified conversation thread
  // across both modes, respecting the backend's 7-message rolling window.
  const sessionIdRef = useRef<string>('');
  if (!sessionIdRef.current) {
    sessionIdRef.current = crypto.randomUUID();
  }

  const { play } = useTTS();

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Create user message immediately
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      tool_used: false,
      tool_name: null,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    // Predict if a tool is going to run
    const predictedTool = predictTool(content.trim());
    if (predictedTool) {
      setActiveTool(predictedTool);
    }

    const startTime = Date.now();

    try {
      // Call backend API
      const response = await sendChatMessage(
        content.trim(),
        sessionIdRef.current,
        mode
      );

      // Clamp minimum loading animation time to 1.2s to satisfy micro-interaction visibility
      const elapsed = Date.now() - startTime;
      if (predictedTool && elapsed < 1200) {
        await new Promise((resolve) => setTimeout(resolve, 1200 - elapsed));
      }

      let audioUrl: string | undefined;

      // In voice mode, run TTS conversion and play audio
      if (mode === 'voice' && response.reply) {
        try {
          setIsAssistantSpeaking(true);
          audioUrl = await play(response.reply);
        } catch (ttsError) {
          console.error('Error playing voice output:', ttsError);
        } finally {
          setIsAssistantSpeaking(false);
        }
      }

      // Create assistant message with tool details and audio URL
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.reply,
        tool_used: response.tool_used,
        tool_name: response.tool_name,
        timestamp: new Date(),
        audioUrl,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
      setActiveTool(null);
    }
  };

  return {
    messages,
    loading,
    activeTool,
    isAssistantSpeaking,
    error,
    sendMessage,
  };
}

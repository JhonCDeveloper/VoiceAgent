export type Mode = 'text' | 'voice';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  tool_used: boolean;
  tool_name: string | null;
  timestamp: Date;
  audioUrl?: string;
}

export interface ChatResponse {
  reply: string;
  tool_used: boolean;
  tool_name: string | null;
}

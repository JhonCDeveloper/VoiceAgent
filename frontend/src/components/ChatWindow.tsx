import { useEffect, useRef } from 'react';
import type { Message as MessageType } from '../types';
import { Message } from './Message';
import { TypingIndicator } from './TypingIndicator';
import { ToolBadge } from './ToolBadge';

interface ChatWindowProps {
  messages: MessageType[];
  loading: boolean;
  activeTool: string | null;
}

export function ChatWindow({ messages, loading, activeTool }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 bg-[var(--bg-base)]">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] font-mono text-[12px] select-none">
          <span>NOMAD AI IS READY</span>
          <span className="mt-1 opacity-70">Ask about travel, weather, or exchange rates</span>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-6 flex flex-col">
          {messages.map((msg) => (
            <Message key={msg.id} message={msg} />
          ))}
          
          {loading && (
            <div className="self-start">
              {activeTool ? (
                <div className="flex flex-col gap-1 w-full items-start">
                  <ToolBadge toolName={activeTool} isLoading={true} />
                </div>
              ) : (
                <TypingIndicator />
              )}
            </div>
          )}
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}

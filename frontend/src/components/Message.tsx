import ReactMarkdown from 'react-markdown';
import type { Message as MessageType } from '../types';
import { ToolBadge } from './ToolBadge';
import { AudioPlayer } from './AudioPlayer';

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <div
      className={`flex flex-col gap-1 w-full ${
        isUser ? 'items-end' : 'items-start'
      }`}
    >
      {/* Persisted tool badge for assistant messages */}
      {!isUser && message.tool_used && (
        <ToolBadge toolName={message.tool_name} />
      )}

      <div
        className={`flex items-end gap-2 max-w-[85%] ${
          isUser ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        <div
          className={`px-3.5 py-2.5 rounded-[8px] border text-[13.5px] leading-relaxed break-words ${
            isUser
              ? 'bg-[var(--bg-user)] border-[var(--border)] text-[var(--text-primary)]'
              : 'bg-[var(--bg-subtle)] border-[var(--border)] text-[var(--text-primary)] font-light'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="flex flex-col">
              <div className="react-markdown">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
              {message.audioUrl && (
                <AudioPlayer audioUrl={message.audioUrl} />
              )}
            </div>
          )}
        </div>
      </div>

      <span className="text-[11px] font-mono text-[var(--text-muted)] px-1 select-none">
        {formattedTime}
      </span>
    </div>
  );
}

import { useState, useMemo } from 'react';
import type { Mode } from './types';
import { Header } from './components/Header';
import { ChatWindow } from './components/ChatWindow';
import { ChatInput } from './components/ChatInput';
import { useChat } from './hooks/useChat';

function App() {
  const [mode, setMode] = useState<Mode>('text');
  const { messages, loading, activeTool, isAssistantSpeaking, sendMessage } = useChat(mode);

  // Find the last assistant message text (for the Replay button in voice mode)
  const lastAssistantText = useMemo(() => {
    const reversed = [...messages].reverse();
    return reversed.find((m) => m.role === 'assistant')?.content ?? null;
  }, [messages]);

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-base)] text-[var(--text-primary)]">
      <Header mode={mode} setMode={setMode} />
      <ChatWindow messages={messages} loading={loading} activeTool={activeTool} />
      <ChatInput
        onSendMessage={sendMessage}
        loading={loading}
        mode={mode}
        isAssistantSpeaking={isAssistantSpeaking}
        lastAssistantText={lastAssistantText}
      />
    </div>
  );
}

export default App;

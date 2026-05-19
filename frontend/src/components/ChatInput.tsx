import React, { useRef, useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import type { Mode } from '../types';
import { useSTT } from '../hooks/useSTT';
import { fetchTTS } from '../api/client';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  loading: boolean;
  mode: Mode;
  isAssistantSpeaking: boolean;
  lastAssistantText: string | null;
}

export function ChatInput({
  onSendMessage,
  loading,
  mode,
  isAssistantSpeaking,
  lastAssistantText,
}: ChatInputProps) {
  const [text, setText] = useState('');
  const [isReplaying, setIsReplaying] = useState(false);
  const [sttAlert, setSttAlert] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const replayAudioRef = useRef<HTMLAudioElement | null>(null);
  const alertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    const computedHeight = Math.min(textarea.scrollHeight, 120);
    textarea.style.height = `${computedHeight}px`;
  }, [text]);

  // Clear alert on unmount
  useEffect(() => {
    return () => {
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    };
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim() || loading) return;
    onSendMessage(text.trim());
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // STT transcript handler
  const handleTranscript = (transcript: string) => {
    onSendMessage(transcript);
  };

  const handleSttAlert = (msg: string) => {
    setSttAlert(msg);
    if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    alertTimerRef.current = setTimeout(() => {
      setSttAlert(null);
    }, 4000); // clear after 4s
  };

  // paused = true when we want the STT loop to pause (backend is busy or TTS is playing)
  const paused = loading || isAssistantSpeaking || isReplaying;

  const { isListening, isActive, isSupported, activate, deactivate } = useSTT({
    onTranscript: handleTranscript,
    paused,
    onErrorAlert: handleSttAlert,
  });

  // Deactivate STT when leaving voice mode
  useEffect(() => {
    if (mode !== 'voice') {
      deactivate();
    }
  }, [mode, deactivate]);

  const toggleMic = () => {
    if (isActive) {
      deactivate();
    } else {
      activate();
      setSttAlert(null);
    }
  };

  // ── Replay last response via OpenAI TTS ──
  const handleReplay = async () => {
    if (!lastAssistantText || isReplaying || isAssistantSpeaking || loading) return;

    // Stop existing replay if somehow triggered twice
    if (replayAudioRef.current) {
      replayAudioRef.current.pause();
      replayAudioRef.current = null;
    }

    setIsReplaying(true);
    try {
      const blob = await fetchTTS(lastAssistantText);
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      replayAudioRef.current = audio;

      audio.addEventListener('ended', () => {
        setIsReplaying(false);
        replayAudioRef.current = null;
      });
      audio.addEventListener('error', () => {
        setIsReplaying(false);
        replayAudioRef.current = null;
      });

      await audio.play();
    } catch (err) {
      console.error('Replay TTS error:', err);
      setIsReplaying(false);
    }
  };

  const stopReplay = () => {
    if (replayAudioRef.current) {
      replayAudioRef.current.pause();
      replayAudioRef.current = null;
    }
    setIsReplaying(false);
  };

  return (
    <div className="border-t border-[var(--border)] bg-[var(--bg-surface)] p-4 flex flex-col gap-1.5">
      {mode === 'voice' ? (
        /* ── VOICE MODE ── */
        <div className="max-w-2xl w-full mx-auto flex flex-col items-center gap-3 py-2">
          {isSupported ? (
            <>
              {/* Mic button with animated ring */}
              <div className="relative flex items-center justify-center">
                {/* Animated ring when actively listening */}
                {isListening && (
                  <span
                    className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-60"
                    style={{ animationDuration: '1.5s' }}
                  />
                )}
                {/* Glow ring when active but processing */}
                {isActive && !isListening && (
                  <span className="absolute inset-0 rounded-full border-2 border-[var(--border-focus)] opacity-40 animate-pulse" />
                )}

                <button
                  type="button"
                  id="voice-mic-btn"
                  onClick={toggleMic}
                  className={`relative z-10 w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-200 focus:outline-none cursor-pointer
                    ${
                      isListening
                        ? 'bg-red-600 border-red-500 scale-110'
                        : isActive
                        ? 'bg-[var(--bg-elevated)] border-[var(--border-focus)] scale-105'
                        : 'bg-[var(--bg-elevated)] border-[var(--border)] hover:border-[var(--border-focus)] hover:scale-105'
                    }`}
                  aria-label={isActive ? 'Stop voice session' : 'Start voice session'}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className={`w-6 h-6 transition-colors ${
                      isListening
                        ? 'text-white'
                        : isActive
                        ? 'text-[var(--text-primary)]'
                        : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v6a2 2 0 1 0 4 0V5a2 2 0 0 0-2-2z" />
                    <path d="M6.5 10.5A5.5 5.5 0 0 0 17.5 10.5h2a7.5 7.5 0 0 1-6.5 7.43V20h3v2H8v-2h3v-2.07A7.5 7.5 0 0 1 4.5 10.5h2z" />
                  </svg>
                </button>
              </div>

              {/* Status label */}
              <span className="font-mono text-[11px] text-[var(--text-muted)] select-none">
                {loading
                  ? 'Processing...'
                  : isAssistantSpeaking || isReplaying
                  ? 'Speaking...'
                  : isListening
                  ? 'Listening — speak now'
                  : isActive
                  ? 'Ready to listen...'
                  : 'Tap mic to start'}
              </span>

              {/* STT Alert */}
              {sttAlert && (
                <span className="font-mono text-[11px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 select-none transition-opacity animate-in fade-in">
                  {sttAlert}
                </span>
              )}

              {/* ── Replay Last Response Button ── */}
              {lastAssistantText && (
                <button
                  type="button"
                  id="replay-last-response-btn"
                  onClick={isReplaying ? stopReplay : handleReplay}
                  disabled={loading || isAssistantSpeaking}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-[4px] border text-[11px] font-mono transition-all duration-200 select-none disabled:opacity-40 disabled:cursor-not-allowed
                    ${
                      isReplaying
                        ? 'bg-[var(--bg-elevated)] border-[var(--border-focus)] text-[var(--text-primary)] cursor-pointer'
                        : 'bg-transparent border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-focus)] hover:text-[var(--text-primary)] cursor-pointer'
                    }`}
                  aria-label={isReplaying ? 'Stop replay' : 'Replay last response'}
                >
                  {isReplaying ? (
                    <>
                      {/* Animated waveform bars while replaying */}
                      <span className="flex gap-[2px] items-center">
                        <span className="w-[2px] h-2 bg-current rounded-full" style={{ animation: 'waveform 0.5s ease-in-out infinite alternate' }} />
                        <span className="w-[2px] h-3 bg-current rounded-full" style={{ animation: 'waveform 0.6s ease-in-out infinite alternate 0.1s' }} />
                        <span className="w-[2px] h-1 bg-current rounded-full" style={{ animation: 'waveform 0.4s ease-in-out infinite alternate 0.2s' }} />
                      </span>
                      Stop
                    </>
                  ) : (
                    <>
                      {/* Static speaker icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                        <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
                        <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.061Z" />
                      </svg>
                      Repeat last response
                    </>
                  )}
                </button>
              )}
            </>
          ) : (
            <span className="font-mono text-[11px] text-[var(--text-muted)] select-none">
              Voice input is not supported in this browser. Use Chrome or Edge.
            </span>
          )}
        </div>
      ) : (
        /* ── TEXT MODE ── */
        <form
          onSubmit={handleSubmit}
          className="max-w-2xl w-full mx-auto flex items-end gap-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[8px] px-3 py-2 focus-within:border-[var(--border-focus)] transition-colors"
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Nomad..."
            rows={1}
            disabled={loading}
            className="flex-1 bg-transparent border-0 outline-none focus:ring-0 text-[13.5px] text-[var(--text-primary)] placeholder-[var(--text-secondary)] resize-none py-1 font-light leading-normal"
          />

          <button
            type="submit"
            disabled={!text.trim() || loading}
            className="p-1 rounded-[4px] bg-[var(--accent)] text-[var(--text-inverse)] hover:bg-[var(--accent-hover)] disabled:bg-[var(--border)] disabled:text-[var(--text-muted)] transition-colors flex items-center justify-center cursor-pointer disabled:cursor-not-allowed select-none"
            aria-label="Send message"
          >
            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>
      )}

      {/* Status hint row */}
      <div className="max-w-2xl w-full mx-auto h-4 flex items-center px-1 select-none">
        {loading && mode === 'text' && (
          <span className="text-[11px] font-mono text-[var(--text-muted)] animate-pulse">
            Nomad is thinking...
          </span>
        )}
      </div>
    </div>
  );
}

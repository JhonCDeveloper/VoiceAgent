import { useState, useRef, useCallback, useEffect } from 'react';

interface UseSTTOptions {
  onTranscript: (text: string) => void;
  paused: boolean; // When true, stop listening and don't restart
  onErrorAlert?: (msg: string) => void;
}

// Minimal cross-browser Speech API types
interface ISpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: (() => void) | null;
  onaudiostart: (() => void) | null;
  onsoundstart: (() => void) | null;
  onspeechstart: (() => void) | null;
  onspeechend: (() => void) | null;
  onsoundend: (() => void) | null;
  onaudioend: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onnomatch: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionCtor = new () => ISpeechRecognition;

function getSpeechAPI(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  return (
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition ||
    null
  );
}

export function useSTT({ onTranscript, paused, onErrorAlert }: UseSTTOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isSupported] = useState(() => getSpeechAPI() !== null);

  // Use refs so callbacks inside recognition handlers are always current
  const onTranscriptRef = useRef(onTranscript);
  const pausedRef = useRef(paused);
  const activeRef = useRef(false);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onErrorAlertRef = useRef(onErrorAlert);

  // Keep refs in sync with props
  useEffect(() => { onTranscriptRef.current = onTranscript; }, [onTranscript]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { onErrorAlertRef.current = onErrorAlert; }, [onErrorAlert]);

  const clearRestartTimer = () => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
  };

  // Core function: create a fresh recognition session
  const startSession = useCallback(() => {
    const API = getSpeechAPI();
    if (!API || !activeRef.current || pausedRef.current) return;

    clearRestartTimer();

    // Abort any existing session cleanly
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }

    const recognition = new API();
    recognition.lang = 'es-ES'; // Force Spanish for Nomad AI
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false; // single-utterance mode

    recognition.onstart = () => {
      console.log('[STT] onstart');
      setIsListening(true);
    };

    recognition.onaudiostart = () => console.log('[STT] onaudiostart');
    recognition.onsoundstart = () => console.log('[STT] onsoundstart');
    recognition.onspeechstart = () => console.log('[STT] onspeechstart');
    recognition.onspeechend = () => console.log('[STT] onspeechend');
    recognition.onsoundend = () => console.log('[STT] onsoundend');
    recognition.onaudioend = () => console.log('[STT] onaudioend');

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      console.log('[STT] onresult', event);
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      console.log('[STT] transcript:', transcript);
      if (transcript) {
        onTranscriptRef.current(transcript);
      }
    };

    recognition.onnomatch = () => {
      console.log('[STT] onnomatch (no confidence in transcript)');
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.log('[STT] onerror:', event.error);
      
      // Stop the infinite loop on silence
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        if (onErrorAlertRef.current) {
          onErrorAlertRef.current('Microphone paused due to inactivity.');
        }
        activeRef.current = false;
        setIsActive(false);
        return;
      }
      
      // Fatal errors (permission denied, network)
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        if (onErrorAlertRef.current) {
          onErrorAlertRef.current('Microphone access denied.');
        }
        activeRef.current = false;
        setIsActive(false);
      }
    };

    recognition.onend = () => {
      console.log('[STT] onend');
      setIsListening(false);
      recognitionRef.current = null;

      // Auto-restart only if still globally active and not paused
      if (activeRef.current && !pausedRef.current) {
        restartTimerRef.current = setTimeout(() => {
          startSession();
        }, 300);
      }
    };

    recognitionRef.current = recognition;
    try {
      console.log('[STT] starting recognition...');
      recognition.start();
    } catch (e) {
      console.warn('recognition.start() failed:', e);
    }
  }, []); // stable reference — uses refs for all mutable state

  // Activate: called on first user gesture
  const activate = useCallback(() => {
    activeRef.current = true;
    setIsActive(true);
    startSession();
  }, [startSession]);

  // Deactivate: user manually mutes
  const deactivate = useCallback(() => {
    activeRef.current = false;
    setIsActive(false);
    clearRestartTimer();
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  // React to paused changes without needing user gesture
  useEffect(() => {
    if (paused) {
      // Pause: abort current session and clear pending restart
      clearRestartTimer();
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
        recognitionRef.current = null;
      }
      setIsListening(false);
    } else if (activeRef.current) {
      // Resume: restart session after brief delay
      restartTimerRef.current = setTimeout(() => {
        startSession();
      }, 500);
    }
  }, [paused, startSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearRestartTimer();
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
    };
  }, []);

  return { isListening, isActive, isSupported, activate, deactivate };
}

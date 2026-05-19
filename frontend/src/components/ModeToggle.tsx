import type { Mode } from '../types';

interface ModeToggleProps {
  mode: Mode;
  setMode: (mode: Mode) => void;
}

export function ModeToggle({ mode, setMode }: ModeToggleProps) {
  return (
    <div className="flex bg-[var(--bg-elevated)] border border-[var(--border)] rounded-full p-[2px]">
      <button
        type="button"
        onClick={() => setMode('text')}
        className={`px-3 py-0.5 text-[11px] font-mono rounded-full transition-colors duration-150 ${
          mode === 'text'
            ? 'bg-[var(--accent)] text-[var(--text-inverse)] font-medium'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
        }`}
      >
        Text
      </button>
      <button
        type="button"
        onClick={() => setMode('voice')}
        className={`px-3 py-0.5 text-[11px] font-mono rounded-full transition-colors duration-150 ${
          mode === 'voice'
            ? 'bg-[var(--accent)] text-[var(--text-inverse)] font-medium'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
        }`}
      >
        Voice
      </button>
    </div>
  );
}

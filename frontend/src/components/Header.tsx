import type { Mode } from '../types';
import { ModeToggle } from './ModeToggle';

interface HeaderProps {
  mode: Mode;
  setMode: (mode: Mode) => void;
}

export function Header({ mode, setMode }: HeaderProps) {
  return (
    <header className="h-12 border-b border-[var(--border)] bg-[var(--bg-surface)] px-4 flex items-center justify-between select-none">
      <div className="flex items-center gap-2">
        <span className="font-mono text-[13.5px] font-medium tracking-wider text-[var(--text-primary)]">
          NOMAD AI
        </span>
      </div>
      <ModeToggle mode={mode} setMode={setMode} />
    </header>
  );
}

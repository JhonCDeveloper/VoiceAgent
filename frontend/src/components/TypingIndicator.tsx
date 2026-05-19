export function TypingIndicator() {
  return (
    <div className="flex items-center space-x-1 px-3 py-2.5 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-[8px] w-fit">
      <span className="w-1.5 h-1.5 bg-[var(--text-secondary)] rounded-full animate-pulse [animation-duration:1.2s]"></span>
      <span className="w-1.5 h-1.5 bg-[var(--text-secondary)] rounded-full animate-pulse [animation-duration:1.2s] [animation-delay:0.2s]"></span>
      <span className="w-1.5 h-1.5 bg-[var(--text-secondary)] rounded-full animate-pulse [animation-duration:1.2s] [animation-delay:0.4s]"></span>
    </div>
  );
}

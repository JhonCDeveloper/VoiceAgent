import { useState, useEffect, useRef } from 'react';

// --- Configuration & Data ---

const WEB_SEARCH_TEXTS = [
  'Scanning technical sources...',
  'Reading documentation...',
  'Searching trusted websites...',
  'Comparing online results...',
  'Looking through developer forums...',
  'Analyzing search results...',
  'Gathering external information...',
];

const CURRENCY_TEXTS = [
  'Verifying exchange rates...',
  'Fetching real-time currency data...',
  'Comparing market values...',
  'Calculating conversion...',
  'Checking latest forex prices...',
  'Synchronizing international rates...',
];

const GENERIC_TEXTS = [
  'Initializing autonomous process...',
  'Analyzing parameters...',
  'Computing operation...',
  'Finalizing execution...',
];

interface ToolMeta {
  title: string;
  icon: string;
  statusCycle: string[];
}

const TOOL_META: Record<string, ToolMeta> = {
  web_search: {
    title: 'Searching the Web',
    icon: '🌐',
    statusCycle: WEB_SEARCH_TEXTS,
  },
  currency_convert: {
    title: 'Using Currency Converter',
    icon: '💱',
    statusCycle: CURRENCY_TEXTS,
  },
};

const DEFAULT_META: ToolMeta = {
  title: 'Executing Tool',
  icon: '⚡',
  statusCycle: GENERIC_TEXTS,
};

// --- Subcomponents for Immersive Active States ---

function ActiveWebSearch({ meta, statusIdx }: { meta: ToolMeta; statusIdx: number }) {
  return (
    <div className="relative mb-3 w-full max-w-[340px] rounded-[8px] border border-cyan-900/40 bg-[#060d14] overflow-hidden shadow-[0_0_15px_rgba(8,145,178,0.15)]" style={{ animation: 'pulse-glow 3s infinite' }}>
      
      {/* Background Grid & Scanner Beam */}
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <div className="w-full h-full" style={{
            backgroundImage: 'linear-gradient(rgba(8, 145, 178, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(8, 145, 178, 0.2) 1px, transparent 1px)',
            backgroundSize: '16px 16px'
        }} />
        <div 
          className="absolute left-0 right-0 h-16 bg-gradient-to-b from-transparent via-cyan-500/40 to-transparent"
          style={{ animation: 'beam-scan 2.5s linear infinite' }}
        />
      </div>

      {/* Cyberpunk Data Streams & Pinging Nodes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute left-[15%] w-px h-[40px] bg-gradient-to-b from-transparent via-cyan-400 to-transparent opacity-60" style={{ animation: 'data-stream 2s linear infinite' }} />
        <div className="absolute left-[45%] w-px h-[60px] bg-gradient-to-b from-transparent via-cyan-400 to-transparent opacity-40" style={{ animation: 'data-stream 3s linear infinite 1s' }} />
        <div className="absolute left-[85%] w-px h-[30px] bg-gradient-to-b from-transparent via-cyan-400 to-transparent opacity-70" style={{ animation: 'data-stream 1.5s linear infinite 0.5s' }} />
        
        <div className="absolute top-[20%] left-[30%] w-1.5 h-1.5 bg-cyan-400 rounded-full">
          <div className="absolute inset-0 bg-cyan-400 rounded-full" style={{ animation: 'node-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
        </div>
        <div className="absolute top-[60%] left-[75%] w-1.5 h-1.5 bg-cyan-400 rounded-full">
          <div className="absolute inset-0 bg-cyan-400 rounded-full" style={{ animation: 'node-ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite 1s' }} />
        </div>
      </div>

      <div className="relative z-10 flex flex-col p-3 pt-6 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm">{meta.icon}</span>
          <span className="font-mono text-[12px] text-cyan-400 font-bold tracking-tight uppercase"
            style={{ backgroundImage: 'linear-gradient(90deg, #22d3ee 0%, #0891b2 50%, #22d3ee 100%)', backgroundSize: '200% auto', color: 'transparent', WebkitBackgroundClip: 'text', animation: 'shimmer 2s linear infinite' }}
          >
            {meta.title}
          </span>
          <div className="ml-auto flex gap-1 items-center bg-cyan-950/50 px-2 py-0.5 rounded-full border border-cyan-900/50">
            <span className="text-[8px] text-cyan-500/80 font-mono">LIVE</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-2 py-2 bg-[#020810]/80 rounded border border-cyan-900/40 backdrop-blur-md shadow-inner">
          <span className="text-cyan-500 text-[11px] font-mono opacity-80">&gt;</span>
          <span key={statusIdx} className="font-mono text-[11px] text-cyan-50 font-medium tracking-tight animate-pulse">
            {meta.statusCycle[statusIdx]}
          </span>
          <span className="w-1.5 h-3 bg-cyan-400 animate-pulse ml-auto" style={{ animationDuration: '0.8s' }} />
        </div>
      </div>
    </div>
  );
}

function ActiveCurrencyConvert({ meta, statusIdx }: { meta: ToolMeta; statusIdx: number }) {
  return (
    <div className="relative mb-3 w-full max-w-[340px] rounded-[8px] border border-emerald-900/40 bg-[#051109] overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.1)]" style={{ animation: 'pulse-glow-emerald 3s infinite' }}>
      
      {/* Ticker Tape */}
      <div className="absolute top-0 left-0 right-0 h-5 bg-emerald-950/40 border-b border-emerald-900/30 overflow-hidden flex items-center">
        <div className="flex whitespace-nowrap text-[9px] font-mono text-emerald-500/50" style={{ width: '200%', animation: 'ticker 15s linear infinite' }}>
          <span className="inline-block w-1/2">
            USD/EUR 0.92 • GBP/USD 1.26 • JPY/USD 0.0066 • EUR/JPY 163.5 • BTC/USD 64200 • ETH/USD 3450 • 
          </span>
          <span className="inline-block w-1/2">
            USD/EUR 0.92 • GBP/USD 1.26 • JPY/USD 0.0066 • EUR/JPY 163.5 • BTC/USD 64200 • ETH/USD 3450 • 
          </span>
        </div>
      </div>

      {/* Floating Symbols */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden mt-5">
        <span className="absolute bottom-[-10px] left-[10%] text-emerald-500/20 text-xs font-mono" style={{ animation: 'float-up 3s ease-in infinite' }}>$</span>
        <span className="absolute bottom-[-10px] left-[40%] text-emerald-500/20 text-sm font-mono" style={{ animation: 'float-up 4s ease-in infinite 1s' }}>€</span>
        <span className="absolute bottom-[-10px] left-[70%] text-emerald-500/20 text-xs font-mono" style={{ animation: 'float-up 3.5s ease-in infinite 2s' }}>¥</span>
        <span className="absolute bottom-[-10px] left-[85%] text-emerald-500/20 text-lg font-mono" style={{ animation: 'float-up 4.5s ease-in infinite 0.5s' }}>₿</span>
      </div>

      <div className="relative z-10 flex flex-col p-3 pt-7">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm">{meta.icon}</span>
          <span 
            className="font-mono text-[12px] text-emerald-400 font-semibold tracking-tight uppercase"
            style={{ backgroundImage: 'linear-gradient(90deg, #34d399 0%, #10b981 50%, #34d399 100%)', backgroundSize: '200% auto', color: 'transparent', WebkitBackgroundClip: 'text', animation: 'shimmer 2s linear infinite' }}
          >
            {meta.title}
          </span>
        </div>
        
        <div className="flex items-center gap-2 px-2 py-1.5 bg-emerald-950/20 rounded border border-emerald-900/30 backdrop-blur-sm">
          <svg className="w-3 h-3 text-emerald-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <span key={statusIdx} className="font-mono text-[11px] text-emerald-100/90 animate-pulse">
            {meta.statusCycle[statusIdx]}
          </span>
        </div>
      </div>
    </div>
  );
}

function ActiveGeneric({ meta, statusIdx }: { meta: ToolMeta; statusIdx: number }) {
  return (
    <div className="relative mb-3 w-full max-w-[340px] rounded-[8px] border border-[var(--tool-border)] bg-[var(--tool-bg)] overflow-hidden shadow-lg">
      <div className="relative z-10 flex flex-col p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm">{meta.icon}</span>
          <span className="font-mono text-[12px] text-[var(--tool-text)] font-semibold tracking-tight uppercase">
            {meta.title}
          </span>
        </div>
        
        <div className="flex items-center gap-2 px-2 py-1.5 bg-black/20 rounded border border-white/5">
          <div className="flex gap-[2px]">
            <span className="w-1 h-3 bg-[var(--tool-text)] rounded-sm" style={{ animation: 'waveform 0.5s ease-in-out infinite alternate' }} />
            <span className="w-1 h-3 bg-[var(--tool-text)] rounded-sm" style={{ animation: 'waveform 0.6s ease-in-out infinite alternate 0.1s' }} />
            <span className="w-1 h-3 bg-[var(--tool-text)] rounded-sm" style={{ animation: 'waveform 0.4s ease-in-out infinite alternate 0.2s' }} />
          </div>
          <span key={statusIdx} className="font-mono text-[11px] text-[var(--text-primary)]">
            {meta.statusCycle[statusIdx]}
          </span>
        </div>
      </div>
    </div>
  );
}


// --- Main ToolBadge Component ---

interface ToolBadgeProps {
  toolName: string | null;
  isLoading?: boolean;
}

export function ToolBadge({ toolName, isLoading = false }: ToolBadgeProps) {
  if (!toolName) return null;

  const meta = TOOL_META[toolName] ?? { ...DEFAULT_META, title: `Executing ${toolName}` };
  const [statusIdx, setStatusIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cycle through dynamic loading texts
  useEffect(() => {
    if (!isLoading) {
      setStatusIdx(0);
      return;
    }
    intervalRef.current = setInterval(() => {
      setStatusIdx((prev) => (prev + 1) % meta.statusCycle.length);
    }, 2200); // Slower, more cinematic rotation
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLoading, meta.statusCycle.length]);

  // ACTIVE STATE (Immersive execution card)
  if (isLoading) {
    if (toolName === 'web_search') {
      return <ActiveWebSearch meta={meta} statusIdx={statusIdx} />;
    }
    if (toolName === 'currency_convert') {
      return <ActiveCurrencyConvert meta={meta} statusIdx={statusIdx} />;
    }
    return <ActiveGeneric meta={meta} statusIdx={statusIdx} />;
  }

  // COMPLETED STATE (Persistent sleek log badge)
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 mb-2 text-[10px] font-mono border rounded-[4px] bg-[var(--tool-bg)]/50 border-[var(--tool-border)]/50 w-fit select-none opacity-80 hover:opacity-100 transition-opacity">
      <span className="text-emerald-500 font-bold">✓</span>
      <span className="text-[var(--text-secondary)] tracking-tight">
        {toolName}() executed successfully
      </span>
    </div>
  );
}

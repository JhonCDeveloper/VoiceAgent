import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl: string;
}

export function AudioPlayer({ audioUrl }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    // Attempt to auto-play on mount
    audio.play().catch((err) => {
      // Swallowed since browsers block autoplay prior to user interaction
      console.log('Autoplay deferred:', err);
    });

    return () => {
      audio.pause();
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioRef.current = null;
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        console.error('TTS playback error:', err);
      });
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '00:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    audioRef.current.currentTime = percentage * duration;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-3 px-3 py-2 mt-2 rounded-[6px] border border-[var(--border)] bg-[var(--bg-elevated)] w-[260px] select-none">
      {/* Play/Pause control */}
      <button
        type="button"
        onClick={togglePlay}
        className="w-6 h-6 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-[var(--text-primary)] focus:outline-none flex items-center justify-center transition-colors cursor-pointer"
        aria-label={isPlaying ? 'Pause response' : 'Play response'}
      >
        {isPlaying ? (
          <Pause className="w-2.5 h-2.5 fill-current" />
        ) : (
          <Play className="w-2.5 h-2.5 fill-current translate-x-[0.5px]" />
        )}
      </button>

      {/* Waveform visualizer */}
      <div className="flex items-center gap-[2px] h-3 w-8 px-1">
        <span
          className={`w-[2px] bg-[var(--text-secondary)] rounded-full transition-all duration-150 ${
            isPlaying ? 'animate-[waveform_0.6s_infinite_alternate]' : 'h-1.5'
          }`}
          style={{ animationDelay: '0.0s' }}
        />
        <span
          className={`w-[2px] bg-[var(--text-secondary)] rounded-full transition-all duration-150 ${
            isPlaying ? 'animate-[waveform_0.5s_infinite_alternate]' : 'h-2.5'
          }`}
          style={{ animationDelay: '0.15s' }}
        />
        <span
          className={`w-[2px] bg-[var(--text-secondary)] rounded-full transition-all duration-150 ${
            isPlaying ? 'animate-[waveform_0.7s_infinite_alternate]' : 'h-1'
          }`}
          style={{ animationDelay: '0.3s' }}
        />
        <span
          className={`w-[2px] bg-[var(--text-secondary)] rounded-full transition-all duration-150 ${
            isPlaying ? 'animate-[waveform_0.4s_infinite_alternate]' : 'h-2'
          }`}
          style={{ animationDelay: '0.45s' }}
        />
      </div>

      {/* Progress slider & labels */}
      <div className="flex-1 flex flex-col gap-1">
        <div
          onClick={handleProgressClick}
          className="h-1 bg-[var(--border)] rounded-full overflow-hidden cursor-pointer relative w-full"
        >
          <div
            className="h-full bg-[var(--text-primary)] rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        
        <div className="flex justify-between text-[9px] font-mono text-[var(--text-muted)] leading-none">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}

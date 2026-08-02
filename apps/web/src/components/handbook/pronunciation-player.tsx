'use client';

import { useState, useRef, useEffect } from 'react';
import { Volume2, Play, Pause, RotateCcw } from 'lucide-react';
import { API_BASE_URL } from '@/lib/constants';

interface PronunciationPlayerProps {
  pronunciationId: string;
  speakerAttribution?: string;
  speakerRegion?: string;
  pronunciationVariant?: string;
  className?: string;
}

// Global reference for active audio player singleton
let activeAudioRef: HTMLAudioElement | null = null;

export function PronunciationPlayer({
  pronunciationId,
  speakerAttribution,
  speakerRegion,
  pronunciationVariant,
  className = '',
}: PronunciationPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const audioUrl = `${API_BASE_URL}/api/v1/handbook/pronunciations/${pronunciationId}/audio`;

  useEffect(() => {
    return () => {
      if (audioRef.current && activeAudioRef === audioRef.current) {
        audioRef.current.pause();
        activeAudioRef = null;
      }
    };
  }, []);

  const togglePlay = () => {
    if (hasError) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.preload = 'metadata';

      audioRef.current.onended = () => {
        setIsPlaying(false);
      };

      audioRef.current.onerror = () => {
        setHasError(true);
        setIsPlaying(false);
      };
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (activeAudioRef && activeAudioRef !== audioRef.current) {
        activeAudioRef.pause();
      }
      activeAudioRef = audioRef.current;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setHasError(true);
        setIsPlaying(false);
      });
    }
  };

  const restartAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    if (!isPlaying) {
      togglePlay();
    }
  };

  return (
    <div className={`inline-flex flex-col gap-1.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 ${className}`}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          disabled={hasError}
          aria-label={isPlaying ? 'Tạm dừng phát âm' : 'Nghe phát âm tiếng Khmer'}
          className={`p-2.5 rounded-full transition-all flex items-center justify-center ${
            hasError
              ? 'bg-neutral-200 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600 cursor-not-allowed'
              : isPlaying
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
              : 'bg-amber-500 hover:bg-amber-600 text-white shadow'
          }`}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>

        <div className="flex flex-col">
          <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {pronunciationVariant || 'Phát âm Khmer'}
          </span>
          <span className="text-xs text-neutral-600 dark:text-neutral-400">
            {speakerRegion || 'Trà Vinh'} {speakerAttribution ? `• ${speakerAttribution}` : ''}
          </span>
        </div>

        {isPlaying && (
          <button
            type="button"
            onClick={restartAudio}
            aria-label="Phát lại từ đầu"
            className="ml-auto p-1.5 rounded-lg text-neutral-500 hover:text-amber-600 dark:hover:text-amber-400 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {hasError && (
        <span className="text-xs text-rose-600 dark:text-rose-400">
          Chưa có tệp phát âm thanh cho từ vựng này.
        </span>
      )}
    </div>
  );
}

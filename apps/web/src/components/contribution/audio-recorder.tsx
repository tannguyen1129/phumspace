"use client";

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, Upload, AlertCircle } from 'lucide-react';

interface AudioRecorderProps {
  onAudioReady: (file: File) => void;
  onClearAudio?: () => void;
}

export function AudioRecorder({ onAudioReady, onClearAudio }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [permissionError, setPermissionError] = useState<string>('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !navigator.mediaDevices?.getUserMedia) {
      setIsSupported(false);
    }
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    setPermissionError('');
    audioChunksRef.current = [];
    setRecordingTime(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        const recordedFile = new File([audioBlob], `ghi_am_${Date.now()}.webm`, {
          type: 'audio/webm',
        });
        onAudioReady(recordedFile);

        // Stop all audio stream tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      setPermissionError('Khởi tạo micro thất bại. Vui lòng cấp quyền micro cho trình duyệt hoặc sử dụng nút Upload bên dưới.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const clearRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setIsPlaying(false);
    setRecordingTime(0);
    if (onClearAudio) onClearAudio();
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      onAudioReady(file);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-100 flex items-center gap-2">
          <Mic className="w-4 h-4 text-amber-400" />
          Ghi âm trực tiếp / Upload âm thanh phát âm
        </h4>
        {audioUrl && (
          <button
            onClick={clearRecording}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
            type="button"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Xóa
          </button>
        )}
      </div>

      {permissionError && (
        <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/40 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {permissionError}
        </div>
      )}

      {/* Recording Interface */}
      {isSupported && !audioUrl && (
        <div className="text-center py-6 space-y-4">
          <div className="text-2xl font-extrabold text-amber-400 font-mono">
            {formatTime(recordingTime)}
          </div>

          {!isRecording ? (
            <button
              onClick={startRecording}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 text-slate-950 font-extrabold text-xs hover:opacity-95 shadow-lg shadow-rose-500/20 transition-all"
              type="button"
            >
              <Mic className="w-4 h-4" />
              Bắt đầu ghi âm
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-600 text-slate-100 font-extrabold text-xs animate-pulse hover:bg-rose-500 transition-all"
              type="button"
            >
              <Square className="w-4 h-4 fill-current" />
              Dừng ghi âm
            </button>
          )}
        </div>
      )}

      {/* Audio Playback Interface */}
      {audioUrl && (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
          <audio
            ref={audioPlayerRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
          <button
            onClick={togglePlayback}
            className="h-10 w-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold hover:bg-amber-400 transition-colors"
            type="button"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
          <div className="flex-1">
            <p className="text-xs font-semibold text-slate-200">Bản ghi âm đã sẵn sàng</p>
            <span className="text-[11px] text-slate-400 font-mono">Thời lượng: {formatTime(recordingTime)}</span>
          </div>
        </div>
      )}

      {/* Fallback File Upload */}
      <div className="pt-2 border-t border-slate-800/80">
        <label className="cursor-pointer inline-flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors">
          <Upload className="w-4 h-4 text-amber-400" />
          <span>Hoặc chọn tệp audio từ máy (MP3, WAV, WebM, OGG &lt; 25MB)</span>
          <input
            type="file"
            accept="audio/mp3,audio/wav,audio/webm,audio/ogg,audio/mpeg"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}

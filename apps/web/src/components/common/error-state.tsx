"use client";

import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Không thể tải dữ liệu từ API',
  message = 'Đã xảy ra sự cố khi kết nối tới máy chủ PhumSpace API. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-10 rounded-2xl bg-rose-950/20 border border-rose-900/40 my-8 space-y-4 shadow-lg">
      <div className="h-14 w-14 rounded-full bg-rose-900/40 flex items-center justify-center text-rose-400">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <div className="space-y-1 max-w-md">
        <h3 className="text-lg font-semibold text-rose-200">{title}</h3>
        <p className="text-xs text-rose-300/80 leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-500 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-400"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Thử lại
        </button>
      )}
    </div>
  );
}

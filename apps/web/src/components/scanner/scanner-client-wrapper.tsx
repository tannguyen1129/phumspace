"use client";

import { useState, useRef } from 'react';
import type { ScanResponseContract } from '@phumspace/contracts';
import { apiClient, ApiError } from '@/lib/api-client';
import { ScannerPrivacyNotice } from './scanner-privacy-notice';
import { ImagePicker } from './image-picker';
import { ImagePreview } from './image-preview';
import { ScanProgress } from './scan-progress';
import { ScanResult } from './scan-result';
import { ScanErrorState } from './scan-error-state';

export type ScannerState = 'IDLE' | 'PREVIEW' | 'ANALYZING' | 'RESULT' | 'ERROR';

export function ScannerClientWrapper() {
  const [state, setState] = useState<ScannerState>('IDLE');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scanResponse, setScanResponse] = useState<ScanResponseContract | null>(null);
  const [errorInfo, setErrorInfo] = useState<{ code?: string; message?: string }>({});

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSelectFile = (file: File) => {
    setSelectedFile(file);
    setScanResponse(null);
    setErrorInfo({});
    setState('PREVIEW');
  };

  const handleClear = () => {
    setSelectedFile(null);
    setScanResponse(null);
    setErrorInfo({});
    setState('IDLE');
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setState('ANALYZING');
    setErrorInfo({});

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await apiClient.uploadScanImage(selectedFile, controller.signal);
      setScanResponse(res);
      setState('RESULT');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errorCode === 'SCAN_CANCELLED') {
          setState('PREVIEW');
          return;
        }
        setErrorInfo({ code: err.errorCode, message: err.message });
      } else {
        setErrorInfo({ message: err instanceof Error ? err.message : 'Không thể gửi yêu cầu phân tích' });
      }
      setState('ERROR');
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleCancelAnalyze = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState('PREVIEW');
  };

  const handleValidationError = (msg: string) => {
    setErrorInfo({ message: msg });
    setState('ERROR');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Privacy Notice Notice Bar */}
      <ScannerPrivacyNotice />

      {/* State Machine Rendering */}
      {state === 'IDLE' && (
        <ImagePicker onSelectFile={handleSelectFile} onError={handleValidationError} />
      )}

      {state === 'PREVIEW' && selectedFile && (
        <ImagePreview file={selectedFile} onClear={handleClear} onAnalyze={handleAnalyze} />
      )}

      {state === 'ANALYZING' && (
        <ScanProgress onCancel={handleCancelAnalyze} />
      )}

      {state === 'RESULT' && scanResponse && (
        <ScanResult scanResponse={scanResponse} onReset={handleClear} />
      )}

      {state === 'ERROR' && (
        <ScanErrorState
          errorCode={errorInfo.code}
          message={errorInfo.message}
          onRetry={() => {
            if (selectedFile) {
              setState('PREVIEW');
            } else {
              handleClear();
            }
          }}
        />
      )}
    </div>
  );
}

import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ScanErrorStateProps {
  errorCode?: string;
  message?: string;
  onRetry: () => void;
}

export function ScanErrorState({ errorCode, message, onRetry }: ScanErrorStateProps) {
  const getFriendlyMessage = (): string => {
    switch (errorCode) {
      case 'INVALID_IMAGE':
        return 'Tệp hình ảnh rỗng hoặc không hợp lệ. Vui lòng chọn lại ảnh.';
      case 'IMAGE_TOO_LARGE':
        return 'Ảnh vượt quá kích thước cho phép (tối đa 5 MB). Vui lòng chọn tấm ảnh nhỏ hơn.';
      case 'UNSUPPORTED_IMAGE_TYPE':
        return 'Định dạng tệp không được hỗ trợ. Vui lòng sử dụng tệp ảnh JPEG, PNG hoặc WebP.';
      case 'AI_PROVIDER_UNAVAILABLE':
        return 'Dịch vụ phân tích AI đang tạm thời không phản hồi. Vui lòng thử lại sau giây lát.';
      case 'AI_RESPONSE_INVALID':
        return 'Hệ thống chưa thể xử lý kết quả phân tích. Vui lòng thử lại với tấm ảnh khác.';
      case 'NO_PUBLISHED_CANDIDATES':
        return 'PhumData chưa có dữ liệu di sản công bố phù hợp với hình ảnh này.';
      case 'SCAN_RATE_LIMITED':
        return 'Bạn đã gửi quá nhiều yêu cầu phân tích. Vui lòng chờ 1 phút và thử lại.';
      case 'SCAN_CANCELLED':
        return 'Đã hủy quá trình phân tích hình ảnh.';
      default:
        return message || 'Đã xảy ra sự cố khi phân tích hình ảnh. Vui lòng thử lại.';
    }
  };

  return (
    <div
      role="alert"
      className="p-8 sm:p-12 rounded-3xl bg-rose-950/20 border border-rose-900/40 text-center space-y-5 shadow-xl"
    >
      <div className="h-14 w-14 rounded-full bg-rose-900/40 text-rose-400 flex items-center justify-center mx-auto">
        <AlertTriangle className="w-7 h-7" />
      </div>

      <div className="space-y-1.5 max-w-md mx-auto">
        <h3 className="text-lg font-bold text-rose-200">Không thể phân tích hình ảnh</h3>
        <p className="text-xs text-rose-300/80 leading-relaxed">{getFriendlyMessage()}</p>
      </div>

      <div>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500 transition-colors shadow-lg"
        >
          <RefreshCw className="w-4 h-4" />
          Thử lại
        </button>
      </div>
    </div>
  );
}

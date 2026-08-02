import { Metadata } from 'next';
import { ScannerClientWrapper } from '@/components/scanner/scanner-client-wrapper';

export const metadata: Metadata = {
  title: 'AI Cultural Scanner — PhumSpace',
  description: 'Quét và nhận diện di sản văn hóa Khmer Nam Bộ bằng trí tuệ nhân tạo đối chiếu kho tri thức PhumData công bố.',
};

export default function ScannerPage() {
  return (
    <div className="space-y-6 py-8">
      {/* Header Banner */}
      <div className="space-y-2 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-100">
          AI Cultural Scanner
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Nhận diện đặc điểm thị giác công trình kiến trúc, di vật và hoa văn văn hóa Khmer, kiểm chứng minh bạch với kho tư liệu PhumData.
        </p>
      </div>

      <ScannerClientWrapper />
    </div>
  );
}

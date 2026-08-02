import { ContributionWizard } from '@/components/contribution/contribution-wizard';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewContributionPage() {
  return (
    <div className="py-8 space-y-6 max-w-3xl mx-auto">
      <Link
        href="/dong-gop"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại danh sách đóng góp
      </Link>

      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-100">Đóng góp Tư liệu Văn hóa Mới</h1>
        <p className="text-xs text-slate-400">
          Vui lòng hoàn thành 5 bước dưới đây để gửi tư liệu vào hàng đợi kiểm duyệt của PhumSpace.
        </p>
      </div>

      <ContributionWizard />
    </div>
  );
}

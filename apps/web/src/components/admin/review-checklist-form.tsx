"use client";

import { useState } from 'react';
import type { AdminReviewChecklistContract } from '@phumspace/contracts';
import { CheckSquare, Square, ShieldCheck } from 'lucide-react';

interface ReviewChecklistFormProps {
  initialState?: Partial<AdminReviewChecklistContract>;
  onChange: (checklist: AdminReviewChecklistContract) => void;
}

export function ReviewChecklistForm({ initialState, onChange }: ReviewChecklistFormProps) {
  const [checklist, setChecklist] = useState<AdminReviewChecklistContract>({
    culturalScope: initialState?.culturalScope ?? true,
    verifiability: initialState?.verifiability ?? true,
    sourceValidity: initialState?.sourceValidity ?? true,
    contributorRightsConfirmed: initialState?.contributorRightsConfirmed ?? true,
    publicDisplayConsent: initialState?.publicDisplayConsent ?? true,
    educationalConsent: initialState?.educationalConsent ?? true,
    aiConsent: initialState?.aiConsent ?? false,
    privacyPass: initialState?.privacyPass ?? true,
    culturalSafetyPass: initialState?.culturalSafetyPass ?? true,
    expertConsultationNeeded: initialState?.expertConsultationNeeded ?? false,
  });

  const toggleKey = (key: keyof AdminReviewChecklistContract) => {
    const updated = { ...checklist, [key]: !checklist[key] };
    setChecklist(updated);
    onChange(updated);
  };

  const checklistItems: { key: keyof AdminReviewChecklistContract; label: string; desc: string }[] = [
    { key: 'culturalScope', label: '1. Đúng Phạm vi Văn hóa', desc: 'Nội dung thuộc về di sản/văn hóa Khmer Nam Bộ.' },
    { key: 'verifiability', label: '2. Khả năng Kiểm chứng', desc: 'Đủ dữ liệu thông tin để đối chiếu tài liệu trích dẫn.' },
    { key: 'sourceValidity', label: '3. Nguồn gốc Rõ ràng', desc: 'Có người cung cấp hoặc địa chỉ khảo sát rõ ràng.' },
    { key: 'contributorRightsConfirmed', label: '4. Tác quyền Người gửi', desc: 'Contributor đã tick chọn khẳng định quyền cung cấp.' },
    { key: 'publicDisplayConsent', label: '5. Consent Hiển thị Công khai', desc: 'Cho phép hiển thị công khai trên ứng dụng (allowPublicDisplay).' },
    { key: 'educationalConsent', label: '6. Consent Sử dụng Giáo dục', desc: 'Cho phép sử dụng trong tài liệu giáo dục văn hóa.' },
    { key: 'aiConsent', label: '7. Consent Xử lý Gemini AI', desc: 'Cho phép phân tích AI Cultural Scanner.' },
    { key: 'privacyPass', label: '8. Bảo mật Dữ liệu Cá nhân', desc: 'Media không vi phạm quyền riêng tư khuôn mặt.' },
    { key: 'culturalSafetyPass', label: '9. An toàn Tôn giáo & Nhạy cảm', desc: 'Không chứa nội dung mâu thuẫn sắc tộc hay tôn giáo.' },
    { key: 'expertConsultationNeeded', label: '10. Cần Tham vấn Hội đồng', desc: 'Đánh dấu nếu cần chuyên gia hội đồng góp ý thêm.' },
  ];

  return (
    <fieldset className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
      <legend className="text-xs font-bold text-amber-400 flex items-center gap-2 px-2">
        <ShieldCheck className="w-4 h-4" />
        10 Tiêu chí Thẩm định Chất lượng &amp; Quyền tác giả
      </legend>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {checklistItems.map((item) => {
          const isChecked = checklist[item.key];
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => toggleKey(item.key)}
              className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                isChecked
                  ? 'bg-amber-500/10 border-amber-500/40 text-slate-100'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400'
              }`}
            >
              {isChecked ? (
                <CheckSquare className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              ) : (
                <Square className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <p className="text-xs font-bold">{item.label}</p>
                <p className="text-[11px] text-slate-400 leading-normal">{item.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

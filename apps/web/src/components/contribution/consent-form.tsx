"use client";

import { ShieldCheck, HelpCircle } from 'lucide-react';

export interface ConsentFormState {
  contributorOwnsRights: boolean;
  allowPublicDisplay: boolean;
  allowEducationalUse: boolean;
  allowResearchUse: boolean;
  allowCommercialUse: boolean;
  allowAiProcessing: boolean;
  attributionPreference: string;
}

interface ConsentFormProps {
  value: ConsentFormState;
  onChange: (value: ConsentFormState) => void;
}

export function ConsentForm({ value, onChange }: ConsentFormProps) {
  const toggleField = (field: keyof ConsentFormState) => {
    if (field === 'contributorOwnsRights') {
      onChange({ ...value, contributorOwnsRights: !value.contributorOwnsRights });
    } else if (typeof value[field] === 'boolean') {
      onChange({ ...value, [field]: !value[field] });
    }
  };

  const handleAttributionChange = (pref: string) => {
    onChange({ ...value, attributionPreference: pref });
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
      <div className="flex items-center gap-3 text-amber-400">
        <ShieldCheck className="w-6 h-6" />
        <div>
          <h3 className="text-sm font-bold text-slate-100">Bản quyền &amp; Quyền sử dụng tư liệu</h3>
          <p className="text-xs text-slate-400">Minh bạch điều khoản bảo vệ tư liệu văn hóa của cộng đồng</p>
        </div>
      </div>

      {/* Mandatory Consent */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={value.contributorOwnsRights}
            onChange={() => toggleField('contributorOwnsRights')}
            className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
          />
          <span className="text-xs font-bold text-amber-200">
            Tôi xác nhận tôi là tác giả sở hữu hoặc có đầy đủ quyền cung cấp tư liệu/nội dung này cho PhumSpace. (Bắt buộc)
          </span>
        </label>
      </div>

      {/* Granular Optional Consents */}
      <div className="space-y-4 pt-2">
        <h4 className="text-xs font-bold text-slate-300">Tùy chọn Phạm vi Chia sẻ:</h4>

        <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-slate-200">Hiển thị công khai</span>
            <p className="text-[11px] text-slate-400">Cho phép hiển thị tư liệu trên cổng thông tin PhumSpace sau khi kiểm duyệt</p>
          </div>
          <input
            type="checkbox"
            checked={value.allowPublicDisplay}
            onChange={() => toggleField('allowPublicDisplay')}
            className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
          />
        </label>

        <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-slate-200">Sử dụng cho Giáo dục &amp; Học tập</span>
            <p className="text-[11px] text-slate-400">Cho phép đưa tư liệu vào các bài thử thách quiz kiến thức giáo dục</p>
          </div>
          <input
            type="checkbox"
            checked={value.allowEducationalUse}
            onChange={() => toggleField('allowEducationalUse')}
            className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
          />
        </label>

        <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-slate-200">Sử dụng cho Nghiên cứu Văn hóa</span>
            <p className="text-[11px] text-slate-400">Cho phép các nhà nghiên cứu tham chiếu tư liệu lưu trữ PhumData</p>
          </div>
          <input
            type="checkbox"
            checked={value.allowResearchUse}
            onChange={() => toggleField('allowResearchUse')}
            className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
          />
        </label>

        <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-slate-200">Cho phép Xử lý AI Gemini</span>
            <p className="text-[11px] text-slate-400">Nếu tắt, tệp và mô tả của bạn sẽ tuyệt đối KHÔNG bao giờ gửi tới AI</p>
          </div>
          <input
            type="checkbox"
            checked={value.allowAiProcessing}
            onChange={() => toggleField('allowAiProcessing')}
            className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
          />
        </label>
      </div>

      {/* Attribution Preference */}
      <div className="space-y-2 pt-2">
        <h4 className="text-xs font-bold text-slate-300">Tùy chọn Ghi danh Tác giả:</h4>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'COMMUNITY', label: 'Cộng đồng PhumSpace' },
            { id: 'DISPLAY_NAME', label: 'Tên hiển thị Guest' },
            { id: 'ANONYMOUS', label: 'Ẩn danh' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleAttributionChange(item.id)}
              className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                value.attributionPreference === item.id
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

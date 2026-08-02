"use client";

import type { AdminPublicationPlanContract } from '@phumspace/contracts';
import { Send, FileCode, CheckCircle2 } from 'lucide-react';

interface PublicationMappingFormProps {
  plan: AdminPublicationPlanContract;
  onChange: (updated: AdminPublicationPlanContract) => void;
  onSubmit: () => void;
  loading: boolean;
}

export function PublicationMappingForm({ plan, onChange, onSubmit, loading }: PublicationMappingFormProps) {
  const updateField = (key: keyof AdminPublicationPlanContract, value: any) => {
    onChange({ ...plan, [key]: value });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6"
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <FileCode className="w-4 h-4 text-amber-400" />
          Kế hoạch Xuất bản PhumData (Publication Plan Mapping)
        </h3>
        <span className="text-[10px] font-bold px-2 py-1 rounded bg-amber-500/20 text-amber-400 font-mono">
          ADMIN Role Required
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">
            Phương án Xuất bản
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => updateField('publicationTarget', 'NEW_ENTITY')}
              className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                plan.publicationTarget === 'NEW_ENTITY'
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              Tạo mới Di sản (NEW_ENTITY)
            </button>
            <button
              type="button"
              onClick={() => updateField('publicationTarget', 'UPDATE_ENTITY')}
              className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                plan.publicationTarget === 'UPDATE_ENTITY'
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              Cập nhật Di sản (UPDATE_ENTITY)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Mã Định danh Chuẩn (Canonical Code) *
            </label>
            <input
              type="text"
              value={plan.canonicalCode}
              onChange={(e) => updateField('canonicalCode', e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Phân loại Di sản (Entity Type) *
            </label>
            <select
              value={plan.entityType}
              onChange={(e) => updateField('entityType', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono"
            >
              <option value="ARCHITECTURE">ARCHITECTURE (Kiến trúc)</option>
              <option value="FESTIVAL">FESTIVAL (Lễ hội)</option>
              <option value="PERFORMING_ART">PERFORMING_ART (Nghệ thuật trình diễn)</option>
              <option value="ARTIFACT">ARTIFACT (Hiện vật)</option>
              <option value="CRAFT">CRAFT (Nghề thủ công)</option>
              <option value="BELIEF">BELIEF (Tín ngưỡng)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Tên Tiếng Việt Chính thức *
            </label>
            <input
              type="text"
              value={plan.preferredViName}
              onChange={(e) => updateField('preferredViName', e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Tên Tiếng Khmer
            </label>
            <input
              type="text"
              value={plan.preferredKmName || ''}
              onChange={(e) => updateField('preferredKmName', e.target.value)}
              placeholder="វត្ត..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-semibold"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">
            Mô tả Tóm tắt Chuẩn (Summary) *
          </label>
          <textarea
            value={plan.summary}
            onChange={(e) => updateField('summary', e.target.value)}
            rows={3}
            required
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">
            Nhãn Mức độ Thẩm định (Verification Outcome)
          </label>
          <select
            value={plan.verificationOutcome}
            onChange={(e) => updateField('verificationOutcome', e.target.value as any)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 text-xs font-bold font-mono"
          >
            <option value="SOURCE_VERIFIED">SOURCE_VERIFIED (Đã xác minh nguồn trích dẫn)</option>
            <option value="EXPERT_REVIEWED">EXPERT_REVIEWED (Đã thẩm định bởi hội đồng chuyên gia)</option>
            <option value="COMMUNITY_CONFIRMED">COMMUNITY_CONFIRMED (Cộng đồng xác nhận)</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-extrabold text-xs hover:opacity-95 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
      >
        <Send className="w-4 h-4" />
        Xác nhận Xuất bản vào PhumData Core
      </button>
    </form>
  );
}

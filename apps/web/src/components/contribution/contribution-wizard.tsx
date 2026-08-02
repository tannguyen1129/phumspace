"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, ApiError } from '@/lib/api-client';
import { AudioRecorder } from './audio-recorder';
import { ConsentForm, ConsentFormState } from './consent-form';
import {
  FileText,
  Upload,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  Mic,
  BookOpen,
} from 'lucide-react';

const CONTRIBUTION_TYPES = [
  { id: 'NEW_HERITAGE_CONTENT', label: 'Di sản văn hóa mới', desc: 'Đề xuất di sản, di vật hoặc công trình chưa có trên PhumSpace' },
  { id: 'CORRECTION', label: 'Đính chính / Chỉnh sửa', desc: 'Đề xuất sửa nội dung di sản hiện có' },
  { id: 'LOCAL_NAME', label: 'Tên gọi địa phương', desc: 'Tên dân gian truyền miệng tại địa phương' },
  { id: 'KHMER_LANGUAGE', label: 'Từ ngữ Khmer Nam Bộ', desc: 'Từ ngữ, cụm từ tiếng Khmer' },
  { id: 'AUDIO_RECORDING', label: 'Bản ghi âm phát âm / Truyện', desc: 'Phát âm chuẩn tiếng Khmer hoặc truyện dân gian' },
  { id: 'IMAGE_MEDIA', label: 'Hình ảnh tư liệu', desc: 'Ảnh chụp tư liệu chùa chiền, lễ hội, di vật' },
  { id: 'PLACE_INFORMATION', label: 'Thông tin địa điểm', desc: 'Địa chỉ, vị trí không gian văn hóa' },
  { id: 'CULTURAL_STORY', label: 'Câu chuyện di sản', desc: 'Hồi ký, truyền thuyết truyền miệng' },
];

export function ContributionWizard() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Form State
  const [contributionType, setContributionType] = useState<string>('NEW_HERITAGE_CONTENT');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [languageCode, setLanguageCode] = useState<string>('vi');
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  const [consent, setConsent] = useState<ConsentFormState>({
    contributorOwnsRights: false,
    allowPublicDisplay: true,
    allowEducationalUse: true,
    allowResearchUse: true,
    allowCommercialUse: false,
    allowAiProcessing: false,
    attributionPreference: 'COMMUNITY',
  });

  const nextStep = () => {
    setErrorMsg('');
    if (step === 1 && !contributionType) {
      setErrorMsg('Vui lòng chọn loại đóng góp.');
      return;
    }
    if (step === 2 && (!title.trim() || !description.trim())) {
      setErrorMsg('Vui lòng nhập đầy đủ Tiêu đề và Nội dung mô tả.');
      return;
    }
    if (step === 4 && !consent.contributorOwnsRights) {
      setErrorMsg('Bạn phải xác nhận sở hữu hoặc có quyền cung cấp tư liệu.');
      return;
    }
    setStep((prev) => Math.min(prev + 1, 5));
  };

  const prevStep = () => {
    setErrorMsg('');
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // 1. Ensure guest session
      await apiClient.ensurePassportSession();

      // 2. Create contribution in DRAFT
      const detail = await apiClient.createContribution({
        contributionType,
        title,
        description,
        languageCode,
        consent: {
          contributorOwnsRights: consent.contributorOwnsRights,
          allowPublicDisplay: consent.allowPublicDisplay,
          allowEducationalUse: consent.allowEducationalUse,
          allowResearchUse: consent.allowResearchUse,
          allowCommercialUse: consent.allowCommercialUse,
          allowAiProcessing: consent.allowAiProcessing,
          attributionPreference: consent.attributionPreference,
        },
        submitImmediately: false,
      });

      // 3. Upload media if present
      if (mediaFile) {
        await apiClient.uploadContributionMedia(detail.publicId, mediaFile);
      }

      // 4. Submit to moderation queue
      await apiClient.submitContribution(detail.publicId);

      // Redirect to detail view
      router.push(`/dong-gop/${detail.publicId}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Không thể gửi bản đóng góp. Vui lòng kiểm tra lại kết nối.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Wizard Progress Indicator */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-400 font-mono">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center border ${
                step === i
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold'
                  : step > i
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-slate-900 border-slate-800 text-slate-600'
              }`}
            >
              {step > i ? '✓' : i}
            </div>
          </div>
        ))}
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/40 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Step 1: Contribution Type */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-100">Bước 1: Chọn Loại Đóng góp</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CONTRIBUTION_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setContributionType(type.id)}
                className={`p-4 rounded-2xl border text-left space-y-1 transition-all ${
                  contributionType === type.id
                    ? 'bg-slate-900 border-amber-500 text-slate-100 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <h4 className="text-xs font-bold text-slate-200">{type.label}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">{type.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Content & Title */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-100">Bước 2: Tiêu đề &amp; Nội dung Chi tiết</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Tiêu đề đóng góp <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Bổ sung nguồn gốc tên gọi Chùa Âng..."
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Nội dung mô tả chi tiết <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả nguồn gốc, thông tin chi tiết hoặc câu chuyện di sản..."
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Media File */}
      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-100">Bước 3: Đính kèm Tệp Phương tiện (Tùy chọn)</h2>
          <AudioRecorder onAudioReady={(file) => setMediaFile(file)} />

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-100 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-amber-400" />
              Tải lên hình ảnh tư liệu
            </h4>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
              className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700"
            />
            {mediaFile && (
              <p className="text-xs text-emerald-400 font-mono">
                Đã chọn tệp: {mediaFile.name} ({(mediaFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
        </div>
      )}

      {/* Step 4: Consent Form */}
      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-100">Bước 4: Quyền sử dụng &amp; Consent</h2>
          <ConsentForm value={consent} onChange={setConsent} />
        </div>
      )}

      {/* Step 5: Review & Submit */}
      {step === 5 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-100">Bước 5: Kiểm tra &amp; Gửi Kiểm duyệt</h2>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 text-xs">
            <div>
              <span className="text-slate-400">Loại đóng góp:</span>
              <p className="font-bold text-amber-400">
                {CONTRIBUTION_TYPES.find((t) => t.id === contributionType)?.label}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Tiêu đề:</span>
              <p className="font-bold text-slate-100">{title}</p>
            </div>
            <div>
              <span className="text-slate-400">Mô tả:</span>
              <p className="text-slate-300 whitespace-pre-wrap">{description}</p>
            </div>
            {mediaFile && (
              <div>
                <span className="text-slate-400">Tệp phương tiện:</span>
                <p className="font-bold text-emerald-400">{mediaFile.name}</p>
              </div>
            )}
            <div>
              <span className="text-slate-400">Xác nhận bản quyền:</span>
              <p className="font-bold text-emerald-400">✓ Đã xác nhận sở hữu tác quyền</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        {step > 1 ? (
          <button
            onClick={prevStep}
            className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2"
            type="button"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>
        ) : (
          <div />
        )}

        {step < 5 ? (
          <button
            onClick={nextStep}
            className="px-6 py-3 rounded-xl bg-amber-500 text-slate-950 text-xs font-extrabold hover:bg-amber-400 transition-colors flex items-center gap-2 shadow-lg shadow-amber-500/20"
            type="button"
          >
            Tiếp tục
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 text-xs font-extrabold hover:opacity-95 transition-opacity flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
            type="button"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Gửi kiểm duyệt
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

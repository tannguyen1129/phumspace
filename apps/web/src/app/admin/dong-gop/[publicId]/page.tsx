"use client";

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { AdminContributionDetailContract, AdminReviewChecklistContract, StaffProfileContract } from '@phumspace/contracts';
import { apiClient } from '@/lib/api-client';
import { ReviewChecklistForm } from '@/components/admin/review-checklist-form';
import { API_BASE_URL } from '@/lib/constants';
import {
  FileCheck2,
  ShieldCheck,
  Paperclip,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowLeft,
  Send,
  Loader2,
  Volume2,
  Image as ImageIcon,
} from 'lucide-react';

export default function AdminContributionDetailPage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = use(params);
  const router = useRouter();

  const [detail, setDetail] = useState<AdminContributionDetailContract | null>(null);
  const [profile, setProfile] = useState<StaffProfileContract | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'CONTENT' | 'CONSENT' | 'CHECKLIST'>('CONTENT');

  const [publicMessage, setPublicMessage] = useState<string>('');
  const [internalNote, setInternalNote] = useState<string>('');
  const [checklist, setChecklist] = useState<AdminReviewChecklistContract | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [detailData, profileData] = await Promise.all([
        apiClient.getAdminContributionDetail(publicId),
        apiClient.getAdminProfile(),
      ]);
      setDetail(detailData);
      setProfile(profileData);
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể tải thông tin đóng góp.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [publicId]);

  const handleAssignSelf = async () => {
    try {
      await apiClient.assignAdminReview(publicId);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRequestInfo = async () => {
    if (!publicMessage.trim()) {
      alert('Vui lòng nhập tin nhắn hướng dẫn bổ sung thông tin.');
      return;
    }
    setActionLoading(true);
    try {
      await apiClient.requestAdminInformation(publicId, publicMessage, detail?.version);
      alert('Đã gửi yêu cầu bổ sung thông tin thành công.');
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecommendation = async (recommendation: string) => {
    setActionLoading(true);
    try {
      await apiClient.submitAdminRecommendation(publicId, {
        recommendation,
        internalNote,
        checklistResult: checklist,
      });
      alert(`Đã lưu khuyến nghị ${recommendation}.`);
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await apiClient.approveAdminContribution(publicId, internalNote, detail?.version);
      alert('Đã phê duyệt đóng góp thành công!');
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!publicMessage.trim()) {
      alert('Vui lòng nhập lý do từ chối gửi cho người đóng góp.');
      return;
    }
    setActionLoading(true);
    try {
      await apiClient.rejectAdminContribution(publicId, publicMessage, 'OUT_OF_SCOPE', detail?.version);
      alert('Đã từ chối bài đóng góp.');
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-slate-400 text-xs gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
        Đang tải thông tin đóng góp...
      </div>
    );
  }

  if (errorMsg || !detail) {
    return (
      <div className="p-8 text-center rounded-3xl bg-rose-950/20 border border-rose-900/40 text-rose-300 text-xs space-y-3">
        <p>{errorMsg || 'Không thể hiển thị đóng góp.'}</p>
        <Link href="/admin/dong-gop" className="inline-flex items-center gap-1.5 text-amber-400 font-bold">
          <ArrowLeft className="w-4 h-4" /> Quay lại hàng đợi
        </Link>
      </div>
    );
  }

  const isEditor = profile?.roles.includes('EDITOR') || profile?.roles.includes('ADMIN');
  const isAdmin = profile?.roles.includes('ADMIN');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <Link href="/admin/dong-gop" className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Hàng đợi Kiểm duyệt
          </Link>
          <h1 className="text-xl font-extrabold text-slate-100">{detail.title}</h1>
          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span>ID: <code className="text-amber-400">{detail.publicId}</code></span>
            <span>Trạng thái: <code className="text-emerald-400 font-bold">{detail.status}</code></span>
            <span>Version: {detail.version}</span>
          </div>
        </div>

        {detail.status === 'APPROVED' && isAdmin && (
          <Link
            href={`/admin/dong-gop/${detail.publicId}/xuat-ban`}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-extrabold text-xs hover:opacity-95 transition-opacity flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <Send className="w-4 h-4" />
            Tiến hành Xuất bản vào PhumData Core
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-6 text-xs font-bold text-slate-400">
        <button
          onClick={() => setActiveTab('CONTENT')}
          className={`pb-3 border-b-2 transition-colors ${activeTab === 'CONTENT' ? 'border-amber-400 text-amber-400' : 'border-transparent hover:text-slate-200'}`}
        >
          1. Nội dung &amp; Private Media ({detail.media.length})
        </button>
        <button
          onClick={() => setActiveTab('CONSENT')}
          className={`pb-3 border-b-2 transition-colors ${activeTab === 'CONSENT' ? 'border-amber-400 text-amber-400' : 'border-transparent hover:text-slate-200'}`}
        >
          2. Quyền tác giả &amp; Consent Gate
        </button>
        <button
          onClick={() => setActiveTab('CHECKLIST')}
          className={`pb-3 border-b-2 transition-colors ${activeTab === 'CHECKLIST' ? 'border-amber-400 text-amber-400' : 'border-transparent hover:text-slate-200'}`}
        >
          3. 10-Point Review Checklist &amp; Notes
        </button>
      </div>

      {/* Tab 1: Content & Media */}
      {activeTab === 'CONTENT' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mô tả đóng góp</h3>
            <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">{detail.description}</p>
          </div>

          {detail.media.length > 0 && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-amber-400" />
                Tệp phương tiện đính kèm Private
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {detail.media.map((m) => {
                  const streamUrl = `${API_BASE_URL}/api/v1/admin/contributions/${detail.publicId}/media/${m.id}`;
                  return (
                    <div key={m.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="flex items-center gap-1.5 text-slate-300">
                          {m.mediaType === 'AUDIO' ? <Volume2 className="w-4 h-4 text-sky-400" /> : <ImageIcon className="w-4 h-4 text-emerald-400" />}
                          {m.originalFileName}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">{(m.sizeBytes / 1024 / 1024).toFixed(2)} MB</span>
                      </div>

                      {m.mediaType === 'IMAGE' ? (
                        <img src={streamUrl} alt={m.originalFileName} className="w-full h-48 object-cover rounded-lg border border-slate-800" />
                      ) : (
                        <audio controls src={streamUrl} className="w-full h-10" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Consent Gate */}
      {activeTab === 'CONSENT' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-amber-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Điều kiện Tác quyền &amp; Consent Gate
          </h3>

          {detail.consent ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span>Quyền tác giả (contributorOwnsRights):</span>
                <span className={detail.consent.contributorOwnsRights ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {detail.consent.contributorOwnsRights ? 'ĐẠT (true)' : 'KHÔNG ĐẠT (false)'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span>Consent Hiển thị (allowPublicDisplay):</span>
                <span className={detail.consent.allowPublicDisplay ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {detail.consent.allowPublicDisplay ? 'ĐẠT (true)' : 'KHÔNG ĐẠT (false)'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span>Consent Giáo dục (allowEducationalUse):</span>
                <span className="text-slate-300 font-bold">{detail.consent.allowEducationalUse ? 'Đồng ý' : 'Không'}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span>Consent AI (allowAiProcessing):</span>
                <span className="text-slate-300 font-bold">{detail.consent.allowAiProcessing ? 'Đồng ý' : 'Không'}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-rose-400">Không có thông tin consent.</p>
          )}
        </div>
      )}

      {/* Tab 3: Checklist & Actions */}
      {activeTab === 'CHECKLIST' && (
        <div className="space-y-6">
          <ReviewChecklistForm onChange={setChecklist} />

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-300">Ghi chú &amp; Phản hồi Kiểm duyệt</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Ghi chú Nội bộ Staff (internalNote - Không hiển thị cho người đóng góp)
                </label>
                <textarea
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Ghi chú thẩm định tài liệu trích dẫn..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Thông điệp Phản hồi Người dùng (publicMessage - Dùng khi Yêu cầu bổ sung / Từ chối)
                </label>
                <textarea
                  value={publicMessage}
                  onChange={(e) => setPublicMessage(e.target.value)}
                  placeholder="Vui lòng cung cấp thêm hình ảnh rõ nét..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleRequestInfo}
                disabled={actionLoading}
                className="px-4 py-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <HelpCircle className="w-4 h-4" />
                Yêu cầu Bổ sung Thông tin
              </button>

              <button
                type="button"
                onClick={() => handleRecommendation('RECOMMEND_APPROVE')}
                disabled={actionLoading}
                className="px-4 py-2.5 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/30 hover:bg-sky-500/30 font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                Khuyến nghị Phê duyệt (Reviewer)
              </button>

              {isEditor && (
                <>
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs hover:bg-emerald-400 flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Phê duyệt Đóng góp (APPROVED)
                  </button>

                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={actionLoading}
                    className="px-4 py-2.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Từ chối Đóng góp (REJECTED)
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

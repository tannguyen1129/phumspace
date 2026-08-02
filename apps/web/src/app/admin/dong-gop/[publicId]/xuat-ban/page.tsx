"use client";

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { AdminContributionDetailContract, AdminPublicationPlanContract } from '@phumspace/contracts';
import { apiClient } from '@/lib/api-client';
import { PublicationMappingForm } from '@/components/admin/publication-mapping-form';
import { PublicationPreviewCard } from '@/components/admin/publication-preview-card';
import { ArrowLeft, Send, ShieldCheck, Loader2 } from 'lucide-react';

export default function AdminPublicationPage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = use(params);
  const router = useRouter();

  const [detail, setDetail] = useState<AdminContributionDetailContract | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const [plan, setPlan] = useState<AdminPublicationPlanContract>({
    publicationTarget: 'NEW_ENTITY',
    canonicalCode: '',
    entityType: 'ARCHITECTURE',
    preferredViName: '',
    preferredKmName: '',
    summary: '',
    culturalMeaning: '',
    historicalContent: '',
    verificationOutcome: 'SOURCE_VERIFIED',
    selectedMediaIds: [],
  });

  useEffect(() => {
    apiClient
      .getAdminContributionDetail(publicId)
      .then((data) => {
        setDetail(data);
        const codeSlug = data.title
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');

        setPlan((prev) => ({
          ...prev,
          canonicalCode: codeSlug || `heritage-${Date.now()}`,
          preferredViName: data.title,
          summary: data.description,
          selectedMediaIds: data.media.map((m) => m.id),
        }));
      })
      .catch((err: any) => setErrorMsg(err.message))
      .finally(() => setLoading(false));
  }, [publicId]);

  const handleSubmitPublication = async () => {
    setSubmitting(true);
    try {
      const res = await apiClient.publishAdminContribution(publicId, plan);
      alert(`🎉 Đã xuất bản đóng góp thành công vào PhumData Core!\nMã di sản: ${res.data.canonicalCode}`);
      router.push('/admin/dong-gop');
    } catch (err: any) {
      alert(err.message || 'Không thể xuất bản bài đóng góp.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-slate-400 text-xs gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
        Đang chuẩn bị bản thảo xuất bản PhumData...
      </div>
    );
  }

  if (errorMsg || !detail) {
    return (
      <div className="p-8 text-center rounded-3xl bg-rose-950/20 border border-rose-900/40 text-rose-300 text-xs space-y-3">
        <p>{errorMsg || 'Không thể hiển thị bản thảo.'}</p>
        <Link href={`/admin/dong-gop/${publicId}`} className="inline-flex items-center gap-1.5 text-amber-400 font-bold">
          <ArrowLeft className="w-4 h-4" /> Quay lại chi tiết đóng góp
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <Link href={`/admin/dong-gop/${publicId}`} className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Chi tiết đóng góp
          </Link>
          <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Bản thảo Kế hoạch Xuất bản vào PhumData Core
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PublicationMappingForm plan={plan} onChange={setPlan} onSubmit={handleSubmitPublication} loading={submitting} />
        <PublicationPreviewCard plan={plan} />
      </div>
    </div>
  );
}

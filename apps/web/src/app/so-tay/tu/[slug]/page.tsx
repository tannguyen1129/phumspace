'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { PronunciationPlayer } from '@/components/handbook/pronunciation-player';
import { apiClient } from '@/lib/api-client';
import type { KhmerTermDetailContract } from '@phumspace/contracts';
import {
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  Bookmark,
  MapPin,
  Landmark,
  Share2,
  ShieldCheck,
  Tag,
  Layers,
} from 'lucide-react';

interface TermDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function KhmerTermDetailPage({ params }: TermDetailPageProps) {
  const { slug } = use(params);
  const [term, setTerm] = useState<KhmerTermDetailContract | null>(null);
  const [learningStatus, setLearningStatus] = useState<'NEW' | 'LEARNING' | 'LEARNED'>('NEW');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const detail = await apiClient.getHandbookTermBySlug(slug);
        setTerm(detail);

        // Load progress for term
        try {
          const progress = await apiClient.getHandbookTermProgress(detail.id);
          setLearningStatus(progress.status);
        } catch {
          setLearningStatus('NEW');
        }
      } catch {
        setTerm(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [slug]);

  const handleUpdateStatus = async (newStatus: 'LEARNING' | 'LEARNED') => {
    if (!term || isUpdating) return;
    setIsUpdating(true);
    try {
      const res = await apiClient.updateHandbookTermProgress(term.id, newStatus);
      setLearningStatus(res.status);
    } catch {
      // Failed silently
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="h-64 rounded-3xl bg-neutral-100 dark:bg-neutral-800 animate-pulse mb-8" />
      </div>
    );
  }

  if (!term) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-xl text-center">
        <BookOpen className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          PhumData chưa có dữ liệu từ vựng này.
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
          Từ vựng không tồn tại hoặc chưa được xuất bản trong PhumData Core.
        </p>
        <Link
          href="/so-tay"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Sổ tay Khmer</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 mb-6">
        <Link href="/so-tay" className="hover:text-amber-600 transition">
          Sổ tay Khmer
        </Link>
        <span>/</span>
        <span className="text-neutral-900 dark:text-neutral-100 font-bold">{term.scriptText}</span>
      </div>

      {/* Main Term Banner Header */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xl mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span lang="km" className="text-5xl md:text-6xl font-black leading-relaxed tracking-wide">
                {term.scriptText}
              </span>
              {term.partOfSpeech && (
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-amber-100">
                  {term.partOfSpeech}
                </span>
              )}
            </div>

            {term.transliteration && (
              <p className="text-xl font-bold text-amber-100 mb-2">
                /{term.transliteration}/
              </p>
            )}

            <p className="text-lg text-amber-50 font-medium">
              {term.shortDefinitionVi}
            </p>
          </div>

          {/* Guest Learning Status Buttons */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleUpdateStatus('LEARNING')}
              disabled={isUpdating}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                learningStatus === 'LEARNING'
                  ? 'bg-white text-amber-700 shadow-md'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>{learningStatus === 'LEARNING' ? 'Đang học' : 'Đánh dấu Đang học'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleUpdateStatus('LEARNED')}
              disabled={isUpdating}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                learningStatus === 'LEARNED'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{learningStatus === 'LEARNED' ? 'Đã nhớ từ này' : 'Đánh dấu Đã nhớ'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content (2 Columns) */}
        <div className="md:col-span-2 space-y-8">
          {/* Pronunciations Section */}
          {term.pronunciations && term.pronunciations.length > 0 && (
            <section className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                <span>Phát âm Người bản địa đã Thẩm định</span>
              </h3>

              <div className="space-y-3">
                {term.pronunciations.map((p) => (
                  <PronunciationPlayer
                    key={p.id}
                    pronunciationId={p.id}
                    speakerAttribution={p.speakerAttribution}
                    speakerRegion={p.speakerRegion}
                    pronunciationVariant={p.pronunciationVariant}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Cultural Notes */}
          {term.culturalNote && (
            <section className="p-6 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
              <h3 className="text-base font-bold text-amber-900 dark:text-amber-200 mb-2">
                Ghi chú Văn hóa & Ngữ cảnh
              </h3>
              <p className="text-sm text-amber-950 dark:text-amber-100 leading-relaxed font-normal">
                {term.culturalNote}
              </p>
            </section>
          )}

          {/* Examples Section */}
          {term.examples && term.examples.length > 0 && (
            <section className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                Ví dụ Sử dụng
              </h3>

              <div className="space-y-4">
                {term.examples.map((ex) => (
                  <div key={ex.id} className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60">
                    <p lang="km" className="text-lg font-bold text-neutral-900 dark:text-neutral-50 mb-1 leading-relaxed">
                      {ex.khmerText}
                    </p>
                    {ex.translationVi && (
                      <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        {ex.translationVi}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar Metadata (1 Column) */}
        <div className="space-y-6">
          {/* Linked Heritage Entity */}
          {term.relatedHeritageEntity && (
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-amber-500" />
                <span>Di sản liên quan</span>
              </h4>
              <Link
                href={`/kham-pha/${term.relatedHeritageEntity.slug}`}
                className="text-sm font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 block hover:underline"
              >
                {term.relatedHeritageEntity.canonicalCode}
              </Link>
            </div>
          )}

          {/* Linked Place */}
          {term.relatedPlace && (
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>Địa điểm gắn liền</span>
              </h4>
              <Link
                href={`/dia-diem/${term.relatedPlace.slug}`}
                className="text-sm font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 block hover:underline"
              >
                {term.relatedPlace.name}
              </Link>
            </div>
          )}

          {/* Topics & Collections */}
          {term.topics && term.topics.length > 0 && (
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-amber-500" />
                <span>Chủ đề học tập</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {term.topics.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/so-tay/chu-de/${t.slug}`}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-200 transition"
                  >
                    {t.titleVi}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

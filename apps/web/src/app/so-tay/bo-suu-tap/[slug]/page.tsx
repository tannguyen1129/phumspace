'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { KhmerTermCard } from '@/components/handbook/khmer-term-card';
import { apiClient } from '@/lib/api-client';
import type { HandbookCollectionDetailContract } from '@phumspace/contracts';
import { Layers, ArrowLeft, PlayCircle, Trophy, BookOpen } from 'lucide-react';

interface CollectionDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function CollectionDetailPage({ params }: CollectionDetailPageProps) {
  const { slug } = use(params);
  const [collection, setCollection] = useState<HandbookCollectionDetailContract | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCollection() {
      setIsLoading(true);
      try {
        const detail = await apiClient.getCollectionDetailBySlug(slug);
        setCollection(detail);
      } catch {
        setCollection(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadCollection();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="h-48 rounded-3xl bg-neutral-100 dark:bg-neutral-800 animate-pulse mb-8" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-xl text-center">
        <Layers className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Không tìm thấy bộ sưu tập từ vựng này.
        </h2>
        <Link
          href="/so-tay"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow mt-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Sổ tay Khmer</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 mb-6">
        <Link href="/so-tay" className="hover:text-amber-600 transition">
          Sổ tay Khmer
        </Link>
        <span>/</span>
        <span className="text-neutral-900 dark:text-neutral-100 font-bold">{collection.title}</span>
      </div>

      {/* Hero Header */}
      <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 text-white mb-10 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              {collection.difficulty && (
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-amber-100">
                  {collection.difficulty === 'EASY' ? 'Cơ bản' : collection.difficulty}
                </span>
              )}
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-amber-100">
                {collection.itemCount} từ vựng
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black mb-3">{collection.title}</h1>
            {collection.description && (
              <p className="text-amber-100 text-sm md:text-base leading-relaxed">
                {collection.description}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 shrink-0">
            <div className="flex items-center gap-2 text-amber-100 text-xs font-semibold px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md">
              <Trophy className="w-4 h-4 text-amber-200" />
              <span>Thưởng +20 Điểm Passport</span>
            </div>

            <Link
              href={`/so-tay/bo-suu-tap/${collection.slug}/hoc`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-amber-50 text-amber-800 font-extrabold text-sm shadow-lg transition-transform hover:scale-[1.02]"
            >
              <PlayCircle className="w-5 h-5 text-amber-600" />
              <span>Bắt đầu Học Flashcards</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Terms List Grid */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-amber-500" />
          <span>Danh sách Từ vựng trong Bộ sưu tập</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collection.terms.map((term) => (
            <KhmerTermCard key={term.id} term={term} />
          ))}
        </div>
      </section>
    </div>
  );
}

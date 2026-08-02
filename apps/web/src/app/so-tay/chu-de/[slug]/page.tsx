'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { KhmerTermCard } from '@/components/handbook/khmer-term-card';
import { apiClient } from '@/lib/api-client';
import type { HandbookTopicContract, KhmerTermSummaryContract } from '@phumspace/contracts';
import { Tag, ArrowLeft } from 'lucide-react';

interface TopicTermsPageProps {
  params: Promise<{ slug: string }>;
}

export default function TopicTermsPage({ params }: TopicTermsPageProps) {
  const { slug } = use(params);
  const [topic, setTopic] = useState<HandbookTopicContract | null>(null);
  const [terms, setTerms] = useState<KhmerTermSummaryContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTopicData() {
      setIsLoading(true);
      try {
        const res = await apiClient.getTermsByTopicSlug(slug);
        setTopic(res.topic);
        setTerms(res.terms);
      } catch {
        setTopic(null);
        setTerms([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadTopicData();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="h-40 rounded-3xl bg-neutral-100 dark:bg-neutral-800 animate-pulse mb-8" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-xl text-center">
        <Tag className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Không tìm thấy chủ đề học tập này.
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
      <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 mb-6">
        <Link href="/so-tay" className="hover:text-amber-600 transition">
          Sổ tay Khmer
        </Link>
        <span>/</span>
        <span className="text-neutral-900 dark:text-neutral-100 font-bold">{topic.titleVi}</span>
      </div>

      <div className="p-8 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 text-white mb-10 shadow-lg">
        <h1 className="text-3xl font-black mb-2">{topic.titleVi}</h1>
        {topic.titleKm && <span lang="km" className="text-xl font-bold text-amber-100 block mb-3">{topic.titleKm}</span>}
        {topic.description && <p className="text-amber-100 text-sm max-w-2xl">{topic.description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {terms.map((term) => (
          <KhmerTermCard key={term.id} term={term} />
        ))}
      </div>
    </div>
  );
}

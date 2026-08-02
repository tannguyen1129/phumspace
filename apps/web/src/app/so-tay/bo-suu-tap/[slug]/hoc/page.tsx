'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { FlashcardDeck } from '@/components/handbook/flashcard-deck';
import { apiClient } from '@/lib/api-client';
import type { HandbookCollectionDetailContract } from '@phumspace/contracts';
import { Layers, ArrowLeft } from 'lucide-react';

interface FlashcardLearningPageProps {
  params: Promise<{ slug: string }>;
}

export default function FlashcardLearningPage({ params }: FlashcardLearningPageProps) {
  const { slug } = use(params);
  const [collection, setCollection] = useState<HandbookCollectionDetailContract | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCollection() {
      setIsLoading(true);
      try {
        const detail = await apiClient.getCollectionDetailBySlug(slug);
        setCollection(detail);

        // Start collection session
        try {
          await apiClient.startHandbookCollection(detail.id);
        } catch {
          // Handled
        }
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
      <div className="container mx-auto px-4 py-12 max-w-xl">
        <div className="h-96 rounded-3xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-xl text-center">
        <Layers className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Không tìm thấy bộ sưu tập học tập này.
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <Link
          href="/so-tay"
          className="inline-flex items-center gap-2 text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-amber-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Sổ tay</span>
        </Link>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
          Chế độ thẻ Flashcard
        </span>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-neutral-900 dark:text-neutral-100 mb-2">
          {collection.title}
        </h1>
        {collection.description && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto">
            {collection.description}
          </p>
        )}
      </div>

      {/* Interactive Deck */}
      <FlashcardDeck
        collectionId={collection.id}
        collectionTitle={collection.title}
        terms={collection.terms}
      />
    </div>
  );
}

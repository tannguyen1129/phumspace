'use client';

import { useState, useEffect, Suspense } from 'react';
import { HandbookHero } from '@/components/handbook/handbook-hero';
import { HandbookSearch } from '@/components/handbook/handbook-search';
import { KhmerTermCard } from '@/components/handbook/khmer-term-card';
import { HandbookTopicCard } from '@/components/handbook/handbook-topic-card';
import { HandbookCollectionCard } from '@/components/handbook/handbook-collection-card';
import { apiClient } from '@/lib/api-client';
import type {
  KhmerTermSummaryContract,
  HandbookTopicContract,
  HandbookCollectionSummaryContract,
} from '@phumspace/contracts';
import { BookOpen, Layers, Tag, SearchX } from 'lucide-react';

export default function HandbookHubPage() {
  const [terms, setTerms] = useState<KhmerTermSummaryContract[]>([]);
  const [topics, setTopics] = useState<HandbookTopicContract[]>([]);
  const [collections, setCollections] = useState<HandbookCollectionSummaryContract[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [topicsData, collectionsData] = await Promise.all([
          apiClient.getHandbookTopics().catch(() => []),
          apiClient.getHandbookCollections().catch(() => []),
        ]);
        setTopics(topicsData);
        setCollections(collectionsData);
      } catch {
        // Handled gracefully
      }
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);

    apiClient
      .getHandbookTerms({ q: searchQuery, limit: 12 }, controller.signal)
      .then((res) => {
        setTerms(res.data);
      })
      .catch(() => {
        setTerms([]);
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [searchQuery]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <HandbookHero />

      <div className="mb-12">
        <Suspense fallback={<div className="h-12 max-w-2xl mx-auto bg-neutral-100 dark:bg-neutral-800 rounded-2xl animate-pulse" />}>
          <HandbookSearch onSearch={(q) => setSearchQuery(q)} isLoading={isLoading} />
        </Suspense>
      </div>

      {/* Search Result Section */}
      {searchQuery ? (
        <section className="mb-12">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <span>Kết quả tìm kiếm cho từ khóa "{searchQuery}"</span>
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-40 rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
              ))}
            </div>
          ) : terms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {terms.map((term) => (
                <KhmerTermCard key={term.id} term={term} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-neutral-50 dark:bg-neutral-900 rounded-3xl border border-neutral-200/60 dark:border-neutral-800">
              <SearchX className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
              <p className="text-base font-semibold text-neutral-700 dark:text-neutral-300">
                PhumData chưa có kết quả phù hợp.
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Thử tìm kiếm với tên chữ Khmer, phiên âm IPA hoặc từ loại khác.
              </p>
            </div>
          )}
        </section>
      ) : (
        <>
          {/* Topics Grid */}
          {topics.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <Tag className="w-6 h-6 text-amber-500" />
                  <span>Chủ đề Học tập</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topics.map((topic) => (
                  <HandbookTopicCard key={topic.id} topic={topic} />
                ))}
              </div>
            </section>
          )}

          {/* Collections Grid */}
          {collections.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <Layers className="w-6 h-6 text-amber-500" />
                  <span>Bộ sưu tập Từ vựng Flashcard</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {collections.map((collection) => (
                  <HandbookCollectionCard key={collection.id} collection={collection} />
                ))}
              </div>
            </section>
          )}

          {/* Featured Published Terms */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-amber-500" />
              <span>Từ vựng Khmer Nổi bật</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {terms.map((term) => (
                <KhmerTermCard key={term.id} term={term} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

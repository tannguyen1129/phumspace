import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { apiClient, ApiError } from '@/lib/api-client';
import { HeritageDetailHero } from '@/components/heritage/heritage-detail-hero';
import { SourceList } from '@/components/common/source-list';
import { ArrowLeft, BookOpen, Compass, MapPin } from 'lucide-react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const entity = await apiClient.getHeritageEntityBySlug(slug);
    const preferredVi = entity.names.find((n) => n.language === 'vi' && n.nameType === 'PREFERRED')?.originalValue || entity.slug;
    return {
      title: `${preferredVi} — Di sản Văn hóa PhumSpace`,
      description: entity.summary,
      openGraph: {
        title: preferredVi,
        description: entity.summary,
      },
    };
  } catch {
    return {
      title: 'Di sản Văn hóa — PhumSpace',
      description: 'Khám phá di sản văn hóa Khmer Nam Bộ',
    };
  }
}

export default async function HeritageDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let entity = null;
  try {
    entity = await apiClient.getHeritageEntityBySlug(slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  if (!entity) {
    notFound();
  }

  return (
    <div className="space-y-10 py-8">
      {/* Back Link */}
      <div>
        <Link
          href="/kham-pha"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách di sản
        </Link>
      </div>

      {/* Hero Banner */}
      <HeritageDetailHero entity={entity} />

      {/* Content Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Summary Section */}
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-400" />
              Tổng quan
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              {entity.summary}
            </p>
          </section>

          {/* Historical Content Section */}
          {entity.historicalContent && (
            <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                Lịch sử & Nguồn gốc
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                {entity.historicalContent}
              </p>
            </section>
          )}

          {/* Cultural Meaning Section */}
          {entity.culturalMeaning && (
            <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span className="text-amber-400 text-xl font-bold">✨</span>
                Giá trị & Ý nghĩa Văn hóa
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                {entity.culturalMeaning}
              </p>
            </section>
          )}
        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-6">
          {/* Related Places */}
          {entity.places.length > 0 && (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                Địa điểm liên quan
              </h3>
              <ul className="space-y-2">
                {entity.places.map((place) => (
                  <li key={place.id}>
                    <Link
                      href={`/dia-diem/${place.slug}`}
                      className="block p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 transition-colors text-xs font-semibold text-slate-300 hover:text-amber-300"
                    >
                      📍 {place.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Source List / Provenance */}
          <SourceList />
        </div>
      </div>
    </div>
  );
}

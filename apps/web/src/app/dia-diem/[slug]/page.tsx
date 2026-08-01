import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { apiClient, ApiError } from '@/lib/api-client';
import { HeritageCard } from '@/components/heritage/heritage-card';
import { ArrowLeft, Compass, MapPin } from 'lucide-react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const place = await apiClient.getPlaceBySlug(slug);
    return {
      title: `${place.name} — Địa điểm Di sản PhumSpace`,
      description: place.summary || `Khám phá di sản văn hóa tại ${place.name}`,
    };
  } catch {
    return {
      title: 'Địa điểm Di sản — PhumSpace',
      description: 'Khám phá địa điểm di sản văn hóa Khmer',
    };
  }
}

export default async function PlaceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let place = null;
  let relatedEntities = [];

  try {
    const [placeRes, entitiesRes] = await Promise.all([
      apiClient.getPlaceBySlug(slug),
      apiClient.getHeritageEntities({ placeSlug: slug }),
    ]);

    place = placeRes;
    relatedEntities = entitiesRes.data;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  if (!place) {
    notFound();
  }

  return (
    <div className="space-y-10 py-8">
      {/* Back Link */}
      <div>
        <Link
          href="/dia-diem"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách địa điểm
        </Link>
      </div>

      {/* Place Detail Header Banner */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-8 sm:p-12 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 text-amber-400">
          <MapPin className="w-6 h-6" />
          <span className="text-xs font-bold uppercase tracking-wider">Thông tin địa điểm</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-100">{place.name}</h1>

        {place.address && (
          <p className="text-sm text-slate-300 font-medium">📍 Địa chỉ: {place.address}</p>
        )}

        {place.latitude && place.longitude && (
          <p className="text-xs font-mono text-slate-400">
            Tọa độ: {place.latitude}, {place.longitude}
          </p>
        )}

        {place.summary && (
          <p className="text-sm text-slate-300 pt-2 border-t border-slate-800/80 leading-relaxed">
            {place.summary}
          </p>
        )}
      </div>

      {/* Related Heritage Entities */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-lg font-bold text-slate-100">
          <Compass className="w-5 h-5 text-amber-400" />
          <h2>Di sản gắn liền với địa điểm này</h2>
        </div>

        {relatedEntities.length === 0 ? (
          <p className="text-xs text-slate-400 italic p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
            Chưa có thực thể di sản PUBLISHED nào được gán với địa điểm này.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedEntities.map((entity) => (
              <HeritageCard key={entity.id} entity={entity} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

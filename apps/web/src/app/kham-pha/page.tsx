import { Metadata } from 'next';
import type { CategoryPublicContract, PlacePublicContract } from '@phumspace/contracts';
import { apiClient } from '@/lib/api-client';
import { HeritageCard } from '@/components/heritage/heritage-card';
import { HeritageFilter } from '@/components/heritage/heritage-filter';
import { Pagination } from '@/components/common/pagination';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';

export const metadata: Metadata = {
  title: 'Khám phá Di sản Văn hóa — PhumSpace',
  description: 'Danh sách các di sản văn hóa Khmer Nam Bộ đã được công bố chính thức trên PhumData.',
};

interface SearchParams {
  page?: string;
  categorySlug?: string;
  placeSlug?: string;
}

export default async function HeritageListPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const categorySlug = params.categorySlug || undefined;
  const placeSlug = params.placeSlug || undefined;

  let entitiesRes = null;
  let categories: CategoryPublicContract[] = [];
  let places: PlacePublicContract[] = [];
  let errorMsg = null;

  try {
    const [entRes, catList, plcList] = await Promise.all([
      apiClient.getHeritageEntities({ page, limit: 9, categorySlug, placeSlug }),
      apiClient.getCategories().catch(() => []),
      apiClient.getPlaces().catch(() => []),
    ]);

    entitiesRes = entRes;
    categories = catList;
    places = plcList;
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : 'Không thể kết nối tới máy chủ PhumSpace API';
  }

  return (
    <div className="space-y-8 py-8">
      {/* Header Banner */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">
          Khám phá Di sản Văn hóa Khmer
        </h1>
        <p className="text-sm text-slate-400">
          Danh mục các thực thể di sản kiến trúc, lễ hội và tri thức dân gian đã được công bố chính thức.
        </p>
      </div>

      {/* Heritage Filter */}
      <HeritageFilter categories={categories} places={places} />

      {/* Main Listing Grid / Error / Empty states */}
      {errorMsg ? (
        <ErrorState message={errorMsg} />
      ) : !entitiesRes || entitiesRes.data.length === 0 ? (
        <EmptyState
          title="Không tìm thấy di sản phù hợp"
          description="Không có thực thể văn hóa PUBLISHED nào khớp với tiêu chí tìm kiếm hiện tại."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {entitiesRes.data.map((entity) => (
              <HeritageCard key={entity.id} entity={entity} />
            ))}
          </div>

          <Pagination
            currentPage={entitiesRes.meta.page}
            totalPages={entitiesRes.meta.totalPages}
            baseUrl="/kham-pha"
            searchParams={{ categorySlug, placeSlug }}
          />
        </>
      )}
    </div>
  );
}

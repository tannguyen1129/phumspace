import { Metadata } from 'next';
import type { PlacePublicContract } from '@phumspace/contracts';
import { apiClient } from '@/lib/api-client';
import { PlaceCard } from '@/components/place/place-card';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';

export const metadata: Metadata = {
  title: 'Danh sách Địa điểm Di sản — PhumSpace',
  description: 'Khám phá các địa điểm văn hóa lịch sử tiêu biểu tại Trà Vinh.',
};

export const revalidate = 60; // ISR 60s

export default async function PlaceListPage() {
  let places: PlacePublicContract[] = [];
  let errorMsg = null;

  try {
    places = await apiClient.getPlaces();
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : 'Không thể kết nối đến máy chủ PhumSpace API';
  }

  return (
    <div className="space-y-8 py-8">
      {/* Header Banner */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">
          Địa điểm Di sản Văn hóa
        </h1>
        <p className="text-sm text-slate-400">
          Danh sách các không gian kiến trúc, danh thắng và địa bàn diễn ra hoạt động văn hóa Khmer.
        </p>
      </div>

      {/* Place Grid / Error / Empty states */}
      {errorMsg ? (
        <ErrorState message={errorMsg} />
      ) : places.length === 0 ? (
        <EmptyState
          title="Chưa có địa điểm công bố"
          description="Hiện tại chưa có danh sách địa điểm nào được cập nhật trên PhumData."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      )}
    </div>
  );
}

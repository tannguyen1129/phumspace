import Link from 'next/link';
import type { HeritageEntityPublicContract } from '@phumspace/contracts';
import { apiClient } from '@/lib/api-client';
import { HeritageCard } from '@/components/heritage/heritage-card';
import { ErrorState } from '@/components/common/error-state';
import { ArrowRight, Compass, Database, HeartHandshake, MapPin, Sparkles } from 'lucide-react';

export const revalidate = 60; // ISR 60s

export default async function HomePage() {
  let featuredEntities: HeritageEntityPublicContract[] = [];
  let errorMsg = null;

  try {
    const res = await apiClient.getHeritageEntities({ limit: 3 });
    featuredEntities = res.data;
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : 'Không thể kết nối đến máy chủ PhumSpace API';
  }

  return (
    <div className="space-y-16 py-8 sm:py-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-amber-950/20 via-slate-900 to-slate-950 border border-slate-800 p-8 sm:p-14 lg:p-20 text-center space-y-8 shadow-2xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>Kho tri thức di sản văn hóa Khmer Nam Bộ</span>
        </div>

        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-100 leading-tight">
            Khám phá & Bảo tồn <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              Di sản Văn hóa Khmer
            </span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Nền tảng số hóa kết nối dữ liệu xác minh <strong>PhumData</strong> với trải nghiệm tương tác số và bản đồ hành trình văn hóa, khởi tạo tại Trà Vinh.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/kham-pha"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
          >
            <Compass className="w-5 h-5" />
            Khám phá di sản
          </Link>
          <Link
            href="/dia-diem"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-semibold text-sm hover:bg-slate-800 transition-all"
          >
            <MapPin className="w-5 h-5 text-amber-400" />
            Xem địa điểm
          </Link>
        </div>
      </section>

      {/* Core Journey Section: Khám phá -> Trải nghiệm -> Học hỏi -> Truyền lại */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">Hành trình Trải nghiệm Văn hóa</h2>
          <p className="text-xs sm:text-sm text-slate-400">4 bước tiếp cận di sản số ý nghĩa cùng PhumSpace</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 relative overflow-hidden group hover:border-amber-500/40 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h3 className="font-bold text-base text-slate-200">Khám phá</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Truy cập tri thức văn hóa Khmer đã được kiểm duyệt với chứng cứ và nguồn dẫn rõ ràng.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 relative overflow-hidden group hover:border-amber-500/40 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h3 className="font-bold text-base text-slate-200">Trải nghiệm</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Kết nối di sản với các điểm đến thực địa, địa điểm kiến trúc tôn giáo và lễ hội truyền thống.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 relative overflow-hidden group hover:border-amber-500/40 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h3 className="font-bold text-base text-slate-200">Học hỏi</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tìm hiểu từ vựng tiếng Khmer, phát âm, phiên âm Latin và ý nghĩa văn hóa sâu sắc.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 relative overflow-hidden group hover:border-amber-500/40 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg">
              4
            </div>
            <h3 className="font-bold text-base text-slate-200">Truyền lại</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Chung tay trao truyền giá trị di sản cho thế hệ trẻ và cộng đồng địa phương.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Heritage Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Di sản Nổi bật</h2>
            <p className="text-xs text-slate-400">Dữ liệu công bố chính thức từ PhumData Core</p>
          </div>
          <Link
            href="/kham-pha"
            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            Xem tất cả
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {errorMsg ? (
          <ErrorState message={errorMsg} />
        ) : featuredEntities.length === 0 ? (
          <p className="text-xs text-slate-400 italic">Chưa có di sản nổi bật nào được công bố.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEntities.map((entity) => (
              <HeritageCard key={entity.id} entity={entity} />
            ))}
          </div>
        )}
      </section>

      {/* PhumData Intro Section */}
      <section className="p-8 sm:p-12 rounded-3xl bg-slate-900/60 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        <div className="md:col-span-2 space-y-4">
          <div className="inline-flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
            <Database className="w-4 h-4" />
            <span>Kho tri thức PhumData</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
            Dữ liệu Văn hóa Minh bạch & Có Provenance
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Mọi thông tin văn hóa trên PhumSpace đều xuất phát từ nguồn tư liệu được xác minh, gắn chứng cứ minh bạch và được quản lý theo cơ chế công bố nghiêm ngặt.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3 text-center">
          <div className="h-12 w-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">Cộng đồng Chủ thể</h3>
          <p className="text-xs text-slate-400">
            Tôn trọng bản quyền, sự đồng ý và tiếng nói của nghệ nhân, tri thức dân gian Khmer Nam Bộ.
          </p>
        </div>
      </section>
    </div>
  );
}

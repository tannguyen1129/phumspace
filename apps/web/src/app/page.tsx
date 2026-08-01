import { ApiStatus } from "./api-status";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 text-slate-100 flex flex-col justify-between p-6 sm:p-12 lg:p-24">
      {/* Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center font-bold text-slate-950 text-xl shadow-lg shadow-amber-500/20">
            PS
          </div>
          <div>
            <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
              PhumSpace
            </span>
            <span className="text-xs text-slate-400 block font-medium">Sprint 0 Foundation</span>
          </div>
        </div>
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
          Release 1 MVP (Sprint 0)
        </span>
      </header>

      {/* Main Content */}
      <section className="max-w-4xl mx-auto w-full my-12 space-y-8">
        <div className="space-y-4">
          <h1 id="main-heading" className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
            Khám phá, Học tập & Bảo tồn Di sản Văn hóa Khmer Nam Bộ
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
            PhumSpace là nền tảng tri thức số kết nối kho dữ liệu văn hóa xác minh <strong>PhumData</strong> với trải nghiệm tương tác, AI grounded, và bản đồ di sản số khởi tạo tại Trà Vinh.
          </p>
        </div>

        {/* Sprint 0 Status Notice */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div id="card-feature-discover" className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur">
            <div className="text-amber-400 font-semibold mb-1">🔍 Khám phá PhumData</div>
            <p className="text-xs text-slate-400">Tri thức văn hóa có provenance, nguồn dẫn chứng và xác minh minh bạch.</p>
          </div>
          <div id="card-feature-experience" className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur">
            <div className="text-amber-400 font-semibold mb-1">🗺️ Bản đồ & Hành trình</div>
            <p className="text-xs text-slate-400">Trải nghiệm di sản qua điểm đến, tuyến tham quan và chế độ lễ hội.</p>
          </div>
          <div id="card-feature-learn" className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur">
            <div className="text-amber-400 font-semibold mb-1">📚 Sổ tay & Olympiad</div>
            <p className="text-xs text-slate-400">Học từ vựng Khmer tương tác và tham gia các kỳ thi văn hóa số.</p>
          </div>
        </div>

        {/* API Connection Health Check */}
        <ApiStatus />
      </section>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full text-center text-xs text-slate-500 border-t border-slate-800/80 pt-6">
        <p>© 2026 PhumSpace. Dự án bảo tồn di sản văn hóa Khmer Nam Bộ. Sprint 0 Foundation Setup.</p>
      </footer>
    </main>
  );
}

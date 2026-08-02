"use client";

import { useEffect, useState } from 'react';
import type { AdminContributionSummaryContract } from '@phumspace/contracts';
import { apiClient } from '@/lib/api-client';
import { ModerationQueueTable } from '@/components/admin/moderation-queue-table';
import { FileCheck2, Filter, Loader2, RefreshCw } from 'lucide-react';

export default function AdminModerationQueuePage() {
  const [items, setItems] = useState<AdminContributionSummaryContract[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await apiClient.getAdminModerationQueue({ status: statusFilter || undefined });
      setItems(res.data);
      setTotal(res.total);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [statusFilter]);

  const handleAssign = async (publicId: string) => {
    try {
      await apiClient.assignAdminReview(publicId);
      fetchQueue();
    } catch (err: any) {
      alert(err.message || 'Không thể nhận bài review.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-amber-400" />
            Hàng đợi Kiểm duyệt Đóng góp Tri thức Văn hóa
          </h1>
          <p className="text-xs text-slate-400">
            Xem danh sách bài đóng góp từ cộng đồng, nhận lượt review và tiến hành thẩm định
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none font-semibold"
            >
              <option value="">Tất cả Trạng thái</option>
              <option value="SUBMITTED">Mới gửi (SUBMITTED)</option>
              <option value="UNDER_REVIEW">Đang kiểm duyệt (UNDER_REVIEW)</option>
              <option value="NEEDS_MORE_INFORMATION">Cần bổ sung (NEEDS_INFO)</option>
              <option value="APPROVED">Đã phê duyệt (APPROVED)</option>
              <option value="REJECTED">Từ chối (REJECTED)</option>
              <option value="PUBLISHED">Đã xuất bản (PUBLISHED)</option>
            </select>
          </div>

          <button
            onClick={fetchQueue}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 transition-colors"
            title="Làm mới hàng đợi"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          Đang tải danh sách bài đóng góp...
        </div>
      ) : (
        <ModerationQueueTable items={items} onAssign={handleAssign} />
      )}
    </div>
  );
}

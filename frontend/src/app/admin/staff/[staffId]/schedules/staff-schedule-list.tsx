'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, CalendarDays, Clock, Loader2 } from 'lucide-react';
import { Pagination } from '@/components/shared/pagination';
import { ApiError } from '@/lib/http';
import { staffApi } from '@/services/staff.service';
import type { StaffItem, WorkScheduleItem } from '@/types/staff';

const PAGE_SIZE = 10;

interface StaffScheduleListProps {
  staffId: number;
  initialPage: number;
}

function formatDate(value: string) {
  return value.slice(0, 10).split('-').reverse().join('/');
}

function formatTime(value: string) {
  return value.slice(0, 5);
}

async function getStaffById(staffId: number) {
  let page = 1;

  while (true) {
    const result = await staffApi.list({ page });
    const staff = result.items.find((item) => item.id === staffId);
    if (staff || page >= result.totalPages) return staff ?? null;
    page += 1;
  }
}

export default function StaffScheduleList({ staffId, initialPage }: StaffScheduleListProps) {
  const router = useRouter();
  const [staff, setStaff] = useState<StaffItem | null>(null);
  const [schedules, setSchedules] = useState<WorkScheduleItem[]>([]);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    void Promise.resolve().then(async () => {
      try {
        const [staff, staffSchedules] = await Promise.all([
          getStaffById(staffId),
          staffApi.getSchedules(staffId),
        ]);

        if (cancelled) return;

        setStaff(staff);
        setSchedules(staffSchedules);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Không tải được lịch nhân viên.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [staffId]);

  useEffect(() => {
    const syncPageFromUrl = () => {
      const urlPage = Number(new URLSearchParams(window.location.search).get('page') ?? '1');
      if (Number.isInteger(urlPage) && urlPage > 0) setPage(urlPage);
    };

    window.addEventListener('popstate', syncPageFromUrl);
    return () => window.removeEventListener('popstate', syncPageFromUrl);
  }, []);

  const newestSchedules = useMemo(
    () => [...schedules].sort((a, b) =>
      b.workDate.localeCompare(a.workDate) || b.startTime.localeCompare(a.startTime),
    ),
    [schedules],
  );

  const totalPages = Math.max(1, Math.ceil(newestSchedules.length / PAGE_SIZE));
  const visibleSchedules = newestSchedules.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const changePage = (nextPage: number) => {
    setPage(nextPage);
    router.push(`/admin/staff/${staffId}/schedules?page=${nextPage}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      <Link
        href="/admin/staff"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại nhân viên
      </Link>

      <section className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-indigo-400" />
            <div>
              <h1 className="text-lg font-bold text-white">Các ca làm việc</h1>
              <p className="text-sm text-slate-400 mt-1">
                {staff ? `${staff.fullName} · ${staff.email}` : `Nhân viên #${staffId}`}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="m-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-2xl text-sm flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/40 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="p-4 pl-6">Ngày làm</th>
                <th className="p-4">Khung giờ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={2} className="p-12 text-center text-slate-400">
                    <Loader2 className="inline h-5 w-5 animate-spin mr-2 text-indigo-400" />
                    Đang tải lịch...
                  </td>
                </tr>
              ) : visibleSchedules.length === 0 ? (
                <tr>
                  <td colSpan={2} className="p-12 text-center text-slate-400">
                    Nhân viên chưa có ca làm việc.
                  </td>
                </tr>
              ) : visibleSchedules.map((schedule) => (
                <tr key={schedule.id} className="hover:bg-slate-950/40 transition-colors">
                  <td className="p-4 pl-6 text-slate-300">{formatDate(schedule.workDate)}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-xl text-xs font-semibold">
                      <Clock className="h-3.5 w-3.5" />
                      {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && (
          <Pagination page={page} totalPages={totalPages} onPageChange={changePage} />
        )}
      </section>
    </div>
  );
}
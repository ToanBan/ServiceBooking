'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, Calendar, CalendarDays, Filter, Loader2, RotateCcw, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Pagination } from '@/components/shared/pagination';
import { ApiError } from '@/lib/http';
import { useBookingRealtime } from '@/hooks/use-booking-realtime';
import { bookingApi } from '@/services/booking.service';
import type { BookingItem, BookingStatus } from '@/types/booking';

function formatBookingTime(value: string) {
  return new Date(value).toLocaleString('vi-VN');
}

function getStatusBadge(status: BookingStatus) {
  const statusClass = {
    Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  }[status];

  return <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusClass}`}>{status}</span>;
}

export default function MyBookingsPage() {
  const [filterStatus, setFilterStatus] = useState<BookingStatus | 'ALL'>('ALL');
  const [filterDate, setFilterDate] = useState('');
  const [page, setPage] = useState(1);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelTarget, setCancelTarget] = useState<BookingItem | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [realtimeVersion, setRealtimeVersion] = useState(0);

  useBookingRealtime(() => setRealtimeVersion((current) => current + 1));

  useEffect(() => {
    let cancelled = false;

    void Promise.resolve().then(async () => {
      setLoading(true);
      setError('');

      try {
        const result = await bookingApi.myBookings({
          page,
          status: filterStatus === 'ALL' ? undefined : filterStatus,
          date: filterDate || undefined,
        });

        if (!cancelled) {
          setBookings(result.items);
          setTotalCount(result.totalCount);
          setTotalPages(result.totalPages);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Không tải được lịch đặt của bạn.');
          setBookings([]);
          setTotalCount(0);
          setTotalPages(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [filterDate, filterStatus, page, realtimeVersion]);

  const handleCancel = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cancelTarget || cancelling) return;

    setCancelling(true);
    setCancelError('');

    try {
      await bookingApi.cancel(cancelTarget.id, cancellationReason);
      setBookings((current) => current.map((booking) =>
        booking.id === cancelTarget.id
          ? { ...booking, status: 'Cancelled' }
          : booking,
      ));
      setCancelTarget(null);
      setCancellationReason('');
    } catch (err) {
      setCancelError(
        err instanceof ApiError ? err.message : 'Không thể hủy booking. Vui lòng thử lại.',
      );
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link href="/services" className="inline-flex items-center space-x-2 text-xs text-slate-400 hover:text-white mb-2 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Trang dịch vụ</span>
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Lịch đặt của tôi</h1>
            <p className="text-sm text-slate-400">Quản lý và theo dõi trạng thái các lịch hẹn dịch vụ của bạn</p>
          </div>

        </div>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl sm:p-6">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                <Filter className="h-4 w-4 text-indigo-400" />
                Bộ lọc lịch hẹn
              </h2>
              <p className="mt-1 text-xs text-slate-400">Chọn trạng thái hoặc ngày để tìm lịch phù hợp</p>
            </div>
            <p className="text-xs text-slate-400">
              Có <span className="font-semibold text-indigo-300">{totalCount}</span> lịch hẹn
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-[minmax(180px,1fr)_minmax(180px,1fr)_auto]">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-400">Trạng thái</span>
              <select
                value={filterStatus}
                onChange={(event) => {
                  setFilterStatus(event.target.value as BookingStatus | 'ALL');
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="Pending">Chờ xác nhận</option>
                <option value="Confirmed">Đã xác nhận</option>
                <option value="Completed">Hoàn thành</option>
                <option value="Cancelled">Đã hủy</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-400">Ngày hẹn</span>
              <span className="relative block">
                <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="date"
                  value={filterDate}
                  onChange={(event) => {
                    setFilterDate(event.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-3 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </span>
            </label>
            <button
              type="button"
              onClick={() => {
                setFilterStatus('ALL');
                setFilterDate('');
                setPage(1);
              }}
              disabled={filterStatus === 'ALL' && !filterDate}
              className="inline-flex items-center justify-center gap-2 self-end rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw className="h-4 w-4" />
              Xóa lọc
            </button>
          </div>
        </section>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-2xl text-sm flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="divide-y divide-slate-800/80">
            {loading ? (
              <div className="p-12 text-center text-slate-400">
                <Loader2 className="inline h-5 w-5 animate-spin mr-2 text-indigo-400" />
                Đang tải lịch đặt...
              </div>
            ) : bookings.length === 0 ? (
              <div className="p-12 text-center text-slate-400">Bạn chưa có lịch đặt phù hợp.</div>
            ) : bookings.map((item) => (
              <div key={item.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-950/40 transition-colors">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-xl">{item.bookingCode}</span>
                    {getStatusBadge(item.status)}
                  </div>
                  <h3 className="text-lg font-bold text-white">{item.serviceName}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center space-x-1.5"><Calendar className="w-4 h-4 text-indigo-400" /> <span>{formatBookingTime(item.startTime)}</span></span>
                    <span>•</span>
                    <span>Nhân viên: <strong className="text-slate-200">{item.staffName}</strong></span>
                  </div>
                </div>

                {(item.status === 'Pending' || item.status === 'Confirmed') && (
                  <button
                    type="button"
                    onClick={() => {
                      setCancelTarget(item);
                      setCancellationReason('');
                      setCancelError('');
                    }}
                    className="self-start md:self-center px-4 py-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 rounded-2xl text-xs font-semibold transition-all flex items-center space-x-2"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Hủy lịch hẹn</span>
                  </button>
                )}
              </div>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>

        {cancelTarget && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <form onSubmit={handleCancel} className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-8 space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white">Xác nhận hủy lịch</h2>
                <p className="text-sm text-slate-400">
                  {cancelTarget.bookingCode} · {cancelTarget.serviceName}
                </p>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="cancel-reason" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Lý do hủy
                </label>
                <textarea
                  id="cancel-reason"
                  rows={3}
                  required
                  minLength={2}
                  maxLength={1000}
                  value={cancellationReason}
                  onChange={(event) => setCancellationReason(event.target.value)}
                  placeholder="Nhập lý do hủy lịch..."
                  className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              {cancelError && <p role="alert" className="text-sm text-rose-400">{cancelError}</p>}

              <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={() => setCancelTarget(null)}
                  className="px-5 py-2.5 bg-slate-800 text-slate-300 rounded-2xl text-sm font-semibold disabled:opacity-50"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="px-5 py-2.5 bg-rose-600 text-white rounded-2xl text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
                >
                  {cancelling && <Loader2 className="h-4 w-4 animate-spin" />}
                  Hủy lịch
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
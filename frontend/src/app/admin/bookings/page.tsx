  'use client';

  import React, { useEffect, useState } from 'react';
  import { AlertCircle, CalendarDays, Clock, Filter, Loader2, RotateCcw, Search } from 'lucide-react';
  import { Pagination } from '@/components/shared/pagination';
  import { ApiError } from '@/lib/http';
  import { useBookingRealtime } from '@/hooks/use-booking-realtime';
  import { bookingApi } from '@/services/booking.service';
  import type { BookingItem, BookingStatus } from '@/types/booking';

  function formatBookingTime(value: string) {
    return new Date(value).toLocaleString('vi-VN');
  }

  export default function AdminBookingsPage() {
    const [filterStatus, setFilterStatus] = useState<BookingStatus | 'ALL'>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [page, setPage] = useState(1);
    const [bookings, setBookings] = useState<BookingItem[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionError, setActionError] = useState('');
    const [updatingBookingId, setUpdatingBookingId] = useState<number | null>(null);
    const [realtimeVersion, setRealtimeVersion] = useState(0);

    useBookingRealtime(() => setRealtimeVersion((current) => current + 1));

    const updateBookingStatus = async (booking: BookingItem, status: BookingStatus) => {
      if (updatingBookingId !== null) return;

      setUpdatingBookingId(booking.id);
      setActionError('');

      try {
        await bookingApi.updateStatus(booking.id, status);
        setBookings((current) => current.map((item) =>
          item.id === booking.id ? { ...item, status } : item,
        ));
      } catch (err) {
        setActionError(
          err instanceof ApiError ? err.message : 'Không thể cập nhật trạng thái booking.',
        );
      } finally {
        setUpdatingBookingId(null);
      }
    };

    useEffect(() => {
      let cancelled = false;

      void Promise.resolve().then(async () => {
        setLoading(true);
        setError('');

        try {
          const result = await bookingApi.list({
            page,
            status: filterStatus === 'ALL' ? undefined : filterStatus,
            search: searchTerm.trim() || undefined,
            date: filterDate || undefined,
          });

          if (!cancelled) {
            setBookings(result.items);
            setTotalCount(result.totalCount);
            setTotalPages(result.totalPages);
          }
        } catch (err) {
          if (!cancelled) {
            setError(err instanceof ApiError ? err.message : 'Không tải được danh sách booking.');
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
    }, [filterDate, filterStatus, page, realtimeVersion, searchTerm]);

    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
          <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Filter className="h-4 w-4 text-indigo-400" />
                Lọc và tìm kiếm booking
              </div>
              <p className="mt-1 text-xs text-slate-400">Kết hợp từ khóa, trạng thái và ngày hẹn</p>
            </div>
            <p className="text-xs text-slate-400">
              Tìm thấy <span className="font-semibold text-indigo-300">{totalCount}</span> booking
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(240px,1.5fr)_minmax(180px,1fr)_minmax(180px,1fr)_auto]">
            <label className="relative block">
              <span className="mb-1.5 block text-xs font-medium text-slate-400">Từ khóa</span>
              <Search className="absolute left-3.5 top-[2.55rem] h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="search"
                placeholder="Mã booking hoặc tên khách..."
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </label>

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
                setSearchTerm('');
                setFilterStatus('ALL');
                setFilterDate('');
                setPage(1);
              }}
              disabled={!searchTerm && filterStatus === 'ALL' && !filterDate}
              className="inline-flex items-center justify-center gap-2 self-end rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw className="h-4 w-4" />
              Xóa lọc
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-2xl text-sm flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        {actionError && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-2xl text-sm flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {actionError}
          </div>
        )}

        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="p-4 pl-6">Mã & Khách hàng</th>
                  <th className="p-4">Dịch vụ & Nhân viên</th>
                  <th className="p-4">Thời gian</th>
                  <th className="p-4">Ghi chú khách hàng</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 pr-6 text-right">Thao tác duyệt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-400">
                      <Loader2 className="inline h-5 w-5 animate-spin mr-2 text-indigo-400" />
                      Đang tải booking...
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-400">
                      Không tìm thấy booking phù hợp.
                    </td>
                  </tr>
                ) : bookings.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-950/40 transition-colors">
                    <td className="p-4 pl-6">
                      <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg">{item.bookingCode}</span>
                      <div className="font-bold text-white mt-1.5">{item.customerName}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-white">{item.serviceName}</div>
                      <div className="text-xs text-slate-400 mt-0.5">Phụ trách: {item.staffName}</div>
                    </td>
                    <td className="p-4 text-slate-300 text-xs">
                      <span className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{formatBookingTime(item.startTime)} - {new Date(item.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                    </td>
                    <td className="p-4 text-xs">
                      {item.customerNote ? (
                        <p className="max-w-xs whitespace-pre-wrap break-words text-slate-300">
                          {item.customerNote}
                        </p>
                      ) : (
                        <span className="text-slate-500">Không có ghi chú</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        item.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        item.status === 'Confirmed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        item.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {item.status}
                      </span>
                      {item.status === 'Cancelled' && item.cancellationReason && (
                        <p className="mt-2 max-w-xs text-xs normal-case text-slate-400">
                          Lý do hủy: {item.cancellationReason}
                        </p>
                      )}
                    </td>
                    <td className="p-4 pr-6 text-right space-x-2">
                      {item.status === 'Pending' && (
                        <button
                          type="button"
                          onClick={() => void updateBookingStatus(item, 'Confirmed')}
                          disabled={updatingBookingId !== null}
                          title="Xác nhận booking"
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updatingBookingId === item.id ? 'Đang lưu...' : 'Xác nhận'}
                        </button>
                      )}
                      {item.status === 'Confirmed' && (
                        <button
                          type="button"
                          onClick={() => void updateBookingStatus(item, 'Completed')}
                          disabled={updatingBookingId !== null}
                          title="Đánh dấu hoàn tất"
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updatingBookingId === item.id ? 'Đang lưu...' : 'Hoàn thành'}
                        </button>
                      )}
                      <button
                        type="button"
                        disabled
                        title="API cập nhật trạng thái booking chưa được triển khai"
                        className="px-3 py-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Hủy lịch
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>
    );
  }

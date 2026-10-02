'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Search, Clock, DollarSign, Calendar, ArrowRight, Sparkles, Loader2, PackageX, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { ApiError } from '@/lib/http';
import { Pagination } from '@/components/shared/pagination';
import { serviceApi } from '@/services/service.service';
import type { ServiceItem } from '@/types/service';

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadServices = useCallback(async (pageNumber: number) => {
    try {
      const data = await serviceApi.list({ page: pageNumber });
      setServices(data.items.filter((item) => item.isActive));
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Không tải được danh sách dịch vụ.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => loadServices(page));
  }, [loadServices, page]);

  const filteredServices = services.filter((service) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;

    return (
      service.name.toLowerCase().includes(term) ||
      (service.description ?? '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 border-b border-indigo-900/40 py-16 px-6">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-6xl mx-auto space-y-4 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-semibold text-indigo-300 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Hệ thống đặt lịch chuyên nghiệp</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Khám phá Dịch vụ của chúng tôi</h1>
          <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
            Lựa chọn dịch vụ phù hợp và đặt lịch làm việc trực tiếp với chuyên gia hàng đầu chỉ trong vài bước đơn giản.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-10 space-y-8">
        {/* Thanh tìm kiếm & Điều hướng */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm dịch vụ..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all shadow-inner"
            />
          </div>
          <Link
            href="/my-bookings"
            className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1.5 transition-colors"
          >
            <span>Xem lịch đặt của tôi</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-2xl text-sm flex items-center justify-between gap-4">
            <span className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </span>
            <button
              onClick={() => {
                setLoading(true);
                setError('');
                void loadServices(page);
              }}
              className="px-4 py-2 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs font-semibold hover:bg-rose-500/20 transition-all flex-shrink-0"
            >
              Thử lại
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-24 text-slate-400 text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
            <span>Đang tải dịch vụ...</span>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <PackageX className="w-10 h-10 text-slate-600" />
            <p className="text-slate-400 text-sm">
              {searchTerm
                ? 'Không tìm thấy dịch vụ nào khớp với từ khoá.'
                : 'Hiện chưa có dịch vụ nào khả dụng.'}
            </p>
          </div>
        ) : (
          /* Danh sách Dịch vụ Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div 
              key={service.id} 
              className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-800 p-6 flex flex-col justify-between space-y-6 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group"
            >
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                  {service.name}
                </h3>
                  <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">
                    {service.description ?? 'Chưa có mô tả cho dịch vụ này.'}
                  </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center space-x-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <span>{service.durationMinutes} phút</span>
                  </div>
                  <div className="flex items-center space-x-1 text-indigo-400 font-bold text-base">
                    <DollarSign className="w-4 h-4" />
                    <span>{service.price.toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>

                <Link
                  href={`/booking?serviceId=${service.id}`}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-600/20 flex items-center justify-center space-x-2 transition-all group/btn"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Đặt lịch ngay</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
          </div>
        )}

        {!loading && filteredServices.length > 0 && (
          <Pagination page={page} totalPages={totalPages} onPageChange={(nextPage) => {
            setLoading(true);
            setError('');
            setPage(nextPage);
          }} />
        )}
      </div>
    </div>
  );
}
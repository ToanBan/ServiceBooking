'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Search,
  Plus,
  Edit,
  Lock,
  Unlock,
  Clock,
  X,
  Loader2,
  PackageX,
  AlertCircle,
} from 'lucide-react';
import { ApiError } from '@/lib/http';
import { Pagination } from '@/components/shared/pagination';
import { serviceApi } from '@/services/service.service';
import type { FieldErrors } from '@/types/api';
import type { ServiceItem, ServicePayload } from '@/types/service';

type ModalMode = 'create' | 'edit';

const EMPTY_FORM: ServicePayload = {
  name: '',
  description: '',
  durationMinutes: 60,
  price: 500000,
  isActive: true,
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<ModalMode>('create');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ServicePayload>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState('');

  const loadServices = useCallback(async (pageNumber: number) => {
    try {
      const data = await serviceApi.list({ page: pageNumber });
      setServices(data.items);
      setCurrentPage(pageNumber);
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
    void Promise.resolve().then(() => loadServices(1));
  }, [loadServices]);

  // Backend chưa hỗ trợ tham số search nên lọc client-side.
  // Admin thấy cả dịch vụ đang khoá (khác trang customer chỉ lấy isActive).
  const filteredServices = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return services;

    return services.filter(
      (service) =>
        service.name.toLowerCase().includes(term) ||
        (service.description ?? '').toLowerCase().includes(term),
    );
  }, [searchTerm, services]);

  const openCreateModal = useCallback(() => {
    setMode('create');
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setFieldErrors({});
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((service: ServiceItem) => {
    setMode('edit');
    setEditingId(service.id);
    setForm({
      name: service.name,
      description: service.description ?? '',
      durationMinutes: service.durationMinutes,
      price: service.price,
      isActive: service.isActive,
    });
    setFormError('');
    setFieldErrors({});
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    if (submitting) return;

    setIsModalOpen(false);
    setFormError('');
    setFieldErrors({});
  }, [submitting]);

  const handleChange = useCallback(
    <K extends keyof ServicePayload>(key: K, value: ServicePayload[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      // Xoá lỗi của field vừa sửa để không còn message cũ bị bám lại.
      setFieldErrors((prev) => {
        if (!(key in prev)) return prev;

        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    setFieldErrors({});

    try {
      if (mode === 'edit' && editingId !== null) {
        await serviceApi.update(editingId, form);
      } else {
        await serviceApi.create(form);
      }

      setIsModalOpen(false);
      setLoading(true);
      await loadServices(currentPage);
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setFormError('Đã có lỗi xảy ra khi lưu dịch vụ.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Backend không có PATCH nên bật/tắt = PUT lại toàn bộ payload.
  // Cập nhật bằng optimistic update rồi rollback nếu request thất bại.
  const toggleStatus = async (service: ServiceItem) => {
    if (togglingId !== null) return;

    const nextIsActive = !service.isActive;
    setTogglingId(service.id);
    setActionError('');
    setServices((prev) =>
      prev.map((item) =>
        item.id === service.id ? { ...item, isActive: nextIsActive } : item,
      ),
    );

    try {
      const updated = await serviceApi.update(service.id, {
        name: service.name,
        description: service.description,
        durationMinutes: service.durationMinutes,
        price: service.price,
        isActive: nextIsActive,
      });

      // Đồng bộ lại theo dữ liệu server trả về (phòng khi backend chuẩn hoá giá trị).
      setServices((prev) =>
        prev.map((item) => (item.id === service.id ? updated : item)),
      );
    } catch (err) {
      setServices((prev) =>
        prev.map((item) =>
          item.id === service.id ? { ...item, isActive: service.isActive } : item,
        ),
      );
      setActionError(
        err instanceof ApiError ? err.message : 'Không cập nhật được trạng thái dịch vụ.',
      );
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/80 backdrop-blur-xl p-4 rounded-3xl border border-slate-800 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm dịch vụ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold rounded-2xl text-sm flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm dịch vụ mới</span>
        </button>
      </div>

      {actionError && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-2xl text-sm flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-2xl text-sm flex items-center justify-between gap-4">
          <span className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </span>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setError('');
              void loadServices(currentPage);
            }}
            className="px-4 py-2 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs font-semibold hover:bg-rose-500/20 transition-all flex-shrink-0"
          >
            Thử lại
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-2xl flex items-center justify-center gap-3 py-24 text-slate-400 text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
          <span>Đang tải dịch vụ...</span>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-2xl flex flex-col items-center justify-center gap-3 py-24 text-center">
          <PackageX className="w-10 h-10 text-slate-600" />
          <p className="text-slate-400 text-sm">
            {searchTerm
              ? 'Không tìm thấy dịch vụ nào khớp với từ khoá.'
              : 'Chưa có dịch vụ nào trong hệ thống.'}
          </p>
        </div>
      ) : (
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="p-4 pl-6">Tên dịch vụ</th>
                  <th className="p-4">Mô tả</th>
                  <th className="p-4">Thời lượng</th>
                  <th className="p-4">Giá tiền</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 pr-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-sm">
                {filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-slate-950/40 transition-colors">
                    <td className="p-4 pl-6 font-bold text-white">{service.name}</td>
                    <td className="p-4 text-slate-400 max-w-xs truncate text-xs">
                      {service.description ?? '—'}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center space-x-1.5 bg-slate-950 border border-slate-800 px-3 py-1 rounded-xl text-xs text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{service.durationMinutes} phút</span>
                      </span>
                    </td>
                    <td className="p-4 font-bold text-indigo-400">
                      {service.price.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="p-4">
                      {service.isActive ? (
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-semibold border border-emerald-500/20">Hoạt động</span>
                      ) : (
                        <span className="px-3 py-1 bg-rose-500/10 text-rose-400 rounded-full text-xs font-semibold border border-rose-500/20">Đã khóa</span>
                      )}
                    </td>
                    <td className="p-4 pr-6 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(service)}
                        className="p-2.5 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white rounded-xl transition-all inline-flex items-center"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void toggleStatus(service)}
                        disabled={togglingId !== null}
                        title={service.isActive ? 'Khóa dịch vụ' : 'Mở lại dịch vụ'}
                        className={`p-2.5 rounded-xl transition-all inline-flex items-center border disabled:opacity-50 disabled:cursor-not-allowed ${
                          service.isActive
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                        }`}
                      >
                        {togglingId === service.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : service.isActive ? (
                          <Lock className="w-4 h-4" />
                        ) : (
                          <Unlock className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              setLoading(true);
              setError('');
              void loadServices(page);
            }}
          />
        </div>
      )}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white">
                {mode === 'edit' ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="text-slate-500 hover:text-white disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3.5 rounded-2xl text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Tên dịch vụ
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={200}
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Nhập tên..."
                  className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
                {fieldErrors.name?.[0] && (
                  <p className="text-xs text-rose-400">{fieldErrors.name[0]}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Mô tả dịch vụ
                </label>
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={form.description ?? ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Mô tả chi tiết..."
                  className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
                {fieldErrors.description?.[0] && (
                  <p className="text-xs text-rose-400">{fieldErrors.description[0]}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Thời lượng (phút)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={1440}
                    value={form.durationMinutes}
                    onChange={(e) =>
                      handleChange('durationMinutes', Number(e.target.value))
                    }
                    className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                  {fieldErrors.durationMinutes?.[0] && (
                    <p className="text-xs text-rose-400">
                      {fieldErrors.durationMinutes[0]}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Giá tiền (VNĐ)
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={1000}
                    value={form.price}
                    onChange={(e) => handleChange('price', Number(e.target.value))}
                    className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                  {fieldErrors.price?.[0] && (
                    <p className="text-xs text-rose-400">{fieldErrors.price[0]}</p>
                  )}
                </div>
              </div>

              <label className="flex items-center gap-2.5 text-sm text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                  className="w-4 h-4 accent-indigo-500"
                />
                <span>Dịch vụ đang hoạt động (khách hàng có thể đặt lịch)</span>
              </label>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="px-5 py-2.5 bg-slate-800 text-slate-300 rounded-2xl text-sm font-semibold hover:bg-slate-700 disabled:opacity-60"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-indigo-600/20 disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center space-x-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{submitting ? 'Đang lưu...' : 'Lưu dịch vụ'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


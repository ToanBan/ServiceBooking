'use client';

import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Clock, User, FileText, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ApiError } from '@/lib/http';
import { bookingApi } from '@/services/booking.service';
import { serviceApi } from '@/services/service.service';
import { staffApi } from '@/services/staff.service';
import type { AvailableSlot } from '@/types/booking';
import type { ServiceItem } from '@/types/service';
import type { StaffItem } from '@/types/staff';

function getLocalToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function BookingPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [selectedService, setSelectedService] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [customerNote, setCustomerNote] = useState('');

  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState('');
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void Promise.resolve().then(async () => {
      try {
        const [firstServicePage, firstStaffPage] = await Promise.all([
          serviceApi.list({ page: 1 }),
          staffApi.list({ isActive: true, page: 1 }),
        ]);
        if (cancelled) return;

        const [remainingServicePages, remainingStaffPages] = await Promise.all([
          Promise.all(Array.from(
            { length: Math.max(firstServicePage.totalPages - 1, 0) },
            (_, index) => serviceApi.list({ page: index + 2 }),
          )),
          Promise.all(Array.from(
            { length: Math.max(firstStaffPage.totalPages - 1, 0) },
            (_, index) => staffApi.list({ isActive: true, page: index + 2 }),
          )),
        ]);
        if (cancelled) return;

        const allServices = [firstServicePage, ...remainingServicePages]
          .flatMap((result) => result.items);
        const allStaff = [firstStaffPage, ...remainingStaffPages]
          .flatMap((result) => result.items);
        const activeServices = allServices.filter((service) => service.isActive);
        setServices(activeServices);
        setStaffList(allStaff);
        setSelectedService(String(activeServices[0]?.id ?? ''));
        setSelectedStaff(String(allStaff[0]?.id ?? ''));
      } catch (err) {
        if (!cancelled) {
          setOptionsError(
            err instanceof ApiError ? err.message : 'Không tải được dịch vụ và nhân viên.',
          );
        }
      } finally {
        if (!cancelled) setOptionsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedService || !selectedStaff || !selectedDate) return;

    let cancelled = false;

    void Promise.resolve().then(async () => {
      setSlotsLoading(true);
      setSlotsError('');

      try {
        const slots = await bookingApi.getAvailableSlots({
          serviceId: Number(selectedService),
          staffId: Number(selectedStaff),
          date: selectedDate,
        });
        if (!cancelled) setAvailableSlots(slots);
      } catch (err) {
        if (!cancelled) {
          setAvailableSlots([]);
          setSlotsError(
            err instanceof ApiError ? err.message : 'Không tải được khung giờ trống.',
          );
        }
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [selectedService, selectedStaff, selectedDate]);

  const resetSlots = () => {
    setSelectedSlot('');
    setAvailableSlots([]);
    setSlotsError('');
    setSlotsLoading(false);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const slot = availableSlots.find(
      (item) => `${item.startTime}-${item.endTime}` === selectedSlot,
    );
    if (!slot) {
      setError('Vui lòng chọn khung giờ còn trống.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await bookingApi.create({
        serviceId: Number(selectedService),
        staffId: Number(selectedStaff),
        date: selectedDate,
        startTime: slot.startTime,
        customerNote,
      });
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Không thể tạo booking. Vui lòng thử lại.',
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-8 text-center space-y-6">
          <div className="inline-flex p-4 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Đặt lịch thành công!</h2>
            <p className="text-sm text-slate-400">Booking của bạn đã được ghi nhận vào hệ thống ở trạng thái Pending.</p>
          </div>
          <Link
            href="/my-bookings"
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-indigo-600/20 inline-block"
          >
            Xem lịch đặt của tôi
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/services" className="inline-flex items-center space-x-2 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách dịch vụ</span>
        </Link>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 p-8 border-b border-indigo-900/40 space-y-2">
            <h1 className="text-2xl font-bold text-white">Tạo lịch hẹn dịch vụ</h1>
            <p className="text-slate-400 text-sm">Điền đầy đủ thông tin bên dưới để hoàn tất việc đặt lịch hẹn</p>
          </div>

          {(error || optionsError) && (
            <div className="mx-8 mt-6 bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-2xl text-sm flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error || optionsError}</span>
            </div>
          )}

          <form onSubmit={handleBookingSubmit} className="p-8 space-y-6">
            {/* Chọn Dịch vụ */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>1. Chọn dịch vụ</span>
              </label>
              <select
                value={selectedService}
                onChange={(e) => {
                  setSelectedService(e.target.value);
                  resetSlots();
                }}
                disabled={optionsLoading || services.length === 0}
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
              >
                <option value="">{optionsLoading ? 'Đang tải dịch vụ...' : 'Chọn dịch vụ'}</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} ({service.durationMinutes} phút - {service.price.toLocaleString('vi-VN')} đ)
                  </option>
                ))}
              </select>
            </div>

            {/* Chọn Nhân viên */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                <User className="w-4 h-4 text-indigo-400" />
                <span>2. Chọn nhân viên</span>
              </label>
              <select
                value={selectedStaff}
                onChange={(e) => {
                  setSelectedStaff(e.target.value);
                  resetSlots();
                }}
                disabled={optionsLoading || staffList.length === 0}
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
              >
                <option value="">{optionsLoading ? 'Đang tải nhân viên...' : 'Chọn nhân viên'}</option>
                {staffList.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.fullName} ({staff.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Chọn Ngày */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                <CalendarIcon className="w-4 h-4 text-indigo-400" />
                <span>3. Chọn ngày làm việc</span>
              </label>
              <input
                type="date"
                required
                min={getLocalToday()}
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  resetSlots();
                }}
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Chọn Khung giờ trống */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>4. Chọn khung giờ trống</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {slotsLoading ? (
                  <div className="col-span-full flex items-center justify-center gap-2 py-6 text-sm text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                    Đang tìm khung giờ phù hợp...
                  </div>
                ) : slotsError ? (
                  <p className="col-span-full py-4 text-sm text-rose-400">{slotsError}</p>
                ) : !selectedService || !selectedStaff || !selectedDate ? (
                  <p className="col-span-full py-4 text-sm text-slate-500">
                    Chọn dịch vụ, nhân viên và ngày để xem khung giờ trống.
                  </p>
                ) : availableSlots.length === 0 ? (
                  <p className="col-span-full py-4 text-sm text-slate-500">
                    Không có khung giờ phù hợp trong ngày đã chọn.
                  </p>
                ) : availableSlots.map((slot) => {
                  const slotKey = `${slot.startTime}-${slot.endTime}`;
                  const startTime = slot.startTime.slice(0, 5);
                  const endTime = slot.endTime.slice(0, 5);

                  return (
                  <button
                    type="button"
                    key={slotKey}
                    onClick={() => setSelectedSlot(slotKey)}
                    className={`py-3 px-3 rounded-2xl border text-sm font-medium transition-all ${
                      selectedSlot === slotKey
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-indigo-500/50'
                    }`}
                  >
                    {startTime} - {endTime}
                  </button>
                  );
                })}
              </div>
            </div>

            {/* Ghi chú */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">5. Ghi chú cho nhân viên (Tùy chọn)</label>
              <textarea
                rows={3}
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="Nhập yêu cầu chi tiết của bạn..."
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !selectedSlot}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold rounded-2xl shadow-xl shadow-indigo-600/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang xử lý đặt lịch...</span>
                </>
              ) : (
                <span>Xác nhận đặt lịch hẹn</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
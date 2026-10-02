'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  CalendarDays,
  CalendarPlus,
  Clock,
  Edit,
  Loader2,
  Mail,
  Plus,
  Search,
  Shield,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react';
import { ApiError } from '@/lib/http';
import { Pagination } from '@/components/shared/pagination';
import { staffApi } from '@/services/staff.service';
import type { StaffItem, WorkScheduleItem } from '@/types/staff';

const SCHEDULE_PREVIEW_COUNT = 5;

const EMPTY_SCHEDULE_FORM = {
  workDate: '',
  startTime: '08:00',
  endTime: '17:00',
};

function formatDate(value: string) {
  return value.slice(0, 10).split('-').reverse().join('/');
}

function formatTime(value: string) {
  return value.slice(0, 5);
}

export default function AdminStaffPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [staffPage, setStaffPage] = useState(1);
  const [staffTotalPages, setStaffTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedStaff, setSelectedStaff] = useState<StaffItem | null>(null);
  const [schedules, setSchedules] = useState<WorkScheduleItem[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [schedulesError, setSchedulesError] = useState('');

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleStaffId, setScheduleStaffId] = useState('');
  const [scheduleForm, setScheduleForm] = useState(EMPTY_SCHEDULE_FORM);
  const [scheduleError, setScheduleError] = useState('');
  const [savingSchedule, setSavingSchedule] = useState(false);

  const loadStaff = useCallback(async (pageNumber: number) => {
    try {
      const page = await staffApi.list({ page: pageNumber });
      setStaffList(page.items);
      setStaffPage(pageNumber);
      setStaffTotalPages(page.totalPages);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Không tải được danh sách nhân viên.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSchedules = useCallback(async (staffId: number) => {
    try {
      setSchedules(await staffApi.getSchedules(staffId));
    } catch (err) {
      setSchedulesError(
        err instanceof ApiError ? err.message : 'Không tải được lịch làm việc.',
      );
      setSchedules([]);
    } finally {
      setSchedulesLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => loadStaff(1));
  }, [loadStaff]);

  useEffect(() => {
    if (selectedStaff) {
      void Promise.resolve().then(() => loadSchedules(selectedStaff.id));
    }
  }, [loadSchedules, selectedStaff]);

  const filteredStaff = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return staffList;

    return staffList.filter(
      (staff) =>
        staff.fullName.toLowerCase().includes(term) ||
        staff.email.toLowerCase().includes(term),
    );
  }, [searchTerm, staffList]);

  const newestSchedules = useMemo(
    () => [...schedules].sort((a, b) =>
      b.workDate.localeCompare(a.workDate) || b.startTime.localeCompare(a.startTime),
    ),
    [schedules],
  );

  const openScheduleModal = (staff?: StaffItem) => {
    setScheduleStaffId(staff ? String(staff.id) : '');
    setScheduleForm({ ...EMPTY_SCHEDULE_FORM, workDate: new Date().toISOString().slice(0, 10) });
    setScheduleError('');
    setScheduleModalOpen(true);
  };

  const closeScheduleModal = () => {
    if (savingSchedule) return;
    setScheduleModalOpen(false);
    setScheduleError('');
  };

  const handleCreateSchedule = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const staffId = Number(scheduleStaffId);

    if (!staffId) {
      setScheduleError('Vui lòng chọn nhân viên.');
      return;
    }

    if (scheduleForm.startTime >= scheduleForm.endTime) {
      setScheduleError('Giờ bắt đầu phải nhỏ hơn giờ kết thúc.');
      return;
    }

    setSavingSchedule(true);
    setScheduleError('');

    try {
      await staffApi.createSchedule(staffId, {
        ...scheduleForm,
        startTime: `${scheduleForm.startTime}:00`,
        endTime: `${scheduleForm.endTime}:00`,
      });
      setScheduleModalOpen(false);

      if (selectedStaff?.id === staffId) {
        setSchedulesLoading(true);
        await loadSchedules(staffId);
      }
    } catch (err) {
      setScheduleError(
        err instanceof ApiError ? err.message : 'Không thể tạo lịch làm việc.',
      );
    } finally {
      setSavingSchedule(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/80 backdrop-blur-xl p-4 rounded-3xl border border-slate-800 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm nhân viên..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>

        <button
          type="button"
          onClick={() => openScheduleModal()}
          disabled={staffList.filter((staff) => staff.isActive).length === 0}
          className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-2xl text-sm flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
        >
          <UserPlus className="w-4 h-4" />
          <span>Thêm lịch làm việc</span>
        </button>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-2xl text-sm flex items-center justify-between gap-4">
          <span className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </span>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setError('');
              void loadStaff(staffPage);
            }}
            className="px-4 py-2 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs font-semibold hover:bg-rose-500/20 shrink-0"
          >
            Thử lại
          </button>
        </div>
      )}

      <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="p-4 pl-6">Họ và tên</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 pr-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={3} className="p-12 text-center text-slate-400">
                    <span className="inline-flex items-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                      Đang tải nhân viên...
                    </span>
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-12 text-center text-slate-400">
                    {searchTerm ? 'Không tìm thấy nhân viên phù hợp.' : 'Chưa có nhân viên.'}
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-950/40 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                          {staff.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white">{staff.fullName}</div>
                          <div className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                            <Mail className="w-3 h-3" />
                            <span>{staff.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center space-x-1 border px-3 py-1 rounded-xl text-xs font-semibold ${staff.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                        <Shield className="w-3.5 h-3.5" />
                        <span>{staff.isActive ? 'Hoạt động' : 'Ngừng hoạt động'}</span>
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSchedulesLoading(true);
                          setSchedulesError('');
                          setSelectedStaff(staff);
                        }}
                        title="Xem chi tiết nhân viên và lịch"
                        aria-label={`Xem chi tiết ${staff.fullName}`}
                        className="p-2.5 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white rounded-xl transition-all inline-flex items-center"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openScheduleModal(staff)}
                        disabled={!staff.isActive}
                        title={staff.isActive ? 'Thêm lịch làm việc' : 'Nhân viên đã ngừng hoạt động'}
                        aria-label={`Thêm lịch cho ${staff.fullName}`}
                        className="p-2.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all inline-flex items-center"
                      >
                        <CalendarPlus className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled
                        title="API hiện tại chưa hỗ trợ xóa nhân viên"
                        aria-label={`Xóa ${staff.fullName} (chưa được hỗ trợ)`}
                        className="p-2.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 opacity-40 cursor-not-allowed rounded-xl transition-all inline-flex items-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={staffPage}
          totalPages={staffTotalPages}
          onPageChange={(page) => {
            setLoading(true);
            setError('');
            void loadStaff(page);
          }}
        />
      </div>

      {selectedStaff && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-40">
          <section className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-900 flex items-center justify-between p-6 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white">Chi tiết nhân viên</h2>
                <p className="text-sm text-slate-400 mt-1">{selectedStaff.fullName} · {selectedStaff.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStaff(null)}
                aria-label="Đóng chi tiết"
                className="text-slate-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-indigo-400" />
                  Lịch làm việc
                </h3>
                <button
                  type="button"
                  onClick={() => openScheduleModal(selectedStaff)}
                  disabled={!selectedStaff.isActive}
                  className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  Thêm lịch
                </button>
              </div>

              {schedulesError && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-2xl text-sm flex items-center justify-between gap-4">
                  <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4" />{schedulesError}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSchedulesLoading(true);
                      void loadSchedules(selectedStaff.id);
                    }}
                    className="font-semibold"
                  >
                    Thử lại
                  </button>
                </div>
              )}

              {!schedulesLoading && !schedulesError && schedules.length > SCHEDULE_PREVIEW_COUNT && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <p className="text-xs text-slate-400">
                    Đang hiển thị {SCHEDULE_PREVIEW_COUNT} ca mới nhất trong {schedules.length} ca.
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push(`/admin/staff/${selectedStaff.id}/schedules?page=1`)}
                    className="px-4 py-2 bg-slate-800 text-slate-200 hover:bg-slate-700 rounded-xl text-sm font-semibold"
                  >
                    Xem tất cả lịch
                  </button>
                </div>
              )}

              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-950/60 text-xs uppercase text-slate-400">
                      <th className="p-4">Ngày làm</th>
                      <th className="p-4">Khung giờ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-sm">
                    {schedulesLoading ? (
                      <tr><td colSpan={2} className="p-8 text-center text-slate-400"><Loader2 className="inline w-5 h-5 animate-spin mr-2" />Đang tải lịch...</td></tr>
                    ) : schedules.length === 0 ? (
                      <tr><td colSpan={2} className="p-8 text-center text-slate-400">Nhân viên chưa có lịch làm việc.</td></tr>
                    ) : newestSchedules.slice(0, SCHEDULE_PREVIEW_COUNT).map((schedule) => (
                      <tr key={schedule.id} className="text-slate-300">
                        <td className="p-4">{formatDate(schedule.workDate)}</td>
                        <td className="p-4"><span className="inline-flex items-center gap-2"><Clock className="w-4 h-4 text-indigo-400" />{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      )}

      {scheduleModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-xl font-bold text-white">Thêm lịch làm việc</h3>
                {scheduleStaffId && <p className="text-sm text-slate-400 mt-1">{staffList.find((staff) => staff.id === Number(scheduleStaffId))?.fullName}</p>}
              </div>
              <button type="button" onClick={closeScheduleModal} disabled={savingSchedule} aria-label="Đóng form" className="text-slate-500 hover:text-white disabled:opacity-50"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreateSchedule} className="space-y-4">
              {!scheduleStaffId && (
                <div className="space-y-1.5">
                  <label htmlFor="schedule-staff" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Chọn nhân viên</label>
                  <select
                    id="schedule-staff"
                    required
                    value={scheduleStaffId}
                    onChange={(event) => setScheduleStaffId(event.target.value)}
                    className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  >
                    <option value="">Chọn nhân viên</option>
                    {staffList.filter((staff) => staff.isActive).map((staff) => <option key={staff.id} value={staff.id}>{staff.fullName} · {staff.email}</option>)}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="work-date" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Ngày làm việc</label>
                <input id="work-date" type="date" required value={scheduleForm.workDate} onChange={(event) => setScheduleForm((form) => ({ ...form, workDate: event.target.value }))} className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="start-time" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Giờ bắt đầu</label>
                  <input id="start-time" type="time" required value={scheduleForm.startTime} onChange={(event) => setScheduleForm((form) => ({ ...form, startTime: event.target.value }))} className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="end-time" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Giờ kết thúc</label>
                  <input id="end-time" type="time" required value={scheduleForm.endTime} onChange={(event) => setScheduleForm((form) => ({ ...form, endTime: event.target.value }))} className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
                </div>
              </div>

              {scheduleError && <p role="alert" className="text-sm text-rose-400 flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{scheduleError}</p>}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={closeScheduleModal} disabled={savingSchedule} className="px-5 py-2.5 bg-slate-800 text-slate-300 rounded-2xl text-sm font-semibold disabled:opacity-50">Hủy</button>
                <button type="submit" disabled={savingSchedule} className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-2">
                  {savingSchedule && <Loader2 className="w-4 h-4 animate-spin" />}
                  Lưu lịch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
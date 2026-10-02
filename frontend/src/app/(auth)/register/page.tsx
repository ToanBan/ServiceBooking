'use client';

import React, { useState } from 'react';
import { Lock, Mail, User, ArrowRight, Loader2, CalendarCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ApiError } from '@/lib/http';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/providers/auth-context';
import type { FieldErrors } from '@/types/api';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.');
      return;
    }

    setLoading(true);

    try {
      await register({ fullName, email, password, confirmPassword });
      router.replace(`${ROUTES.login}?registered=1`);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setError('Đã có lỗi xảy ra khi đăng ký.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2 bg-slate-950 font-sans">
      {/* Cột trái: Brand Showcase */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white relative overflow-hidden border-r border-indigo-900/40">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center space-x-3 relative z-10">
          <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/40 text-white">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <span className="font-bold text-lg tracking-tight">ServiceBooking System</span>
        </div>

        <div className="space-y-6 relative z-10 max-w-lg">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-semibold text-indigo-300 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Trải nghiệm dịch vụ đỉnh cao</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Tạo tài khoản mới <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-indigo-200">
              chỉ trong vài giây.
            </span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Tham gia ngay hệ thống đặt lịch hẹn chuyên nghiệp để trải nghiệm quy trình tự động hóa đặt lịch nhanh chóng, tiện lợi và an toàn.
          </p>
        </div>

        <div className="space-y-3 relative z-10">
          <div className="flex items-center space-x-3 text-sm text-slate-300">
            <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0" />
            <span>Xem lịch trình dịch vụ linh hoạt 24/7</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-slate-300">
            <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0" />
            <span>Quản lý danh sách booking và hủy lịch minh bạch</span>
          </div>
        </div>
      </div>

      {/* Cột phải: Form Đăng ký */}
      <div className="flex items-center justify-center p-8 lg:p-12 bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-md w-full space-y-6 bg-slate-900/80 p-8 rounded-3xl border border-slate-800 shadow-2xl shadow-black/50">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">Đăng ký tài khoản</h2>
            <p className="text-sm text-slate-400">Điền thông tin cá nhân để khởi tạo tài khoản của bạn</p>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-2xl text-sm font-medium animate-shake">
              {error}
            </div>
          )}

          {Object.keys(fieldErrors).length > 0 && (
            <ul className="space-y-1.5 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-300">
              {Object.entries(fieldErrors).map(([field, messages]) => (
                <li key={field}>
                  <span className="font-semibold capitalize">{field}:</span>{' '}
                  {messages.join(', ')}
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Họ và tên</label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Mật khẩu</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Xác nhận mật khẩu</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all shadow-inner"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold rounded-2xl shadow-xl shadow-indigo-600/20 flex items-center justify-center space-x-2 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed group active:scale-[0.98] mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang xử lý đăng ký...</span>
                </>
              ) : (
                <>
                  <span>Hoàn tất đăng ký</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-sm text-slate-400 pt-2 border-t border-slate-800/60">
            Đã có tài khoản?{' '}
            <Link href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
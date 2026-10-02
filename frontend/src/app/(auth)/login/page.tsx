'use client';

import React, { Suspense, useState } from 'react';
import { Lock, Mail, ArrowRight, Loader2, CalendarCheck, Sparkles, ShieldCheck, Clock } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ApiError } from '@/lib/http';
import { safeRedirectPath } from '@/lib/auth/safe-redirect';
import { ROUTES, ROLE_HOME } from '@/constants/routes';
import { useAuth } from '@/providers/auth-context';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(email, password);
      const safeRedirect = safeRedirectPath(searchParams.get('redirect'), user.role);

      router.replace(safeRedirect ?? ROLE_HOME[user.role]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Đã có lỗi xảy ra, vui lòng thử lại.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2 bg-slate-950 font-sans">
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
            <span>Nền tảng đặt lịch chuyên nghiệp & thông minh</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Quản lý lịch hẹn <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-indigo-200">
              dễ dàng hơn bao giờ hết.
            </span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Hệ thống kết nối trực tiếp khách hàng với chuyên gia, chống trùng lịch thông minh bằng thuật toán hiện đại và giao diện tối ưu trải nghiệm.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 relative z-10">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Bảo mật tuyệt đối</span>
            </div>
            <p className="text-xs text-slate-400">Phân quyền chặt chẽ Customer & Admin.</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
            <div className="flex items-center space-x-2 text-sky-400 font-semibold text-xs">
              <Clock className="w-4 h-4" />
              <span>Thời gian thực</span>
            </div>
            <p className="text-xs text-slate-400">Kiểm tra khung giờ trống tự động.</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-8 lg:p-12 bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-md w-full space-y-8 bg-slate-900/80 p-8 rounded-3xl border border-slate-800 shadow-2xl shadow-black/50">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">Đăng nhập tài khoản</h2>
            <p className="text-sm text-slate-400">Nhập thông tin bên dưới để truy cập hệ thống của bạn</p>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-2xl text-sm font-medium animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Email đăng nhập</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Mật khẩu</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all shadow-inner"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold rounded-2xl shadow-xl shadow-indigo-600/20 flex items-center justify-center space-x-2 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed group active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  <span>Đăng nhập hệ thống</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>



          <div className="text-center text-sm text-slate-400 pt-2 border-t border-slate-800/60">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
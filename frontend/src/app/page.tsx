'use client';

import React from 'react';
import Link from 'next/link';
import { CalendarCheck, ArrowRight, Sparkles, ShieldCheck, Clock, Users, CheckCircle2, Zap } from 'lucide-react';
import { UserMenu } from "@/components/auth/user-menu";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/30 text-white">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white">
              Service<span className="text-indigo-400">Booking</span>
            </span>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <Link href="/services" className="hover:text-indigo-400 transition-colors">Dịch vụ</Link>
            <Link href="/booking" className="hover:text-indigo-400 transition-colors">Đặt lịch ngay</Link>
            <Link href="/my-bookings" className="hover:text-indigo-400 transition-colors">Lịch hẹn của tôi</Link>
          </nav>

          {/* Action Buttons / User Menu */}
          <UserMenu />
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 px-6">
        {/* Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-semibold text-indigo-300 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Nền tảng quản lý & đặt lịch hẹn chuyên nghiệp thế hệ mới</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.1]">
            Giải pháp đặt lịch <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-indigo-200">
              Thông minh & Tự động
            </span>
          </h1>

          <p className="text-slate-400 text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
            Kết nối khách hàng với chuyên gia hàng đầu. Chống trùng lịch hoàn hảo, quản lý ca làm việc linh hoạt và tối ưu hóa toàn bộ quy trình vận hành dịch vụ của bạn.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/services"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/30 flex items-center justify-center space-x-3 transition-all group"
            >
              <span>Khám phá dịch vụ</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/booking"
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold rounded-2xl transition-all"
            >
              Đặt lịch hẹn ngay
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Features / Bento Grid Section */}
      <section className="py-20 px-6 border-t border-slate-900 bg-slate-950/50">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight">Tính năng vượt trội</h2>
            <p className="text-slate-400 text-sm max-w-lg mx-auto">
              Được thiết kế tỉ mỉ mang lại trải nghiệm mượt mà và tối ưu hóa hiệu suất làm việc.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl space-y-4 hover:border-indigo-500/50 transition-all">
              <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Chống trùng lịch thông minh</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Hệ thống tự động kiểm tra thời gian làm việc của nhân viên và trạng thái booking, loại bỏ hoàn toàn việc đặt trùng giờ.
              </p>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl space-y-4 hover:border-indigo-500/50 transition-all">
              <div className="w-12 h-12 bg-sky-500/10 border border-sky-500/20 rounded-2xl flex items-center justify-center text-sky-400">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Thời gian thực 24/7</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Khách hàng dễ dàng tra cứu khung giờ trống, đặt lịch hẹn và theo dõi trạng thái đơn hàng bất cứ lúc nào.
              </p>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl space-y-4 hover:border-indigo-500/50 transition-all">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Phân quyền chặt chẽ</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Quản trị viên dễ dàng quản lý dịch vụ, thiết lập ca làm việc và duyệt booking trực quan trên trang quản trị.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Footer */}
      <footer className="border-t border-slate-900 py-12 px-6 text-center text-sm text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <CalendarCheck className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-400">ServiceBooking System © 2026</span>
          </div>
          <div className="flex space-x-6">
            <Link href="/services" className="hover:text-slate-300 transition-colors">Dịch vụ</Link>
            <Link href="/login" className="hover:text-slate-300 transition-colors">Đăng nhập</Link>
            <Link href="/register" className="hover:text-slate-300 transition-colors">Đăng ký</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
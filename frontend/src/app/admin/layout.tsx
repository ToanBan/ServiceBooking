'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarCheck, LayoutDashboard, Users, FileText, ShieldAlert } from 'lucide-react';
import { AdminGuard } from '@/components/auth/admin-guard';
import { UserMenu } from '@/components/auth/user-menu';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Quản lý Booking', href: '/admin/bookings', icon: FileText },
    { name: 'Quản lý Dịch vụ', href: '/admin/services', icon: LayoutDashboard },
    { name: 'Quản lý Nhân viên', href: '/admin/staff', icon: Users },
  ];

  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-indigo-500 selection:text-white">
        {/* Sidebar Cố định */}
        <aside className="w-72 bg-slate-900/90 backdrop-blur-2xl border-r border-slate-800/80 flex flex-col justify-between hidden lg:flex">
          <div className="p-6 space-y-8">
            {/* Logo Brand */}
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-tr from-indigo-600 to-blue-600 rounded-2xl shadow-lg shadow-indigo-600/30 text-white">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-extrabold text-base tracking-tight text-white">ServiceBooking</h1>
                <p className="text-xs text-indigo-400 font-medium">Admin Control Center</p>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-600/25'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar ẩn dưới lg, nên UserMenu chỉ hiện ở sidebar cho desktop. */}
          <div className="hidden lg:block p-4 border-t border-slate-800/80">
            <UserMenu />
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-20 bg-slate-900/50 backdrop-blur-xl border-b border-slate-800/80 px-8 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShieldAlert className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white hidden sm:block">Hệ thống quản trị viên</h2>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="hidden sm:block text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Về trang chủ khách hàng →
              </Link>
              {/* Sidebar ẩn ở mobile nên cần UserMenu ở header cho mọi kích thước. */}
              <UserMenu />
            </div>
          </header>

          <main className="p-8 flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}
"use client";

import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import { UserMenu } from "@/components/auth/user-menu";

const NAV_ITEMS = [
  { name: "Dịch vụ", href: "/services" },
  { name: "Đặt lịch ngay", href: "/booking" },
  { name: "Lịch hẹn của tôi", href: "/my-bookings" },
];

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/30 text-white">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white">
              Service<span className="text-indigo-400">Booking</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-indigo-400 transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <UserMenu />
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}

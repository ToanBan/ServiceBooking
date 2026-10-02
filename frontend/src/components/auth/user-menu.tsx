"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Home,
  LogOut,
  Loader2,
  Settings,
  CalendarDays,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/providers/auth-context";
import { USER_ROLE } from "@/types/auth";

export function UserMenu() {
  const { user, status, logout } = useAuth();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const inTrigger = triggerRef.current?.contains(target);
      const inDropdown = dropdownRef.current?.contains(target);

      if (!inTrigger && !inDropdown) close();
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen, close]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  useEffect(() => {
    close();
  }, [pathname, close]);

  useLayoutEffect(() => {
    if (!isOpen) return;

    const update = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const width = 288; // w-72
      const gap = 12; // mt-3
      const viewportWidth = window.innerWidth;
      const margin = 16;

      const left = Math.max(
        margin,
        Math.min(rect.right - width, viewportWidth - width - margin),
      );

      setPosition({ top: rect.bottom + gap, left });
    };

    update();

    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
      close();
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center space-x-3" aria-hidden>
        <div className="w-10 h-10 rounded-2xl bg-slate-800/80 animate-pulse" />
        <div className="hidden sm:block w-24 h-3 rounded-full bg-slate-800/80 animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-4">
        <Link
          href={ROUTES.login}
          className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
        >
          Đăng nhập
        </Link>
        <Link
          href={ROUTES.register}
          className="hidden sm:block px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-sm font-semibold rounded-2xl shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98]"
        >
          Đăng ký miễn phí
        </Link>
      </div>
    );
  }

  const isAdmin = user.role === USER_ROLE.Admin;

  return (
    <div className="relative">
      <button
        type="button"
        ref={triggerRef}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex items-center space-x-3 pl-1.5 pr-3 py-1.5 rounded-2xl border border-slate-800 hover:border-indigo-500/50 bg-slate-900/60 transition-all"
      >
        <span className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm">
          {user.fullName.charAt(0).toUpperCase()}
        </span>
        <span className="hidden sm:block text-left max-w-[10rem]">
          <span className="block text-sm font-bold text-white truncate leading-tight">
            {user.fullName}
          </span>
          <span className="block text-xs text-slate-500 truncate leading-tight">
            {user.email}
          </span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && isMounted && createPortal(
        <div
          ref={dropdownRef}
          role="menu"
          style={{ top: position.top, left: position.left }}
          className="fixed w-72 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl shadow-black/60 overflow-hidden z-[1000]"
        >
          <div className="flex items-start space-x-3 p-4">
            <span className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold flex-shrink-0">
              {user.fullName.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate">{user.fullName}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
              <span
                className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isAdmin
                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                {isAdmin ? "Admin" : "Khách hàng"}
              </span>
            </div>
          </div>

          <div className="border-t border-slate-800/80 py-2">
            <Link
              href="/"
              role="menuitem"
              className="flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800/60 hover:text-white transition-colors"
            >
              <Home className="w-4 h-4 text-slate-500" />
              <span>Trang chủ</span>
            </Link>

            {isAdmin ? (
              <Link
                href="/admin/bookings"
                role="menuitem"
                className="flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800/60 hover:text-white transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-500" />
                <span>Trang quản trị</span>
              </Link>
            ) : (
              <Link
                href={ROUTES.myBookings}
                role="menuitem"
                className="flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800/60 hover:text-white transition-colors"
              >
                <CalendarDays className="w-4 h-4 text-slate-500" />
                <span>Lịch của tôi</span>
              </Link>
            )}
          </div>

          <div className="border-t border-slate-800/80 p-2">
            <button
              type="button"
              role="menuitem"
              onClick={() => void handleLogout()}
              disabled={isLoggingOut}
              className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-2xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              <span>
                {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
              </span>
            </button>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

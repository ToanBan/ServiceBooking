import Link from 'next/link';
import { ShieldX } from 'lucide-react';

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
      <section className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900/80 p-8 text-center shadow-2xl shadow-black/40">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400">
          <ShieldX className="h-8 w-8" aria-hidden="true" />
        </div>
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-rose-400">
          Lỗi 403
        </p>
        <h1 className="mb-3 text-2xl font-bold">Bạn không có quyền truy cập</h1>
        <p className="mb-8 text-sm leading-relaxed text-slate-400">
          Tài khoản của bạn không được phép truy cập khu vực quản trị viên.
        </p>
        <Link
          href="/"
          className="inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
        >
          Quay về trang chủ
        </Link>
      </section>
    </main>
  );
}

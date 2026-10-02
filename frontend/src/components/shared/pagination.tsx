import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const firstVisible = Math.max(1, page - 2);
  const lastVisible = Math.min(totalPages, page + 2);
  const visiblePages = Array.from(
    { length: lastVisible - firstVisible + 1 },
    (_, index) => firstVisible + index,
  );

  const buttonClass =
    'inline-flex h-9 min-w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 px-3 text-sm font-medium text-slate-300 transition hover:border-indigo-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <nav
      aria-label="Phân trang"
      className="flex flex-wrap items-center justify-center gap-2 border-t border-slate-800 px-4 py-4"
    >
      <button
        type="button"
        className={buttonClass}
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Trang trước"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {firstVisible > 1 && (
        <>
          <button type="button" className={buttonClass} onClick={() => onPageChange(1)}>
            1
          </button>
          {firstVisible > 2 && <span className="px-1 text-slate-500">...</span>}
        </>
      )}

      {visiblePages.map((visiblePage) => (
        <button
          key={visiblePage}
          type="button"
          className={`${buttonClass} ${visiblePage === page ? 'border-indigo-500 bg-indigo-600 text-white' : ''}`}
          onClick={() => onPageChange(visiblePage)}
          aria-current={visiblePage === page ? 'page' : undefined}
        >
          {visiblePage}
        </button>
      ))}

      {lastVisible < totalPages && (
        <>
          {lastVisible < totalPages - 1 && <span className="px-1 text-slate-500">...</span>}
          <button type="button" className={buttonClass} onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </button>
        </>
      )}

      <button
        type="button"
        className={buttonClass}
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Trang sau"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
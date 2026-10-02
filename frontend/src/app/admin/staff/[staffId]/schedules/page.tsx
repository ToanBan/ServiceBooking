import { notFound } from 'next/navigation';
import StaffScheduleList from './staff-schedule-list';

interface StaffSchedulesPageProps {
  params: Promise<{ staffId: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}

export default async function StaffSchedulesPage({
  params,
  searchParams,
}: StaffSchedulesPageProps) {
  const [{ staffId: rawStaffId }, query] = await Promise.all([params, searchParams]);
  const staffId = Number(rawStaffId);

  if (!Number.isInteger(staffId) || staffId <= 0) notFound();

  const rawPage = Array.isArray(query.page) ? query.page[0] : query.page;
  const requestedPage = Number(rawPage ?? '1');
  const initialPage = Number.isInteger(requestedPage) && requestedPage > 0
    ? requestedPage
    : 1;

  return <StaffScheduleList staffId={staffId} initialPage={initialPage} />;
}
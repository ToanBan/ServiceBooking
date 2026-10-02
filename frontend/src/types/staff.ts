export interface StaffItem {
  id: number;
  fullName: string;
  email: string;
  isActive: boolean;
}

export interface StaffPage {
  items: StaffItem[];
  totalCount: number;
  offset: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface WorkScheduleItem {
  id: number;
  staffId: number;
  workDate: string;
  startTime: string;
  endTime: string;
}

export interface WorkSchedulePayload {
  workDate: string;
  startTime: string;
  endTime: string;
}
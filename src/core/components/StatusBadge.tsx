import type { ReactNode } from 'react';

type StatusVariant = 'pending' | 'success' | 'error' | 'warning' | 'info' | 'default';

interface StatusBadgeProps {
  children: ReactNode;
  variant?: StatusVariant;
  className?: string;
}

const VARIANT_CLASSES: Record<StatusVariant, string> = {
  pending: 'status-pending',
  success: 'status-approved status-confirmed status-completed',
  error: 'status-rejected status-cancelled status-danger',
  warning: 'status-warning',
  info: 'status-info',
  default: '',
};

/**
 * 상태 뱃지 컴포넌트
 *
 * @example
 * <StatusBadge variant="pending">대기중</StatusBadge>
 * <StatusBadge variant="success">승인됨</StatusBadge>
 */
export function StatusBadge({ children, variant = 'default', className = '' }: StatusBadgeProps) {
  return (
    <span className={`status-badge ${VARIANT_CLASSES[variant]} ${className}`.trim()}>
      {children}
    </span>
  );
}

// 예약 상태용 헬퍼
type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

const BOOKING_STATUS_CONFIG: Record<BookingStatus, { text: string; variant: StatusVariant }> = {
  pending: { text: '대기중', variant: 'pending' },
  confirmed: { text: '확정', variant: 'success' },
  completed: { text: '완료', variant: 'success' },
  cancelled: { text: '취소됨', variant: 'error' },
};

export function BookingStatusBadge({ status }: { status: string }) {
  const config = BOOKING_STATUS_CONFIG[status as BookingStatus] || { text: status, variant: 'default' as const };
  return <StatusBadge variant={config.variant}>{config.text}</StatusBadge>;
}

// 승인 상태용 헬퍼
type ApprovalStatus = 'pending' | 'approved' | 'rejected';

const APPROVAL_STATUS_CONFIG: Record<ApprovalStatus, { text: string; variant: StatusVariant }> = {
  pending: { text: '승인 대기', variant: 'pending' },
  approved: { text: '승인됨', variant: 'success' },
  rejected: { text: '거절됨', variant: 'error' },
};

export function ApprovalStatusBadge({ status }: { status: string }) {
  const config = APPROVAL_STATUS_CONFIG[status as ApprovalStatus] || { text: status, variant: 'default' as const };
  return <StatusBadge variant={config.variant}>{config.text}</StatusBadge>;
}

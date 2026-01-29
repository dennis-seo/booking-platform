import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from './LoadingSpinner';
import type { ReactNode } from 'react';

interface RequireAuthProps {
  children: ReactNode;
  /** 인증 조건을 체크하는 함수. false 반환 시 redirectTo로 이동 */
  check?: (auth: ReturnType<typeof useAuth>) => boolean;
  /** 조건 불충족 시 리다이렉트할 경로 */
  redirectTo?: string;
  /** 리다이렉트 대신 표시할 fallback 컴포넌트 */
  fallback?: ReactNode;
  /** 로그인 필수 여부 (기본: true) */
  requireLogin?: boolean;
}

/**
 * 인증/권한 가드 컴포넌트
 *
 * @example
 * // 로그인 필수
 * <RequireAuth>
 *   <ProtectedPage />
 * </RequireAuth>
 *
 * @example
 * // 관리자만 접근
 * <RequireAuth
 *   check={(auth) => auth.user?.role === 'admin'}
 *   fallback={<AccessDenied />}
 * >
 *   <AdminPage />
 * </RequireAuth>
 */
export function RequireAuth({
  children,
  check,
  redirectTo = '/login',
  fallback,
  requireLogin = true,
}: RequireAuthProps) {
  const auth = useAuth();
  const location = useLocation();

  if (auth.isLoading) {
    return <LoadingSpinner />;
  }

  // 로그인 필수인데 미인증 시
  if (requireLogin && !auth.isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // 추가 조건 체크
  if (check && !check(auth)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

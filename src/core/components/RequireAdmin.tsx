import { RequireAuth } from './RequireAuth';

interface RequireAdminProps {
  children: React.ReactNode;
}

const AccessDenied = () => (
  <div className="access-denied">
    <h1>접근 권한이 없습니다</h1>
    <p>이 페이지는 관리자 또는 사업자만 접근할 수 있습니다.</p>
    <a href="/" className="btn btn-primary btn-md">홈으로 돌아가기</a>
  </div>
);

export function RequireAdmin({ children }: RequireAdminProps) {
  return (
    <RequireAuth
      check={(auth) => auth.user?.role === 'admin' || auth.user?.role === 'business_owner'}
      fallback={<AccessDenied />}
    >
      {children}
    </RequireAuth>
  );
}

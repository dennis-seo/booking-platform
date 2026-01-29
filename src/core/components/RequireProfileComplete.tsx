import { RequireAuth } from './RequireAuth';

interface RequireProfileCompleteProps {
  children: React.ReactNode;
}

export function RequireProfileComplete({ children }: RequireProfileCompleteProps) {
  return (
    <RequireAuth
      check={(auth) => !auth.isAuthenticated || auth.isProfileComplete}
      redirectTo="/profile/complete"
      requireLogin={false}
    >
      {children}
    </RequireAuth>
  );
}

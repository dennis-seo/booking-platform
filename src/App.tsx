import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './core/contexts/AuthContext';
import { MainLayout } from './core/layouts/MainLayout';
import { RequireProfileComplete } from './core/components/RequireProfileComplete';
import { RequireAdmin } from './core/components/RequireAdmin';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { ProfileCompletePage } from './pages/ProfileCompletePage';
import { NotFoundPage } from './pages/NotFoundPage';

// Hair Salon Feature Pages
import { HairShopListPage } from './features/hairSalon/pages/HairShopListPage';
import { HairShopDetailPage } from './features/hairSalon/pages/HairShopDetailPage';
import { HairBookingPage } from './features/hairSalon/pages/HairBookingPage';
import { HairMyBookingsPage } from './features/hairSalon/pages/HairMyBookingsPage';

// Hair Salon Admin Pages
import { AdminDashboardPage } from './features/hairSalon/admin/AdminDashboardPage';
import { ShopRegisterPage } from './features/hairSalon/admin/ShopRegisterPage';
import { ShopManagePage } from './features/hairSalon/admin/ShopManagePage';
import { ServiceManagePage } from './features/hairSalon/admin/ServiceManagePage';
import { StylistManagePage } from './features/hairSalon/admin/StylistManagePage';
import { ScheduleManagePage } from './features/hairSalon/admin/ScheduleManagePage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Main Routes */}
          <Route path="/" element={<HomePage />} />

          {/* Hair Salon Feature Routes */}
          <Route path="/hair">
            <Route index element={<HairShopListPage />} />
            <Route path=":shopId" element={<HairShopDetailPage />} />
            <Route path=":shopId/booking" element={<RequireProfileComplete><HairBookingPage /></RequireProfileComplete>} />
            <Route path="my-bookings" element={<HairMyBookingsPage />} />

            {/* Admin Routes */}
            <Route path="admin" element={<RequireAdmin><AdminDashboardPage /></RequireAdmin>} />
            <Route path="admin/register" element={<RequireAdmin><ShopRegisterPage /></RequireAdmin>} />
            <Route path="admin/:shopId" element={<RequireAdmin><ShopManagePage /></RequireAdmin>} />
            <Route path="admin/:shopId/services" element={<RequireAdmin><ServiceManagePage /></RequireAdmin>} />
            <Route path="admin/:shopId/stylists" element={<RequireAdmin><StylistManagePage /></RequireAdmin>} />
            <Route path="admin/:shopId/schedule" element={<RequireAdmin><ScheduleManagePage /></RequireAdmin>} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Login (outside MainLayout) */}
        <Route path="/login" element={<LoginPage />} />

        {/* Profile Complete (outside MainLayout) */}
        <Route path="/profile/complete" element={<ProfileCompletePage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;

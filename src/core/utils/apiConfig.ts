export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    register: '/auth/register',
    me: '/auth/me',
  },
  hairShop: {
    list: '/hair-shops',
    detail: (id: string) => `/hair-shops/${id}`,
    services: (shopId: string) => `/hair-shops/${shopId}/services`,
    stylists: (shopId: string) => `/hair-shops/${shopId}/stylists`,
    slots: (shopId: string) => `/hair-shops/${shopId}/slots`,
  },
  hairBooking: {
    list: '/hair-bookings',
    detail: (id: string) => `/hair-bookings/${id}`,
    myBookings: '/hair-bookings/my',
    create: '/hair-bookings',
    cancel: (id: string) => `/hair-bookings/${id}/cancel`,
  },
} as const;

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

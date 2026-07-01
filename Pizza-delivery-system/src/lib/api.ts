import type {
  AuthTokens,
  LoginPayload,
  SignUpPayload,
  CreateOrderPayload,
  Order,
  User,
} from '@/types';
import { useAuthStore } from '@/store/auth';

const PROXY_BASE = '/api/proxy';

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = useAuthStore.getState().accessToken;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${PROXY_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    if (res.status === 401) {
      useAuthStore.getState().clearTokens();
      throw new Error('Session expired. Please log in again.');
    }
    let detail = 'An error occurred';
    try {
      const errData = await res.json();
      detail = errData.detail || detail;
    } catch {
      // ignore parse errors
    }
    throw new Error(detail);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  // Auth
  signup: (data: SignUpPayload) =>
    apiFetch<User>('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: LoginPayload) =>
    apiFetch<AuthTokens>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  refresh: (refreshToken: string) =>
    apiFetch<{ access: string }>('/auth/refresh', {
      headers: { Authorization: `Bearer ${refreshToken}` },
    }),

  // Orders
  createOrder: (data: CreateOrderPayload) =>
    apiFetch<Order>('/orders/order', { method: 'POST', body: JSON.stringify(data) }),

  getMyOrders: () => apiFetch<Order[]>('/orders/user/orders'),

  getMyOrderById: (id: number) => apiFetch<Order>(`/orders/user/order/${id}/`),

  updateOrder: (id: number, data: CreateOrderPayload) =>
    apiFetch<Order>(`/orders/order/update/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteOrder: (id: number) =>
    apiFetch<void>(`/orders/order/delete/${id}/`, { method: 'DELETE' }),

  // Admin
  getAllOrders: () => apiFetch<Order[]>('/orders/orders'),

  getOrderById: (id: number) => apiFetch<Order>(`/orders/orders/${id}`),

  updateOrderStatus: (id: number, status: string) =>
    apiFetch<Order>(`/orders/order/update/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ order_status: status }),
    }),

  // Check if current user is staff (admin) by probing the admin-only endpoint
  checkIsStaff: async (accessToken: string): Promise<boolean> => {
    try {
      const res = await fetch(`${PROXY_BASE}/orders/orders`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.ok; // 200 = staff, 401 = not staff
    } catch {
      return false;
    }
  },
};
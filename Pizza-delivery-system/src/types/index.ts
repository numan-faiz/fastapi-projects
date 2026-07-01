export interface User {
  id?: number;
  name?: string;
  username: string;
  email: string;
  is_staff: boolean;
  is_active: boolean;
}

export interface SignUpPayload {
  name?: string;
  username: string;
  email: string;
  password: string;
  is_staff?: boolean;
  is_active?: boolean;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  name?: string;
  username?: string;
}

export type PizzaSize = 'SMALL' | 'MEDIUM' | 'LARGE' | 'EXTRA-LARGE';

export type OrderStatus = 'PENDING' | 'IN-TRANSIT' | 'DELIVERED';

export interface Order {
  id: number;
  quantity: number;
  pizza_size: PizzaSize;
  order_status: OrderStatus;
  unit_price: number;
  total_price: number;
  name?: string;
  username?: string;
  user_id?: number;
  user?: Pick<User, 'id' | 'username' | 'name'>;
}

export interface CreateOrderPayload {
  quantity: number;
  pizza_size: PizzaSize;
}

export type ViewType = 'auth' | 'dashboard' | 'admin';
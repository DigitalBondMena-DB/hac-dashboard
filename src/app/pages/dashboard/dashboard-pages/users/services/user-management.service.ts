import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WEB_SITE_BASE_URL } from '../../../../../core/constants/WEB_SITE_BASE_UTL';

// Interface for address
export interface Address {
  id: number;
  user_id: number;
  location_id: number;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  city: string;
  notes: string | null;
  active_status: boolean;
  created_at: string;
  updated_at: string;
}

// Interface for order
export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  user_address_id: number;
  promo_code_id: number | null;
  promo_code_value: string;
  subtotal: string;
  tax: string;
  shipping: string;
  total: string;
  payment_method: string;
  order_status: string;
  notes: string | null;
  active_status: boolean;
  order_date: string;
  order_time: string;
  created_at: string;
  updated_at: string;
}

// Interface for a single user
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  email_verified_at: string | null;
  role: string;
  admin_status: number | string; // Can be 0,   1, or their string equivalents
  verify_status: number | string;
  deactive_status: number | string;
  delete_status: number | string;
  created_at: string;
  updated_at: string;
  addresses?: Address[]; // Included in single user response
  confirmed_orders?: Order[]; // Included in single user and orders response
}

// Interface for users list response
export interface UsersListResponse {
  rows: {
    current_page: number;
    data: User[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: { url: string | null; label: string; active: boolean }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

// Interface for single user response
export interface SingleUserResponse {
  row: User;
}

// Interface for success response (used for update admin status)
export interface SuccessResponse {
  success: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  constructor(private http: HttpClient) {}

  // Get all users
  getAllUsers(): Observable<UsersListResponse> {
    return this.http.get<UsersListResponse>(`${WEB_SITE_BASE_URL}users`);
  }

  // Get a single user by ID
  getUserById(id: string): Observable<SingleUserResponse> {
    return this.http.get<SingleUserResponse>(`${WEB_SITE_BASE_URL}users/${id}`);
  }

  // Get user orders by ID
  getUserOrders(id: string): Observable<SingleUserResponse> {
    return this.http.get<SingleUserResponse>(`${WEB_SITE_BASE_URL}users/showOrders/${id}`);
  }

  // Update admin status
  updateAdminStatus(userId: string, adminStatus: '0' | '1'): Observable<SuccessResponse> {
    return this.http.post<SuccessResponse>(
      `${WEB_SITE_BASE_URL}users/user_update/${userId}`,
      { admin_status: adminStatus }
    );
  }
  getCommercialUsers(page: number): Observable<any> {
    return this.http.get<any>(`${WEB_SITE_BASE_URL}commercialindex?page=${page}`);
  }
}
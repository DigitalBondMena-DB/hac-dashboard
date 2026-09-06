import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WEB_SITE_BASE_URL } from '../../../../../core/constants/WEB_SITE_BASE_UTL';

// Interfaces for nested objects
export interface Product {
  id: number;
  category_id: number;
  subcategory_id: number;
  en_name: string;
  ar_name: string;
  en_slug: string;
  ar_slug: string;
  en_description: string;
  ar_description: string;
  price: string;
  sale_price: string;
  price_after_sale: string;
  stock_status: boolean;
  main_image: string;
  additional_images: string | null;
  en_specifications: string | null;
  ar_specifications: string | null;
  featured: number;
  active_status: boolean;
  en_more_information: string;
  ar_more_information: string;
  en_ingredient: string;
  ar_ingredient: string;
  en_how_to_use: string;
  ar_how_to_use: string;
  product_counter: number;
  created_at: string;
  updated_at: string;
}

export interface OrderDetail {
  id: number;
  order_id: number;
  product_id: number;
  product_choice_id: number | null;
  quantity: number;
  unit_price: string;
  subtotal: string;
  active_status: boolean;
  created_at: string;
  cash_on_shipping: number;
  updated_at: string;
  product: Product;
  choice: any | null;
}

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

// Interface for a single order
export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  user_address_id: number;
  promo_code_id: number | null;
  promo_code_value: string;
  subtotal: string;
  cash_on_shipping: number;
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
  // commercial_status: number | null;
  details: OrderDetail[];
  address: Address;
  user?: User;
}

// Interface for orders list response
export interface OrdersListResponse {
  orders: Order[];
}
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  city: string;
  role: string;
}

// Interface for single order response
export interface SingleOrderResponse {
  order: Order;
}

// Interface for order update response
export interface OrderUpdateResponse {
  message: string;
  order: Order;
}

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  constructor(private http: HttpClient) {}

  // Get all orders
  getAllOrders(): Observable<OrdersListResponse> {
    return this.http.get<OrdersListResponse>(`${WEB_SITE_BASE_URL}orders`);
  }

  // Get a single order by ID
  getOrderById(id: string): Observable<SingleOrderResponse> {
    return this.http.get<SingleOrderResponse>(
      `${WEB_SITE_BASE_URL}orders/${id}`
    );
  }

  // Update order status
  updateOrderStatus(
    orderId: string,
    statusData: { order_status: string }
  ): Observable<OrderUpdateResponse> {
    return this.http.post<OrderUpdateResponse>(
      `${WEB_SITE_BASE_URL}orders/${orderId}`,
      statusData
    );
  }

  // Cancel an order
  cancelOrder(orderId: string): Observable<OrderUpdateResponse> {
    return this.http.post<OrderUpdateResponse>(
      `${WEB_SITE_BASE_URL}orders/${orderId}/cancel`,
      {}
    );
  }
}

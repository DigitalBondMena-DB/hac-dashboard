export interface IOrderById {
  order: Order;
  orderdetails: Orderdetail[];
}

export interface Orderdetail {
  id: number;
  order_id: number;
  product_id: number;
  product_piece_price_id: null;
  product_name: null;
  pieces: null | number;
  price: number;
  quantity: number;
  offer: number;
  state: number;
  en_choice_name: null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  user_id: number;
  branch_id: number;
  address_id: number;
  address_information: null;
  location_id: null;
  location_title: null;
  sub_location_id: number;
  sub_location_title: string;
  total_price: number;
  sub_total: number;
  confirmed_by_user: number;
  status: string;
  combo_id: number;
  combo_name: null;
  promo_code_id: number;
  order_date: string;
  order_time: null;
  created_at: string;
  updated_at: string;
  date: string;
  time: string;
  user: User;
  sublocationinfo: Sublocationinfo;
  addressinfo: Addressinfo;
  promo: Promo;
}

export interface Promo {
  id: number;
  code: string;
  percentage: number;
  status: number;
  counter_use: number;
  created_at: string;
  updated_at: string;
}

export interface Addressinfo {
  id: number;
  user_id: number;
  location_id: number;
  sub_location_id: number;
  phone: null;
  address_type: null;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Sublocationinfo {
  id: number;
  en_sub_location: string;
  ar_sub_location: string;
  location_id: number;
  price: number;
  branch_id: number;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  phone: string;
  email: string;
  email_verified_at: null;
  role: string;
  branch_id: number;
  google_id: null;
  apple_id: null;
  device_token: null;
  admin_status: number;
  deactive_status: number;
  delete_status: number;
  forget_code: null;
  verify_code: null;
  verify_status: null;
  created_at: string;
  updated_at: string;
}

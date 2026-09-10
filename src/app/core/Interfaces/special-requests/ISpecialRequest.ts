export interface ISpecialRequestResponse {
  rows: ISpecialRequest[];
}

export interface ISpecialRequest {
  id: number;
  name: string;
  email: string;
  phone: string;
  city?: string;
  doctor_name?: string;
  hospital_name?: string;
  doctor_code?: string;
  address?: string;
  product_id: number;
  quantity: number;
  is_read: number | boolean | null;
  created_at: string;
  updated_at: string;
  product: any;
}


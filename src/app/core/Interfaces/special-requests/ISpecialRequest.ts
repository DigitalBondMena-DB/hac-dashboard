export interface ISpecialRequestResponse {
  rows: ISpecialRequest[];
}

export interface ISpecialRequest {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  product_id: number;
  quantity: number;
  is_read: number | null;
  created_at: string;
  updated_at: string;
  product: any;
}

export interface IUpdateSubCategoriesResponse {
  status: boolean;
  message: string;
  data: Data;
}

export interface Data {
  id: number;
  category_id: string;
  en_name: string;
  ar_name: string;
  en_slug: string;
  ar_slug: string;
  active_status: number;
  order_view: number;
  created_at: string;
  updated_at: string;
}

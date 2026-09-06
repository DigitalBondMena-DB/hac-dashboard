export interface ICategoryById {
  status: boolean;
  data: Category;
}

export interface Category {
  id: number;
  en_name: string;
  ar_name: string;
  en_slug: string;
  ar_slug: string;
  active_status: number;
  order_view: number;
  created_at: string;
  updated_at: string;
}

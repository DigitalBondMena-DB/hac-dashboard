export interface IStoreSubCategoriesResponse {
  status: boolean;
  message: string;
  data: Data;
}

export interface Data {
  category_id: string;
  en_name: string;
  ar_name: string;
  en_slug: string;
  ar_slug: string;
  updated_at: string;
  created_at: string;
  id: number;
}

export interface IGetAllProducts {
  rows: ProductData[];
}

export interface ProductResponse {
  row: ProductData;
}

export interface ProductData {
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
  sale_price: string | null;
  price_after_sale: string | null;
  stock_status: boolean;
  main_image: string;
  additional_images: string | null;
  en_specifications: string | null;
  ar_specifications: string | null;
  featured: number;
  active_status: boolean;
  en_more_information: string | null;
  ar_more_information: string | null;
  en_ingredient: string | null;
  ar_ingredient: string | null;
  en_how_to_use: string | null;
  ar_how_to_use: string | null;
  created_at: string;
  updated_at: string;
  images: ProductImage[];
  choices: ProductChoice[];
  category: Category;
  subcategory: Subcategory;
  piece_price_array?: PiecePrice[];
}

export interface ProductImage {
  id: number;
  product_id: number;
  image: string;
  thumb: string;
  medium: string;
  order_view: number;
  is_main: boolean;
  active_status: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductChoice {
  id: number;
  product_id: number;
  en_name: string;
  ar_name: string;
  cuurent_value: number;
  active_status: number;
  created_at: string;
  updated_at: string;
}

export interface PiecePrice {
  pieces: number;
  prices: number;
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

export interface Subcategory {
  id: number;
  category_id: number;
  en_name: string;
  ar_name: string;
  en_slug: string;
  ar_slug: string;
  active_status: number;
  order_view: number;
  created_at: string;
  updated_at: string;
}

export interface IToggleProduct {
  message: string;
  product: ProductData;
}

export interface IGetProductById {
  product: ProductData;
  piecesPrices?: PiecePrice[];
  choices?: ProductChoice[];
}

export interface IAddProducts {
  message: string;
  product: ProductData;
}

export interface IUpdateProductsResponse {
  message: string;
  product: ProductData;
}

export interface ToggleChoiceResponse {
  success: string;
}
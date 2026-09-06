// export interface IAddProductBody {
//   image: File;
//   piece_price_array: string;
//   product_choice_array: string;
//   category_id: string;
//   en_food_name: string;
//   ar_food_name: string;
//   en_ingredients: string;
//   ar_ingredients: string;
//   piece_price_state: string;
//   product_choice_state: string;
//   state: string;
// }


// interfaces.ts
export interface IProductForm {
  id?: number;
  category_id: number;
  subcategory_id: number;
  en_name: string;
  ar_name: string;
  en_description: string;
  ar_description: string;
  price: number | null;
  sale_price: number | null;
  price_after_sale: number | null;
  stock_status: boolean;
  main_image: File | string | null;
  additional_images: (File | string)[];
  featured: boolean;
  active_status: boolean;
  en_specifications: string | null;
  ar_specifications: string | null;
  en_ingredient: string | null;
  ar_ingredient: string | null;
  pricing_type: 'standard' | 'choices';
  choices: IProductChoice[];
}

export interface IProductChoice {
  id?: number;
  en_name: string;
  ar_name: string;
  current_value: number;
  active_status: boolean;
}

export interface ICategory {
  id: number;
  en_name: string;
  ar_name: string;
}

export interface ISubcategory extends ICategory {
  category_id: number;
}
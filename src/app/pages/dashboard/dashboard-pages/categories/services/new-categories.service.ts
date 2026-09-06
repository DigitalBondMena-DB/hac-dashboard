import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WEB_SITE_BASE_URL } from '../../../../../core/constants/WEB_SITE_BASE_UTL';

// Interface for a single category
export interface Category {
  id: number;
  en_name: string;
  ar_name: string;
  en_slug: string;
  ar_slug: string;
  active_status: number; // 0 or 1
  main_image: string | null;
  order_view: number;
  created_at: string;
  updated_at: string;
}

// Interface for categories list response
export interface CategoriesListResponse {
  status: boolean;
  data: Category[];
}

// Interface for single category response
export interface SingleCategoryResponse {
  status: boolean;
  data: Category;
}

// Interface for operation responses
export interface CategoryOperationResponse {
  status: boolean;
  message: string;
  data?: Category;
}

@Injectable({
  providedIn: 'root'
})
export class NewCategoriesService {
  constructor(private http: HttpClient) { }

  private getUrl(path: string, special?: boolean): string {
    const baseUrl = `${WEB_SITE_BASE_URL}${path}`;
    if (!special) return baseUrl;
    return baseUrl.includes('?') ? `${baseUrl}&is_special=1` : `${baseUrl}?is_special=1`;
  }

  // Get all categories
  getAllCategories(special?: boolean): Observable<CategoriesListResponse> {
    return this.http.get<CategoriesListResponse>(this.getUrl('categories', special));
  }

  // Get a single category by ID
  getCategoryById(id: number, special?: boolean): Observable<SingleCategoryResponse> {
    return this.http.get<SingleCategoryResponse>(this.getUrl(`categories/${id}`, special));
  }

  // Create a new category
  createCategory(data: FormData, special?: boolean): Observable<CategoryOperationResponse> {
    return this.http.post<CategoryOperationResponse>(
      this.getUrl('categories', special),
      data
    );
  }

  // Update a category
  updateCategory(id: number, data: FormData, special?: boolean): Observable<CategoryOperationResponse> {
    return this.http.post<CategoryOperationResponse>(
      this.getUrl(`categories/${id}`, special),
      data
    );
  }

  // Disable a category
  disableCategory(id: number, special?: boolean): Observable<CategoryOperationResponse> {
    return this.http.post<CategoryOperationResponse>(
      this.getUrl(`categories/${id}/destroy`, special),
      {}
    );
  }

  // Enable a category
  enableCategory(id: number, special?: boolean): Observable<CategoryOperationResponse> {
    return this.http.post<CategoryOperationResponse>(
      this.getUrl(`categories/${id}/recover`, special),
      {}
    );
  }
}
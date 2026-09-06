import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { WEB_SITE_BASE_URL } from "../../constants/WEB_SITE_BASE_UTL";
import { IAllCategory } from "../../Interfaces/h-category/IAllCategory";
import { IAddCategoryBody } from "../../Interfaces/h-category/IAddCategoryBody";
import { ICategoryById } from "../../Interfaces/h-category/ICategoryById";
import { IAddCategoryResponse } from "../../Interfaces/h-category/IAddCategoryResponse";
import { IUpdateCategoryResponse } from "../../Interfaces/h-category/IUpdateCategory";
import { IToggleCategory } from "../../Interfaces/h-category/IToggleCategory";

@Injectable({
  providedIn: "root",
})
export class CategoriesService {
  constructor(private http: HttpClient) { }

  private getUrl(path: string, special?: boolean): string {
    const baseUrl = `${WEB_SITE_BASE_URL}${path}`;
    if (!special) return baseUrl;
    return baseUrl.includes('?') ? `${baseUrl}&is_special=1` : `${baseUrl}?is_special=1`;
  }

  getAllCategories(page: number = 1, perPage: number = 10, special?: boolean) {
    return this.http.get<IAllCategory>(this.getUrl(`categories?page=${page}&limit=${perPage}`, special));
  }
  getCategoryById(CategoryId: string, special?: boolean) {
    return this.http.get<ICategoryById>(this.getUrl(`categories/${CategoryId}`, special));
  }
  addCategory(categoryData: IAddCategoryBody, special?: boolean) {
    return this.http.post<IAddCategoryResponse>(this.getUrl('categories', special), categoryData);
  }
  updateCategory(CategoryId: string, categoryData: IAddCategoryBody, special?: boolean) {
    return this.http.post<IUpdateCategoryResponse>(this.getUrl(`categories/${CategoryId}`, special), categoryData);
  }
  destroyCategory(CategoryId: string, special?: boolean) {
    return this.http.post<IToggleCategory>(this.getUrl(`categories/${CategoryId}/destroy`, special), {});
  }
  enableCategory(CategoryId: string, special?: boolean) {
    return this.http.post<IToggleCategory>(this.getUrl(`categories/${CategoryId}/recover`, special), {});
  }
}

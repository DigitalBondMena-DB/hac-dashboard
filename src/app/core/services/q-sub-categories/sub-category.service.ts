import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { IGetAllSubCategories } from "../../Interfaces/q-sub-categories/IGetAllSubCategories";
import { WEB_SITE_BASE_URL } from "../../constants/WEB_SITE_BASE_UTL";
import { IGetSubCategoryById } from "../../Interfaces/q-sub-categories/IGetSubCategoryById";
import { IStoreSubCategoriesResponse } from "../../Interfaces/q-sub-categories/IStoreSubCategoriesResponse";
import { IUpdateSubCategoriesResponse } from "../../Interfaces/q-sub-categories/IUpdateSubCategoriesResponse";
import { IToggleSubCategoryResponse } from "../../Interfaces/q-sub-categories/IToggleSubCategoryResponse";

@Injectable({
  providedIn: "root",
})
export class SubCategoryService {
  private readonly http = inject(HttpClient);

  private getUrl(path: string, special?: boolean): string {
    const baseUrl = `${WEB_SITE_BASE_URL}${path}`;
    if (!special) return baseUrl;
    return baseUrl.includes('?') ? `${baseUrl}&is_special=1` : `${baseUrl}?is_special=1`;
  }

  // Since your API doesn't support pagination, we remove the parameters
  getAllSubCategories(special?: boolean) {
    return this.http.get<IGetAllSubCategories>(this.getUrl('subcategories', special));
  }

  getSubCategoryById(CategoryId: string, special?: boolean) {
    return this.http.get<IGetSubCategoryById>(this.getUrl(`subcategories/${CategoryId}`, special));
  }

  addSubCategory(CategoryId: string, categoryData: {}, special?: boolean) {
    return this.http.post<IStoreSubCategoriesResponse>(this.getUrl('subcategories', special), categoryData);
  }

  updateSubCategory(CategoryId: string, categoryData: FormData, special?: boolean) {
    return this.http.post<IUpdateSubCategoriesResponse>(
      this.getUrl(`subcategories/${CategoryId}`, special),
      categoryData
    );
  }

  destroySubCategory(CategoryId: string, special?: boolean) {
    return this.http.post<IToggleSubCategoryResponse>(this.getUrl(`subcategories/${CategoryId}/destroy`, special), {});
  }

  enableSubCategory(CategoryId: string, special?: boolean) {
    return this.http.post<IToggleSubCategoryResponse>(this.getUrl(`subcategories/${CategoryId}/recover`, special), {});
  }
}

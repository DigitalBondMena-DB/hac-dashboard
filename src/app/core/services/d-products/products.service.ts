import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { WEB_SITE_BASE_URL } from '../../constants/WEB_SITE_BASE_UTL';
import { IGetAllProducts, ProductChoice, ProductResponse, } from '../../Interfaces/d-products/IGetAllProducts';
import { IGetProductsCategories } from '../../Interfaces/d-products/IGetProductsCategories';
import { IToggleProduct, ToggleChoiceResponse } from '../../Interfaces/d-products/IToggleProduct';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  categoryId = signal(0);
  private ChoiceDataSubject = new BehaviorSubject<any>(null);
  data$ = this.ChoiceDataSubject.asObservable();


  setChoiceData(data: any) {
    this.ChoiceDataSubject.next(data);
  }

  constructor(private http: HttpClient) { }

  private getUrl(path: string, special?: boolean): string {
    const baseUrl = `${WEB_SITE_BASE_URL}${path}`;
    if (!special) return baseUrl;
    return baseUrl.includes('?') ? `${baseUrl}&is_special=1` : `${baseUrl}?is_special=1`;
  }

  getAllProducts(special?: boolean): Observable<IGetAllProducts> {
    return this.http.get<IGetAllProducts>(this.getUrl('products', special));
  }

  getAllProductsCategories(special?: boolean): Observable<IGetProductsCategories> {
    return this.http.get<IGetProductsCategories>(this.getUrl('getcategory', special));
  }

  getProductById(id: string, special?: boolean): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(this.getUrl(`products/${id}`, special));
  }

  disableProduct(productId: string, special?: boolean): Observable<IToggleProduct> {
    return this.http.post<IToggleProduct>(this.getUrl(`products/${productId}/disable`, special), {});
  }

  enableProduct(productId: string, special?: boolean): Observable<IToggleProduct> {
    return this.http.post<IToggleProduct>(this.getUrl(`products/${productId}/enable`, special), {});
  }

  enableChoice(id: string, special?: boolean): Observable<ToggleChoiceResponse> {
    return this.http.post<ToggleChoiceResponse>(this.getUrl(`products/choices/${id}/enable`, special), {});
  }

  disableChoice(id: string, special?: boolean): Observable<ToggleChoiceResponse> {
    return this.http.post<ToggleChoiceResponse>(this.getUrl(`products/choices/${id}/removeChoice`, special), {});
  }

  addChoices(productId: string, formData: FormData, special?: boolean) {
    return this.http.post(this.getUrl(`products/${productId}/choices`, special), formData);
  }

  updateChoice(choiceId: string, formData: FormData, special?: boolean) {
    return this.http.post(this.getUrl(`products/choices/${choiceId}`, special), formData);
  }

  updateProduct(productId: string, formData: FormData, special?: boolean) {
    return this.http.post(this.getUrl(`products/${productId}`, special), formData);
  }

  addImage(productId: string, formData: FormData, special?: boolean) {
    return this.http.post(this.getUrl(`products/${productId}/images`, special), formData);
  }
  removeImage(imageId: string, special?: boolean) {
    return this.http.delete(this.getUrl(`products/images/${imageId}`, special));
  }
}
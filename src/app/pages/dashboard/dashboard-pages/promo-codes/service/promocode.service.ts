import { Injectable } from '@angular/core';
import { WEB_SITE_BASE_URL } from '../../../../../core/constants/WEB_SITE_BASE_UTL';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface PromoCodeData {
  id: number;
  code: string;
  value: string;
  uses_count: number;
  active_status: boolean;
  created_at: string;
  updated_at: string;
  first_order_status: number;
  expired_date?: string;
  product_ids?: any[];
  product_i_ds?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class PromoCodeService {
  constructor(private http: HttpClient) {}

  getAllPromoCodes(): Observable<PromoCodeData[]> {
    return this.http.get<PromoCodeData[]>(`${WEB_SITE_BASE_URL}promo-codes`);
  }

  /**
   * Sends a request to enable a promo code by its ID.
   * 
   * @param promoCodeId - The ID of the promo code to be enabled.
   * @returns An observable containing a message indicating the result of the operation.
   */
  enablePromoCode(promoCodeId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${WEB_SITE_BASE_URL}promo-codes/${promoCodeId}/recover`, {});
  }
  enablePromoCodeNew(promoCodeId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${WEB_SITE_BASE_URL}promo-codes/${promoCodeId}/newrecover`, {});
  }

  /**
   * Sends a request to disable a promo code by its ID.
   * 
   * @param promoCodeId - The ID of the promo code to be disabled.
   * @returns An observable containing a message indicating the result of the operation.
   */
  disablePromoCode(promoCodeId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${WEB_SITE_BASE_URL}promo-codes/${promoCodeId}/destroy`, {});
  }
  disablePromoCodeNew(promoCodeId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${WEB_SITE_BASE_URL}promo-codes/${promoCodeId}/newdestroy`, {});
  }

  /**
   * Updates an existing promo code with the provided data.
   * 
   * @param promoCodeId - The ID of the promo code to be updated.
   * @param data - The partial data to update the promo code with.
   * @returns An observable containing the updated promo code data.
   */
  updatePromoCode(promoCodeId: string, data: FormData): Observable<PromoCodeData> {
    return this.http.post<PromoCodeData>(`${WEB_SITE_BASE_URL}promo-codes/${promoCodeId}`, data);
  }

  /**
   * Retrieves a specific promo code by its ID.
   * 
   * @param promoCodeId - The ID of the promo code to retrieve.
   * @returns An observable containing the promo code data.
   */
  getPromoCodeById(promoCodeId: string): Observable<PromoCodeData> {
    return this.http.get<PromoCodeData>(`${WEB_SITE_BASE_URL}promo-codes/${promoCodeId}`);
  }

  /**
   * Creates a new promo code with the provided data.
   * 
   * @param data - The data for creating a new promo code.
   * @returns An observable containing the created promo code data.
   */
  createPromoCode(data:FormData): Observable<PromoCodeData> {
    return this.http.post<PromoCodeData>(`${WEB_SITE_BASE_URL}promo-codes`, data);
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WEB_SITE_BASE_URL } from '../../../../../core/constants/WEB_SITE_BASE_UTL';


// Interface for a single offer
export interface Offer {
  id: number;
  main_image: string;
  ar_small_title: string;
  en_samll_title: string; // Note: API returns "en_samll_title" (typo)
  en_title: string;
  ar_title: string;
  en_text: string;
  ar_text: string;
  active_status: number; // 1 or 0
  created_at: string;
  updated_at: string;
}

// Interface for offers list response
export interface OffersListResponse {
  rows: Offer[];
}

// Interface for single offer response
export interface SingleOfferResponse {
  row: Offer;
}

// Interface for success response (used for create/update/enable/disable)
export interface SuccessResponse {
  success: string;
}

@Injectable({
  providedIn: 'root'
})
export class OffersService {
  constructor(private http: HttpClient) {}

  // Get all offers
  getAllOffers(): Observable<OffersListResponse> {
    return this.http.get<OffersListResponse>(`${WEB_SITE_BASE_URL}offers`);
  }

  // Get a single offer by ID
  getOfferById(id: string): Observable<SingleOfferResponse> {
    return this.http.get<SingleOfferResponse>(`${WEB_SITE_BASE_URL}offers/${id}`);
  }

  // Enable an offer
  enableOffer(offerId: string): Observable<SuccessResponse> {
    return this.http.post<SuccessResponse>(
      `${WEB_SITE_BASE_URL}offers/${offerId}/recover`,
      {}
    );
  }

  // Disable an offer
  disableOffer(offerId: string): Observable<SuccessResponse> {
    return this.http.post<SuccessResponse>(
      `${WEB_SITE_BASE_URL}offers/${offerId}/destroy`,
      {}
    );
  }

  // Update an offer
  updateOffer(offerId: string, data: FormData): Observable<SuccessResponse> {
    return this.http.post<SuccessResponse>(
      `${WEB_SITE_BASE_URL}offers/${offerId}`,
      data
    );
  }

  // Create a new offer
  createOffer(data: FormData): Observable<SuccessResponse> {
    return this.http.post<SuccessResponse>(
      `${WEB_SITE_BASE_URL}offers`,
      data
    );
  }
}





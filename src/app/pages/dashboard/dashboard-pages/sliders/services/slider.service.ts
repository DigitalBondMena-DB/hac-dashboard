import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WEB_SITE_BASE_URL } from '../../../../../core/constants/WEB_SITE_BASE_UTL';

// Interface for a single slider
export interface Slider {
  id: number;
  main_image_ar: string;
  main_image: string;
  active_status: number | string;
  created_at: string;
  updated_at: string;
  en_slider_link?: string;
  ar_slider_link?: string;
}

// Interface for sliders list response
export interface SlidersListResponse {
  rows: Slider[];
}

// Interface for single slider response
export interface SingleSliderResponse {
  row: Slider;
}

// Interface for success response (used for create/update/enable/disable)
export interface SuccessResponse {
  success: string;
}

@Injectable({
  providedIn: 'root',
})
export class SlidersService {
  constructor(private http: HttpClient) {}

  // Get all sliders
  getAllSliders(): Observable<SlidersListResponse> {
    return this.http.get<SlidersListResponse>(`${WEB_SITE_BASE_URL}sliders`);
  }

  // Get a single slider by ID
  getSliderById(id: string): Observable<SingleSliderResponse> {
    return this.http.get<SingleSliderResponse>(
      `${WEB_SITE_BASE_URL}sliders/${id}`
    );
  }

  // Enable a slider
  enableSlider(sliderId: string): Observable<SuccessResponse> {
    return this.http.post<SuccessResponse>(
      `${WEB_SITE_BASE_URL}sliders/${sliderId}/recover`,
      {}
    );
  }

  // Disable a slider
  disableSlider(sliderId: string): Observable<SuccessResponse> {
    return this.http.post<SuccessResponse>(
      `${WEB_SITE_BASE_URL}sliders/${sliderId}/destroy`,
      {}
    );
  }

  // Update a slider
  updateSlider(sliderId: string, data: FormData): Observable<SuccessResponse> {
    return this.http.post<SuccessResponse>(
      `${WEB_SITE_BASE_URL}sliders/${sliderId}`,
      data
    );
  }

  // Create a new slider
  createSlider(data: FormData): Observable<SuccessResponse> {
    return this.http.post<SuccessResponse>(`${WEB_SITE_BASE_URL}sliders`, data);
  }
}

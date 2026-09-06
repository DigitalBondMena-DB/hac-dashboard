import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WEB_SITE_BASE_URL } from '../../../../../core/constants/WEB_SITE_BASE_UTL';


// Interface for a single FAQ
export interface Faq {
  id: number;
  en_title: string;
  ar_title: string;
  en_text: string;
  ar_text: string;
  active_status: number; // 1 or 0
  created_at: string;
  updated_at: string;
}

// Interface for FAQs list response
export interface FaqsListResponse {
  rows: Faq[];
}

// Interface for single FAQ response
export interface SingleFaqResponse {
  row: Faq;
}

// Interface for success response (used for create/update/enable/disable)
export interface SuccessResponse {
  success: string;
}

@Injectable({
  providedIn: 'root'
})
export class FaqsService {
  constructor(private http: HttpClient) {}

  // Get all FAQs
  getAllFaqs(): Observable<FaqsListResponse> {
    return this.http.get<FaqsListResponse>(`${WEB_SITE_BASE_URL}faqs`);
  }

  // Get a single FAQ by ID
  getFaqById(id: string): Observable<SingleFaqResponse> {
    return this.http.get<SingleFaqResponse>(`${WEB_SITE_BASE_URL}faqs/${id}`);
  }

  // Enable a FAQ
  enableFaq(faqId: string): Observable<SuccessResponse> {
    return this.http.post<SuccessResponse>(
      `${WEB_SITE_BASE_URL}faqs/${faqId}/recover`,
      {}
    );
  }

  // Disable a FAQ
  disableFaq(faqId: string): Observable<SuccessResponse> {
    return this.http.post<SuccessResponse>(
      `${WEB_SITE_BASE_URL}faqs/${faqId}/destroy`,
      {}
    );
  }

  // Update a FAQ
  updateFaq(faqId: string, data: FormData): Observable<SuccessResponse> {
    return this.http.post<SuccessResponse>(
      `${WEB_SITE_BASE_URL}faqs/${faqId}`,
      data
    );
  }

  // Create a new FAQ
  createFaq(data: FormData): Observable<SuccessResponse> {
    return this.http.post<SuccessResponse>(
      `${WEB_SITE_BASE_URL}faqs`,
      data
    );
  }
}
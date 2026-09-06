import { Injectable } from '@angular/core';
import { WEB_SITE_BASE_URL } from '../../../../../core/constants/WEB_SITE_BASE_UTL';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';


export interface AboutPage {
  id: number;
  en_meta_title: string;
  ar_meta_title: string;
  en_meta_text: string;
  ar_meta_text: string;
  main_image: string;
  active_status: number; // 1 or 0
  en_footer_for_text: string;
  ar_footer_for_text: string;
  en_mission_text: string;
  ar_mission_text: string;
  en_vision_text: string;
  ar_vision_text: string;
  en_main_title: string;
  ar_main_title: string;
  en_main_text: string;
  ar_main_text: string;
  created_at: string;
  updated_at: string;
}

// Interface for About page response
export interface AboutPageResponse {
  rows: AboutPage;
}

// Interface for update response
export interface AboutUpdateResponse {
  success: string;
  about: AboutPage;
}


@Injectable({
  providedIn: 'root'
})
export class AboutService {

constructor(private http: HttpClient) { }

  // Get About page data
  getAboutPage(): Observable<AboutPageResponse> {
    return this.http.get<AboutPageResponse>(`${WEB_SITE_BASE_URL}aboutindex`);
  }

  // Update About page
  updateAboutPage(id: number, data: FormData): Observable<AboutUpdateResponse> {
    return this.http.post<AboutUpdateResponse>(
      `${WEB_SITE_BASE_URL}aboutupdate/${id}`,
      data
    );
  }

  // Enable About page (if needed)
  enableAboutPage(id: number): Observable<AboutUpdateResponse> {
    return this.http.post<AboutUpdateResponse>(
      `${WEB_SITE_BASE_URL}aboutupdate/${id}`,
      { active_status: 1 }
    );
  }

  // Disable About page (if needed)
  disableAboutPage(id: number): Observable<AboutUpdateResponse> {
    return this.http.post<AboutUpdateResponse>(
      `${WEB_SITE_BASE_URL}aboutupdate/${id}`,
      { active_status: 0 }
    );
  }}

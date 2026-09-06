import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WEB_SITE_BASE_URL } from '../../../../../../app/core/constants/WEB_SITE_BASE_UTL';
import { Observable } from 'rxjs';

export interface Contact {
  id: number;
  en_address: string;
  ar_address: string;
  phone: string;
  email: string;
  facebook: string | null;
  twitter: string | null;
  instagram: string | null;
  linkedin: string | null;
  active_status: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface ApiResponse {
  rows: Contact;
}

export interface UpdateResponse {
  success: string;
  contact: Contact;
}
@Injectable({
  providedIn: 'root'
})
export class ContactService {


  constructor(private http: HttpClient) { }

  getContactInfo(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${WEB_SITE_BASE_URL}contact-info`);
  }


//  id =1 
  updateContactInfo(data: Partial<Contact>): Observable<UpdateResponse> {
    return this.http.post<UpdateResponse>(`${WEB_SITE_BASE_URL}contact-info/1`, data);
  }

}
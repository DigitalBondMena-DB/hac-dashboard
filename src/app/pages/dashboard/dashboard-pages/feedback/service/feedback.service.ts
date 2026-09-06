import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WEB_SITE_BASE_URL } from '../../../../../core/constants/WEB_SITE_BASE_UTL';

// Interface for a single contact form submission
export interface ContactForm {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  is_read: number; // 0 or 1
  created_at: string;
  updated_at: string;
}

// Interface for contact forms list response
export interface ContactFormsListResponse {
  rows: ContactForm[];
}

// Interface for single contact form response
export interface SingleContactFormResponse {
  row: ContactForm;
}

// Interface for success response
export interface SuccessResponse {
  success?: string;
  message?: string; // Some APIs might use 'message' instead of 'success'
}

@Injectable({
  providedIn: 'root'
})
export class ContactFormsService {
  constructor(private http: HttpClient) {}

  // Get all contact form submissions
  getAllContactForms(): Observable<ContactFormsListResponse> {
    return this.http.get<ContactFormsListResponse>(`${WEB_SITE_BASE_URL}feedback_index`);
  }

  // Get a single contact form submission by ID
  getContactFormById(id: number): Observable<SingleContactFormResponse> {
    return this.http.get<SingleContactFormResponse>(`${WEB_SITE_BASE_URL}feedback_data/${id}`);
  }

  // Mark a contact form as read/unread
  updateReadStatus(id: number, isRead: number): Observable<SuccessResponse> {
    return this.http.post<SuccessResponse>(
      `${WEB_SITE_BASE_URL}feedback_data/${id}`,
      { is_read: isRead }
    );
  }

  // Delete a contact form submission
  deleteContactForm(id: number): Observable<SuccessResponse> {
    return this.http.delete<SuccessResponse>(
      `${WEB_SITE_BASE_URL}feedback_data/${id}`
    );
  }
}
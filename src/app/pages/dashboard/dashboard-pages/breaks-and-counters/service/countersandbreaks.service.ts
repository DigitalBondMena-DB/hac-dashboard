import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WEB_SITE_BASE_URL } from '../../../../../core/constants/WEB_SITE_BASE_UTL';

// Interfaces for Breaks
export interface Break {
  id: number;
  en_name: string;
  ar_name: string;
  order_by: string;
  created_at: string;
  updated_at: string;
}

export interface BreaksListResponse {
  rows: Break[];
}

export interface SingleBreakResponse {
  row: Break;
}

export interface BreakUpdateResponse {
  success: string;
}

// Interfaces for Counters
export interface Counter {
  id: number;
  en_name: string;
  ar_name: string;
  counter_value: string;
  created_at: string;
  updated_at: string;
}

export interface CountersListResponse {
  rows: Counter[];
}

export interface SingleCounterResponse {
  row: Counter;
}

export interface CounterUpdateResponse {
  success: string;
}

@Injectable({
  providedIn: 'root'
})
export class BreaksCountersService {

  constructor(private http: HttpClient) { }

  // ========== Breaks Methods ==========

  // Get all breaks
  getAllBreaks(): Observable<BreaksListResponse> {
    return this.http.get<BreaksListResponse>(`${WEB_SITE_BASE_URL}breaks`);
  }

  // Get single break by ID
  getBreakById(id: number): Observable<SingleBreakResponse> {
    return this.http.get<SingleBreakResponse>(`${WEB_SITE_BASE_URL}breaks/${id}`);
  }

  // Update break
  updateBreak(id: number, data: { en_name?: string, ar_name?: string, order_by?: string }): Observable<BreakUpdateResponse> {
    return this.http.post<BreakUpdateResponse>(
      `${WEB_SITE_BASE_URL}breaks/${id}`,
      data
    );
  }

  // ========== Counters Methods ==========

  // Get all counters
  getAllCounters(): Observable<CountersListResponse> {
    return this.http.get<CountersListResponse>(`${WEB_SITE_BASE_URL}counters`);
  }

  // Get single counter by ID
  getCounterById(id: number): Observable<SingleCounterResponse> {
    return this.http.get<SingleCounterResponse>(`${WEB_SITE_BASE_URL}counters/${id}`);
  }

  // Update counter
  updateCounter(
    id: number, 
    data: { en_name?: string, ar_name?: string, counter_value?: string }
  ): Observable<CounterUpdateResponse> {
    return this.http.post<CounterUpdateResponse>(
      `${WEB_SITE_BASE_URL}counters/${id}`,
      data
    );
  }
}
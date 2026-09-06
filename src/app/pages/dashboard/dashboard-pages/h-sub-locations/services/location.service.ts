import { Injectable } from '@angular/core';

import { WEB_SITE_BASE_URL } from '../../../../../core/constants/WEB_SITE_BASE_UTL';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';


export interface LocationData {
  id: number;
  en_name: string;
  ar_name: string;
  delivery_amount: string;
  active_status: boolean;
  created_at: string;
  updated_at: string;
}


@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor(private http: HttpClient) {}

  getAllLocations(): Observable<LocationData[]> {
    return this.http.get<LocationData[]>(`${WEB_SITE_BASE_URL}locations`);
  }

  enableLocation(locationId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${WEB_SITE_BASE_URL}locations/${locationId}/recover`, {});
  }

/**
 * Sends a request to disable a location by its ID.
 * 
 * @param locationId - The ID of the location to be disabled.
 * @returns An observable containing a message indicating the result of the operation.
 */

  disableLocation(locationId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${WEB_SITE_BASE_URL}locations/${locationId}/destroy`, {});
  }

  updateLocation(locationId: string, data: Partial<LocationData>): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${WEB_SITE_BASE_URL}locations/${locationId}`, data);
  }

  getLocationById(locationId: string): Observable<LocationData> {
    return this.http.get<LocationData>(`${WEB_SITE_BASE_URL}locations/${locationId}`);
  }


  createLocation(data: Partial<LocationData>): Observable<LocationData> {
    return this.http.post<LocationData>(`${WEB_SITE_BASE_URL}locations`, data);
  }

}

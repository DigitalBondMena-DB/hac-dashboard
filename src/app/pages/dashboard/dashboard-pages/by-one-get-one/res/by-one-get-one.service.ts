import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WEB_SITE_BASE_URL } from '../../../../../core/constants/WEB_SITE_BASE_UTL';

@Injectable({
  providedIn: 'root',
})
export class ByOneGetOneService {
  constructor(private http: HttpClient) {}

  getAllByOneGetOne(): Observable<{ discount: number }> {
    return this.http.get<{ discount: number }>(
      `${WEB_SITE_BASE_URL}getdiscount`
    );
  }

  setByOneGetOne(discount_value: number): Observable<{ discount: number }> {
    return this.http.post<{ discount: number }>(
      `${WEB_SITE_BASE_URL}updatediscount`,
      {
        discount_value: discount_value,
      }
    );
  }
}

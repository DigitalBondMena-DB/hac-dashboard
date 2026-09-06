import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { WEB_SITE_BASE_URL } from "../../constants/WEB_SITE_BASE_UTL";
import { ISpecialRequestResponse, ISpecialRequest } from "../../Interfaces/special-requests/ISpecialRequest";

@Injectable({
  providedIn: "root",
})
export class SpecialRequestsService {
  constructor(private http: HttpClient) {}

  getAllSpecialRequests(): Observable<ISpecialRequestResponse> {
    return this.http.get<ISpecialRequestResponse>(`${WEB_SITE_BASE_URL}special_request_index`);
  }

  getSpecialRequestById(id: number): Observable<ISpecialRequest | undefined> {
    return new Observable((observer) => {
      this.getAllSpecialRequests().subscribe({
        next: (response) => {
          const request = response.rows?.find((r) => r.id === id);
          observer.next(request);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }
}

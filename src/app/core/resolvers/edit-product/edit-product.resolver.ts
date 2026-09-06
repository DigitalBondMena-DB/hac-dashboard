import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable, map, catchError, throwError, finalize, timer } from 'rxjs';
import { Product, ProductApiResponse } from '../../../pages/dashboard/dashboard-pages/c-dashboard-menu/b-products/h-products-edit/h-products-edit.component';
import { WEB_SITE_BASE_URL } from '../../constants/WEB_SITE_BASE_UTL';

@Injectable({ providedIn: 'root' })
export class EditProductsResolver implements Resolve<Product> {
  constructor(
    private http: HttpClient,
    private router: Router,
    private spinnerService: NgxSpinnerService
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<Product> {
    const productId = route.paramMap.get('id')!;
    const isSpecial = route.queryParams['special'] === 'true' || route.queryParams['special'] === '1';
    this.spinnerService.show('actionsLoader');

    const url = isSpecial
      ? `${WEB_SITE_BASE_URL}products/${productId}?is_special=1`
      : `${WEB_SITE_BASE_URL}products/${productId}`;

    return this.http.get<ProductApiResponse>(url).pipe(
      map(response => {
        if (response.row) {
          return response.row;
        }

        this.router.navigate(['/dashboard/menu/products'], {
          queryParams: isSpecial ? { special: 'true' } : undefined
        });
        throw new Error('Failed to load product data');
      }),
      catchError(() => {
        this.router.navigate(['/dashboard/menu/products'], {
          queryParams: isSpecial ? { special: 'true' } : undefined
        });
        return throwError(() => new Error('Failed to load product data'));
      })
    );
  }
}
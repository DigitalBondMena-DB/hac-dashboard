import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import { map, finalize, timer } from 'rxjs';
import { ApiResponse, Category } from '../../../pages/dashboard/dashboard-pages/c-dashboard-menu/b-products/h-products-edit/h-products-edit.component';
import { WEB_SITE_BASE_URL } from '../../constants/WEB_SITE_BASE_UTL';

export const farCategoryResolver: ResolveFn<Category[]> = (route) => {
  const http = inject(HttpClient);
  const ngxSpinnerService = inject(NgxSpinnerService);
  const isSpecial = route.queryParams['special'] === 'true' || route.queryParams['special'] === '1';
  const url = isSpecial ? `${WEB_SITE_BASE_URL}categories?is_special=1` : `${WEB_SITE_BASE_URL}categories`;

  ngxSpinnerService.show('actionsLoader');
  return http.get<ApiResponse<Category>>(url).pipe(
    map(response => {
      if (response.status) {
        return response.data.filter(c => c.active_status === 1);
      }
      throw new Error('Failed to load categories');
    }),
    finalize(() => {
      // timer(200).subscribe(() =>  ngxSpinnerService.hide('actionsLoader'));
    })
  );
};
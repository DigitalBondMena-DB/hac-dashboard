import { ResolveFn } from '@angular/router';
import { IAllCategory } from '../../Interfaces/h-category/IAllCategory';
import { inject } from '@angular/core';
import { CategoriesService } from '../../services/h-category/categories.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize, timer } from 'rxjs';

export const allCategoriesResolver: ResolveFn<boolean|IAllCategory> = (route, state) => {
  const categoriesService = inject(CategoriesService);
  const ngxSpinnerService = inject(NgxSpinnerService);
  const isSpecial = route.queryParams['special'] === 'true' || route.queryParams['special'] === '1';

  ngxSpinnerService.show("actionsLoader");
  return categoriesService.getAllCategories(1, 100, isSpecial).pipe(
    finalize(() => {
      timer(200).subscribe(() => ngxSpinnerService.hide('actionsLoader'));
    })
  );
};

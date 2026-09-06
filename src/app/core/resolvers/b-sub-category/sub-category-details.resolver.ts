import { ResolveFn } from "@angular/router";
import { IGetSubCategoryById } from "../../Interfaces/q-sub-categories/IGetSubCategoryById";
import { SubCategoryService } from "../../services/q-sub-categories/sub-category.service";
import { inject } from "@angular/core";
import { finalize, timer } from "rxjs";
import { NgxSpinnerService } from "ngx-spinner";

export const subCategoryDetailsResolver: ResolveFn<boolean | IGetSubCategoryById> = (route, state) => {
  const subCategoryService = inject(SubCategoryService);
  const ngxSpinnerService = inject(NgxSpinnerService);
  const isSpecial = route.queryParams['special'] === 'true' || route.queryParams['special'] === '1';
  ngxSpinnerService.show("actionsLoader");

  return subCategoryService
    .getSubCategoryById(route.paramMap.get("id")!, isSpecial)
    .pipe(
      finalize(() => {
        timer(200).subscribe(() => ngxSpinnerService.hide("actionsLoader"));
      })
    );
};

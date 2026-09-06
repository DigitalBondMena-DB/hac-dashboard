// import { ResolveFn } from "@angular/router";
// import { IGetProductById } from "../../Interfaces/d-products/IGetProductById";
// import { NgxSpinnerService } from "ngx-spinner";
// import { inject } from "@angular/core";
// import { finalize, timer } from "rxjs";
// import { ProductsService } from "../../services/d-products/products.service";

// export const productDetailsResolver: ResolveFn<boolean | IGetProductById> = (route, state) => {
//   const productsService = inject(ProductsService);
//   const ngxSpinnerService = inject(NgxSpinnerService);
//   ngxSpinnerService.show("actionsLoader");

//   if (route.paramMap.get("id")) {
//     return productsService.getProductById(route.paramMap.get("id")!).pipe(
//       finalize(() => {
//         timer(200).subscribe(() => ngxSpinnerService.hide("actionsLoader"));
//       })
//     );
//   }

//   return true;
// };

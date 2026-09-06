import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProductsService } from '../../services/d-products/products.service';
import { IGetAllProducts } from '../../Interfaces/d-products/IGetAllProducts';

export const promoCodesResolver: ResolveFn<{ id: number, name: string }[]> = (route, state) => {
  const productsService = inject(ProductsService);
  return productsService.getAllProducts().pipe(
    map((response: IGetAllProducts) => response.rows.map(product => ({
      id: product.id,
      name: product.en_name || product.ar_name
    })))
  );
};
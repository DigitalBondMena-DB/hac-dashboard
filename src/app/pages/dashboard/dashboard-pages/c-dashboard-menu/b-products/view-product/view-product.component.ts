import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '../../../../../../core/services/d-products/products.service';
import { ProductData } from '../../../../../../core/Interfaces/d-products/IGetAllProducts';
import { NgxSpinnerComponent, NgxSpinnerModule } from 'ngx-spinner';
import { CommonModule } from '@angular/common';
import { SafeHtmlPipe } from '../../../../../../core/pipes/safe-html.pipe';
@Component({
  selector: 'app-view-product',
  standalone: true,
  imports: [NgxSpinnerModule,CommonModule,SafeHtmlPipe],
  templateUrl: './view-product.component.html',
  styleUrl: './view-product.component.scss',
})
export class ViewProductComponent implements OnInit {
 ProductData!: ProductData;
  id: string | null = "";
  imageLoaded: boolean = false;
  additionalImagesLoaded: { [key: number]: boolean } = {};
  isSpecial = false;

  constructor(private route: ActivatedRoute, private productService: ProductsService) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.isSpecial = this.route.snapshot.queryParams['special'] === 'true' || this.route.snapshot.queryParams['special'] === '1';
    if (this.id) {
      this.fetchProductData(this.id);
    }
  }

  fetchProductData(id: string) {
    this.productService.getProductById(id, this.isSpecial).subscribe({
      next: (res) => {
        this.ProductData = res.row;
      },
      error: (err) => {
        console.error('Error fetching product data:', err);
      }
    });
  }



}

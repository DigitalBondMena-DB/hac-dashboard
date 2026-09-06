import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '../../../../../../core/services/d-products/products.service';
import { ProductData } from '../../../../../../core/Interfaces/d-products/IGetAllProducts';
import { NgxSpinnerComponent, NgxSpinnerModule } from 'ngx-spinner';
import { CommonModule } from '@angular/common';
import { SafeHtmlPipe } from '../../../../../../core/pipes/safe-html.pipe';
import { MAIN_SITE_URL } from '../../../../../../core/constants/WEB_SITE_BASE_UTL';

@Component({
  selector: 'app-view-product',
  standalone: true,
  imports: [NgxSpinnerModule, CommonModule, SafeHtmlPipe],
  templateUrl: './view-product.component.html',
  styleUrl: './view-product.component.scss',
})
export class ViewProductComponent implements OnInit {
  ProductData!: ProductData;
  id: string | null = "";
  imageLoaded: boolean = false;
  additionalImagesLoaded: { [key: number]: boolean } = {};
  isSpecial = false;
  copiedLang: 'en' | 'ar' | null = null;

  constructor(private route: ActivatedRoute, private productService: ProductsService) { }

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

  getProductUrl(lang: 'en' | 'ar'): string {
    const slug = lang === 'en' ? this.ProductData?.en_slug : this.ProductData?.ar_slug;
    if (!slug) return '';
    const baseUrl = MAIN_SITE_URL.replace(/\/+$/, '');
    return `${baseUrl}/#/${lang}/product-details/${slug}`;
  }

  copyToClipboard(url: string, lang: 'en' | 'ar'): void {
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      this.copiedLang = lang;
      setTimeout(() => {
        if (this.copiedLang === lang) {
          this.copiedLang = null;
        }
      }, 2000);
    });
  }
}

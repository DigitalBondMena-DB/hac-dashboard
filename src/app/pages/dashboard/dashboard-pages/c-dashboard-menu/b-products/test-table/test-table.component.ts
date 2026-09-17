import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ImageUploadComponent } from '../../../../../../shared/components/image-upload/image-upload.component';
import { ProductsService } from '../../../../../../core/services/d-products/products.service';
import { ProductResponse, ProductImage } from '../../../../../../core/Interfaces/d-products/IGetAllProducts';

interface ProductState {
  mainImage: string;
  mainImageFile: File | null;
  images: string[];
  additionalImageFiles: File[];
}

@Component({
  selector: 'app-test-table',
  standalone: true,
  imports: [CommonModule, ToastModule, ImageUploadComponent, ButtonModule],
  templateUrl: './test-table.component.html',
  styleUrls: ['./test-table.component.scss'],
  providers: [MessageService]
})
export class TestTableComponent implements OnInit {
  state: ProductState = {
    mainImage: '',
    mainImageFile: null,
    images: [],
    additionalImageFiles: []
  };

  mainImageInitial: ProductImage[] = [];
  imagesInitial: ProductImage[] = [];
  private productId = '3'; // Match API type (string)

  constructor(
    private messageService: MessageService,
    private productsService: ProductsService
  ) { }

  ngOnInit(): void {
    this.loadProductData();
  }

  private loadProductData(): void {
    this.productsService.getProductById(this.productId).subscribe({
      next: (response: ProductResponse) => {
        if (!response.row) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No product data found' });
          return;
        }

        const product = response.row;
        this.state = {
          mainImage: product.main_image || '',
          mainImageFile: null,
          images: product.images?.map(img => img.image).filter(Boolean) || [],
          additionalImageFiles: []
        };

        this.mainImageInitial = this.state.mainImage ? [{
          id: 'main',
          product_id: Number(this.productId),
          image: this.state.mainImage,
          thumb: `https://mesoshop.digitalbondmena.com/${this.state.mainImage}`,
          medium: `https://mesoshop.digitalbondmena.com/${this.state.mainImage}`,
          order_view: 1,
          is_main: true,
          active_status: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }] : [];

        this.imagesInitial = product.images?.map((img, index) => ({
          id: img.id.toString(), // Ensure id is string for consistency
          product_id: Number(this.productId),
          image: img.image,
          thumb: `https://mesoshop.digitalbondmena.com/${img.image}`,
          medium: `https://mesoshop.digitalbondmena.com/${img.image}`,
          order_view: index + 2,
          is_main: false,
          active_status: true,
          created_at: img.created_at || new Date().toISOString(),
          updated_at: img.updated_at || new Date().toISOString()
        })) || [];
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load product data' });
      }
    });
  }

  onMainImageChanged({ added, removed }: { added: File[], removed: string[] }): void {
    if (removed.length > 0) {
      const path = removed[0].split('digitalbondmena.com/mesoshop/')[1] || removed[0];
      if (path === this.state.mainImage) {
        this.state.mainImage = '';
      }
    }
    this.state.mainImageFile = added[0] || null;
  }

  onImagesChanged({ added, removed }: { added: File[], removed: string[] }): void {
    const removedPaths = removed
      .map(url => url.split('digitalbondmena.com/mesoshop/')[1] || url)
      .filter(Boolean);
    this.state.images = this.state.images.filter(path => !removedPaths.includes(path));
    this.state.additionalImageFiles = added;
  }

  onSave(): void {
    const formData = new FormData();
    const defaultData = {
      id: this.productId,
      category_id: '1',
      subcategory_id: '1',
      en_name: 'Test Product',
      ar_small_description: 'Test Product22',
      en_small_description: 'Test Product',
      ar_name: 'منتج اختبار',
      en_slug: 'test-product',
      ar_slug: 'منتج-اختبار',
      en_description: 'Test description',
      ar_description: 'وصف الاختبار',
      price: '200.00',
      stock_status: '0',
      active_status: '0',
      featured: '0'
    };

    Object.entries(defaultData).forEach(([key, value]) => formData.append(key, value));

    if (this.state.mainImageFile) {
      formData.append('main_image', this.state.mainImageFile);
    } else if (this.state.mainImage) {
      formData.append('main_image', this.state.mainImage);
    }

    if (this.state.additionalImageFiles.length > 0) {
      this.state.additionalImageFiles.forEach((file, index) => {
        formData.append(`images[${index}]`, file);
      });
    } else {
      formData.append('images[0]', '');
    }

    this.productsService.updateProduct(this.productId, formData).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Product updated successfully!' });
        this.loadProductData();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update product.' });
      }
    });
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ProductsService } from '../../../core/services/d-products/products.service';
import { ImageUploadComponent } from "../image-upload/image-upload.component";

interface ProductState {
  mainImageFile: File | null;
  additionalImageFiles: File[];
}

@Component({
  selector: 'test-2',
  standalone: true,
  imports: [CommonModule, ToastModule, ButtonModule, ImageUploadComponent],
  templateUrl: './test2.component.html',
  styleUrls: ['./test2.component.scss'],
  providers: [MessageService]
})
export class test2 implements OnInit {
  state: ProductState = {
    mainImageFile: null,
    additionalImageFiles: []
  };

  constructor(
    private messageService: MessageService,
    private productsService: ProductsService
  ) {}

  ngOnInit(): void {}

  onMainImageChanged({ added }: { added: File[], removed: string[] }): void {
    this.state.mainImageFile = added[0] || null;
  }

  onAdditionalImagesChanged({ added }: { added: File[], removed: string[] }): void {
    this.state.additionalImageFiles = added;
  }

  onSave(): void {
    const formData = new FormData();
    const productData = {
      category_id: '1',
      subcategory_id: '1',
      en_name: 'New Product',
      ar_name: 'منتج جديد',
      en_small_description: 'New product description',
      ar_small_description: 'وصف منتج جديد',
      en_slug: 'new-product',
      ar_slug: 'منتج-جديد',
      en_description: 'Full description',
      ar_description: 'الوصف الكامل',
      price: '100.00',
      stock_status: '1',
      active_status: '1',
      featured: '0'
    };

    Object.entries(productData).forEach(([key, value]) => formData.append(key, value));

    if (this.state.mainImageFile) {
      formData.append('main_image', this.state.mainImageFile);
    }

    this.state.additionalImageFiles.forEach((file, index) => {
      formData.append(`images[${index}]`, file);
    });

    // this.productsService.addProduct(formData).subscribe({
    //   next: (response) => {
    //     this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Product added successfully!' });
    //     this.resetForm();
    //   },
    //   error: () => {
    //     this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to add product.' });
    //   }
    // });
  }

  private resetForm(): void {
    this.state = {
      mainImageFile: null,
      additionalImageFiles: []
    };
  }
}
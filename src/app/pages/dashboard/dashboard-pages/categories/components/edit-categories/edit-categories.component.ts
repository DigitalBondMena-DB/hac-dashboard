import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { InputSwitchModule } from 'primeng/inputswitch';
import { CommonModule } from '@angular/common';
import { ImageUploadComponent } from '../../../../../../shared/components/image-upload/image-upload.component';
import { NewCategoriesService, SingleCategoryResponse } from '../../services/new-categories.service';

export interface CategoryImage {
  id: string | number;
  category_id: number;
  image: string;
  thumb: string;
  medium: string;
  order_view: number;
  is_main: boolean;
  active_status: boolean;
  created_at: string;
  updated_at: string;
}

// Reusing ProductImage interface to avoid duplication
export interface ProductImage {
  id: string | number;
  product_id: number;
  image: string;
  thumb: string;
  medium: string;
  order_view: number;
  is_main: boolean;
  active_status: boolean;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-add-category',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    NgxSpinnerModule,
    RouterLink,
    CommonModule,
    InputSwitchModule,
    ImageUploadComponent
  ],
  templateUrl: './edit-categories.component.html',
  styleUrl: './edit-categories.component.scss',
  providers: [MessageService]
})
export class EditCategoriesComponent implements OnInit {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private categoriesService = inject(NewCategoriesService);
  private messageService = inject(MessageService);
  private ngxSpinnerService = inject(NgxSpinnerService);
  private route = inject(ActivatedRoute);

  categoryForm!: FormGroup;
  isSubmitting: boolean = false;
  addedImages: File[] = [];
  removedImages: string[] = [];
  isEditMode: boolean = false;
  categoryId: number | null = null;
  isSpecial: boolean = false;
  initialImages: ProductImage[] = []; // Changed to ProductImage[]
  private readonly IMAGE_BASE_URL = 'https://mesoshop.digitalbondmena.com/';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.isSpecial = params['special'] === 'true' || params['special'] === '1';
    });
    this.initializeForm();
    this.checkMode();
  }

  initializeForm() {
    this.categoryForm = this.fb.group({
      en_name: ['', Validators.required],
      ar_name: ['', Validators.required],
      // en_slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      // ar_slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      active_status: [1, Validators.required],
      // order_view: [0, [Validators.required, Validators.min(0)]],
      main_image: [null, Validators.required]
    });
    this.categoryForm.markAsPristine();
  }

  checkMode() {
    this.route.url.subscribe(segments => {
      this.isEditMode = segments.some(segment => segment.path.includes('edit'));
      if (this.isEditMode) {
        const id = this.route.snapshot.paramMap.get('id');
        this.categoryId = id ? parseInt(id, 10) : null;
        if (this.categoryId) {
          this.loadCategoryData(this.categoryId);
        }
      } else {
        this.initialImages = [];
      }
    });
  }

  loadCategoryData(id: number) {
    this.ngxSpinnerService.show('actionsLoader');
    this.categoriesService.getCategoryById(id, this.isSpecial).subscribe({
      next: (response: SingleCategoryResponse) => {
        const category = response.data;
        const currentTime = new Date().toISOString();
        // Map CategoryImage to ProductImage
        this.initialImages = category.main_image
          ? [{
            id: `temp-${Date.now()}`,
            product_id: category.id, // Use category.id as product_id
            image: this.IMAGE_BASE_URL + category.main_image,
            thumb: this.IMAGE_BASE_URL + category.main_image,
            medium: this.IMAGE_BASE_URL + category.main_image,
            order_view: 0,
            is_main: true,
            active_status: true,
            created_at: currentTime,
            updated_at: currentTime
          }]
          : [];
        this.categoryForm.patchValue({
          en_name: category.en_name,
          ar_name: category.ar_name,
          // en_slug: category.en_slug,
          // ar_slug: category.ar_slug,
          active_status: category.active_status,
          // order_view: category.order_view,
          main_image: category.main_image
        });
        this.categoryForm.get('main_image')?.clearValidators();
        this.categoryForm.get('main_image')?.updateValueAndValidity();
        this.ngxSpinnerService.hide('actionsLoader');
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load category data'
        });
        this.ngxSpinnerService.hide('actionsLoader');
      }
    });
  }

  onImagesChanged(event: { added: File[], removed: string[] }) {
    this.addedImages = event.added;
    this.removedImages = event.removed;
    if (this.addedImages.length > 0) {
      this.categoryForm.patchValue({ main_image: this.addedImages[0] });
      this.categoryForm.get('main_image')?.setValidators([Validators.required]);
    } else if (this.isEditMode && this.initialImages.length > 0 && this.removedImages.length === 0) {
      const filename = this.initialImages[0].image.replace(this.IMAGE_BASE_URL, '');
      this.categoryForm.patchValue({ main_image: filename });
      this.categoryForm.get('main_image')?.clearValidators();
    } else {
      this.categoryForm.patchValue({ main_image: null });
      this.categoryForm.get('main_image')?.setValidators([Validators.required]);
    }
    this.categoryForm.get('main_image')?.updateValueAndValidity();
  }

  onActiveStatusChange(event: any) {
    this.categoryForm.patchValue({ active_status: event.checked ? 1 : 0 });
  }

  onSubmit() {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.ngxSpinnerService.show('actionsLoader');

    const formData = new FormData();
    const categoryData = this.categoryForm.value as { [key: string]: string | number | File | null };

    Object.keys(categoryData).forEach(key => {
      if (key !== 'main_image') {
        const value = categoryData[key];
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      }
    });

    if (this.isEditMode) {
      if (this.addedImages.length > 0) {
        const mainImage = categoryData['main_image'] as File | null;
        if (mainImage) {
          formData.append('main_image', mainImage);
        }
      }
    } else {
      const mainImage = categoryData['main_image'] as File | null;
      if (mainImage) {
        formData.append('main_image', mainImage);
      }
    }

    const apiCall = this.isEditMode && this.categoryId
      ? this.categoriesService.updateCategory(this.categoryId, formData, this.isSpecial)
      : this.categoriesService.createCategory(formData, this.isSpecial);

    apiCall.subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: response.message || `Category ${this.isEditMode ? 'updated' : 'created'} successfully`
        });
        // this.categoryForm.reset();
        // this.categoryForm.markAsPristine();
        // this.addedImages = [];
        // this.removedImages = [];
        // this.initialImages = [];
        // this.isSubmitting = false;
        this.ngxSpinnerService.hide('actionsLoader');
        this.router.navigate(['/dashboard/new-categories'], {
          queryParams: this.isSpecial ? { special: 'true' } : undefined
        });
        // setTimeout(() => {
        // });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to ${this.isEditMode ? 'update' : 'create'} category`
        });
        this.isSubmitting = false;
        this.ngxSpinnerService.hide('actionsLoader');
      }
    });
  }
}
import { AfterViewInit, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxJoditComponent } from 'ngx-jodit';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ImageUploadComponent } from '../../../../../../shared/components/image-upload/image-upload.component';

export interface DropdownOption {
  id: number | null;
  en_name: string;
}

export interface Category {
  id: number;
  en_name: string;
  ar_name: string;
  en_slug: string;
  ar_slug: string;
  active_status: number;
  order_view: number;
  created_at: string;
  updated_at: string;
}

export interface Subcategory {
  id: number;
  category_id: number;
  en_name: string;
  ar_name: string;
  en_slug: string;
  ar_slug: string;
  active_status: number;
  order_view: number;
  created_at: string;
  updated_at: string;
  category?: Category;
}

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

export interface Choice {
  id: number;
  product_id: number;
  en_name: string;
  ar_name: string;
  cuurent_value: number;
  active_status: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  category_id: number;
  subcategory_id: number | null;
  en_name: string;
  ar_name: string;
  en_slug: string;
  ar_slug: string;
  en_description: string;
  en_small_descritpion: string;
  ar_small_descritpion: string;
  ar_description: string;
  price: string;
  sale_price: string | null;
  price_after_sale: string | null;
  stock_status: boolean;
  main_image: string;
  additional_images: string | null;
  featured: number;
  active_status: boolean;
  en_ingredient: string | null;
  ar_ingredient: string | null;
  en_how_to_use: string | null;
  ar_how_to_use: string;
  en_more_information: string | null;
  ar_more_information: string | null;
  created_at: string;
  updated_at: string;
  images: ProductImage[];
  choices: Choice[];
  category: Category;
  subcategory: Subcategory | null;
  size?: string;
  en_meta_Title: string | null;
  ar_meta_Title: string | null;
  en_meta_text: string | null;
  ar_meta_text: string | null;
  commercial_status: number | null;
  promo_code_status: number | null;
}

export interface ApiResponse<T> {
  status: boolean;
  data: T[];
}

export interface ProductApiResponse {
  status: boolean;
  row: Product;
}

export interface ProductState {
  mainImage: string;
  mainImageFile: File | null;
  images: string[];
  additionalImageFiles: File[];
}

@Component({
  selector: 'app-c-products-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    InputSwitchModule,
    DialogModule,
    RouterLink,
    DropdownModule,
    NgxJoditComponent,
    InputNumberModule,
    InputTextareaModule,
    ToastModule,
    HttpClientModule,
    ImageUploadComponent,
    NgxSpinnerModule
  ],
  templateUrl: './h-products-edit.component.html',
  styleUrls: ['./h-products-edit.component.scss'],
  providers: [MessageService]
})
export class CProductsEditComponent implements AfterViewInit, OnInit {
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private spinnerService = inject(NgxSpinnerService);
  private router = inject(Router);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private cdRef = inject(ChangeDetectorRef);

  productForm: FormGroup;
  isEditing = true;
  categories: Category[] = [];
  subcategories: (Subcategory | DropdownOption)[] = [];
  noSubcategoriesOption: DropdownOption[] = [{ id: null, en_name: 'No Subcategories' }];
  isSubcategoryDisabled = true;
  productId: string | null = null;
  private baseUrl = 'https://dev.mesoshop.digitalbondmena.com/api/';
  submittedData: any = null;
  product: Product | null = null;
  isDataLoaded = false;
  isSpinnerLocked = false;
  isSpecial = false;

  state: ProductState = {
    mainImage: '',
    mainImageFile: null,
    images: [],
    additionalImageFiles: []
  };
  mainImageInitial: ProductImage[] = [];
  imagesInitial: ProductImage[] = [];

  constructor() {
    this.spinnerService.show('actionsLoader');
    this.isSpecial = this.route.snapshot.queryParams['special'] === 'true' || this.route.snapshot.queryParams['special'] === '1';

    this.productForm = this.createForm();
    this.setupPricingTypeListener();
    this.setupCategoryListener();
  }

  ngOnInit(): void {
    this.isSpinnerLocked = true;
    this.spinnerService.show('actionsLoader');
    this.isSpecial = this.route.snapshot.queryParams['special'] === 'true' || this.route.snapshot.queryParams['special'] === '1';
    this.updatePriceValidators();
    this.route.queryParams.subscribe(params => {
      this.isSpecial = params['special'] === 'true' || params['special'] === '1';
      this.updatePriceValidators();
    });
  }

  private updatePriceValidators(): void {
    const pricingType = this.productForm?.get('pricing_type')?.value;
    if (pricingType === 'standard') {
      if (this.isSpecial) {
        this.productForm.get('price')?.setValidators([Validators.min(0)]);
      } else {
        this.productForm.get('price')?.setValidators([Validators.required, Validators.min(0)]);
      }
    } else {
      this.productForm?.get('price')?.clearValidators();
    }
    this.productForm?.get('price')?.updateValueAndValidity();
  }


  ngAfterViewInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');

    if (!this.productId) {
      this.showError('Invalid product ID');
      this.router.navigate(['/dashboard/menu/products'], {
        queryParams: this.isSpecial ? { special: 'true' } : undefined
      });
      return;
    }

    this.product = this.route.snapshot.data['product'];
    this.categories = this.route.snapshot.data['categories'];

    if (this.product && this.categories) {
      this.populateForm(this.product);

      setTimeout(() => {
        this.isDataLoaded = true;
        this.isSpinnerLocked = false;
        this.spinnerService.hide('actionsLoader');
        this.cdRef.detectChanges();
      }, 1000);

    } else {
      this.showError('Failed to load data');
      this.router.navigate(['/dashboard/menu/products']);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      en_name: ['', [Validators.required]],
      ar_name: ['', [Validators.required]],
      size: ['', [Validators.required]],
      en_description: ['', [Validators.required]],
      en_small_descritpion: ['', [Validators.required]],
      ar_small_descritpion: ['', [Validators.required]],
      ar_description: ['', [Validators.required]],
      category_id: [null, [Validators.required]],
      subcategory_id: [null],
      pricing_type: ['standard', [Validators.required]],
      price: [null, this.isSpecial ? [Validators.min(0)] : [Validators.required, Validators.min(0)]],
      sale_price: [null, [Validators.min(0), Validators.max(100)]],
      price_after_sale: [{ value: null, disabled: true }],
      active_status: [false],
      stock_status: [false],
      featured: [false, [Validators.required]],
      en_ingredient: [''],
      ar_ingredient: [''],
      en_how_to_use: [''],
      ar_how_to_use: [''],
      en_more_information: [''],
      ar_more_information: [''],
      en_script: [''],
      ar_script: [''],
      en_meta_Title: ['', [Validators.required]],
      ar_meta_Title: ['', [Validators.required]],
      en_meta_text: ['', [Validators.required]],
      ar_meta_text: ['', [Validators.required]],
      commercial_status: [false],
      promo_code_status: [false],
      choices: this.fb.array([])
    });
  }

  get choicesArray(): FormArray {
    return this.productForm.get('choices') as FormArray;
  }

  private populateForm(product: Product): void {
    const mainImgPath = product.main_image || (product.images?.find(img => img.is_main)?.image) || '';

    const additionalImages = (product.images || []).filter(img => img.image && !img.is_main && img.image !== mainImgPath);

    this.state = {
      mainImage: mainImgPath,
      mainImageFile: null,
      images: additionalImages.map(img => img.image).filter(Boolean),
      additionalImageFiles: []
    };

    this.mainImageInitial = this.state.mainImage ? [{
      id: 'main',
      product_id: product.id,
      image: this.state.mainImage,
      thumb: `https://dev.mesoshop.digitalbondmena.com/${this.state.mainImage}`,
      medium: `https://dev.mesoshop.digitalbondmena.com/${this.state.mainImage}`,
      order_view: 1,
      is_main: true,
      active_status: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }] : [];

    this.imagesInitial = additionalImages.map((img, index) => ({
      id: img.id.toString(),
      product_id: product.id,
      image: img.image,
      thumb: `https://dev.mesoshop.digitalbondmena.com/${img.image}`,
      medium: `https://dev.mesoshop.digitalbondmena.com/${img.image}`,
      order_view: index + 2,
      is_main: false,
      active_status: true,
      created_at: img.created_at || new Date().toISOString(),
      updated_at: img.updated_at || new Date().toISOString()
    }));

    if (product.category_id) {
      this.fetchSubcategoriesAndSetValues(product.category_id, product.subcategory_id).then(() => {
        this.setRemainingFormValues(product);
      });
    } else {
      this.subcategories = this.noSubcategoriesOption;
      this.isSubcategoryDisabled = true;
      this.productForm.get('subcategory_id')?.setValue(null);
      this.setRemainingFormValues(product);
    }
  }

  private async fetchSubcategoriesAndSetValues(categoryId: number, subcategoryId: number | null): Promise<void> {
    return new Promise((resolve) => {
      if (!this.isSpinnerLocked) {
        this.spinnerService.show('actionsLoader');
      }
      this.http.get<ApiResponse<Subcategory>>(`${this.baseUrl}subcategories${this.isSpecial ? '?is_special=1' : ''}`).subscribe({
        next: (response) => {
          if (response.status && Array.isArray(response.data)) {
            this.subcategories = response.data.filter(sc =>
              sc.category_id === categoryId && sc.active_status === 1
            );
            this.isSubcategoryDisabled = this.subcategories.length === 0;
            if (this.isSubcategoryDisabled) {
              this.subcategories = this.noSubcategoriesOption;
              this.productForm.get('subcategory_id')?.setValue(null);
              this.productForm.get('subcategory_id')?.clearValidators();
            } else {
              this.productForm.get('subcategory_id')?.setValidators([Validators.required]);
              this.subcategories = [...this.subcategories];
              this.productForm.patchValue({
                category_id: categoryId,
                subcategory_id: subcategoryId
              }, { emitEvent: false });
            }
            this.productForm.get('subcategory_id')?.updateValueAndValidity();
          } else {
            this.handleSubcategoryError();
          }
          if (!this.isSpinnerLocked) {
            this.spinnerService.hide('actionsLoader');
          }
          resolve();
        },
        error: () => {
          this.handleSubcategoryError();
          if (!this.isSpinnerLocked) {
            this.spinnerService.hide('actionsLoader');
          }
          resolve();
        }
      });
    });
  }

  private handleSubcategoryError(): void {
    this.showError('Failed to load subcategories');
    this.subcategories = this.noSubcategoriesOption;
    this.isSubcategoryDisabled = true;
    this.productForm.get('subcategory_id')?.setValue(null);
    this.productForm.get('subcategory_id')?.clearValidators();
    this.productForm.get('subcategory_id')?.updateValueAndValidity();
    this.cdRef.detectChanges();
  }

  private setRemainingFormValues(product: Product): void {
    this.productForm.patchValue({
      en_name: product.en_name,
      ar_name: product.ar_name,
      en_description: product.en_description,
      ar_description: product.ar_description,
      size: product.size,
      en_small_descritpion: product.en_small_descritpion,
      ar_small_descritpion: product.ar_small_descritpion,
      pricing_type: product.choices.length > 0 ? 'choices' : 'standard',
      price: parseFloat(product.price) || null,
      sale_price: product.sale_price ? parseFloat(product.sale_price) : null,
      price_after_sale: product.price_after_sale ? parseFloat(product.price_after_sale) : null,
      active_status: product.active_status,
      stock_status: product.stock_status,
      featured: !!product.featured,
      en_ingredient: product.en_ingredient || '',
      ar_ingredient: product.ar_ingredient || '',
      en_how_to_use: product.en_how_to_use || '',
      ar_how_to_use: product.ar_how_to_use || '',
      en_more_information: product.en_more_information || '',
      ar_more_information: product.ar_more_information || '',
      en_script: (product as any).en_script || '',
      ar_script: (product as any).ar_script || '',
      commercial_status: product.commercial_status ? true : false,
      promo_code_status: product.promo_code_status && product.promo_code_status >= 1 ? true : false,

      en_meta_Title: product.en_meta_Title || '',
      ar_meta_Title: product.ar_meta_Title || '',
      en_meta_text: product.en_meta_text || '',
      ar_meta_text: product.ar_meta_text || '',
    });
  }

  onMainImageChanged({ added, removed }: { added: File[], removed: string[] }): void {
    if (removed.length > 0) {
      const cleanPath = removed[0].match(/uploads\/.+/)?.[0] || removed[0];
      if (cleanPath === this.state.mainImage || removed[0].includes(this.state.mainImage)) {
        this.state.mainImage = '';
      }
    }
    this.state.mainImageFile = added[0] || null;
  }

  onImagesChanged({ added, removed }: { added: File[], removed: string[] }): void {
    const removedPaths = removed
      .map(url => url.match(/uploads\/.+/)?.[0] || url)
      .filter(Boolean);
    this.state.images = this.state.images.filter(path => !removedPaths.some(r => path.includes(r) || r.includes(path)));
    this.state.additionalImageFiles = added;
  }

  private setupCategoryListener(): void {
    this.productForm.get('category_id')?.valueChanges.subscribe(categoryId => {
      if (categoryId) {
        this.fetchSubcategories(categoryId);
      } else {
        this.subcategories = this.noSubcategoriesOption;
        this.isSubcategoryDisabled = true;
        this.productForm.get('subcategory_id')?.setValue(null);
        this.productForm.get('subcategory_id')?.clearValidators();
        this.productForm.get('subcategory_id')?.updateValueAndValidity();
      }
    });
  }

  private setupPricingTypeListener(): void {
    this.productForm.get('pricing_type')?.valueChanges.subscribe(type => {
      if (type === 'standard') {
        if (this.isSpecial) {
          this.productForm.get('price')?.setValidators([Validators.min(0)]);
        } else {
          this.productForm.get('price')?.setValidators([Validators.required, Validators.min(0)]);
        }
        this.productForm.get('sale_price')?.setValidators([Validators.min(0), Validators.max(100)]);
      } else {
        this.productForm.get('price')?.clearValidators();
        this.productForm.get('sale_price')?.clearValidators();
      }
      this.productForm.get('price')?.updateValueAndValidity();
      this.productForm.get('sale_price')?.updateValueAndValidity();
    });

    this.productForm.get('sale_price')?.valueChanges.subscribe(salePrice => {
      const price = this.productForm.get('price')?.value;
      if (price && salePrice) {
        const priceAfterSale = price - price * (salePrice / 100);
        this.productForm.get('price_after_sale')?.setValue(priceAfterSale.toFixed(2));
      } else {
        this.productForm.get('price_after_sale')?.setValue(null);
      }
    });

    this.productForm.get('price')?.valueChanges.subscribe(price => {
      const salePrice = this.productForm.get('sale_price')?.value;
      if (price && salePrice) {
        const priceAfterSale = price - price * (salePrice / 100);
        this.productForm.get('price_after_sale')?.setValue(priceAfterSale.toFixed(2));
      } else {
        this.productForm.get('sale_price')?.setValue(null);
        this.productForm.get('price_after_sale')?.setValue(null);
      }
    });
  }

  onFormSubmit(): void {
    this.productForm.markAllAsTouched();
    if (!this.state.mainImage && !this.state.mainImageFile) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill all required fields, including the main image'
      });
      return;
    }

    if (!this.isSpecial && this.productForm.get('pricing_type')?.value === 'standard' && this.productForm.get('price')?.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Price is required for standard pricing'
      });
      return;
    }

    if (!this.isSpinnerLocked) {
      this.spinnerService.show('actionsLoader');
    }
    const formData = this.prepareFormData();
    console.table(formData);
    // return;

    this.http.post(`${this.baseUrl}products/${this.productId}${this.isSpecial ? '?is_special=1' : ''}`, formData).subscribe({
      next: (response: any) => {
        if (!this.isSpinnerLocked) {
          this.spinnerService.hide('actionsLoader');
        }
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Product updated successfully'
          });
          this.submittedData = this.convertFormDataToObject(formData);
          this.router.navigate(['/dashboard/menu/products'], {
            queryParams: this.isSpecial ? { special: 'true' } : undefined
          });
        } else {
          this.showError('Unexpected response from server');
        }
      },
      error: (error) => {
        if (!this.isSpinnerLocked) {
          this.spinnerService.hide('actionsLoader');
        }
        this.showError(error.error?.message || 'Failed to update product');
      }
    });
  }

  private prepareFormData(): FormData {
    const formValue = this.productForm.getRawValue();
    const formData = new FormData();

    formData.append('id', this.productId || '');
    formData.append('en_name', formValue.en_name);
    formData.append('size', formValue.size);
    formData.append('ar_name', formValue.ar_name);
    formData.append('en_description', formValue.en_description);
    formData.append('ar_description', formValue.ar_description);
    formData.append('en_small_descritpion', formValue.en_small_descritpion);
    formData.append('ar_small_descritpion', formValue.ar_small_descritpion);
    formData.append('category_id', formValue.category_id);
    formData.append('en_ingredient', formValue.en_ingredient);
    formData.append('ar_ingredient', formValue.ar_ingredient);
    formData.append('en_how_to_use', formValue.en_how_to_use);
    formData.append('ar_how_to_use', formValue.ar_how_to_use);
    formData.append('en_more_information', formValue.en_more_information);
    formData.append('ar_more_information', formValue.ar_more_information);
    formData.append('en_meta_Title', formValue.en_meta_Title);
    formData.append('ar_meta_Title', formValue.ar_meta_Title);
    formData.append('en_meta_text', formValue.en_meta_text);
    formData.append('ar_meta_text', formValue.ar_meta_text);
    // Append raw script blocks (as strings). Backend should handle/sanitize as needed.
    formData.append('en_script', formValue.en_script || '');
    formData.append('ar_script', formValue.ar_script || '');
    formData.append("commercial_status", formValue.commercial_status ? "1" : "0"); // Added commercial_status
    formData.append("promo_code_status", formValue.promo_code_status ? "1" : "0"); // Added promo_code_status
    if (formValue.subcategory_id) {
      formData.append('subcategory_id', formValue.subcategory_id);
    }

    formData.append('active_status', formValue.active_status ? '1' : '0');
    formData.append('featured', formValue.featured ? '1' : '0');
    formData.append('stock_status', formValue.stock_status ? '1' : '0');

    if (formValue.price !== null && formValue.price !== undefined && formValue.price !== '') {
      formData.append('price', formValue.price);
    } else if (this.isSpecial) {
      formData.append('price', '');
    } else {
      formData.append('price', formValue.price || '0');
    }
    if (formValue.sale_price) {
      formData.append('sale_price', formValue.sale_price);
      formData.append('price_after_sale', formValue.price_after_sale);
    }

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

    return formData;
  }

  private convertFormDataToObject(formData: FormData): any {
    const obj: any = {};
    formData.forEach((value, key) => {
      if (value instanceof File) {
        obj[key] = `File: ${value.name}`;
      } else {
        try {
          obj[key] = JSON.parse(value as string);
        } catch {
          obj[key] = value;
        }
      }
    });
    return obj;
  }

  private showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message
    });
    if (!this.isSpinnerLocked) {
      this.spinnerService.hide('actionsLoader');
    }
  }

  private fetchSubcategories(categoryId: number): void {
    if (!this.isSpinnerLocked) {
      this.spinnerService.show('actionsLoader');
    }
    this.http.get<ApiResponse<Subcategory>>(`${this.baseUrl}subcategories${this.isSpecial ? '?is_special=1' : ''}`).subscribe({
      next: (response) => {
        if (response.status && Array.isArray(response.data)) {
          this.subcategories = response.data.filter(sc => sc.category_id === categoryId && sc.active_status === 1);
          this.isSubcategoryDisabled = this.subcategories.length === 0;
          if (this.isSubcategoryDisabled) {
            this.subcategories = this.noSubcategoriesOption;
            this.productForm.get('subcategory_id')?.setValue(null);
            this.productForm.get('subcategory_id')?.clearValidators();
          } else {
            this.productForm.get('subcategory_id')?.setValidators([Validators.required]);
          }
          this.productForm.get('subcategory_id')?.updateValueAndValidity();
          this.cdRef.detectChanges();
        } else {
          this.handleSubcategoryError();
        }
        if (!this.isSpinnerLocked) {
          this.spinnerService.hide('actionsLoader');
        }
      },
      error: () => {
        this.handleSubcategoryError();
        if (!this.isSpinnerLocked) {
          this.spinnerService.hide('actionsLoader');
        }
      }
    });
  }
}
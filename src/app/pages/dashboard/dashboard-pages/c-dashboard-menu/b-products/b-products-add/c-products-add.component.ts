import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { NgxJoditComponent } from "ngx-jodit";
import { NgxSpinnerModule, NgxSpinnerService } from "ngx-spinner";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { DialogModule } from "primeng/dialog";
import { DropdownModule } from "primeng/dropdown";
import { FileUploadModule } from "primeng/fileupload";
import { InputSwitchModule } from "primeng/inputswitch";
import { InputNumberModule } from "primeng/inputnumber";
import { InputTextareaModule } from "primeng/inputtextarea";
import { ToastModule } from "primeng/toast";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { WEB_SITE_BASE_URL } from "../../../../../../core/constants/WEB_SITE_BASE_UTL";

interface DropdownOption {
  id: number | null;
  en_name: string;
}

interface Category {
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

interface Subcategory {
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

interface ApiResponse<T> {
  status: boolean;
  data: T[];
}

@Component({
  selector: "app-c-products-add",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    FileUploadModule,
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
    NgxSpinnerModule
  ],
  templateUrl: "./c-products-add.component.html",
  styleUrl: "./c-products-add.component.scss",
  providers: [MessageService],
})
export class CProductsAddComponent implements OnInit {
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private spinnerService = inject(NgxSpinnerService);
  private router = inject(Router);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  isSpecial = false;
  productForm: FormGroup;
  isEditing = false;
  categories: Category[] = [];
  subcategories: (Subcategory | DropdownOption)[] = [];
  noSubcategoriesOption: DropdownOption[] = [{ id: null, en_name: "No Subcategories" }];
  isSubcategoryDisabled = true;
  mainImagePreview: string | null = null;
  additionalImagePreviews: { file: File; preview: string }[] = [];
  submittedData: any = null;
  private baseUrl = WEB_SITE_BASE_URL;

  constructor() {
    this.isSpecial = this.route.snapshot.queryParams['special'] === 'true' || this.route.snapshot.queryParams['special'] === '1';
    this.productForm = this.createForm();
    this.setupPricingTypeListener();
    this.setupCategoryListener();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.isSpecial = params['special'] === 'true' || params['special'] === '1';
      this.updatePriceValidators();
      this.fetchCategories();
    });
    this.subcategories = this.noSubcategoriesOption;
  }

  private updatePriceValidators(): void {
    const pricingType = this.productForm.get("pricing_type")?.value;
    if (pricingType === "standard") {
      if (this.isSpecial) {
        this.productForm.get("price")?.setValidators([Validators.min(0)]);
      } else {
        this.productForm.get("price")?.setValidators([Validators.required, Validators.min(0)]);
      }
    } else {
      this.productForm.get("price")?.clearValidators();
    }
    this.productForm.get("price")?.updateValueAndValidity();
  }

  createForm(): FormGroup {
    return this.fb.group({
      en_name: ["", [Validators.required]],
      ar_name: ["", [Validators.required]],
      en_description: ["", [Validators.required]],
      en_small_description: ["", [Validators.required]],
      ar_small_description: ["", [Validators.required]],
      ar_description: ["", [Validators.required]],
      category_id: [null, [Validators.required]],
      subcategory_id: [null],
      pricing_type: ["standard", [Validators.required]],
      price: [null, this.isSpecial ? [Validators.min(0)] : [Validators.required, Validators.min(0)]],
      sale_price: [{ value: null, disabled: true }, [Validators.min(0), Validators.max(100)]],
      price_after_sale: [{ value: null, disabled: true }],
      active_status: [0],
      stock_status: [0],
      featured: [false],
      commercial_status: [0],
      main_image: [null, [Validators.required]],
      additional_images: [[]],
      en_ingredient: [""],
      ar_ingredient: [""],
      en_how_to_use: [""],
      ar_how_to_use: [""],
      en_more_information: [""],
      ar_more_information: [""],
      en_script: [""],
      ar_script: [""],
      en_meta_Title: ["", Validators.required],
      ar_meta_Title: ["", Validators.required],
      en_meta_text: ["", Validators.required],
      ar_meta_text: ["", Validators.required],
      size: ["", Validators.required],
      promo_code_status: [false],
      choices: this.fb.array([]),
    });
  }

  get choicesArray(): FormArray {
    return this.productForm.get("choices") as FormArray;
  }

  onMainImageSelect(event: any): void {
    const file = event.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.mainImagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
      this.productForm.patchValue({
        main_image: file
      });
    }
  }

  clearMainImage(): void {
    this.mainImagePreview = null;
    this.productForm.patchValue({
      main_image: null
    });
  }

  onAdditionalImagesSelect(event: any): void {
    const files: FileList = event.files;
    if (files && files.length) {
      const fileArray = Array.from(files);

      fileArray.forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.additionalImagePreviews.push({
            file,
            preview: e.target.result
          });
        };
        reader.readAsDataURL(file);
      });

      const currentFiles = this.productForm.get('additional_images')?.value || [];
      this.productForm.patchValue({
        additional_images: [...currentFiles, ...fileArray]
      });
    }
  }

  removeAdditionalImage(index: number): void {
    this.additionalImagePreviews.splice(index, 1);
    const currentFiles = this.productForm.get('additional_images')?.value || [];
    currentFiles.splice(index, 1);
    this.productForm.patchValue({
      additional_images: currentFiles
    });
  }

  onAdditionalImageRemove(event: any): void {
    // Handle remove event if needed
  }

  fetchCategories(): void {
    this.spinnerService.show("actionsLoader");
    this.http.get<ApiResponse<Category>>(`${this.baseUrl}categories${this.isSpecial ? '?is_special=1' : ''}`).subscribe({
      next: (response) => {
        if (response.status) {
          this.categories = response.data.filter(c => c.active_status === 1);
          this.spinnerService.hide("actionsLoader");
        } else {
          this.showError("Failed to load categories");
        }
      },
      error: () => this.showError("Failed to load categories"),
    });
  }

  fetchSubcategories(categoryId: number): void {
    this.spinnerService.show("actionsLoader");
    this.http.get<ApiResponse<Subcategory>>(`${this.baseUrl}subcategories${this.isSpecial ? '?is_special=1' : ''}`).subscribe({
      next: (response) => {
        if (response.status && Array.isArray(response.data)) {
          this.subcategories = response.data.filter(
            (sc) => sc.category_id === categoryId && sc.active_status === 1
          );
          this.isSubcategoryDisabled = this.subcategories.length === 0;
          if (this.isSubcategoryDisabled) {
            this.subcategories = this.noSubcategoriesOption;
            this.productForm.get("subcategory_id")?.setValue(null);
            this.productForm.get("subcategory_id")?.clearValidators();
          } else {
            this.productForm.get("subcategory_id")?.setValidators([Validators.required]);
          }
          this.productForm.get("subcategory_id")?.updateValueAndValidity();
          this.spinnerService.hide("actionsLoader");
        } else {
          this.handleSubcategoryError();
        }
      },
      error: () => this.handleSubcategoryError(),
    });
  }

  private handleSubcategoryError(): void {
    this.showError("Failed to load subcategories");
    this.subcategories = this.noSubcategoriesOption;
    this.isSubcategoryDisabled = true;
    this.productForm.get("subcategory_id")?.setValue(null);
    this.productForm.get("subcategory_id")?.clearValidators();
    this.productForm.get("subcategory_id")?.updateValueAndValidity();
    this.spinnerService.hide("actionsLoader");
  }

  private showError(message: string): void {
    this.messageService.add({
      severity: "error",
      summary: "Error",
      detail: message,
    });
    this.spinnerService.hide("actionsLoader");
  }

  setupCategoryListener(): void {
    this.productForm.get("category_id")?.valueChanges.subscribe((categoryId) => {
      if (categoryId) {
        this.fetchSubcategories(categoryId);
      } else {
        this.subcategories = this.noSubcategoriesOption;
        this.isSubcategoryDisabled = true;
        this.productForm.get("subcategory_id")?.setValue(null);
        this.productForm.get("subcategory_id")?.clearValidators();
        this.productForm.get("subcategory_id")?.updateValueAndValidity();
      }
    });
  }

  addChoice(): void {
    this.choicesArray.push(
      this.fb.group({
        en_name: ["", [Validators.required]],
        ar_name: ["", [Validators.required]],
        current_value: [0, [Validators.required, Validators.min(0)]],
        active_status: [0],
      })
    );
  }

  removeChoice(index: number): void {
    this.choicesArray.removeAt(index);
  }

  setupPricingTypeListener(): void {
    this.productForm.get("pricing_type")?.valueChanges.subscribe((type) => {
      if (type === "standard") {
        this.choicesArray.clear();
        if (this.isSpecial) {
          this.productForm.get("price")?.setValidators([Validators.min(0)]);
        } else {
          this.productForm.get("price")?.setValidators([Validators.required, Validators.min(0)]);
        }
        this.productForm.get("sale_price")?.setValidators([Validators.min(0)]);
      } else {
        if (this.choicesArray.length === 0) {
          this.addChoice();
        }
        this.productForm.get("price")?.clearValidators();
        this.productForm.get("sale_price")?.clearValidators();
      }
      this.productForm.get("price")?.updateValueAndValidity();
      this.productForm.get("sale_price")?.updateValueAndValidity();
    });
    // Add listener for price changes to enable/disable sale_price
    this.productForm.get("price")?.valueChanges.subscribe((price) => {
      if (price !== null && price !== "" && price > 0) {
        this.productForm.get("sale_price")?.enable();
      } else {
        this.productForm.get("sale_price")?.disable();
        this.productForm.get("sale_price")?.setValue(null);
        this.productForm.get("price_after_sale")?.setValue(null);
      }
    });

    this.productForm.get("sale_price")?.valueChanges.subscribe((salePrice) => {
      const price = this.productForm.get("price")?.value;
      if (price && salePrice) {
        const priceAfterSale = price - price * (salePrice / 100);
        this.productForm.get("price_after_sale")?.setValue(priceAfterSale.toFixed(2));
      } else {
        this.productForm.get("price_after_sale")?.setValue(null);
      }
    });
  }

  onFormSubmit(): void {
    this.productForm.markAllAsTouched();

    if (this.productForm.invalid) {
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: "Please complete all required fields",
      });
      return;
    }

    if (this.productForm.get('pricing_type')?.value === 'choices' && this.choicesArray.length < 2) {
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: "At least two choices are required for choice-based pricing",
      });
      return;
    }

    this.spinnerService.show("actionsLoader");
    const formData = this.prepareFormData();
    this.http.post(`${this.baseUrl}products${this.isSpecial ? '?is_special=1' : ''}`, formData).subscribe({
      next: (response: any) => {
        this.spinnerService.hide("actionsLoader");
        if (response.success) {
          this.messageService.add({
            severity: "success",
            summary: "Success",
            detail: response.success,
          });
          this.router.navigate(["/dashboard/menu/products"], {
            queryParams: this.isSpecial ? { special: 'true' } : undefined
          });
        } else {
          this.showError("Unexpected response from server");
        }
      },
      error: (error) => {
        this.spinnerService.hide("actionsLoader");
        this.showError(error.error?.message || "Failed to submit product");
      },
    });
  }

  private prepareFormData(): FormData {
    const formValue = this.productForm.getRawValue();
    const formData = new FormData();

    formData.append("en_name", formValue.en_name);
    formData.append("ar_name", formValue.ar_name);
    formData.append("en_description", formValue.en_description);
    formData.append("ar_description", formValue.ar_description);
    formData.append("size", formValue.size);
    formData.append("en_small_descritpion", formValue.en_small_description);
    formData.append("ar_small_descritpion", formValue.ar_small_description);
    formData.append("category_id", formValue.category_id);
    formData.append("en_ingredient", formValue.en_ingredient);
    formData.append("ar_ingredient", formValue.ar_ingredient);
    formData.append("en_how_to_use", formValue.en_how_to_use);
    formData.append("ar_how_to_use", formValue.ar_how_to_use);
    formData.append("en_more_information", formValue.en_more_information);
    formData.append("ar_more_information", formValue.ar_more_information);
    formData.append("en_meta_Title", formValue.en_meta_Title);
    formData.append("ar_meta_Title", formValue.ar_meta_Title);
    formData.append("en_meta_text", formValue.en_meta_text);
    formData.append("ar_meta_text", formValue.ar_meta_text);
    // Append raw script blocks (as strings). Backend should handle/sanitize as needed.
    formData.append("en_script", formValue.en_script || "");
    formData.append("ar_script", formValue.ar_script || "");
    formData.append("promo_code_status", formValue.promo_code_status ? "1" : "0");

    if (formValue.subcategory_id) {
      formData.append("subcategory_id", formValue.subcategory_id);
    }

    formData.append("active_status", formValue.active_status ? "1" : "0");
    formData.append("featured", formValue.featured ? "1" : "0");
    formData.append("stock_status", formValue.stock_status ? "1" : "0");
    formData.append("commercial_status", formValue.commercial_status ? "1" : "0"); // Added commercial_status

    if (formValue.pricing_type === "standard") {
      if (formValue.price !== null && formValue.price !== undefined && formValue.price !== "") {
        formData.append("price", formValue.price);
      } else if (this.isSpecial) {
        formData.append("price", "");
      } else {
        formData.append("price", formValue.price ?? "");
      }
      if (formValue.sale_price) {
        formData.append("sale_price", formValue.sale_price);
        formData.append("price_after_sale", formValue.price_after_sale);
      }
    } else {
      this.choicesArray.controls.forEach((choice, index) => {
        formData.append(`choices[${index}][en_name]`, choice.get('en_name')?.value);
        formData.append(`choices[${index}][ar_name]`, choice.get('ar_name')?.value);
        formData.append(`choices[${index}][cuurent_value]`, choice.get('current_value')?.value);
        formData.append(`choices[${index}][active_status]`, choice.get('active_status')?.value ? "1" : "0");
      });

      formData.append("price", formValue.price || "0");
      if (formValue.sale_price) {
        formData.append("sale_price", formValue.sale_price);
        formData.append("price_after_sale", formValue.price_after_sale);
      }
    }

    if (formValue.main_image) {
      formData.append("main_image", formValue.main_image);
    }

    const additionalImages = formValue.additional_images || [];
    additionalImages.forEach((file: File, index: number) => {
      formData.append(`images[${index}]`, file);
    });

    return formData;
  }

  private convertFormDataToObject(formData: FormData): any {
    const obj: any = {};
    formData.forEach((value, key) => {
      if (value instanceof File) {
        if (key === "main_image") {
          obj.main_image = value.name;
        } else if (key.startsWith("images[")) {
          if (!obj.additional_images) obj.additional_images = [];
          obj.additional_images.push(value.name);
        }
      } else if (key === "choices") {
        try {
          obj[key] = JSON.parse(value as string);
        } catch (e) {
          obj[key] = [];
        }
      } else {
        obj[key] = value;
      }
    });
    return obj;
  }
}
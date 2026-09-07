import { HttpErrorResponse } from "@angular/common/http";
import { Component, inject } from "@angular/core";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { DialogModule } from "primeng/dialog";
import { DropdownModule } from "primeng/dropdown";
import { InputSwitchModule } from "primeng/inputswitch";
import { timer } from "rxjs";
import { IAllCategory } from "../../../../../../core/Interfaces/h-category/IAllCategory";
import { SubCategoryService } from "../../../../../../core/services/q-sub-categories/sub-category.service";
import { FileUploadModule } from "primeng/fileupload";
import { ImageUploadComponent } from "../../../../../../shared/components/image-upload/image-upload.component";
import { ProductImage } from "../../b-products/h-products-edit/h-products-edit.component";
@Component({
  selector: 'app-c-sub-categories-add',
  standalone: true,
  imports: [
    ButtonModule,
    CardModule,
    InputSwitchModule,
    DialogModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    DropdownModule,
    FileUploadModule,
    ImageUploadComponent
  ],
  templateUrl: './c-sub-categories-add.component.html',
  styleUrl: './c-sub-categories-add.component.scss',
  providers: [MessageService],
})
export class CSubCategoriesAddComponent {
  submitForm: FormGroup;
  IMAGE_BASE_URL: string = `https://dev.mesoshop.digitalbondmena.com/`;
  categories: {
    value: string;
    label: string;
  }[] = [];
  addedImages: File[] = [];
  removedImages: string[] = [];
  isEditing = false;
  isSpecial = false;
  mainImagePreview: ProductImage[] = [];

  errorMessagesArr: string[] = [];

  subCategoryId: string | null = null;

  private fb = inject(FormBuilder);

  private subCategoryService = inject(SubCategoryService);

  private ngxSpinnerService = inject(NgxSpinnerService);

  private router = inject(Router);

  private messageService = inject(MessageService);

  private activatedRoute = inject(ActivatedRoute);

  constructor() {
    this.submitForm = this.fb.group({
      en_name: ['', Validators.required],
      ar_name: ['', Validators.required],
      image: [null, Validators.required],
      category_id: ['', Validators.required],
      active_status: [1, Validators.required],
    });
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      this.isSpecial = params['special'] === 'true' || params['special'] === '1';
    });
    this.initAllCategories();
    this.initEditData();
  }

  initAllCategories() {
    if (this.activatedRoute.snapshot.data['categories']) {
      this.categories = (
        this.activatedRoute.snapshot.data['categories'] as IAllCategory
      ).data.filter((c) => c.active_status === 1).map((category: any) => ({
        value: category.id,
        label: category.en_name,
      }));
    }
  }

  initEditData() {
    this.initAllCategories();
    const subCategory = this.activatedRoute.snapshot.data['subCategory']?.data;
    if (subCategory) {
      const image = this.IMAGE_BASE_URL + subCategory?.image;
      const currentTime = new Date().toISOString();
      this.mainImagePreview = image
        ? [{
          id: `temp-${Date.now()}`,
          product_id: subCategory.id, // Use category.id as product_id
          image: image,
          thumb: image,
          medium: image,
          order_view: 0,
          is_main: true,
          active_status: true,
          created_at: currentTime,
          updated_at: currentTime
        }]
        : [];;

      this.isEditing = true;
      this.submitForm.patchValue(
        this.activatedRoute.snapshot.data['subCategory'].data
      );

      this.subCategoryId =
        this.activatedRoute.snapshot.data['subCategory'].data.id;
    }
  }

  saveForm() {
    this.submitForm.markAllAsTouched();
    if (this.submitForm.invalid) return;

    this.ngxSpinnerService.show('actionsLoader');
    this.messageService.clear();

    const formData = new FormData();
    formData.append('en_name', this.submitForm.get('en_name')?.value);
    formData.append('ar_name', this.submitForm.get('ar_name')?.value);
    formData.append('category_id', this.submitForm.get('category_id')?.value);
    formData.append('active_status', this.submitForm.get('active_status')?.value);

    const imageFile = this.submitForm.get('image')?.value;
    if (imageFile && imageFile instanceof File) {
      formData.append('image', imageFile);
    }
    if (this.isEditing && this.subCategoryId) {
      this.subCategoryService.updateSubCategory(this.subCategoryId, formData, this.isSpecial).subscribe({
        next: (response) => {
          this.router.navigate(['/dashboard/menu/sub-categories'], {
            queryParams: this.isSpecial ? { special: 'true' } : undefined
          });
          this.messageService.add({
            severity: 'success',
            summary: 'Updated',
            detail: 'Category updated successfully',
          });
          timer(200).subscribe(() => this.ngxSpinnerService.hide('actionsLoader'));
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessagesArr = error.error.errors;
          this.ngxSpinnerService.hide('actionsLoader');
        },
      });
    } else {
      this.subCategoryService.addSubCategory(this.submitForm.value.category_id, formData, this.isSpecial).subscribe({
        next: (response) => {
          this.router.navigate(['/dashboard/menu/sub-categories'], {
            queryParams: this.isSpecial ? { special: 'true' } : undefined
          });
          this.messageService.add({
            severity: 'success',
            summary: 'Added',
            detail: 'Category added successfully',
          });
          timer(200).subscribe(() => this.ngxSpinnerService.hide('actionsLoader'));
        },
        error: (error: HttpErrorResponse) => {
          console.log(error.error.errors);
          this.ngxSpinnerService.hide('actionsLoader');
        },
      });
    }
  }

  clearMainImage(): void {
    this.submitForm.patchValue({
      image: null
    });
  }
  onImagesChanged(event: { added: File[], removed: string[] }) {
    this.addedImages = event.added;
    this.removedImages = event.removed;
    if (this.addedImages.length > 0) {
      this.submitForm.patchValue({ image: this.addedImages[0] });
      this.submitForm.get('image')?.setValidators([Validators.required]);
    } else if (this.isEditing && this.mainImagePreview.length > 0 && this.removedImages.length === 0) {
      const filename = this.mainImagePreview[0].image.replace(this.IMAGE_BASE_URL, '');
      this.submitForm.patchValue({ image: filename });
      this.submitForm.get('image')?.clearValidators();
    } else {
      this.submitForm.patchValue({ image: null });
      this.submitForm.get('image')?.setValidators([Validators.required]);
    }
    this.submitForm.get('image')?.updateValueAndValidity();
  }



}

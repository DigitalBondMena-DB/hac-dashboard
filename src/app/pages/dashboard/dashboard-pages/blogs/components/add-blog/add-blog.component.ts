import { NgxJoditComponent } from 'ngx-jodit';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { InputSwitchModule } from 'primeng/inputswitch';
import { CommonModule } from '@angular/common';
import { ImageUploadComponent } from '../../../../../../shared/components/image-upload/image-upload.component';
import { Blog, BlogsService } from '../../services/blogs.service';

// ProductImage interface as provided
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

// Custom validator to restrict past dates
function restrictPastDates(control: AbstractControl): ValidationErrors | null {
  const selectedDate = new Date(control.value);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day
  if (selectedDate < today) {
    return { pastDate: true };
  }
  return null;
}

@Component({
  selector: 'app-add-blog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    ToastModule,
    NgxSpinnerModule,
    RouterLink,
    CommonModule,
    InputSwitchModule,
    ImageUploadComponent,
    NgxJoditComponent
  ],
  templateUrl: './add-blog.component.html',
  styleUrl: './add-blog.component.scss',
  providers: [MessageService]
})
export class AddBlogComponent implements OnInit {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private blogsService = inject(BlogsService);
  private messageService = inject(MessageService);
  private ngxSpinnerService = inject(NgxSpinnerService);
  private route = inject(ActivatedRoute);

  blogForm!: FormGroup;
  isSubmitting: boolean = false;
  addedImages: File[] = [];
  removedImages: string[] = [];
  isEditMode: boolean = false;
  blogId: string | null = null;
  initialImages: ProductImage[] = [];
  private readonly IMAGE_BASE_URL = 'https://dev.mesoshop.digitalbondmena.com/';
  minDate: string = new Date().toISOString().split('T')[0]; // For input min attribute

  constructor() { }

  ngOnInit() {
    this.ngxSpinnerService.show('actionsLoader');
    this.initializeForm();
    this.checkMode();
    this.ngxSpinnerService.hide('actionsLoader');
  }

  initializeForm() {
    this.blogForm = this.fb.group({
      en_blog_title: ['', Validators.required],
      ar_blog_title: ['', Validators.required],
      en_blog_text: ['', Validators.required],
      ar_blog_text: ['', Validators.required],
      en_meta_title: ['', Validators.required],
      ar_meta_title: ['', Validators.required],
      en_meta_text: ['', Validators.required],
      ar_meta_text: ['', Validators.required],
      en_script_text: ['', Validators.required],
      ar_script_text: ['', Validators.required],
      blog_date: ['', [Validators.required, restrictPastDates]],
      active_status: [1, Validators.required],
      main_image: [null, Validators.required]
    });
    this.blogForm.markAsPristine();
  }

  checkMode() {
    this.route.url.subscribe(segments => {
      this.isEditMode = segments.some(segment => segment.path.includes('edit'));
      if (this.isEditMode) {
        this.blogId = this.route.snapshot.paramMap.get('id');
        if (this.blogId) {
          this.loadBlogData(this.blogId);
        }
      } else {
        this.initialImages = [];
      }
    });
  }

  loadBlogData(id: string) {
    this.ngxSpinnerService.show('actionsLoader');
    this.blogsService.getBlogById(id).subscribe({
      next: (response) => {
        const blog = response.blog;
        const currentTime = new Date().toISOString();
        this.initialImages = blog.main_image
          ? [{
            id: `temp-${Date.now()}`,
            product_id: 0,
            image: this.IMAGE_BASE_URL + blog.main_image,
            thumb: this.IMAGE_BASE_URL + blog.main_image,
            medium: this.IMAGE_BASE_URL + blog.main_image,
            order_view: 0,
            is_main: true,
            active_status: true,
            created_at: currentTime,
            updated_at: currentTime
          }]
          : [];
        this.blogForm.patchValue({
          en_blog_title: blog.en_blog_title,
          ar_blog_title: blog.ar_blog_title,
          en_blog_text: blog.en_blog_text,
          ar_blog_text: blog.ar_blog_text,
          en_meta_title: blog.en_meta_title,
          ar_meta_title: blog.ar_meta_title,
          en_meta_text: blog.en_meta_text,
          ar_meta_text: blog.ar_meta_text,
          en_script_text: blog.en_script_text || '',
          ar_script_text: blog.ar_script_text || '',
          blog_date: blog.blog_date,
          active_status: blog.active_status,
          main_image: blog.main_image
        });
        // Allow any valid date in edit mode
        this.blogForm.get('blog_date')?.setValidators([Validators.required]);
        this.blogForm.get('blog_date')?.updateValueAndValidity();
        this.blogForm.get('main_image')?.clearValidators();
        this.blogForm.get('main_image')?.updateValueAndValidity();
        this.ngxSpinnerService.hide('actionsLoader');
      },
      error: (error: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Failed to load blog data'
        });
        this.ngxSpinnerService.hide('actionsLoader');
      }
    });
  }

  onImagesChanged(event: { added: File[], removed: string[] }) {
    this.addedImages = event.added;
    this.removedImages = event.removed;
    if (this.addedImages.length > 0) {
      this.blogForm.patchValue({ main_image: this.addedImages[0] });
      this.blogForm.get('main_image')?.setValidators([Validators.required]);
    } else if (this.isEditMode && this.initialImages.length > 0 && this.removedImages.length === 0) {
      const filename = this.initialImages[0].image.replace(this.IMAGE_BASE_URL, '');
      this.blogForm.patchValue({ main_image: filename });
      this.blogForm.get('main_image')?.clearValidators();
    } else {
      this.blogForm.patchValue({ main_image: null });
      this.blogForm.get('main_image')?.setValidators([Validators.required]);
    }
    this.blogForm.get('main_image')?.updateValueAndValidity();
  }

  onActiveStatusChange(event: any) {
    this.blogForm.patchValue({ active_status: event.checked ? 1 : 0 });
  }

  onSubmit() {
    if (this.blogForm.invalid) {
      this.blogForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.ngxSpinnerService.show('actionsLoader');

    const formData = new FormData();
    const blogData = this.blogForm.value as { [key: string]: string | number | File | null };

    Object.keys(blogData).forEach(key => {
      if (key !== 'main_image') {
        const value = blogData[key];
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      }
    });

    if (this.isEditMode) {
      if (this.addedImages.length > 0) {
        const mainImage = blogData['main_image'] as File | null;
        if (mainImage) {
          formData.append('main_image', mainImage);
        }
      }
    } else {
      const mainImage = blogData['main_image'] as File | null;
      if (mainImage) {
        formData.append('main_image', mainImage);
      }
    }

    const apiCall = this.isEditMode && this.blogId
      ? this.blogsService.updateBlog(this.blogId, formData)
      : this.blogsService.createBlog(formData);

    apiCall.subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: response.success || `Blog ${this.isEditMode ? 'updated' : 'created'} successfully`
        });
        this.blogForm.reset();
        this.blogForm.markAsPristine();
        this.addedImages = [];
        this.removedImages = [];
        this.initialImages = [];
        this.isSubmitting = false;
        this.ngxSpinnerService.hide('actionsLoader');
        this.router.navigate(['/dashboard/blogs']);
      },
      error: (error: any) => {
        let errorMessage = error.error?.message || `Failed to ${this.isEditMode ? 'update' : 'create'} blog`;
        if (error.error?.errors) {
          const errorFields = Object.keys(error.error.errors);
          if (errorFields.length > 0) {
            const firstErrorKey = errorFields[0];
            errorMessage = error.error.errors[firstErrorKey][0];
            errorFields.forEach((key) => {
              if (error.error.errors[key].length > 0) {
                console.log(`Error for ${key}: ${error.error.errors[key][0]}`);
              }
            });
          }
        }
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage
        });
        this.isSubmitting = false;
        this.ngxSpinnerService.hide('actionsLoader');
      }
    });
  }
}
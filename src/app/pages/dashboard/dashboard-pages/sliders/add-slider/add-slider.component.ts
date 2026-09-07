import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { ImageUploadComponent } from '../../../../../shared/components/image-upload/image-upload.component';
import {
  SingleSliderResponse,
  SlidersService,
} from '../services/slider.service';

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
  selector: 'app-add-slider',
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
  ],
  templateUrl: './add-slider.component.html',
  styleUrl: './add-slider.component.scss',
  providers: [MessageService],
})
export class AddSliderComponent implements OnInit {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private slidersService = inject(SlidersService);
  private messageService = inject(MessageService);
  private ngxSpinnerService = inject(NgxSpinnerService);
  private route = inject(ActivatedRoute);

  sliderForm!: FormGroup;
  isSubmitting: boolean = false;
  addedArImages: File[] = [];
  addedEnImages: File[] = [];
  removedArImages: string[] = [];
  removedEnImages: string[] = [];
  isEditMode: boolean = false;
  sliderId: string | null = null;
  initialArImages: ProductImage[] = [];
  initialEnImages: ProductImage[] = [];
  private readonly IMAGE_BASE_URL = 'https://dev.mesoshop.digitalbondmena.com/';

  constructor() { }

  ngOnInit() {
    this.ngxSpinnerService.show('actionsLoader');
    this.initializeForm();
    this.checkMode();
    this.ngxSpinnerService.hide('actionsLoader');
  }

  initializeForm() {
    this.sliderForm = this.fb.group({
      ar_slider_link: [
        '',
        [
          Validators.pattern(
            /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/
          ),
        ],
      ],
      en_slider_link: [
        '',
        [
          Validators.pattern(
            /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/
          ),
        ],
      ],
      active_status: [1, Validators.required],
      main_image_ar: [null, Validators.required],
      main_image: [null, Validators.required],
    });
    this.sliderForm.markAsPristine();
  }

  checkMode() {
    this.route.url.subscribe((segments) => {
      this.isEditMode = segments.some((segment) =>
        segment.path.includes('edit')
      );
      if (this.isEditMode) {
        this.sliderId = this.route.snapshot.paramMap.get('id');
        if (this.sliderId) {
          this.loadSliderData(this.sliderId);
        }
      } else {
        this.initialArImages = [];
        this.initialEnImages = [];
      }
    });
  }

  loadSliderData(id: string) {
    this.ngxSpinnerService.show('actionsLoader');
    this.slidersService.getSliderById(id).subscribe({
      next: (response: SingleSliderResponse) => {
        const slider = response.row;
        const currentTime = new Date().toISOString();
        // Handle Arabic image
        this.initialArImages = slider.main_image_ar
          ? [
            {
              id: `temp-ar-${Date.now()}`,
              product_id: 0,
              image: this.IMAGE_BASE_URL + slider.main_image_ar,
              thumb: this.IMAGE_BASE_URL + slider.main_image_ar,
              medium: this.IMAGE_BASE_URL + slider.main_image_ar,
              order_view: 0,
              is_main: true,
              active_status: true,
              created_at: currentTime,
              updated_at: currentTime,
            },
          ]
          : [];

        // Handle English image
        this.initialEnImages = slider.main_image
          ? [
            {
              id: `temp-en-${Date.now()}`,
              product_id: 0,
              image: this.IMAGE_BASE_URL + slider.main_image,
              thumb: this.IMAGE_BASE_URL + slider.main_image,
              medium: this.IMAGE_BASE_URL + slider.main_image,
              order_view: 0,
              is_main: true,
              active_status: true,
              created_at: currentTime,
              updated_at: currentTime,
            },
          ]
          : [];
        this.sliderForm.patchValue({
          active_status: slider.active_status,
          main_image_ar: slider.main_image_ar,
          main_image: slider.main_image,
          en_slider_link: slider.en_slider_link,
          ar_slider_link: slider.ar_slider_link,
        });

        // Clear validators for existing images
        this.sliderForm.get('main_image_ar')?.clearValidators();
        this.sliderForm.get('main_image_ar')?.updateValueAndValidity();
        this.sliderForm.get('main_image')?.clearValidators();
        this.sliderForm.get('main_image')?.updateValueAndValidity();
        this.ngxSpinnerService.hide('actionsLoader');
      },
      error: (error: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Failed to load slider data',
        });
        this.ngxSpinnerService.hide('actionsLoader');
      },
    });
  }

  onArImagesChanged(event: { added: File[]; removed: string[] }) {
    this.addedArImages = event.added;
    this.removedArImages = event.removed;

    if (this.addedArImages.length > 0) {
      this.sliderForm.patchValue({ main_image_ar: this.addedArImages[0] });
      this.sliderForm
        .get('main_image_ar')
        ?.setValidators([Validators.required]);
    } else if (
      this.isEditMode &&
      this.initialArImages.length > 0 &&
      this.removedArImages.length === 0
    ) {
      const filename = this.initialArImages[0].image.replace(
        this.IMAGE_BASE_URL,
        ''
      );
      this.sliderForm.patchValue({ main_image_ar: filename });
      this.sliderForm.get('main_image_ar')?.clearValidators();
    } else {
      this.sliderForm.patchValue({ main_image_ar: null });
      this.sliderForm
        .get('main_image_ar')
        ?.setValidators([Validators.required]);
    }
    this.sliderForm.get('main_image_ar')?.updateValueAndValidity();
  }

  onEnImagesChanged(event: { added: File[]; removed: string[] }) {
    this.addedEnImages = event.added;
    this.removedEnImages = event.removed;

    if (this.addedEnImages.length > 0) {
      this.sliderForm.patchValue({ main_image: this.addedEnImages[0] });
      this.sliderForm.get('main_image')?.setValidators([Validators.required]);
    } else if (
      this.isEditMode &&
      this.initialEnImages.length > 0 &&
      this.removedEnImages.length === 0
    ) {
      const filename = this.initialEnImages[0].image.replace(
        this.IMAGE_BASE_URL,
        ''
      );
      this.sliderForm.patchValue({ main_image: filename });
      this.sliderForm.get('main_image')?.clearValidators();
    } else {
      this.sliderForm.patchValue({ main_image: null });
      this.sliderForm.get('main_image')?.setValidators([Validators.required]);
    }
    this.sliderForm.get('main_image')?.updateValueAndValidity();
  }

  onActiveStatusChange(event: any) {
    this.sliderForm.patchValue({ active_status: event.checked ? 1 : 0 });
  }

  onSubmit() {
    if (this.sliderForm.invalid) {
      this.sliderForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.ngxSpinnerService.show('actionsLoader');

    const formData = new FormData();
    const sliderData = this.sliderForm.value as {
      [key: string]: string | number | File | null;
    };

    Object.keys(sliderData).forEach((key) => {
      if (key !== 'main_image_ar' && key !== 'main_image') {
        const value = sliderData[key];
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      }
    });

    // Handle Arabic image
    if (this.isEditMode) {
      if (this.addedArImages.length > 0) {
        const arMainImage = sliderData['main_image_ar'] as File | null;
        if (arMainImage) {
          formData.append('main_image_ar', arMainImage);
        }
      }
    } else {
      const arMainImage = sliderData['main_image_ar'] as File | null;
      if (arMainImage) {
        formData.append('main_image_ar', arMainImage);
      }
    }

    // Handle English image
    if (this.isEditMode) {
      if (this.addedEnImages.length > 0) {
        const enMainImage = sliderData['main_image'] as File | null;
        if (enMainImage) {
          formData.append('main_image', enMainImage);
        }
      }
    } else {
      const enMainImage = sliderData['main_image'] as File | null;
      if (enMainImage) {
        formData.append('main_image', enMainImage);
      }
    }

    const apiCall =
      this.isEditMode && this.sliderId
        ? this.slidersService.updateSlider(this.sliderId, formData)
        : this.slidersService.createSlider(formData);

    apiCall.subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail:
            response.success ||
            `Slider ${this.isEditMode ? 'updated' : 'created'} successfully`,
        });
        this.sliderForm.reset();
        this.sliderForm.markAsPristine();
        this.addedArImages = [];
        this.addedEnImages = [];
        this.removedArImages = [];
        this.removedEnImages = [];
        this.initialArImages = [];
        this.initialEnImages = [];
        this.isSubmitting = false;
        this.ngxSpinnerService.hide('actionsLoader');
        this.router.navigate(['/dashboard/sliders']);
      },
      error: (error: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail:
            error.error?.message ||
            `Failed to ${this.isEditMode ? 'update' : 'create'} slider`,
        });
        this.isSubmitting = false;
        this.ngxSpinnerService.hide('actionsLoader');
      },
    });
  }
}

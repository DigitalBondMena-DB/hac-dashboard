import { NgxJoditComponent } from 'ngx-jodit';
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
import { ImageUploadComponent } from '../../../../../shared/components/image-upload/image-upload.component';
import { FeaturesService, FeatureResponse } from '../services/features.service';

// Reusing ProductImage interface to match ImageUploadComponent expectations
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

// FeatureImage interface mirrors ProductImage but uses feature_id internally
export interface FeatureImage {
  id: string | number;
  feature_id: number; // Maps to product_id when converting to ProductImage
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
  selector: 'app-edit-feature',
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
    ImageUploadComponent,
    NgxJoditComponent
  ],
  templateUrl: './edit-feature.component.html',
  styleUrl: './edit-feature.component.scss',
  providers: [MessageService]
})
export class EditFeatureComponent implements OnInit {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private featuresService = inject(FeaturesService);
  private messageService = inject(MessageService);
  private ngxSpinnerService = inject(NgxSpinnerService);
  private route = inject(ActivatedRoute);

  featureForm!: FormGroup;
  isSubmitting: boolean = false;
  addedImages: File[] = [];
  removedImages: string[] = [];
  isEditMode: boolean = false;
  featureId:


    string | null = null;
  initialImages: ProductImage[] = []; // Changed to ProductImage[] to match ImageUploadComponent
  private readonly IMAGE_BASE_URL = 'https://mesoshop.digitalbondmena.com/';

  constructor() { }

  ngOnInit() {
    this.ngxSpinnerService.show('actionsLoader');

    this.initializeForm();
    this.checkMode();
    this.ngxSpinnerService.hide('actionsLoader');

  }

  initializeForm() {
    this.featureForm = this.fb.group({
      en_title: ['', Validators.required],
      ar_title: ['', Validators.required],
      en_text: ['', Validators.required],
      ar_text: ['', Validators.required],
      icon_image: [null, Validators.required]
    });
    this.featureForm.markAsPristine();
  }

  checkMode() {
    this.route.url.subscribe(segments => {
      this.isEditMode = segments.some(segment => segment.path.includes('edit'));
      if (this.isEditMode) {
        this.featureId = this.route.snapshot.paramMap.get('id');
        if (this.featureId) {
          this.loadFeatureData(this.featureId);
        }
      } else {
        this.initialImages = []; // Empty array in Add mode
      }
    });
  }

  loadFeatureData(id: string) {
    this.ngxSpinnerService.show('actionsLoader');
    this.featuresService.getFeatureById(id).subscribe({
      next: (response: FeatureResponse) => {
        const feature = response.row;
        const currentTime = new Date().toISOString();
        // Create FeatureImage and convert to ProductImage
        const featureImages: FeatureImage[] = feature.icon_image
          ? [{
            id: `temp-${Date.now()}`,
            feature_id: feature.id,
            image: this.IMAGE_BASE_URL + feature.icon_image,
            thumb: this.IMAGE_BASE_URL + feature.icon_image,
            medium: this.IMAGE_BASE_URL + feature.icon_image,
            order_view: 0,
            is_main: true,
            active_status: true,
            created_at: currentTime,
            updated_at: currentTime
          }]
          : [];
        // Convert FeatureImage[] to ProductImage[]
        this.initialImages = featureImages.map(fi => ({
          ...fi,
          product_id: fi.feature_id // Map feature_id to product_id
        }));
        this.featureForm.patchValue({
          en_title: feature.en_title,
          ar_title: feature.ar_title,
          en_text: feature.en_text,
          ar_text: feature.ar_text,
          icon_image: feature.icon_image
        });
        // In edit mode, icon_image is not required unless a new image is uploaded
        this.featureForm.get('icon_image')?.clearValidators();
        this.featureForm.get('icon_image')?.updateValueAndValidity();
        this.ngxSpinnerService.hide('actionsLoader');
      },
      error: (error: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Failed to load feature data'
        });
        this.ngxSpinnerService.hide('actionsLoader');
      }
    });
  }

  onImagesChanged(event: { added: File[], removed: string[] }) {
    this.addedImages = event.added;
    this.removedImages = event.removed;
    if (this.addedImages.length > 0) {
      this.featureForm.patchValue({ icon_image: this.addedImages[0] });
      this.featureForm.get('icon_image')?.setValidators([Validators.required]);
    } else if (this.isEditMode && this.initialImages.length > 0 && this.removedImages.length === 0) {
      const filename = this.initialImages[0].image.replace(this.IMAGE_BASE_URL, '');
      this.featureForm.patchValue({ icon_image: filename });
      this.featureForm.get('icon_image')?.clearValidators();
    } else {
      this.featureForm.patchValue({ icon_image: null });
      this.featureForm.get('icon_image')?.setValidators([Validators.required]);
    }
    this.featureForm.get('icon_image')?.updateValueAndValidity();
  }

  onSubmit() {
    if (this.featureForm.invalid) {
      this.featureForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.ngxSpinnerService.show('actionsLoader');

    const formData = new FormData();
    const featureData = this.featureForm.value as { [key: string]: string | number | File | null };

    // Append feature data (excluding icon_image)
    Object.keys(featureData).forEach(key => {
      if (key !== 'icon_image') {
        const value = featureData[key];
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      }
    });

    // Handle image based on mode
    if (this.isEditMode) {
      if (this.addedImages.length > 0) {
        const iconImage = featureData['icon_image'] as File | null;
        if (iconImage) {
          formData.append('icon_image', iconImage);
        }
      }
    } else {
      const iconImage = featureData['icon_image'] as File | null;
      if (iconImage) {
        formData.append('icon_image', iconImage);
      }
    }

    const apiCall = this.isEditMode && this.featureId
      ? this.featuresService.updateFeature(this.featureId, formData)
      : this.featuresService.updateFeature('0', formData); // Adjust if create endpoint differs

    apiCall.subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Feature ${this.isEditMode ? 'updated' : 'created'} successfully`
        });
        this.featureForm.reset();
        this.featureForm.markAsPristine();
        this.addedImages = [];
        this.removedImages = [];
        this.initialImages = [];
        this.isSubmitting = false;
        this.router.navigate(['/dashboard/features']);
        this.ngxSpinnerService.hide('actionsLoader');
        // setTimeout(() => {
        // }, 1000);
      },
      error: (error: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || `Failed to ${this.isEditMode ? 'update' : 'create'} feature`
        });
        this.isSubmitting = false;
        this.ngxSpinnerService.hide('actionsLoader');
      }
    });
  }
}
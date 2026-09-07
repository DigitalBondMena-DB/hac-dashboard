import { NgxJoditComponent } from 'ngx-jodit';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { OffersService, SingleOfferResponse } from '../../service/offer.service';

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
  selector: 'app-add-offer',
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
  templateUrl: './add-offer.component.html',
  styleUrl: './add-offer.component.scss',
  providers: [MessageService]
})
export class AddOfferComponent implements OnInit {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private offersService = inject(OffersService);
  private messageService = inject(MessageService);
  private ngxSpinnerService = inject(NgxSpinnerService);
  private route = inject(ActivatedRoute);

  offerForm!: FormGroup;
  isSubmitting: boolean = false;
  addedImages: File[] = [];
  removedImages: string[] = [];
  isEditMode: boolean = false;
  offerId: string | null = null;
  initialImages: ProductImage[] = [];
  private readonly IMAGE_BASE_URL = 'https://dev.mesoshop.digitalbondmena.com/';

  constructor() { }

  ngOnInit() {
    this.initializeForm();
    this.checkMode();
  }

  initializeForm() {
    this.offerForm = this.fb.group({
      en_samll_title: ['', Validators.required],
      ar_small_title: ['', Validators.required],
      en_title: ['', Validators.required],
      ar_title: ['', Validators.required],
      en_text: ['', Validators.required],
      ar_text: ['', Validators.required],
      active_status: [1, Validators.required],
      main_image: [null, Validators.required]
    });
    this.offerForm.markAsPristine();
  }

  checkMode() {
    this.route.url.subscribe(segments => {
      this.isEditMode = segments.some(segment => segment.path.includes('edit'));
      if (this.isEditMode) {
        this.offerId = this.route.snapshot.paramMap.get('id');
        if (this.offerId) {
          this.loadOfferData(this.offerId);
        }
      } else {
        this.initialImages = []; // Empty array in Add mode
      }
    });
  }

  loadOfferData(id: string) {
    this.ngxSpinnerService.show('actionsLoader');
    this.offersService.getOfferById(id).subscribe({
      next: (response: SingleOfferResponse) => {
        const offer = response.row;
        console.log(offer);
        // Transform main_image string to ProductImage array with base URL
        const currentTime = new Date().toISOString();
        this.initialImages = offer.main_image
          ? [{
            id: `temp-${Date.now()}`, // Temporary unique ID
            product_id: 0, // Placeholder, adjust if backend requires specific value
            image: this.IMAGE_BASE_URL + offer.main_image,
            thumb: this.IMAGE_BASE_URL + offer.main_image, // Use same URL, adjust if thumb is different
            medium: this.IMAGE_BASE_URL + offer.main_image, // Use same URL, adjust if medium is different
            order_view: 0,
            is_main: true,
            active_status: true,
            created_at: currentTime,
            updated_at: currentTime
          }]
          : [];
        this.offerForm.patchValue({
          en_samll_title: offer.en_samll_title, // Note: API has typo "en_samll_title"
          ar_small_title: offer.ar_small_title,
          en_title: offer.en_title,
          ar_title: offer.ar_title,
          en_text: offer.en_text,
          ar_text: offer.ar_text,
          active_status: offer.active_status,
          main_image: offer.main_image // Store filename only for API submission
        });
        // In edit mode, main_image is not required unless a new image is uploaded
        this.offerForm.get('main_image')?.clearValidators();
        this.offerForm.get('main_image')?.updateValueAndValidity();
        this.ngxSpinnerService.hide('actionsLoader');
      },
      error: (error: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Failed to load offer data'
        });
        this.ngxSpinnerService.hide('actionsLoader');
      }
    });
  }

  onImagesChanged(event: { added: File[], removed: string[] }) {
    this.addedImages = event.added;
    this.removedImages = event.removed;
    if (this.addedImages.length > 0) {
      this.offerForm.patchValue({ main_image: this.addedImages[0] });
      this.offerForm.get('main_image')?.setValidators([Validators.required]);
    } else if (this.isEditMode && this.initialImages.length > 0 && this.removedImages.length === 0) {
      // Use filename only (strip base URL if necessary)
      const filename = this.initialImages[0].image.replace(this.IMAGE_BASE_URL, '');
      this.offerForm.patchValue({ main_image: filename });
      this.offerForm.get('main_image')?.clearValidators();
    } else {
      this.offerForm.patchValue({ main_image: null });
      this.offerForm.get('main_image')?.setValidators([Validators.required]);
    }
    this.offerForm.get('main_image')?.updateValueAndValidity();
  }

  onActiveStatusChange(event: any) {
    this.offerForm.patchValue({ active_status: event.checked ? 1 : 0 });
  }

  onSubmit() {
    if (this.offerForm.invalid) {
      this.offerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.ngxSpinnerService.show('actionsLoader');

    const formData = new FormData();
    const offerData = this.offerForm.value as { [key: string]: string | number | File | null };

    // Append offer data (excluding main_image, as it will be handled separately)
    Object.keys(offerData).forEach(key => {
      if (key !== 'main_image') {
        const value = offerData[key];
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      }
    });

    // Handle image based on mode
    if (this.isEditMode) {
      // In Edit mode, only append main_image if a new image is uploaded
      if (this.addedImages.length > 0) {
        const mainImage = offerData['main_image'] as File | null;
        if (mainImage) {
          formData.append('main_image', mainImage);
        }
      }
    } else {
      // In Add mode, always append main_image
      const mainImage = offerData['main_image'] as File | null;
      if (mainImage) {
        formData.append('main_image', mainImage);
      }
    }

    const apiCall = this.isEditMode && this.offerId
      ? this.offersService.updateOffer(this.offerId, formData)
      : this.offersService.createOffer(formData);

    apiCall.subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: response.success || `Offer ${this.isEditMode ? 'updated' : 'created'} successfully`
        });
        this.offerForm.reset();
        this.offerForm.markAsPristine();
        this.addedImages = [];
        this.removedImages = [];
        this.initialImages = [];
        this.isSubmitting = false;
        this.ngxSpinnerService.hide('actionsLoader');
        this.router.navigate(['/dashboard/offers']);
        // setTimeout(() => {
        // }, 1000);
      },
      error: (error: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || `Failed to ${this.isEditMode ? 'update' : 'create'} offer`
        });
        this.isSubmitting = false;
        this.ngxSpinnerService.hide('actionsLoader');
      }
    });
  }
}
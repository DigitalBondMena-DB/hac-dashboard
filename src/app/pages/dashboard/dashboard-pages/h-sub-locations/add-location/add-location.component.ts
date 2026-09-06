import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { LocationService, LocationData } from '../services/location.service';
import { LoadingDataBannerComponent } from '../../../../../shared/components/loading-data-banner/loading-data-banner.component';
import { CommonModule } from '@angular/common';
import { InputSwitchModule } from 'primeng/inputswitch';

@Component({
  selector: 'app-add-location',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    NgxSpinnerModule,
    RouterLink,
    // LoadingDataBannerComponent,
    CommonModule,
    InputSwitchModule
  ],
  templateUrl: './add-location.component.html',
  styleUrl: './add-location.component.scss',
  providers: [MessageService]
})
export class AddLocationComponent implements OnInit {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private locationsService = inject(LocationService);
  private messageService = inject(MessageService);
  private ngxSpinnerService = inject(NgxSpinnerService);

  locationForm: FormGroup;
  isSubmitting: boolean = false;

  constructor() {
    this.locationForm = this.fb.group({
      en_name: ['', Validators.required],
      ar_name: ['', Validators.required],
      delivery_amount: ['', Validators.required],
      active_status: [false]
    });
  }

  ngOnInit() {
    // Initialize the form with empty values
    this.initializeForm();
  }

  initializeForm() {
    this.locationForm = this.fb.group({
      en_name: ['', Validators.required],
      ar_name: ['', Validators.required],
      delivery_amount: ['', Validators.required],
      active_status: [false]
    });
    
    // Mark form as pristine after initialization
    this.locationForm.markAsPristine();
  }

  onSubmit() {
    if (this.locationForm.invalid) {
      this.locationForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.ngxSpinnerService.show('actionsLoader');
    const formData = this.locationForm.value;
    
    this.locationsService.createLocation(formData).subscribe({
      next: (response: LocationData) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Location created successfully'
        });
        
        this.locationForm.reset();
        this.locationForm.markAsPristine();
        this.isSubmitting = false;
        this.ngxSpinnerService.hide('actionsLoader');
        
        setTimeout(() => {
          this.router.navigate(['/dashboard/locations']);
        }, 1000);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Failed to create location'
        });
        this.isSubmitting = false;
        this.ngxSpinnerService.hide('actionsLoader');
      }
    });
  }
}

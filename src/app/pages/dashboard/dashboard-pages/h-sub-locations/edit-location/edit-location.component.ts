import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  selector: 'app-edit-location',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    NgxSpinnerModule,
    RouterLink,
    LoadingDataBannerComponent,
    CommonModule,
    InputSwitchModule
  ],
  templateUrl: './edit-location.component.html',
  styleUrl: './edit-location.component.scss',
  providers: [MessageService]
})
export class EditLocationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private locationsService = inject(LocationService);
  private messageService = inject(MessageService);
  private ngxSpinnerService = inject(NgxSpinnerService);

  locationForm: FormGroup;
  isLoading: boolean = true;
  isSubmitting: boolean = false;
  locationId: string = '';
  originalData: LocationData | null = null;


  constructor() {
    this.locationForm = this.fb.group({
      en_name: ['', Validators.required],
      ar_name: ['', Validators.required],
      delivery_amount: ['',Validators.required],
      active_status: [false]
    });
  }

  ngOnInit() {
    this.locationId = this.route.snapshot.paramMap.get('id') || '';
    if (this.locationId) {
      this.fetchLocation();
    } else {
      this.isLoading = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid location ID'
      });
    }
  }

  fetchLocation() {
    this.ngxSpinnerService.show('actionsLoader');
    this.locationsService.getLocationById(this.locationId).subscribe({
      next: (location: LocationData) => {
        this.originalData = location;
        this.initializeForm(location);
        this.isLoading = false;
        this.ngxSpinnerService.hide('actionsLoader');
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load location data'
        });
        this.isLoading = false;
        this.ngxSpinnerService.hide('actionsLoader');
      }
    });
  }

  initializeForm(data: LocationData) {
    this.locationForm = this.fb.group({
      en_name: [data.en_name, Validators.required],
      ar_name: [data.ar_name, Validators.required],
      delivery_amount: [data.delivery_amount || ''],
      active_status: [data.active_status || false]
    });
    
    // Mark form as pristine after initialization
    this.locationForm.markAsPristine();
  }

  onSubmit() {
    if (this.locationForm.invalid) {
      this.locationForm.markAllAsTouched();
      return;
    }

    if (!this.locationForm.dirty) {
      this.messageService.add({
        severity: 'info',
        summary: 'Info',
        detail: 'No changes to save'
      });
      return;
    }

    this.isSubmitting = true;
    this.ngxSpinnerService.show('actionsLoader');
    const formData = this.locationForm.value;
    
    this.locationsService.updateLocation(this.locationId, formData).subscribe({
      next: (response) => {
        // Update status if changed
        const newStatus = this.locationForm.get('active_status')?.value;
        if (newStatus !== this.originalData?.active_status) {
          if (newStatus) {
            this.locationsService.enableLocation(this.locationId).subscribe();
          } else {
            this.locationsService.disableLocation(this.locationId).subscribe();
          }
        }
        
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Location updated successfully'
        });
        
        // Update original data and mark form as pristine
        if (this.originalData) {
          this.originalData = {
            ...this.originalData,
            ...formData
          };
        }
        this.locationForm.markAsPristine();
        
        this.isSubmitting = false;
        this.ngxSpinnerService.hide('actionsLoader');
        
        this.router.navigate(['/dashboard/locations']);
        // setTimeout(() => {
        // }, 1000);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update location'
        });
        this.isSubmitting = false;
        this.ngxSpinnerService.hide('actionsLoader');
      }
    });
  }
}

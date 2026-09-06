import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { LocationService, LocationData } from '../services/location.service';
import { LoadingDataBannerComponent } from '../../../../../shared/components/loading-data-banner/loading-data-banner.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-location',
  standalone: true,
  imports: [
    ButtonModule,
    ToastModule,
    NgxSpinnerModule,
    RouterLink,
    LoadingDataBannerComponent,
    CommonModule
  ],
  templateUrl: './view-location.component.html',
  styleUrl: './view-location.component.scss',
  providers: [MessageService]
})
export class ViewLocationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private locationsService = inject(LocationService);
  private messageService = inject(MessageService);
  private ngxSpinnerService = inject(NgxSpinnerService);

  locationId: string = '';
  location: LocationData | null = null;
  isLoading: boolean = true;

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
        this.location = location;
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

  navigateToEdit() {
    this.router.navigate(['/dashboard/locations/edit-location', this.locationId]);
  }

  navigateBack() {
    this.router.navigate(['/dashboard/locations']);
  }
}

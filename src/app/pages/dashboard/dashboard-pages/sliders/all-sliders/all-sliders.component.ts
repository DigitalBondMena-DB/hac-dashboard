import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { Table, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { LoadingDataBannerComponent } from '../../../../../shared/components/loading-data-banner/loading-data-banner.component';
import { NoDataFoundBannerComponent } from '../../../../../shared/components/no-data-found-banner/no-data-found-banner.component';
import {
  Slider,
  SlidersListResponse,
  SlidersService,
} from '../services/slider.service';

interface SelectOption {
  label: string;
  value: string; // '1' or '0' for filter dropdown
}

@Component({
  selector: 'app-all-sliders',
  standalone: true,
  imports: [
    ButtonModule,
    DropdownModule,
    InputSwitchModule,
    TableModule,
    ToastModule,
    RouterLink,
    LoadingDataBannerComponent,
    NoDataFoundBannerComponent,
    CommonModule,
    FormsModule,
    NgxSpinnerModule,
  ],
  templateUrl: './all-sliders.component.html',
  styleUrl: './all-sliders.component.scss',
  providers: [MessageService],
})
export class AllSlidersComponent implements OnInit, OnDestroy {
  private ngxSpinnerService = inject(NgxSpinnerService);
  private messageService = inject(MessageService);
  private slidersService = inject(SlidersService);

  sliders: Slider[] = [];
  filteredSliders: Slider[] = [];
  totalRecords: number = 0;
  rowsPerPage = 10;
  selectedStatus: string | null = null;
  selectOptions: SelectOption[] = [];
  loading: boolean = true;

  private readonly IMAGE_BASE_URL = 'https://mesoshop.digitalbondmena.com/';

  @ViewChild('dt') dt!: Table;

  ngOnInit() {
    this.initDropDownFilter();
    this.fetchSliders();
  }

  initDropDownFilter(): void {
    this.selectOptions = [
      { label: 'Active', value: '1' },
      { label: 'Inactive', value: '0' },
    ];
  }

  fetchSliders() {
    this.loading = true;
    this.ngxSpinnerService.show();
    this.slidersService.getAllSliders().subscribe({
      next: (response: SlidersListResponse) => {
        this.loading = false;
        // Normalize active_status and handle missing/empty images
        this.sliders = response.rows.map((slider) => ({
          ...slider,
          active_status: Number(slider.active_status), // Convert "0"/"1" or 0/1 to number
          main_image_ar:
            slider.main_image_ar && slider.main_image_ar.trim()
              ? slider.main_image_ar
              : 'placeholder.png', // Fallback image
          main_image:
            slider.main_image && slider.main_image.trim()
              ? slider.main_image
              : 'placeholder.png', // Fallback image
        }));
        this.filteredSliders = [...this.sliders];
        this.totalRecords = response.rows.length;
        this.applyFilters();
        this.ngxSpinnerService.hide();
      },
      error: () => {
        this.loading = false;
        this.sliders = [];
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load sliders',
        });
        this.ngxSpinnerService.hide();
      },
    });
  }

  applyFilters(): void {
    let filtered = [...this.sliders];

    // Apply status filter
    if (this.selectedStatus !== null && this.selectedStatus !== '') {
      filtered = filtered.filter(
        (slider) => slider.active_status.toString() === this.selectedStatus
      );
    }

    this.filteredSliders = filtered;
    this.totalRecords = filtered.length;
  }

  onGlobalFilter(dt: Table, event: any) {
    const value = event.target.value.toLowerCase();
    let filtered = [...this.sliders];

    // Apply status filter first
    if (this.selectedStatus !== null && this.selectedStatus !== '') {
      filtered = filtered.filter(
        (slider) => slider.active_status.toString() === this.selectedStatus
      );
    }

    // Apply global search on the filtered dataset
    if (value) {
      filtered = filtered.filter(
        (slider) =>
          slider.id.toString().includes(value) ||
          slider.main_image_ar.toLowerCase().includes(value) ||
          slider.main_image.toLowerCase().includes(value) ||
          (slider.active_status ? 'active' : 'inactive').includes(value) ||
          slider.created_at.toLowerCase().includes(value) ||
          slider.updated_at.toLowerCase().includes(value)
      );
    }

    this.filteredSliders = filtered;
    this.totalRecords = filtered.length;
  }

  onFilterChange(value: string | null): void {
    this.selectedStatus = value;
    this.applyFilters();
  }

  toggleSliderStatus(slider: Slider) {
    this.ngxSpinnerService.show('actionsLoader');
    this.messageService.clear();
    const updatedStatus = slider.active_status === 1 ? 0 : 1; // Toggle between 0 and 1

    const update$ =
      updatedStatus === 1
        ? this.slidersService.enableSlider(slider.id.toString())
        : this.slidersService.disableSlider(slider.id.toString());

    update$.subscribe({
      next: () => {
        slider.active_status = updatedStatus;
        this.applyFilters(); // Reapply filters to reflect updated status
        this.messageService.add({
          severity: 'success',
          summary: 'Updated',
          detail: `Slider ${updatedStatus ? 'Enabled' : 'Disabled'
            } successfully`,
        });
        this.ngxSpinnerService.hide('actionsLoader');
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update slider status',
        });
        this.ngxSpinnerService.hide('actionsLoader');
      },
    });
  }

  getPagination(): number[] {
    return [10, 25, 50, 100].sort((a, b) => a - b);
  }

  getImageUrl(image: string): string {
    return `${this.IMAGE_BASE_URL}${image}`;
  }

  onSort(event: any) {
    const field = event.field;
    const order = event.order;
    this.filteredSliders.sort((a, b) => {
      let valueA: any;
      let valueB: any;
      if (field === 'id') {
        valueA = Number(a.id);
        valueB = Number(b.id);
      } else if (field === 'active_status') {
        valueA = a.active_status;
        valueB = b.active_status;
      } else {
        valueA = (a as any)[field];
        valueB = (b as any)[field];
      }
      if (valueA < valueB) {
        return order === -1 ? -1 : 1;
      } else if (valueA > valueB) {
        return order === -1 ? 1 : -1;
      } else {
        return 0;
      }
    });
  }

  onImageLoad(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.classList.add('loaded');
    img.classList.remove('error');
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.classList.add('error');
    img.classList.remove('loaded');
  }

  runSpinner() {
    this.ngxSpinnerService.show('actionsLoader');
  }
  ngOnDestroy(): void {
    this.ngxSpinnerService.hide('actionsLoader');
  }
}

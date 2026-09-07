import { Component, inject, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { Table, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { LoadingDataBannerComponent } from '../../../../../../shared/components/loading-data-banner/loading-data-banner.component';
import { NoDataFoundBannerComponent } from '../../../../../../shared/components/no-data-found-banner/no-data-found-banner.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OffersService, Offer, OffersListResponse } from '../../service/offer.service';

interface SelectOption {
  label: string;
  value: string; // '1' or '0' for filter dropdown
}

@Component({
  selector: 'app-all-offers',
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
    NgxSpinnerModule
  ],
  templateUrl: './all-offers.component.html',
  styleUrl: './all-offers.component.scss',
  providers: [MessageService]
})
export class AllOffersComponent {
  private ngxSpinnerService = inject(NgxSpinnerService);
  private messageService = inject(MessageService);
  private offersService = inject(OffersService);

  offers: Offer[] = [];
  filteredOffers: Offer[] = [];
  totalRecords: number = 0;
  rowsPerPage = 10;
  selectedStatus: string | null = null;
  selectOptions: SelectOption[] = [];
  sortField: string | null = null;
  sortOrder: number = 1; // 1 for ascending, -1 for descending
  currentPage: number = 1;

  private readonly IMAGE_BASE_URL = 'https://dev.mesoshop.digitalbondmena.com/';

  @ViewChild('dt') dt!: Table;

  ngOnInit() {
    this.initDropDownFilter();
    this.fetchOffers();
  }

  initDropDownFilter(): void {
    this.selectOptions = [
      { label: 'Active', value: '1' },
      { label: 'Inactive', value: '0' }
    ];
  }

  fetchOffers() {
    this.ngxSpinnerService.show();
    this.offersService.getAllOffers().subscribe({
      next: (response: OffersListResponse) => {
        // Normalize active_status and handle missing/empty main_image
        this.offers = response.rows.map(offer => ({
          ...offer,
          active_status: Number(offer.active_status), // Convert to number
          main_image: offer.main_image && offer.main_image.trim() ? offer.main_image : 'placeholder.png', // Fallback image
          en_small_title: offer.en_samll_title || offer.en_samll_title || '' // Handle API typo
        }));
        this.applyFilters();
        this.ngxSpinnerService.hide();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load offers'
        });
        this.ngxSpinnerService.hide();
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.offers];

    // Apply status filter
    if (this.selectedStatus !== null && this.selectedStatus !== '') {
      filtered = filtered.filter((offer) => offer.active_status.toString() === this.selectedStatus);
    }

    // Apply sorting
    if (this.sortField) {
      filtered.sort((a, b) => this.compareValues(a, b, this.sortField!, this.sortOrder));
    }

    this.filteredOffers = filtered;
    this.totalRecords = filtered.length;

    // Reset to first page after filtering
    this.dt.first = 0;
    this.currentPage = 1;
  }

  onGlobalFilter(dt: Table, event: any) {
    const value = event.target.value.toLowerCase();
    let filtered = [...this.offers];

    // Apply status filter first
    if (this.selectedStatus !== null && this.selectedStatus !== '') {
      filtered = filtered.filter((offer) => offer.active_status.toString() === this.selectedStatus);
    }

    // Apply global search on the filtered dataset
    if (value) {
      filtered = filtered.filter((offer) =>
        offer.id.toString().includes(value) ||
        offer.en_samll_title.toLowerCase().includes(value) ||
        offer.ar_small_title.toLowerCase().includes(value) ||
        offer.en_title.toLowerCase().includes(value) ||
        offer.ar_title.toLowerCase().includes(value) ||
        offer.en_text.toLowerCase().includes(value) ||
        offer.ar_text.toLowerCase().includes(value) ||
        offer.main_image.toLowerCase().includes(value) ||
        (offer.active_status ? 'active' : 'inactive').includes(value) ||
        offer.created_at.toLowerCase().includes(value) ||
        offer.updated_at.toLowerCase().includes(value)
      );
    }

    // Apply sorting to the filtered results
    if (this.sortField) {
      filtered.sort((a, b) => this.compareValues(a, b, this.sortField!, this.sortOrder));
    }

    this.filteredOffers = filtered;
    this.totalRecords = filtered.length;

    // Reset to first page after search
    this.dt.first = 0;
    this.currentPage = 1;
  }

  compareValues(a: Offer, b: Offer, field: string, order: number): number {
    let valueA: any;
    let valueB: any;

    if (field === 'id') {
      valueA = Number(a.id);
      valueB = Number(b.id);
    } else if (field === 'en_title') {
      valueA = a.en_title;
      valueB = b.en_title;
    } else if (field === 'active_status') {
      valueA = a.active_status;
      valueB = b.active_status;
    } else {
      valueA = (a as any)[field];
      valueB = (b as any)[field];
    }

    if (valueA === null || valueA === undefined) return order * -1;
    if (valueB === null || valueB === undefined) return order * 1;

    if (valueA < valueB) {
      return order * -1;
    } else if (valueA > valueB) {
      return order * 1;
    } else {
      return 0;
    }
  }

  onFilterChange(value: string | null): void {
    this.selectedStatus = value;
    this.applyFilters();
  }

  onSort(event: any) {
    this.sortField = event.field;
    this.sortOrder = event.order;
    this.applyFilters();
  }

  onPageChange(event: any) {
    this.currentPage = event.page + 1;
  }

  toggleOfferStatus(offer: Offer) {
    this.ngxSpinnerService.show('actionsLoader');
    this.messageService.clear();
    const updatedStatus = offer.active_status === 1 ? 0 : 1; // Toggle between 0 and 1

    const update$ = updatedStatus === 1
      ? this.offersService.enableOffer(offer.id.toString())
      : this.offersService.disableOffer(offer.id.toString());

    update$.subscribe({
      next: () => {
        offer.active_status = updatedStatus;
        this.applyFilters(); // Reapply filters to reflect updated status
        this.messageService.add({
          severity: 'success',
          summary: 'Updated',
          detail: `Offer ${updatedStatus ? 'Enabled' : 'Disabled'} successfully`
        });
        this.ngxSpinnerService.hide('actionsLoader');
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update offer status'
        });
        this.ngxSpinnerService.hide('actionsLoader');
      }
    });
  }

  getPagination(): number[] {
    return [10, 25, 50, 100].sort((a, b) => a - b);
  }

  getImageUrl(image: string): string {
    return `${this.IMAGE_BASE_URL}${image}`;
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
}
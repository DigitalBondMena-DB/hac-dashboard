import { Component, inject, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Table, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoadingDataBannerComponent } from '../../../../../shared/components/loading-data-banner/loading-data-banner.component';
import { NoDataFoundBannerComponent } from '../../../../../shared/components/no-data-found-banner/no-data-found-banner.component';
import { FeaturesService, Feature, AllFeatures } from '../services/features.service';

@Component({
  selector: 'app-all-features',
  standalone: true,
  imports: [
    ButtonModule,
    TableModule,
    ToastModule,
    RouterLink,
    LoadingDataBannerComponent,
    NoDataFoundBannerComponent,
    CommonModule,
    FormsModule,
    NgxSpinnerModule
  ],
  templateUrl: './all-features.component.html',
  styleUrl: './all-features.component.scss',
  providers: [MessageService]
})
export class AllFeaturesComponent {
  private ngxSpinnerService = inject(NgxSpinnerService);
  private messageService = inject(MessageService);
  private featuresService = inject(FeaturesService);

  features: Feature[] = [];
  filteredFeatures: Feature[] = [];
  totalRecords: number = 0;
  rowsPerPage = 10;
  sortField: string | null = null;
  sortOrder: number = 1; // 1 for ascending, -1 for descending
  currentPage: number = 1;
  loading: boolean = true;
  private readonly IMAGE_BASE_URL = 'https://dev.mesoshop.digitalbondmena.com/';

  @ViewChild('dt') dt!: Table;

  ngOnInit() {
    this.fetchFeatures();
  }

  fetchFeatures() {
    this.loading = true;
    this.ngxSpinnerService.show();
    this.featuresService.getAllFeatures().subscribe({
      next: (response: AllFeatures) => {
        this.loading = false;
        // Normalize data and handle missing/empty icon_image
        this.features = response.rows.map(feature => ({
          ...feature,
          icon_image: feature.icon_image && feature.icon_image.trim() ? feature.icon_image : 'placeholder.png' // Fallback image
        }));
        this.applyFilters();
        this.ngxSpinnerService.hide();
      },
      error: (err) => {
        console.error('Error loading features:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load features'
        });
        this.features = []; // Ensure features is empty on error
        this.loading = false;
        this.ngxSpinnerService.hide();
      }
    });
  }


  applyFilters(): void {
    let filtered = [...this.features];

    // Apply sorting
    if (this.sortField) {
      filtered.sort((a, b) => this.compareValues(a, b, this.sortField!, this.sortOrder));
    }

    this.filteredFeatures = filtered;
    this.totalRecords = filtered.length;

    // Reset to first page after filtering
    this.dt.first = 0;
    this.currentPage = 1;
  }

  onGlobalFilter(dt: Table, event: any) {
    const value = event.target.value.toLowerCase();
    let filtered = [...this.features];

    // Apply global search
    if (value) {
      filtered = filtered.filter((feature) =>
        feature.id.toString().includes(value) ||
        feature.en_title.toLowerCase().includes(value)
        // feature.ar_title.toLowerCase().includes(value) ||
        // feature.en_text.toLowerCase().includes(value) ||
        // feature.ar_text.toLowerCase().includes(value) ||
        // feature.icon_image.toLowerCase().includes(value) ||
        // feature.created_at.toLowerCase().includes(value) ||
        // feature.updated_at.toLowerCase().includes(value)
      );
    }

    // Apply sorting to the filtered results
    if (this.sortField) {
      filtered.sort((a, b) => this.compareValues(a, b, this.sortField!, this.sortOrder));
    }

    this.filteredFeatures = filtered;
    this.totalRecords = filtered.length;

    // Reset to first page after search
    this.dt.first = 0;
    this.currentPage = 1;
  }

  compareValues(a: Feature, b: Feature, field: string, order: number): number {
    let valueA: any;
    let valueB: any;

    if (field === 'id') {
      valueA = Number(a.id);
      valueB = Number(b.id);
    } else if (field === 'en_title') {
      valueA = a.en_title;
      valueB = b.en_title;
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

  onSort(event: any) {
    this.sortField = event.field;
    this.sortOrder = event.order;
    this.applyFilters();
  }

  onPageChange(event: any) {
    this.currentPage = event.page + 1;
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
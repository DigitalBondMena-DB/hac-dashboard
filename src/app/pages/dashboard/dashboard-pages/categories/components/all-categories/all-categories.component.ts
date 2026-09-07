import { Component, inject, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
import { CategoriesListResponse, Category, NewCategoriesService } from '../../services/new-categories.service';

interface SelectOption {
  label: string;
  value: string; // '1' or '0' for filter dropdown
}

@Component({
  selector: 'app-all-categories',
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
  templateUrl: './all-categories.component.html',
  styleUrl: './all-categories.component.scss',
  providers: [MessageService]
})
export class AllCategoriesComponent {
  private ngxSpinnerService = inject(NgxSpinnerService);
  private messageService = inject(MessageService);
  private categoriesService = inject(NewCategoriesService);
  private route = inject(ActivatedRoute);

  isSpecial = false;
  isLoading = true;
  categories: Category[] = [];
  filteredCategories: Category[] = [];
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
    this.route.queryParams.subscribe(params => {
      this.isSpecial = params['special'] === 'true' || params['special'] === '1';
      this.fetchCategories();
    });
  }

  initDropDownFilter(): void {
    this.selectOptions = [
      { label: 'Active', value: '1' },
      { label: 'Inactive', value: '0' }
    ];
  }

  fetchCategories() {
    this.isLoading = true;
    this.ngxSpinnerService.show();
    this.categoriesService.getAllCategories(this.isSpecial).subscribe({
      next: (response: CategoriesListResponse) => {
        // Normalize active_status and handle missing/empty main_image
        const list = response?.data || [];
        this.categories = list.map(category => ({
          ...category,
          active_status: Number(category.active_status), // Ensure number
          main_image: category.main_image && category.main_image.trim() ? category.main_image : 'placeholder.png',
          en_name: category.en_name || '',
          ar_name: category.ar_name || ''
        }));
        this.applyFilters();
        this.ngxSpinnerService.hide();
        this.isLoading = false;
      },
      error: () => {
        this.categories = [];
        this.filteredCategories = [];
        this.totalRecords = 0;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load categories'
        });
        this.ngxSpinnerService.hide();
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.categories];

    // Apply status filter
    if (this.selectedStatus !== null && this.selectedStatus !== '') {
      filtered = filtered.filter((category) => category.active_status.toString() === this.selectedStatus);
    }

    // Apply sorting
    if (this.sortField) {
      filtered.sort((a, b) => this.compareValues(a, b, this.sortField!, this.sortOrder));
    }

    this.filteredCategories = filtered;
    this.totalRecords = filtered.length;

    // Reset to first page after filtering
    // this.dt.first = 0;
    // this.currentPage = 1;
  }

  onGlobalFilter(dt: Table, event: any) {
    const value = event.target.value.toLowerCase();
    let filtered = [...this.categories];

    // Apply status filter first
    if (this.selectedStatus !== null && this.selectedStatus !== '') {
      filtered = filtered.filter((category) => category.active_status.toString() === this.selectedStatus);
    }

    // Apply global search
    if (value) {
      filtered = filtered.filter((category) =>
        category.id.toString().includes(value) ||
        category.en_name.toLowerCase().includes(value) ||
        category.ar_name.toLowerCase().includes(value) ||
        category.en_slug.toLowerCase().includes(value) ||
        category.ar_slug.toLowerCase().includes(value) ||
        (category.main_image || '').toLowerCase().includes(value) ||
        (category.active_status ? 'active' : 'inactive').includes(value) ||
        category.created_at.toLowerCase().includes(value) ||
        category.updated_at.toLowerCase().includes(value) ||
        category.order_view.toString().includes(value)
      );
    }

    // Apply sorting
    if (this.sortField) {
      filtered.sort((a, b) => this.compareValues(a, b, this.sortField!, this.sortOrder));
    }

    this.filteredCategories = filtered;
    this.totalRecords = filtered.length;

    // Reset to first page
    // this.dt.first = 0;
    // this.currentPage = 1;
  }

  compareValues(a: Category, b: Category, field: string, order: number): number {
    let valueA: any;
    let valueB: any;

    if (field === 'id') {
      valueA = Number(a.id);
      valueB = Number(b.id);
    } else if (field === 'en_name') {
      valueA = a.en_name;
      valueB = b.en_name;
    } else if (field === 'active_status') {
      valueA = a.active_status;
      valueB = b.active_status;
    } else if (field === 'order_view') {
      valueA = Number(a.order_view);
      valueB = Number(b.order_view);
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

  toggleCategoryStatus(category: Category) {
    this.ngxSpinnerService.show('actionsLoader');
    this.messageService.clear();
    const updatedStatus = category.active_status === 1 ? 0 : 1;

    const update$ = updatedStatus === 1
      ? this.categoriesService.enableCategory(category.id, this.isSpecial)
      : this.categoriesService.disableCategory(category.id, this.isSpecial);

    update$.subscribe({
      next: () => {
        category.active_status = updatedStatus;
        this.applyFilters();
        this.messageService.add({
          severity: 'success',
          summary: 'Updated',
          detail: `Category ${updatedStatus ? 'Enabled' : 'Disabled'} successfully`
        });
        this.ngxSpinnerService.hide('actionsLoader');
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update category status'
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
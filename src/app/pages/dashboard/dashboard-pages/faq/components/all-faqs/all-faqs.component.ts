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
import { Faq, FaqsListResponse, FaqsService } from '../../services/faq.service';

interface SelectOption {
  label: string;
  value: string; // '1' or '0' for filter dropdown
}

@Component({
  selector: 'app-all-faqs',
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
  templateUrl: './all-faqs.component.html',
  styleUrl: './all-faqs.component.scss',
  providers: [MessageService]
})
export class AllFaqsComponent {
  private ngxSpinnerService = inject(NgxSpinnerService);
  private messageService = inject(MessageService);
  private faqsService = inject(FaqsService);

  faqs: Faq[] = [];
  filteredFaqs: Faq[] = [];
  totalRecords: number = 0;
  rowsPerPage = 10;
  selectedStatus: string | null = null;
  selectOptions: SelectOption[] = [];
  sortField: string | null = null;
  sortOrder: number = 1; // 1 for ascending, -1 for descending
  currentPage: number = 1;

  @ViewChild('dt') dt!: Table;

  ngOnInit() {
    this.initDropDownFilter();
    this.fetchFaqs();
  }

  initDropDownFilter(): void {
    this.selectOptions = [
      { label: 'Active', value: '1' },
      { label: 'Inactive', value: '0' }
    ];
  }

  fetchFaqs() {
    this.ngxSpinnerService.show();
    this.faqsService.getAllFaqs().subscribe({
      next: (response: FaqsListResponse) => {
        // Normalize active_status
        this.faqs = response.rows.map(faq => ({
          ...faq,
          active_status: Number(faq.active_status) // Convert to number
        }));
        this.applyFilters();
        this.ngxSpinnerService.hide();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load FAQs'
        });
        this.ngxSpinnerService.hide();
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.faqs];

    // Apply status filter
    if (this.selectedStatus !== null && this.selectedStatus !== '') {
      filtered = filtered.filter((faq) => faq.active_status.toString() === this.selectedStatus);
    }

    // Apply sorting
    if (this.sortField) {
      filtered.sort((a, b) => this.compareValues(a, b, this.sortField!, this.sortOrder));
    }

    this.filteredFaqs = filtered;
    this.totalRecords = filtered.length;

    // Reset to first page after filtering
    this.dt.first = 0;
    this.currentPage = 1;
  }

  onGlobalFilter(dt: Table, event: any) {
    const value = event.target.value.toLowerCase();
    let filtered = [...this.faqs];

    // Apply status filter first
    if (this.selectedStatus !== null && this.selectedStatus !== '') {
      filtered = filtered.filter((faq) => faq.active_status.toString() === this.selectedStatus);
    }

    // Apply global search on the filtered dataset
    if (value) {
      filtered = filtered.filter((faq) =>
        faq.id.toString().includes(value) ||
        faq.en_title.toLowerCase().includes(value) ||
        faq.ar_title.toLowerCase().includes(value) ||
        faq.en_text.toLowerCase().includes(value) ||
        faq.ar_text.toLowerCase().includes(value) ||
        (faq.active_status ? 'active' : 'inactive').includes(value) ||
        faq.created_at.toLowerCase().includes(value) ||
        faq.updated_at.toLowerCase().includes(value)
      );
    }

    // Apply sorting to the filtered results
    if (this.sortField) {
      filtered.sort((a, b) => this.compareValues(a, b, this.sortField!, this.sortOrder));
    }

    this.filteredFaqs = filtered;
    this.totalRecords = filtered.length;

    // Reset to first page after search
    this.dt.first = 0;
    this.currentPage = 1;
  }

  compareValues(a: Faq, b: Faq, field: string, order: number): number {
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

  toggleFaqStatus(faq: Faq) {
    this.ngxSpinnerService.show('actionsLoader');
    this.messageService.clear();
    const updatedStatus = faq.active_status === 1 ? 0 : 1; // Toggle between 0 and 1

    const update$ = updatedStatus === 1
      ? this.faqsService.enableFaq(faq.id.toString())
      : this.faqsService.disableFaq(faq.id.toString());

    update$.subscribe({
      next: () => {
        faq.active_status = updatedStatus;
        this.applyFilters(); // Reapply filters to reflect updated status
        this.messageService.add({
          severity: 'success',
          summary: 'Updated',
          detail: `FAQ ${updatedStatus ? 'Enabled' : 'Disabled'} successfully`
        });
        this.ngxSpinnerService.hide('actionsLoader');
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update FAQ status'
        });
        this.ngxSpinnerService.hide('actionsLoader');
      }
    });
  }

  getPagination(): number[] {
    return [10, 25, 50, 100].sort((a, b) => a - b);
  }

  runSpinner() {
    this.ngxSpinnerService.show('actionsLoader');
  }
}
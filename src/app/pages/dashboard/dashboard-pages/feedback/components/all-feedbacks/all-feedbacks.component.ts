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
import { ContactFormsService, ContactForm, ContactFormsListResponse } from '../../service/feedback.service';

interface SelectOption {
  label: string;
  value: string | null; // null for "All", '1' for Read, '0' for Unread
}

@Component({
  selector: 'app-all-contact-forms',
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
  templateUrl: './all-feedbacks.component.html',
  styleUrl: './all-feedbacks.component.scss',
  providers: [MessageService]
})
export class AllContactFormsComponent {
  private ngxSpinnerService = inject(NgxSpinnerService);
  private messageService = inject(MessageService);
  private contactFormsService = inject(ContactFormsService);

  contactForms: ContactForm[] = [];
  filteredContactForms: ContactForm[] = [];
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
    this.fetchContactForms();
  }

  initDropDownFilter(): void {
    this.selectOptions = [
      { label: 'All', value: null },
      { label: 'Read', value: '1' },
      { label: 'Unread', value: '0' }
    ];
  }

  fetchContactForms() {
    this.ngxSpinnerService.show();
    this.contactFormsService.getAllContactForms().subscribe({
      next: (response: ContactFormsListResponse) => {
        this.contactForms = response.rows.map(form => ({
          ...form,
          is_read: Number(form.is_read) // Ensure is_read is a number
        }));
        this.applyFilters();
        this.ngxSpinnerService.hide();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load contact forms'
        });
        this.ngxSpinnerService.hide();
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.contactForms];

    // Apply status filter
    if (this.selectedStatus !== null) {
      filtered = filtered.filter((form) => form.is_read.toString() === this.selectedStatus);
    }

    // Apply sorting
    if (this.sortField) {
      filtered.sort((a, b) => this.compareValues(a, b, this.sortField!, this.sortOrder));
    }

    this.filteredContactForms = filtered;
    this.totalRecords = filtered.length;

    // Reset to first page after filtering
    this.dt.first = 0;
    this.currentPage = 1;
  }

  onGlobalFilter(dt: Table, event: any) {
    const value = event.target.value.toLowerCase();
    let filtered = [...this.contactForms];

    // Apply status filter first
    if (this.selectedStatus !== null) {
      filtered = filtered.filter((form) => form.is_read.toString() === this.selectedStatus);
    }

    // Apply global search
    if (value) {
      filtered = filtered.filter((form) =>
        form.id.toString().includes(value) ||
        form.name.toLowerCase().includes(value) ||
        form.email.toLowerCase().includes(value) ||
        form.phone.toLowerCase().includes(value) ||
        form.message.toLowerCase().includes(value) ||
        (form.is_read ? 'read' : 'unread').includes(value) ||
        form.created_at.toLowerCase().includes(value) ||
        form.updated_at.toLowerCase().includes(value)
      );
    }

    // Apply sorting to the filtered results
    if (this.sortField) {
      filtered.sort((a, b) => this.compareValues(a, b, this.sortField!, this.sortOrder));
    }

    this.filteredContactForms = filtered;
    this.totalRecords = filtered.length;

    // Reset to first page after search
    this.dt.first = 0;
    this.currentPage = 1;
  }

  compareValues(a: ContactForm, b: ContactForm, field: string, order: number): number {
    let valueA: any;
    let valueB: any;

    if (field === 'id') {
      valueA = Number(a.id);
      valueB = Number(b.id);
    } else if (field === 'name') {
      valueA = a.name;
      valueB = b.name;
    } else if (field === 'created_at') {
      valueA = new Date(a.created_at).getTime();
      valueB = new Date(b.created_at).getTime();
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

  toggleReadStatus(form: ContactForm) {
    this.ngxSpinnerService.show('actionsLoader');
    this.messageService.clear();
    const updatedStatus = form.is_read === 1 ? 0 : 1;

    this.contactFormsService.updateReadStatus(form.id, updatedStatus).subscribe({
      next: () => {
        form.is_read = updatedStatus;
        this.applyFilters();
        this.messageService.add({
          severity: 'success',
          summary: 'Updated',
          detail: `Form marked as ${updatedStatus ? 'Read' : 'Unread'}`
        });
        this.ngxSpinnerService.hide('actionsLoader');
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update read status'
        });
        this.ngxSpinnerService.hide('actionsLoader');
      }
    });
  }

  deleteContactForm(id: number) {
    this.ngxSpinnerService.show('actionsLoader');
    this.messageService.clear();

    this.contactFormsService.deleteContactForm(id).subscribe({
      next: () => {
        this.contactForms = this.contactForms.filter(form => form.id !== id);
        this.applyFilters();
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Contact form deleted successfully'
        });
        this.ngxSpinnerService.hide('actionsLoader');
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete contact form'
        });
        this.ngxSpinnerService.hide('actionsLoader');
      }
    });
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

  runSpinner() {
    this.ngxSpinnerService.show('actionsLoader');
  }
}
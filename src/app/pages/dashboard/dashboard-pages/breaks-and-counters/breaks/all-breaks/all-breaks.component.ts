import { Component, inject, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Table, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { LoadingDataBannerComponent } from '../../../../../../shared/components/loading-data-banner/loading-data-banner.component';
import { NoDataFoundBannerComponent } from '../../../../../../shared/components/no-data-found-banner/no-data-found-banner.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BreaksCountersService, Break, BreaksListResponse } from '../../service/countersandbreaks.service';

@Component({
  selector: 'app-all-breaks',
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
  templateUrl: './all-breaks.component.html',
  styleUrl: './all-breaks.component.scss',
  providers: [MessageService]
})
export class AllBreaksComponent {
  private ngxSpinnerService = inject(NgxSpinnerService);
  private messageService = inject(MessageService);
  private breaksService = inject(BreaksCountersService);

  breaks: Break[] = [];
  filteredBreaks: Break[] = [];
  totalRecords: number = 0;
  rowsPerPage = 10;
  sortField: string | null = null;
  sortOrder: number = 1; // 1 for ascending, -1 for descending
  currentPage: number = 1;

  @ViewChild('dt') dt!: Table;

  ngOnInit() {
    this.fetchBreaks();
  }

  fetchBreaks() {
    this.ngxSpinnerService.show();
    this.breaksService.getAllBreaks().subscribe({
      next: (response: BreaksListResponse) => {
        this.breaks = response.rows;
        this.applyFilters();
        this.ngxSpinnerService.hide();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load breaks'
        });
        this.ngxSpinnerService.hide();
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.breaks];

    // Apply sorting
    if (this.sortField) {
      filtered.sort((a, b) => this.compareValues(a, b, this.sortField!, this.sortOrder));
    }

    this.filteredBreaks = filtered;
    this.totalRecords = filtered.length;

    // Reset to first page after filtering
    this.dt.first = 0;
    this.currentPage = 1;
  }

  onGlobalFilter(dt: Table, event: any) {
    const value = event.target.value.toLowerCase();
    let filtered = [...this.breaks];

    // Apply global search
    if (value) {
      filtered = filtered.filter((brk) =>
        brk.id.toString().includes(value) ||
        brk.en_name.toLowerCase().includes(value) ||
        brk.ar_name.toLowerCase().includes(value) ||
        brk.order_by.toLowerCase().includes(value) ||
        brk.created_at.toLowerCase().includes(value) ||
        brk.updated_at.toLowerCase().includes(value)
      );
    }

    // Apply sorting to the filtered results
    if (this.sortField) {
      filtered.sort((a, b) => this.compareValues(a, b, this.sortField!, this.sortOrder));
    }

    this.filteredBreaks = filtered;
    this.totalRecords = filtered.length;

    // Reset to first page after search
    this.dt.first = 0;
    this.currentPage = 1;
  }

  compareValues(a: Break, b: Break, field: string, order: number): number {
    let valueA: any;
    let valueB: any;

    if (field === 'id') {
      valueA = Number(a.id);
      valueB = Number(b.id);
    } else if (field === 'en_name') {
      valueA = a.en_name;
      valueB = b.en_name;
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

  runSpinner() {
    this.ngxSpinnerService.show('actionsLoader');
  }
}
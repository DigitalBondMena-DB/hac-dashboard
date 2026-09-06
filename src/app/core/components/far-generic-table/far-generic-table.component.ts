import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { NoDataFoundBannerComponent } from "../../../shared/components/no-data-found-banner/no-data-found-banner.component";
import { LoadingDataBannerComponent } from "../../../shared/components/loading-data-banner/loading-data-banner.component";

interface SelectOption {
  label: string;
  value: boolean | number | null;
}

interface CategoryOption {
  value: number;
  label: string;
}

@Component({
  selector: 'app-dynamic-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TableModule,
    ButtonModule,
    DropdownModule,
    InputSwitchModule,
    NgOptimizedImage,
    NoDataFoundBannerComponent,
    LoadingDataBannerComponent
  ],
  templateUrl: './far-generic-table.component.html',
  styleUrls: ['./far-generic-table.component.scss']
})
export class DynamicTableComponent<T extends Record<string, any>> {
  @Input() data: T[] = [];
  @Input() displayHeaders: string[] = [];
  @Input() columnKeys: string[] = [];
  @Input() categoryData: CategoryOption[] = [];
  @Input() selectOptions: SelectOption[] = [];
  @Input() totalRecords: number = 0;
  @Input() rowsPerPage: number = 10;
  @Input() isLoading: boolean = false;
  @Input() title: string = '';
  @Input() addBtnTitle: string = '';

  @Output() statusToggled = new EventEmitter<T>();
  @Output() categoryFilterChanged = new EventEmitter<number>();
  @Output() statusFilterChanged = new EventEmitter<boolean | number | null>();

  @ViewChild('dt') table!: Table;

  filteredData: T[] = [];
  searchValue: string = '';

  ngOnChanges() {
    this.filteredData = [...this.data];
    this.totalRecords = this.data.length;
  }

  getPagination(): number[] {
    return [10, 25, 50, 100].sort((a, b) => a - b);
  }

  getStatusText(status: boolean | number): string {
    if (typeof status === 'boolean') {
      return status ? 'Enabled' : 'Disabled';
    }
    return status === 1 ? 'Enabled' : 'Disabled';
  }

  isStatusActive(status: boolean | number): boolean {
    return typeof status === 'boolean' ? status : status === 1;
  }

  onGlobalFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredData = this.data.filter((item: T) => {
      return this.columnKeys.some((key) => {
        if (key === 'category') {
          return item['category']?.en_name?.toLowerCase().includes(value) || false;
        } else if (key === 'active_status') {
          const status = this.getStatusText(item['active_status']).toLowerCase();
          return status.includes(value);
        } else {
          const itemValue = item[key];
          return itemValue != null ? String(itemValue).toLowerCase().includes(value) : false;
        }
      });
    });
    this.totalRecords = this.filteredData.length;
  }

  onSort(event: any) {
    const field = event.field as string;
    const order = event.order as number;
    this.filteredData.sort((a: T, b: T) => {
      let valueA: any;
      let valueB: any;
      if (field === 'id') {
        valueA = Number(a['id']);
        valueB = Number(b['id']);
      } else if (field === 'category') {
        valueA = a['category']?.en_name || '';
        valueB = b['category']?.en_name || '';
      } else if (field === 'active_status') {
        valueA = this.getStatusText(a['active_status']);
        valueB = this.getStatusText(b['active_status']);
      } else {
        valueA = a[field] ?? '';
        valueB = b[field] ?? '';
      }
      if (valueA < valueB) {
        return order === -1 ? -1 : 1;
      } else if (valueA > valueB) {
        return order === -1 ? 1 : -1;
      }
      return 0;
    });
  }

  toggleStatus(item: T) {
    this.statusToggled.emit(item);
  }
}
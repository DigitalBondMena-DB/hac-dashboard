import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { Table, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { timer } from 'rxjs';
import { LoadingDataBannerComponent } from '../../../../../../shared/components/loading-data-banner/loading-data-banner.component';
import { NoDataFoundBannerComponent } from '../../../../../../shared/components/no-data-found-banner/no-data-found-banner.component';
import { OrdersService, Order, OrdersListResponse } from '../../service/orders.service';

interface StatusOption {
  label: string;
  value: string;
  icon: string;
  color: string;
}

interface FilterOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ButtonModule,
    DropdownModule,
    TableModule,
    ToastModule,
    LoadingDataBannerComponent,
    NoDataFoundBannerComponent,
  ],
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.scss'],
  providers: [MessageService],
})
export class OrderHistoryComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  allOrders!: OrdersListResponse;
  totalRecords!: number;
  selectedStatus: string = '';

  private ordersService = inject(OrdersService);
  private ngxSpinnerService = inject(NgxSpinnerService);
  private messageService = inject(MessageService);

  filterOptions: FilterOption[] = [
    { label: 'delivered', value: 'delivered' },
    { label: 'cancelled', value: 'cancelled' },
  ];

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.ordersService.getAllOrders().subscribe({
      next: (data: OrdersListResponse) => {
        this.allOrders = data;
       let filteredData = data.orders.filter(
          (order) => order.order_status === 'cancelled' || order.order_status === 'delivered'
        ).filter((order)=>order.payment_method!=="Tamara");
        filteredData = this.sortOrdersByCreatedDate(filteredData);
        this.filteredOrders = filteredData;

      
        this.orders = [...this.filteredOrders];
        this.totalRecords = this.orders.length;
      },
      error: (err) => {
        console.error('Failed to load orders', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load orders.',
          life: 3000,
          key: 'orderStatusMessage',
        });
      },
    });
  }

  onFilterChange(value: string): void {
    if (value) {
      this.orders = this.filteredOrders.filter((order) => order.order_status === value);
    } else {
      this.orders = [...this.filteredOrders];
    }
    this.totalRecords = this.orders.length;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'delivered':
        return 'bg-green-200 text-green-800';
      case 'cancelled':
        return 'bg-red-200 text-red-800';
      default:
        return '';
    }
  }

  getAvailableStatusOptions(currentStatus: string): StatusOption[] {
    const statusWithStyles: StatusOption[] = [
      { label: 'Delivered', value: 'delivered', icon: 'pi pi-box', color: 'text-green-600' },
      { label: 'Cancelled', value: 'cancelled', icon: 'pi pi-times', color: 'text-red-600' },
    ];
    return statusWithStyles;
  }

  getPagination(): number[] {
    return [10, 100, 500, 1000, this.totalRecords].filter((v) => v !== 0).sort((a, b) => a - b);
  }

  clear(dt: Table, searchInput: HTMLInputElement, statusFilter: any): void {
    dt.reset();
    searchInput.value = '';
    this.selectedStatus = '';
    statusFilter.value = null;
    this.orders = [...this.filteredOrders];
    this.totalRecords = this.orders.length;
  }

   // Method to sort orders by created_at date
  private sortOrdersByCreatedDate(orders: Order[], ascending: boolean = false): Order[] {
    return orders.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      
      // For descending order (newest first), return dateB - dateA
      // For ascending order (oldest first), return dateA - dateB
      return ascending ? dateA - dateB : dateB - dateA;
    });
  }
}
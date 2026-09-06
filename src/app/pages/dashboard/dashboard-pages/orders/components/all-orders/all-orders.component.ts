import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { Table, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { timer } from 'rxjs';
import { LoadingDataBannerComponent } from '../../../../../../shared/components/loading-data-banner/loading-data-banner.component';
import { NoDataFoundBannerComponent } from '../../../../../../shared/components/no-data-found-banner/no-data-found-banner.component';
import { Order, OrdersListResponse, OrdersService } from '../../service/orders.service';

interface StatusOption {
  label: string;
  value: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ButtonModule,
    CalendarModule,
    DropdownModule,
    TableModule,
    ToastModule,
    LoadingDataBannerComponent,
    NoDataFoundBannerComponent,
  ],
  templateUrl: './all-orders.component.html',
  styleUrls: ['./all-orders.component.scss'],
  providers: [MessageService],
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  allOrders!: OrdersListResponse;
  statusSteps = ['pending', 'confirmed', 'on the way', 'delivered'];
  totalRecords!: number;
  dateRange: Date[] | null = null;
  showCalendar: boolean = false;
 userRole:string=""
  private ordersService = inject(OrdersService);
  private ngxSpinnerService = inject(NgxSpinnerService);
  private messageService = inject(MessageService);

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.ordersService.getAllOrders().subscribe({
      next: (data: OrdersListResponse) => {
        this.allOrders = data;
        
        // Filter out cancelled and delivered orders
        let filteredData = data.orders.filter(
          (order) => order.order_status !== 'cancelled' && order.order_status !== 'delivered'
        ).filter((order)=>order.payment_method!=="Tamara");
        
        // Sort by created_at date (newest first)
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

  toggleCalendar(): void {
    this.showCalendar = !this.showCalendar;
  }

  applyDateFilter(): void {
    if (!this.dateRange || !this.dateRange[0] || !this.dateRange[1]) {
      this.orders = [...this.filteredOrders];
      this.totalRecords = this.orders.length;
      return;
    }

    const [startDate, endDate] = this.dateRange;
    const start = new Date(startDate.setHours(0, 0, 0, 0));
    const end = new Date(endDate.setHours(23, 59, 59, 999));

    let filteredByDate = this.filteredOrders.filter((order) => {
      const orderDate = new Date(order.order_date);
      return orderDate >= start && orderDate <= end;
    });

    // Sort the filtered results by created_at date
    this.orders = this.sortOrdersByCreatedDate(filteredByDate);
    this.totalRecords = this.orders.length;
  }

  getStatusIndex(status: string): number {
    return this.statusSteps.indexOf(status);
  }

  updateOrderStatus(order: Order, isStatus: boolean): void {
    this.ngxSpinnerService.show('actionsLoader');
    this.messageService.clear('orderStatusMessage');

    const request = isStatus
      ? this.ordersService.updateOrderStatus(order.id.toString(), { order_status: order.order_status })
      : this.ordersService.cancelOrder(order.id.toString());

    request.subscribe({
      next: (response) => {
        timer(200).subscribe(() => this.ngxSpinnerService.hide('actionsLoader'));
        order = response.order;
        this.messageService.add({
          severity: 'success',
          summary: isStatus ? 'Status Updated' : 'Order Cancelled',
          detail: isStatus
            ? `Order status changed to "${order.order_status}"`
            : `Order ${order.order_number} has been cancelled`,
          life: 3000,
          key: 'orderStatusMessage',
        });

        if (!isStatus) {
          this.removeOrder(order.id);
        }
      },
      error: (err) => {
        timer(200).subscribe(() => this.ngxSpinnerService.hide('actionsLoader'));
        console.error('Error updating status', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Update Failed',
          detail: isStatus ? 'Could not update order status.' : 'Could not cancel order.',
          life: 3000,
          key: 'orderStatusMessage',
        });
      },
    });
  }

  removeOrder(orderId: number): void {
    this.orders = this.orders.filter((order) => order.id !== orderId);
    this.totalRecords = this.orders.length;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-200 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-200 text-blue-800';
      case 'on the way':
        return 'bg-orange-200 text-orange-800';
      case 'delivered':
        return 'bg-green-200 text-green-800';
      default:
        return '';
    }
  }

  getAvailableStatusOptions(currentStatus: string): StatusOption[] {
    const statusWithStyles: StatusOption[] = [
      { label: 'Pending', value: 'pending', icon: 'pi pi-inbox', color: 'text-yellow-600' },
      { label: 'Confirmed', value: 'confirmed', icon: 'pi pi-check-circle', color: 'text-blue-600' },
      { label: 'on the way', value: 'on the way', icon: 'pi pi-truck', color: 'text-orange-600' },
      { label: 'Delivered', value: 'delivered', icon: 'pi pi-box', color: 'text-green-600' },
    ];

    const currentIndex = this.statusSteps.indexOf(currentStatus);
    return statusWithStyles.map((status, index) => ({
      ...status,
      disabled: status.value === 'pending' || index < currentIndex
    }));
  }

  getPagination(): number[] {
    return [10, 100, 500, 1000, this.totalRecords].filter((v) => v !== 0).sort((a, b) => a - b);
  }

  clear(dt: Table, searchInput: HTMLInputElement): void {
    dt.reset();
    this.dateRange = null;
    this.showCalendar = false;
    searchInput.value = '';
    
    // Reset to original filtered and sorted data
    this.orders = [...this.filteredOrders];
    this.totalRecords = this.orders.length;
  }
}

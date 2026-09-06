import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { timer } from 'rxjs';
import { UserManagementService, Order, SingleUserResponse } from '../../services/user-management.service';
import { LoadingDataBannerComponent } from '../../../../../../shared/components/loading-data-banner/loading-data-banner.component';

@Component({
  selector: 'app-view-user-orders',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    TableModule,
    ButtonModule,
    ToastModule,
    LoadingDataBannerComponent
  ],
  templateUrl: './view-user-orders.component.html',
  styleUrls: ['./view-user-orders.component.scss'],
  providers: [MessageService],
})
export class ViewUserOrdersComponent implements OnInit {
  orders: Order[] = [];
  userId: string | null = null;
  loading: boolean = true;

  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private userManagementService = inject(UserManagementService);
  private spinnerService = inject(NgxSpinnerService);
  private messageService = inject(MessageService);

  ngOnInit(): void {
    this.userId = this.activatedRoute.snapshot.paramMap.get('id');
    if (this.userId) {
      this.fetchUserOrders();
    }
  }

  fetchUserOrders(): void {
    if (!this.userId) return;
    // Set loading state before API call
    this.spinnerService.show('tableLoader');
    this.loading = true;
    this.userManagementService.getUserOrders(this.userId).subscribe({
      next: (response: SingleUserResponse) => {
        this.orders = response.row.confirmed_orders || [];
        // Delay hiding spinner to ensure smooth UI transition
        timer(200).subscribe(() => {
          this.spinnerService.hide('tableLoader');
          this.loading = false; // Clear loading state after data is loaded
        });
      },
      error: (err) => {
        console.error('Failed to load user orders', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load user orders.',
          life: 3000,
          key: 'ordersMessage',
        });
        // Clear loading state on error
        timer(200).subscribe(() => {
          this.spinnerService.hide('tableLoader');
          this.loading = false;
        });
      },
    });
  }

  backToUsers(): void {
    this.router.navigate(['/dashboard/users']);
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
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
}
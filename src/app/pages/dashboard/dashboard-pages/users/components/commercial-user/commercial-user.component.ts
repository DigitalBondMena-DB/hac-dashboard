import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { timer } from 'rxjs';
import {  UsersListResponse, UserManagementService } from '../../services/user-management.service';
import { NoDataFoundBannerComponent } from '../../../../../../shared/components/no-data-found-banner/no-data-found-banner.component';
import { LoadingDataBannerComponent } from "../../../../../../shared/components/loading-data-banner/loading-data-banner.component";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  email_verified_at: string | null;
  role: string;
  trade_name: string;
  commercial_file: string;
  vat_file: string;
  national_address: string;
  admin_status: number | string; // Can be 0, 1, or their string equivalents
  verify_status: number | string;
  deactive_status: number | string;
  delete_status: number | string;
  created_at: string;
  updated_at: string;
  addresses?: any[]; // Included in single user response
  confirmed_orders?: any[]; // Included in single user and orders response
}
interface ApiResponse {
  rows: {
    current_page: number;
    data: User[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: {
      url: string | null;
      label: string;
      active: boolean;
    }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

@Component({
  selector: 'app-all-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    ToastModule,
    ToggleButtonModule,
    RouterLink,
    NgxSpinnerModule,
    NoDataFoundBannerComponent,
    LoadingDataBannerComponent
],
  templateUrl: './commercial-user.component.html',
  styleUrl: './commercial-user.component.scss',
  providers: [MessageService]
})
export class CommercialUserComponent implements OnInit {
  users: User[] = [];
  globalFilter: string = '';
  loading: boolean = true;
  totalRecords: number = 0;
  rowsPerPage: number = 10;
  currentPage: number = 1;
  adminToggleStates: { [userId: number]: boolean } = {};

  @ViewChild('dt') dt!: Table;

  private usersService = inject(UserManagementService);
  private spinnerService = inject(NgxSpinnerService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  ngOnInit(): void {
    this.fetchUsers(1);
  }

  fetchUsers(page: number = 1): void {
    this.spinnerService.show('actionsLoader');
    this.loading = true;

    if (!page || isNaN(page) || page < 1) {
      page = 1;
    }

    this.currentPage = page;

    this.usersService.getCommercialUsers(page).subscribe({
      next: (response:ApiResponse) => {
        this.users = response.rows.data.map(user => ({
          ...user,
          admin_status: Number(user.admin_status),
          phone: user.phone || 'N/A'
        }));
        this.totalRecords = response.rows.total;
        this.rowsPerPage = response.rows.per_page;

        this.users.forEach(user => {
          this.adminToggleStates[user.id] = this.isAdmin(user);
        });

        timer(200).subscribe(() => {
          this.spinnerService.hide('actionsLoader');
          this.loading = false;
        });
      },
      error: (err) => {
        console.error('Failed to load users', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load users.',
          life: 3000,
          key: 'usersMessage'
        });
        timer(200).subscribe(() => {
          this.spinnerService.hide('actionsLoader');
          this.loading = false;
        });
      }
    });
  }

  toggleAdminStatus(user: User): void {
    this.spinnerService.show('actionsLoader');
    
    const currentIsAdmin = this.isAdmin(user);
    const newStatus = currentIsAdmin ? '0' : '1';
    const originalStatus = user.admin_status;
    const originalToggleState = this.adminToggleStates[user.id];

    user.admin_status = parseInt(newStatus);
    this.adminToggleStates[user.id] = !currentIsAdmin;

    this.usersService.updateAdminStatus(user.id.toString(), newStatus).subscribe({
      next: () => {
        timer(200).subscribe(() => this.spinnerService.hide('actionsLoader'));
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Buisness Status is now ${newStatus === '1' ? 'Enabled' : 'Disabled'}`,
          life: 3000,
          key: 'usersMessage'
        });
      },
      error: (err) => {
        console.error('Failed to update admin status', err);
        user.admin_status = originalStatus;
        this.adminToggleStates[user.id] = originalToggleState;
        
        timer(200).subscribe(() => this.spinnerService.hide('actionsLoader'));
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update admin status.',
          life: 3000,
          key: 'usersMessage'
        });
      }
    });
  }

  isAdmin(user: User): boolean {
    return user.admin_status === 1;
  }

  viewUserOrders(userId: number): void {
    this.spinnerService.show('actionsLoader');
    this.router.navigate([`/dashboard/users/user-orders/${userId}`]).then(() => {
      timer(200).subscribe(() => this.spinnerService.hide('actionsLoader'));
    });
  }

  applyGlobalFilter(): void {
    if (this.dt) {
      this.dt.filterGlobal(this.globalFilter, 'contains');
    }
  }

  onPageChange(event: any): void {
    let page: number;
    if (event && typeof event.page === 'number') {
      page = event.page + 1;
    } else if (event && typeof event.first === 'number' && typeof event.rows === 'number') {
      page = Math.floor(event.first / event.rows) + 1;
    } else {
      console.error('Invalid page change event:', event);
      page = 1;
    }
    this.fetchUsers(page);
  }

  getPagination(): number[] {
    return [5, 10, 20, 50].sort((a, b) => a - b);
  }
}
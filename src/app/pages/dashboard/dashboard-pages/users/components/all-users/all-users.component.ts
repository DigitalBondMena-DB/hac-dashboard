import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { timer } from 'rxjs';
import { User, UserManagementService, UsersListResponse } from '../../services/user-management.service';
import { LoadingDataBannerComponent } from '../../../../../../shared/components/loading-data-banner/loading-data-banner.component';

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
    LoadingDataBannerComponent
  ],
  templateUrl: './all-users.component.html',
  styleUrls: ['./all-users.component.scss'],
  providers: [MessageService],
})
export class AllUsersComponent implements OnInit {
  users: User[] = [];
  globalFilter: string = '';
  loading: boolean = true;
  @ViewChild('dt') dt: Table | undefined;

  // Map to store UI toggle states separately from the actual user data
  adminToggleStates: { [userId: number]: boolean } = {};

  private usersService = inject(UserManagementService);
  private spinnerService = inject(NgxSpinnerService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    // Set loading state before API call
    this.spinnerService.show('tableLoader');
    this.loading = true;
    this.usersService.getAllUsers().subscribe({
      next: (response: UsersListResponse) => {
        this.users = response.rows.data;
        
        // Initialize toggle states based on user data
        this.users.forEach(user => {
          this.adminToggleStates[user.id] = this.isAdmin(user);
        });
        
        // Delay hiding spinner to ensure smooth UI transition
        timer(200).subscribe(() => {
          this.spinnerService.hide('tableLoader');
          this.loading = false; // Clear loading state after data is loaded
        });
      },
      error: (err) => {
        console.error('Failed to load users', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load users.',
          life: 3000,
          key: 'usersMessage',
        });
        // Clear loading state on error
        timer(200).subscribe(() => {
          this.spinnerService.hide('tableLoader');
          this.loading = false;
        });
      },
    });
  }

  toggleAdminStatus(user: User): void {
    this.spinnerService.show('actionsLoader');
    
    // Determine the current admin status
    const currentIsAdmin = this.isAdmin(user);
    
    // Set the new status to the opposite of the current status
    const newStatus = currentIsAdmin ? '0' : '1';
    
    // Store original values for rollback if needed
    const originalStatus = user.admin_status;
    const originalToggleState = this.adminToggleStates[user.id];
    
    // Update UI optimistically (toggle the admin status)
    user.admin_status = parseInt(newStatus);
    this.adminToggleStates[user.id] = !currentIsAdmin;
    
    this.usersService.updateAdminStatus(user.id.toString(), newStatus).subscribe({
      next: () => {
        timer(200).subscribe(() => this.spinnerService.hide('actionsLoader'));
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `${user.name} is now ${newStatus === '1' ? 'Admin' : 'User'}`,
          life: 3000,
          key: 'usersMessage',
        });
      },
      error: (err) => {
        console.error('Failed to update admin status', err);
        // Revert on error
        user.admin_status = originalStatus;
        this.adminToggleStates[user.id] = originalToggleState;
        
        timer(200).subscribe(() => this.spinnerService.hide('actionsLoader'));
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update admin status.',
          life: 3000,
          key: 'usersMessage',
        });
      },
    });
  }

  isAdmin(user: User): boolean {
    return user.admin_status === 1 || user.admin_status === '1';
  }

  viewUserOrders(userId: number): void {
    this.router.navigate([`/dashboard/users/user-orders/${userId}`]);
  }

  applyGlobalFilter(): void {
    if (this.dt) {
      this.dt.filterGlobal(this.globalFilter, 'contains');
    }
  }
}
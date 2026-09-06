import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule, Table } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { LoadingDataBannerComponent } from '../../../../../../shared/components/loading-data-banner/loading-data-banner.component';
import { NoDataFoundBannerComponent } from '../../../../../../shared/components/no-data-found-banner/no-data-found-banner.component';
import { SpecialRequestsService } from '../../../../../../core/services/special-requests/special-requests.service';
import { ISpecialRequest, ISpecialRequestResponse } from '../../../../../../core/Interfaces/special-requests/ISpecialRequest';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-all-special-requests',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    TableModule,
    ToastModule,
    LoadingDataBannerComponent,
    NoDataFoundBannerComponent,
    InputTextModule,
  ],
  templateUrl: './all-special-requests.component.html',
})
export class AllSpecialRequestsComponent implements OnInit {
  requests: ISpecialRequest[] = [];
  totalRecords: number = 0;
  isLoading: boolean = true;
  
  private specialRequestsService = inject(SpecialRequestsService);

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.specialRequestsService.getAllSpecialRequests().subscribe({
      next: (data: ISpecialRequestResponse) => {
        // Assuming response structure has a rows array
        this.requests = data.rows || [];
        this.totalRecords = this.requests.length;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Failed to load special requests', err);
        this.isLoading = false;
      },
    });
  }

  getPagination(): number[] {
    return [10, 50, 100].filter((v) => v !== 0).sort((a, b) => a - b);
  }

  clear(dt: Table, searchInput: HTMLInputElement): void {
    dt.reset();
    searchInput.value = '';
    // Optional: Re-fetch or reset local filter if using custom filters
  }
}

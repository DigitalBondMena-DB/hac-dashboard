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
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { MAIN_SITE_URL } from '../../../../../../core/constants/WEB_SITE_BASE_UTL';
import { ProductWebsiteLinksComponent } from '../../../../../../shared/components/product-website-links/product-website-links.component';

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
    DialogModule,
    ProductWebsiteLinksComponent,
  ],
  providers: [MessageService],
  templateUrl: './all-special-requests.component.html',
})
export class AllSpecialRequestsComponent implements OnInit {
  requests: ISpecialRequest[] = [];
  totalRecords: number = 0;
  isLoading: boolean = true;
  showQrDialog: boolean = false;
  selectedProduct: any = null;
  updatingStatusId: number | null = null;

  private specialRequestsService = inject(SpecialRequestsService);
  private messageService = inject(MessageService);

  isDone(req: ISpecialRequest): boolean {
    return Boolean(req.is_read);
  }

  toggleStatus(req: ISpecialRequest, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (this.updatingStatusId === req.id) return;

    this.updatingStatusId = req.id;
    this.specialRequestsService.updateSpecialRequestReadStatus(req.id).subscribe({
      next: (res) => {
        this.updatingStatusId = null;
        if (res && res.special_request) {
          req.is_read = res.special_request.is_read;
        } else {
          req.is_read = this.isDone(req) ? 0 : 1;
        }
        const statusText = this.isDone(req) ? 'Done' : 'Requested';
        this.messageService.add({
          severity: 'success',
          summary: 'Status Updated',
          detail: `Request #${req.id} status is now ${statusText}`,
          life: 2500,
        });
      },
      error: (err) => {
        this.updatingStatusId = null;
        console.error('Failed to update status', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update request status',
          life: 3000,
        });
      },
    });
  }

  getProductUrl(product: any, lang: 'en' | 'ar'): string {
    const slug = lang === 'en'
      ? (product?.en_slug || product?.ar_slug)
      : (product?.ar_slug || product?.en_slug);
    if (!slug) return '';
    const baseUrl = MAIN_SITE_URL.replace(/\/+$/, '');
    return `${baseUrl}/#/${lang}/product-details/${slug}`;
  }

  copyProductUrl(product: any, lang: 'en' | 'ar', event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const url = this.getProductUrl(product, lang);
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Copied',
        detail: `${lang.toUpperCase()} Product URL copied to clipboard!`,
        life: 2000,
      });
    });
  }

  openQrDialog(product: any, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.selectedProduct = product;
    this.showQrDialog = true;
  }

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

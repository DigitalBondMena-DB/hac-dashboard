import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { LoadingDataBannerComponent } from '../../../../../../shared/components/loading-data-banner/loading-data-banner.component';
import { SpecialRequestsService } from '../../../../../../core/services/special-requests/special-requests.service';
import { ISpecialRequest } from '../../../../../../core/Interfaces/special-requests/ISpecialRequest';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { MAIN_SITE_URL } from '../../../../../../core/constants/WEB_SITE_BASE_UTL';
import { ProductWebsiteLinksComponent } from '../../../../../../shared/components/product-website-links/product-website-links.component';

@Component({
  selector: 'app-view-special-request',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    CardModule,
    TableModule,
    ToastModule,
    LoadingDataBannerComponent,
    ButtonModule,
    RouterLink,
    ProductWebsiteLinksComponent,
  ],
  providers: [MessageService],
  templateUrl: './view-special-request.component.html',
})
export class ViewSpecialRequestComponent implements OnInit {
  request: ISpecialRequest | undefined;
  isLoading = true;
  isUpdatingStatus = false;

  private activatedRoute = inject(ActivatedRoute);
  private specialRequestsService = inject(SpecialRequestsService);
  private messageService = inject(MessageService);

  isDone(req?: ISpecialRequest): boolean {
    const target = req || this.request;
    return Boolean(target?.is_read);
  }

  toggleStatus(): void {
    if (!this.request || this.isUpdatingStatus) return;

    this.isUpdatingStatus = true;
    this.specialRequestsService.updateSpecialRequestReadStatus(this.request.id).subscribe({
      next: (res) => {
        this.isUpdatingStatus = false;
        if (this.request) {
          if (res && res.special_request) {
            this.request.is_read = res.special_request.is_read;
          } else {
            this.request.is_read = this.isDone(this.request) ? 0 : 1;
          }
          const statusText = this.isDone(this.request) ? 'Done' : 'Requested';
          this.messageService.add({
            severity: 'success',
            summary: 'Status Updated',
            detail: `Request status is now ${statusText}`,
            life: 2500,
          });
        }
      },
      error: (err) => {
        this.isUpdatingStatus = false;
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

  getProductUrl(lang: 'en' | 'ar'): string {
    const slug = lang === 'en'
      ? (this.request?.product?.en_slug || this.request?.product?.ar_slug)
      : (this.request?.product?.ar_slug || this.request?.product?.en_slug);
    if (!slug) return '';
    const baseUrl = MAIN_SITE_URL.replace(/\/+$/, '');
    return `${baseUrl}/#/${lang}/product-details/${slug}`;
  }

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    const idParam = this.activatedRoute.snapshot.paramMap.get('id');
    if (idParam) {
      const id = parseInt(idParam, 10);
      this.specialRequestsService.getSpecialRequestById(id).subscribe({
        next: (request: ISpecialRequest | undefined) => {
          this.request = request;
          this.isLoading = false;
          if (!request) {
            this.showError('Special Request not found.');
          }
        },
        error: (err: any) => {
          console.error('Failed to load request', err);
          this.isLoading = false;
          this.showError('Failed to load special request details.');
        },
      });
    }
  }

  showError(detail: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail,
      life: 3000,
    });
  }
}

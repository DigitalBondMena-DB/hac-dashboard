import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewSpecialRequestComponent implements OnInit {
  request = signal<ISpecialRequest | undefined>(undefined);
  isLoading = signal(true);
  isUpdatingStatus = signal(false);

  private activatedRoute = inject(ActivatedRoute);
  private specialRequestsService = inject(SpecialRequestsService);
  private messageService = inject(MessageService);
  private sanitizer = inject(DomSanitizer);

  getSafeDriveUrl(): SafeResourceUrl | null {
    const req = this.request();
    if (req?.drive_file_url) {
      let previewUrl = req.drive_file_url;
      if (previewUrl.includes('/view')) {
        previewUrl = previewUrl.replace('/view', '/preview');
      }
      return this.sanitizer.bypassSecurityTrustResourceUrl(previewUrl);
    }
    return null;
  }

  isDone(req?: ISpecialRequest): boolean {
    const target = req || this.request();
    return Boolean(target?.is_read);
  }

  toggleStatus(): void {
    const currentReq = this.request();
    if (!currentReq || this.isUpdatingStatus()) return;

    this.isUpdatingStatus.set(true);
    this.specialRequestsService.updateSpecialRequestReadStatus(currentReq.id).subscribe({
      next: (res) => {
        this.isUpdatingStatus.set(false);
        this.request.update(req => {
          if (!req) return req;
          const newReq = { ...req };
          if (res && res.special_request) {
            newReq.is_read = res.special_request.is_read;
          } else {
            newReq.is_read = this.isDone(req) ? 0 : 1;
          }
          return newReq;
        });

        const statusText = this.isDone(this.request()) ? 'Done' : 'Requested';
        this.messageService.add({
          severity: 'success',
          summary: 'Status Updated',
          detail: `Request status is now ${statusText}`,
          life: 2500,
        });
      },
      error: (err) => {
        this.isUpdatingStatus.set(false);
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
    const req = this.request();
    const slug = lang === 'en'
      ? (req?.product?.en_slug || req?.product?.ar_slug)
      : (req?.product?.ar_slug || req?.product?.en_slug);
    if (!slug) return '';
    const baseUrl = MAIN_SITE_URL.replace(/\/+$/, '');
    return `${baseUrl}/${lang}/product-details/${slug}`;
  }

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    const idParam = this.activatedRoute.snapshot.paramMap.get('id');
    if (idParam) {
      const id = parseInt(idParam, 10);
      this.isLoading.set(true);
      this.specialRequestsService.getSpecialRequestById(id).subscribe({
        next: (request: ISpecialRequest | undefined) => {
          this.request.set(request);
          this.isLoading.set(false);
          if (!request) {
            this.showError('Special Request not found.');
          }
        },
        error: (err: any) => {
          console.error('Failed to load request', err);
          this.isLoading.set(false);
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

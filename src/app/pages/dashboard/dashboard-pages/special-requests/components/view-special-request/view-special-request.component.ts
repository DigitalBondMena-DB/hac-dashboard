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
  ],
  providers: [MessageService],
  templateUrl: './view-special-request.component.html',
})
export class ViewSpecialRequestComponent implements OnInit {
  request: ISpecialRequest | undefined;
  isLoading = true;

  private activatedRoute = inject(ActivatedRoute);
  private specialRequestsService = inject(SpecialRequestsService);
  private messageService = inject(MessageService);

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

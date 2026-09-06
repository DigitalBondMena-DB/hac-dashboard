import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { LoadingDataBannerComponent } from '../../../../../shared/components/loading-data-banner/loading-data-banner.component';
import { CommonModule, DatePipe } from '@angular/common';
import { PromoCodeService, PromoCodeData } from '../service/promocode.service';
import { NoDataFoundBannerComponent } from "../../../../../shared/components/no-data-found-banner/no-data-found-banner.component";

@Component({
  selector: 'app-view-promocode',
  standalone: true,
  imports: [
    ButtonModule,
    ToastModule,
    NgxSpinnerModule,
    RouterLink,
    LoadingDataBannerComponent,
    CommonModule,
    DatePipe,
    NoDataFoundBannerComponent
],
  templateUrl: './view-promocode.component.html',
  styleUrl: './view-promocode.component.scss',
  providers: [MessageService]
})
export class ViewPromocodeComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private promoCodeService = inject(PromoCodeService);
  private messageService = inject(MessageService);
  private ngxSpinnerService = inject(NgxSpinnerService);

  promocodeId: string = '';
  promocode: PromoCodeData | null = null;
  isLoading: boolean = true;

  ngOnInit() {
    this.promocodeId = this.route.snapshot.paramMap.get('id') || '';
    if (this.promocodeId) {
      this.fetchPromocode();
    } else {
      this.isLoading = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid promo code ID'
      });
    }
  }

  fetchPromocode() {
    this.ngxSpinnerService.show('actionsLoader');
    this.promoCodeService.getPromoCodeById(this.promocodeId).subscribe({
      next: (promocode: PromoCodeData) => {
        this.promocode = promocode;
        this.isLoading = false;
        this.ngxSpinnerService.hide('actionsLoader');
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load promo code data'
        });
        this.isLoading = false;
        this.ngxSpinnerService.hide('actionsLoader');
      }
    });
  }

  navigateToEdit() {
    this.router.navigate(['/dashboard/promo-codes/edit-promo-code', this.promocodeId]);
  }

  navigateBack() {
    this.router.navigate(['/dashboard/promo-codes']);
  }
}

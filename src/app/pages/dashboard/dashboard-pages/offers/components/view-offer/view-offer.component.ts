import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { LoadingDataBannerComponent } from '../../../../../../shared/components/loading-data-banner/loading-data-banner.component';
import { SafeHtmlPipe } from '../../../../../../core/pipes/safe-html.pipe';
import { Offer, OffersService, SingleOfferResponse } from '../../service/offer.service';

@Component({
  selector: 'app-view-offer',
  standalone: true,
  imports: [
    ButtonModule,
    ToastModule,
    NgxSpinnerModule,
    RouterLink,
    LoadingDataBannerComponent,
    CommonModule,
    SafeHtmlPipe
  ],
  templateUrl: './view-offer.component.html',
  styleUrl: './view-offer.component.scss',
  providers: [MessageService, SafeHtmlPipe]
})
export class ViewOfferComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private offersService = inject(OffersService);
  private messageService = inject(MessageService);
  private ngxSpinnerService = inject(NgxSpinnerService);

  OFFERS_BASE_URL: string = 'https://dev.mesoshop.digitalbondmena.com/';
  offerId: string = '';
  offer: Offer | null = null;
  isLoading: boolean = true;
  imageLoaded = false;

  ngOnInit() {
    this.offerId = this.route.snapshot.paramMap.get('id') || '';
    if (this.offerId) {
      this.fetchOffer();
    } else {
      this.isLoading = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid offer ID'
      });
    }
  }

  fetchOffer() {
    this.ngxSpinnerService.show('actionsLoader');
    this.offersService.getOfferById(this.offerId).subscribe({
      next: (response: SingleOfferResponse) => {
        this.offer = response.row;
        this.isLoading = false;
        this.ngxSpinnerService.hide('actionsLoader');
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load offer data'
        });
        this.isLoading = false;
        this.ngxSpinnerService.hide('actionsLoader');
      }
    });
  }

  navigateToEdit() {
    this.router.navigate(['/dashboard/offers/edit-offer', this.offerId]);
  }

  navigateBack() {
    this.router.navigate(['/dashboard/offers']);
  }

  get offerImageUrl(): string {
    return this.offer?.main_image
      ? `${this.OFFERS_BASE_URL}${this.offer.main_image}`
      : '';
  }

  onImageLoad() {
    this.imageLoaded = true;
  }
}
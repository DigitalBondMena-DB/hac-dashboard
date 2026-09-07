import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { LoadingDataBannerComponent } from '../../../../../shared/components/loading-data-banner/loading-data-banner.component';

import {
  SingleSliderResponse,
  Slider,
  SlidersService,
} from '../services/slider.service';

@Component({
  selector: 'app-view-slider',
  standalone: true,
  imports: [
    ButtonModule,
    ToastModule,
    NgxSpinnerModule,
    LoadingDataBannerComponent,
    CommonModule,
  ],
  templateUrl: './view-slider.component.html',
  styleUrl: './view-slider.component.scss',
  providers: [MessageService],
})
export class ViewSliderComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private slidersService = inject(SlidersService);
  private messageService = inject(MessageService);
  private ngxSpinnerService = inject(NgxSpinnerService);

  SLIDERS_BASE_URL: string = 'https://dev.mesoshop.digitalbondmena.com/';
  sliderId: string = '';
  slider: Slider | null = null;
  isLoading: boolean = true;
  imageLoaded = false;

  ngOnInit() {
    this.sliderId = this.route.snapshot.paramMap.get('id') || '';
    if (this.sliderId) {
      this.fetchSlider();
    } else {
      this.isLoading = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid slider ID',
      });
    }
  }

  fetchSlider() {
    this.ngxSpinnerService.show('actionsLoader');
    this.slidersService.getSliderById(this.sliderId).subscribe({
      next: (response: SingleSliderResponse) => {
        this.slider = response.row;
        this.isLoading = false;
        this.ngxSpinnerService.hide('actionsLoader');
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load slider data',
        });
        this.isLoading = false;
        this.ngxSpinnerService.hide('actionsLoader');
      },
    });
  }

  navigateToEdit() {
    this.router.navigate(['/dashboard/sliders/edit-slider', this.sliderId]);
  }

  navigateBack() {
    this.router.navigate(['/dashboard/sliders']);
  }

  get sliderArImageUrl(): string {
    return this.slider?.main_image_ar
      ? `${this.SLIDERS_BASE_URL}${this.slider.main_image_ar}`
      : '';
  }

  get sliderEnImageUrl(): string {
    return this.slider?.main_image
      ? `${this.SLIDERS_BASE_URL}${this.slider.main_image}`
      : '';
  }

  onImageLoad() {
    this.imageLoaded = true;
  }

  ngOnDestroy(): void {
    this.ngxSpinnerService.hide('actionsLoader');
  }
}

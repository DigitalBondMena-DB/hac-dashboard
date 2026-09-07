import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { LoadingDataBannerComponent } from '../../../../../shared/components/loading-data-banner/loading-data-banner.component';
import { SafeHtmlPipe } from '../../../../../core/pipes/safe-html.pipe';
import { FeaturesService, Feature, FeatureResponse } from '../services/features.service';

@Component({
  selector: 'app-view-feature',
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
  templateUrl: './view-feature.component.html',
  styleUrl: './view-feature.component.scss',
  providers: [MessageService, SafeHtmlPipe]
})
export class ViewFeatureComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private featuresService = inject(FeaturesService);
  private messageService = inject(MessageService);
  private ngxSpinnerService = inject(NgxSpinnerService);

  FEATURES_BASE_URL: string = 'https://dev.mesoshop.digitalbondmena.com/';
  featureId: string = '';
  feature: Feature | null = null;
  isLoading: boolean = true;
  imageLoaded = false;

  ngOnInit() {
    this.featureId = this.route.snapshot.paramMap.get('id') || '';
    if (this.featureId) {
      this.fetchFeature();
    } else {
      this.isLoading = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid feature ID'
      });
    }
  }

  fetchFeature() {
    this.ngxSpinnerService.show('actionsLoader');
    this.featuresService.getFeatureById(this.featureId).subscribe({
      next: (response: FeatureResponse) => {
        this.feature = response.row;
        this.isLoading = false;
        this.ngxSpinnerService.hide('actionsLoader');
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load feature data'
        });
        this.isLoading = false;
        this.ngxSpinnerService.hide('actionsLoader');
      }
    });
  }

  navigateToEdit() {
    this.router.navigate(['/dashboard/features/edit-feature', this.featureId]);
  }

  navigateBack() {
    this.router.navigate(['/dashboard/features']);
  }

  get featureImageUrl(): string {
    return this.feature?.icon_image
      ? `${this.FEATURES_BASE_URL}${this.feature.icon_image}`
      : '';
  }

  onImageLoad() {
    this.imageLoaded = true;
  }
}
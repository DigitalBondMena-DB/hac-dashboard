import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { LoadingDataBannerComponent } from '../../../../../../shared/components/loading-data-banner/loading-data-banner.component';
import { NewCategoriesService, Category, SingleCategoryResponse } from '../../services/new-categories.service';

@Component({
  selector: 'app-view-category',
  standalone: true,
  imports: [
    ButtonModule,
    ToastModule,
    NgxSpinnerModule,
    LoadingDataBannerComponent,
    CommonModule
  ],
  templateUrl: './view-category.component.html',
  styleUrl: './view-category.component.scss',
  providers: [MessageService]
})
export class ViewCategoryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private categoriesService = inject(NewCategoriesService);
  private messageService = inject(MessageService);
  private ngxSpinnerService = inject(NgxSpinnerService);

  CATEGORIES_BASE_URL: string = 'https://dev.mesoshop.digitalbondmena.com/';
  categoryId: string = '';
  category: Category | null = null;
  isLoading: boolean = true;
  imageLoaded = false;
  isSpecial: boolean = false;

  ngOnInit() {
    this.categoryId = this.route.snapshot.paramMap.get('id') || '';
    this.isSpecial = this.route.snapshot.queryParams['special'] === 'true' || this.route.snapshot.queryParams['special'] === '1';
    if (this.categoryId) {
      this.fetchCategory();
    } else {
      this.isLoading = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid category ID'
      });
    }
  }

  fetchCategory() {
    this.ngxSpinnerService.show('actionsLoader');
    this.categoriesService.getCategoryById(parseInt(this.categoryId, 10), this.isSpecial).subscribe({
      next: (response: SingleCategoryResponse) => {
        this.category = response.data;
        this.isLoading = false;
        this.ngxSpinnerService.hide('actionsLoader');
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load category data'
        });
        this.isLoading = false;
        this.ngxSpinnerService.hide('actionsLoader');
      }
    });
  }

  navigateToEdit() {
    this.router.navigate(['/dashboard/new-categories/edit-category', this.categoryId], {
      queryParams: this.isSpecial ? { special: 'true' } : undefined
    });
  }

  navigateBack() {
    this.router.navigate(['/dashboard/new-categories'], {
      queryParams: this.isSpecial ? { special: 'true' } : undefined
    });
  }

  get categoryImageUrl(): string {
    return this.category?.main_image
      ? `${this.CATEGORIES_BASE_URL}${this.category.main_image}`
      : '';
  }

  onImageLoad() {
    this.imageLoaded = true;
  }
}
import { Component, inject, OnInit, ɵ_sanitizeHtml } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { LoadingDataBannerComponent } from '../../../../../../shared/components/loading-data-banner/loading-data-banner.component';
import { Blog, BlogsService, SingleBlogResponse } from '../../services/blogs.service';
import { SafeHtmlPipe } from '../../../../../../core/pipes/safe-html.pipe';

@Component({
  selector: 'app-view-blog',
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

  templateUrl: './view-blog.component.html',
  styleUrl: './view-blog.component.scss',
  providers: [MessageService, SafeHtmlPipe]
})
export class ViewBlogComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private blogService = inject(BlogsService);
  private messageService = inject(MessageService);
  private ngxSpinnerService = inject(NgxSpinnerService);

  BLOGS_BASE_URL: string = "https://dev.mesoshop.digitalbondmena.com";
  blogId: string = '';
  blog: Blog | null = null;
  isLoading: boolean = true;

  ngOnInit() {
    this.blogId = this.route.snapshot.paramMap.get('id') || '';
    if (this.blogId) {
      this.fetchBlog();
    } else {
      this.isLoading = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid blog ID'
      });
    }
  }

  fetchBlog() {
    this.ngxSpinnerService.show('actionsLoader');
    this.blogService.getBlogById(this.blogId).subscribe({
      next: (response: SingleBlogResponse) => {
        this.blog = response.blog;
        console.log(this.blog);
        this.isLoading = false;
        this.ngxSpinnerService.hide('actionsLoader');
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load blog data'
        });
        this.isLoading = false;
        this.ngxSpinnerService.hide('actionsLoader');
      }
    });
  }

  navigateToEdit() {
    this.router.navigate(['/dashboard/blogs/edit-blog', this.blogId]);
  }

  navigateBack() {
    this.router.navigate(['/dashboard/blogs']);
  }
  get blogImageUrl(): string {
    return this.blog?.main_image
      ? `${this.BLOGS_BASE_URL}${this.blog.main_image}`
      : '';
  }

  imageLoaded = false;

  onImageLoad() {
    this.imageLoaded = true;
  }
}
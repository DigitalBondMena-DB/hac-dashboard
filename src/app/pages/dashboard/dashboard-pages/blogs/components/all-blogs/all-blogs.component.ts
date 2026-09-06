import { Component, inject, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { Table, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { BlogsService, Blog, BlogsResponse } from '../../services/blogs.service';
import { LoadingDataBannerComponent } from '../../../../../../shared/components/loading-data-banner/loading-data-banner.component';
import { NoDataFoundBannerComponent } from '../../../../../../shared/components/no-data-found-banner/no-data-found-banner.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface SelectOption {
  label: string;
  value: string; // '1' or '0' for filter dropdown
}

@Component({
  selector: 'app-all-blogs',
  standalone: true,
  imports: [
    ButtonModule,
    DropdownModule,
    InputSwitchModule,
    TableModule,
    ToastModule,
    RouterLink,
    LoadingDataBannerComponent,
    NoDataFoundBannerComponent,
    CommonModule,
    FormsModule,
    NgxSpinnerModule
  ],
  templateUrl: './all-blogs.component.html',
  styleUrl: './all-blogs.component.scss',
  providers: [MessageService]
})
export class AAllBlogsComponent {
  private ngxSpinnerService = inject(NgxSpinnerService);
  private messageService = inject(MessageService);
  private blogsService = inject(BlogsService);

  blogs: Blog[] = [];
  filteredBlogs: Blog[] = [];
  totalRecords: number = 0;
  rowsPerPage = 10;
  currentPage = 1;
  selectedStatus: string | null = null;
  selectOptions: SelectOption[] = [];
  searchTerm: string = '';
  private readonly IMAGE_BASE_URL = 'https://digitalbondmena.com/';

  @ViewChild('dt') dt!: Table;

  ngOnInit() {
    this.initDropDownFilter();
    this.fetchBlogs(1);
  }

  initDropDownFilter(): void {
    this.selectOptions = [
      { label: 'Active', value: '1' },
      { label: 'Inactive', value: '0' }
    ];
  }

  fetchBlogs(page: number = 1) {
    this.ngxSpinnerService.show();

    // Ensure page is a valid number
    if (!page || isNaN(page) || page < 1) {
      page = 1;
    }

    this.currentPage = page;

    this.blogsService.getAllBlogs(page).subscribe({
      next: (response: BlogsResponse) => {
        // Normalize active_status and handle missing/empty main_image
        this.blogs = response.Blogs.data.map(blog => ({
          ...blog,
          active_status: Number(blog.active_status), // Convert "0"/"1" or 0/1 to number
          main_image: blog.main_image && blog.main_image.trim() ? blog.main_image : 'placeholder.png' // Fallback image
        }));

        this.totalRecords = response.Blogs.total;
        this.rowsPerPage = response.Blogs.per_page;
        this.applyClientSideFilters();
        this.ngxSpinnerService.hide();
        console.log(this.blogs)
      },
      error: (error) => {
        console.error('Error fetching blogs:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load blogs'
        });
        this.ngxSpinnerService.hide();
      }
    });
  }

  applyClientSideFilters(): void {
    let filtered = [...this.blogs];

    // Apply status filter
    if (this.selectedStatus !== null && this.selectedStatus !== '') {
      filtered = filtered.filter((blog) => blog.active_status.toString() === this.selectedStatus);
    }

    // Apply search filter
    if (this.searchTerm) {
      const searchValue = this.searchTerm.toLowerCase();
      filtered = filtered.filter((blog) =>
        blog.id.toString().includes(searchValue) ||
        blog.en_blog_title.toLowerCase().includes(searchValue) ||
        blog.ar_blog_title.toLowerCase().includes(searchValue) ||
        blog.en_blog_text.toLowerCase().includes(searchValue) ||
        blog.ar_blog_text.toLowerCase().includes(searchValue) ||
        blog.main_image.toLowerCase().includes(searchValue) ||
        blog.en_slug.toLowerCase().includes(searchValue) ||
        blog.ar_slug.toLowerCase().includes(searchValue) ||
        blog.blog_date.toLowerCase().includes(searchValue) ||
        blog.en_meta_title.toLowerCase().includes(searchValue) ||
        blog.ar_meta_title.toLowerCase().includes(searchValue) ||
        blog.en_meta_text.toLowerCase().includes(searchValue) ||
        blog.ar_meta_text.toLowerCase().includes(searchValue) ||
        (blog.en_script_text?.toLowerCase().includes(searchValue) || false) ||
        (blog.ar_script_text?.toLowerCase().includes(searchValue) || false) ||
        (blog.active_status ? 'active' : 'inactive').includes(searchValue) ||
        blog.created_at.toLowerCase().includes(searchValue) ||
        blog.updated_at.toLowerCase().includes(searchValue)
      );
    }

    this.filteredBlogs = filtered;
  }

  onGlobalFilter(dt: Table, event: any) {
    this.searchTerm = event.target.value;
    this.applyClientSideFilters();
  }

  onFilterChange(value: string | null): void {
    this.selectedStatus = value;
    this.applyClientSideFilters();
  }

  onPageChange(event: any): void {
    console.log('Page change event:', event);

    // PrimeNG pagination event structure: { first: number, rows: number, page: number, pageCount: number }
    let page: number;

    if (event && typeof event.page === 'number') {
      // PrimeNG uses 0-based indexing, API uses 1-based
      page = event.page + 1;
    } else if (event && typeof event.first === 'number' && typeof event.rows === 'number') {
      // Calculate page from first and rows
      page = Math.floor(event.first / event.rows) + 1;
    } else {
      console.error('Invalid page change event:', event);
      page = 1;
    }

    console.log('Calculated page:', page);
    this.fetchBlogs(page);
  }

  toggleBlogStatus(blog: Blog) {
    this.ngxSpinnerService.show('actionsLoader');
    this.messageService.clear();
    const updatedStatus = blog.active_status === 1 ? 0 : 1; // Toggle between 0 and 1

    const update$ = updatedStatus === 1
      ? this.blogsService.enableBlog(blog.id.toString())
      : this.blogsService.disableBlog(blog.id.toString());

    update$.subscribe({
      next: () => {
        blog.active_status = updatedStatus;
        this.applyClientSideFilters(); // Reapply filters to reflect updated status
        this.messageService.add({
          severity: 'success',
          summary: 'Updated',
          detail: `Blog ${updatedStatus ? 'Enabled' : 'Disabled'} successfully`
        });
        this.ngxSpinnerService.hide('actionsLoader');
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update blog status'
        });
        this.ngxSpinnerService.hide('actionsLoader');
      }
    });
  }

  getPagination(): number[] {
    return [10, 25, 50, 100].sort((a, b) => a - b);
  }

  getImageUrl(image: string): string {
    console.log(this.IMAGE_BASE_URL, image);
    return `${this.IMAGE_BASE_URL}${image}`;
  }

  onSort(event: any) {
    const field = event.field;
    const order = event.order;
    this.filteredBlogs.sort((a, b) => {
      let valueA: any;
      let valueB: any;
      if (field === 'id') {
        valueA = Number(a.id);
        valueB = Number(b.id);
      } else if (field === 'en_blog_title') {
        valueA = a.en_blog_title;
        valueB = b.en_blog_title;
      } else if (field === 'blog_date') {
        valueA = a.blog_date;
        valueB = b.blog_date;
      } else if (field === 'active_status') {
        valueA = a.active_status;
        valueB = b.active_status;
      } else {
        valueA = (a as any)[field];
        valueB = (b as any)[field];
      }

      if (valueA < valueB) {
        return order === -1 ? -1 : 1;
      } else if (valueA > valueB) {
        return order === -1 ? 1 : -1;
      } else {
        return 0;
      }
    });
  }

  onImageLoad(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.classList.add('loaded');
    img.classList.remove('error');
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.classList.add('error');
    img.classList.remove('loaded');
  }

  runSpinner() {
    this.ngxSpinnerService.show('actionsLoader');
  }
}

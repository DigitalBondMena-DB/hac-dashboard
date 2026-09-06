import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WEB_SITE_BASE_URL } from '../../../../../core/constants/WEB_SITE_BASE_UTL';

// Interface for a single blog
export interface Blog {
  id: number;
  en_blog_title: string;
  ar_blog_title: string;
  en_blog_text: string;
  ar_blog_text: string;
  main_image: string;
  en_slug: string;
  ar_slug: string;
  blog_date: string;
  en_meta_title: string;
  ar_meta_title: string;
  en_meta_text: string;
  ar_meta_text: string;
  en_script_text: string | null;
  ar_script_text: string | null;
  active_status: number; // API returns number (1 or 0)
  created_at: string;
  updated_at: string;
}

// Interface for pagination links
export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface BlogsResponse {
  Blogs: {
    current_page: number;
    data: Blog[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

// Interface for single blog response (includes success message)
export interface SingleBlogResponse {
  blog: Blog;
  success?: string; // Optional, as create/update return it, but get may not
}

@Injectable({
  providedIn: 'root'
})
export class BlogsService {
  constructor(private http: HttpClient) {}

  // Get all blogs with pagination
  getAllBlogs(page: number = 1): Observable<BlogsResponse> {
    return this.http.get<BlogsResponse>(`${WEB_SITE_BASE_URL}blogs-data?page=${page}`);
  }

  // Get a single blog by ID for the edit form 
  getBlogById(id: string): Observable<SingleBlogResponse> {
    return this.http.get<SingleBlogResponse>(`${WEB_SITE_BASE_URL}blogs-data/${id}`);
  }

  // Enable a blog
  enableBlog(blogId: string): Observable<SingleBlogResponse> {
    return this.http.post<SingleBlogResponse>(
      `${WEB_SITE_BASE_URL}blogs-data/${blogId}/recover`,
      {}
    );
  }

  // Disable a blog
  disableBlog(blogId: string): Observable<SingleBlogResponse> {
    return this.http.post<SingleBlogResponse>(
      `${WEB_SITE_BASE_URL}blogs-data/${blogId}/destroy`,
      {}
    );
  }

  // Update a blog
  updateBlog(blogId: string, data: FormData): Observable<SingleBlogResponse> {
    return this.http.post<SingleBlogResponse>(
      `${WEB_SITE_BASE_URL}blogs-data/${blogId}`,
      data
    );
  }

  // Create a new blog
  createBlog(data: FormData): Observable<SingleBlogResponse> {
    return this.http.post<SingleBlogResponse>(
      `${WEB_SITE_BASE_URL}blogs-data`,
      data
    );
  }
}

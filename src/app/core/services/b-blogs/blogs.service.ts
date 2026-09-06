// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { WEB_SITE_BASE_URL } from '../../constants/WEB_SITE_BASE_UTL';

// export interface BlogData {
//   id: number;
//   en_blog_title: string;
//   ar_blog_title: string;
//   en_blog_text: string;
//   ar_blog_text: string;
//   main_image: string;
//   en_slug: string;
//   ar_slug: string;
//   blog_date: string;
//   en_meta_title: string;
//   ar_meta_title: string;
//   en_meta_text: string;
//   ar_meta_text: string;
//   en_script_text: string | null;
//   ar_script_text: string | null;
//   active_status: number;
//   created_at: string;
//   updated_at: string;
// }

// export interface BlogsResponse {
//   rows: {
//     current_page: number;
//     data: BlogData[];
//     first_page_url: string;
//     from: number;
//     last_page: number;
//     last_page_url: string;
//     links: { url: string | null; label: string; active: boolean }[];
//     next_page_url: string | null;
//     path: string;
//     per_page: number;
//     prev_page_url: string | null;
//     to: number;
//     total: number;
//   };
// }

// export interface ToggleBlogResponse {
//   success: string;
// }

// @Injectable({
//   providedIn: 'root',
// })
// export class BlogsService {
//   constructor(private http: HttpClient) {}

//   getAllBlogs(page: number, perPage: number): Observable<BlogsResponse> {
//     return this.http.get<BlogsResponse>(`${WEB_SITE_BASE_URL}blogs?page=${page}&per_page=${perPage}`);
//   }

//   enableBlog(blogId: string): Observable<ToggleBlogResponse> {
//     return this.http.post<ToggleBlogResponse>(`${WEB_SITE_BASE_URL}blogs/${blogId}/enable`, {});
//   }

//   disableBlog(blogId: string): Observable<ToggleBlogResponse> {
//     return this.http.post<ToggleBlogResponse>(`${WEB_SITE_BASE_URL}blogs/${blogId}/disable`, {});
//   }
// }
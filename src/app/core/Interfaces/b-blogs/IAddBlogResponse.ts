export interface Blog {
	main_image: string;
	ar_slug: string;
	en_slug: string;
	en_blog_title: string;
	ar_blog_title: string;
	en_blog_text: string;
	ar_blog_text: string;
	blog_date: string;
	en_meta_title: string;
	ar_meta_title: string;
	en_meta_text: string;
	ar_meta_text: string;
	active_status: string;
	updated_at: string;
	created_at: string;
	id: number;
}

export interface IAddBlogResponse {
  blog: Blog;
  success: string;
}




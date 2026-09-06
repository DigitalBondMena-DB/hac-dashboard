export interface Data {
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
	en_script_text?: any;
	ar_script_text?: any;
	active_status: number;
	created_at: string;
	updated_at: string;
}

export interface Link {
	url?: any;
	label: string;
	active: boolean;
}

export interface Blog {
	current_page: number;
	data: Data[];
	first_page_url: string;
	from: number;
	last_page: number;
	last_page_url: string;
	links: Link[];
	next_page_url?: any;
	path: string;
	per_page: number;
	prev_page_url?: any;
	to: number;
	total: number;
}

export interface IGetAllBlogs {
  blogs: Blog;
}
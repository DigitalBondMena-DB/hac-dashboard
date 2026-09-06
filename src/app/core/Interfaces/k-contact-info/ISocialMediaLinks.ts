

export interface Row {
	id: number;
	en_address: string;
	ar_address: string;
	phone: string;
	email: string;
	facebook: string;
	twitter: string;
	instagram: string;
	linkedin: string;
	active_status: number;
	created_at?: any;
	updated_at?: any;
}

export interface ISocialMediaLinks {
  rows: Row;
}

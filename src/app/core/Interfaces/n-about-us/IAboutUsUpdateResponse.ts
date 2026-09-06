export interface IAboutUsUpdateResponse {
  success: string;
  about: About;
}

export interface About {
  id: number;
  en_meta_title: string;
  ar_meta_title: string;
  en_meta_text: string;
  ar_meta_text: string;
  main_image: string;
  active_status: number;
  en_footer_for_text: string;
  ar_footer_for_text: string;
  en_mission_text: string;
  ar_mission_text: string;
  en_vision_text: string;
  ar_vision_text: string;
  en_main_title: string;
  ar_main_title: string;
  en_main_text: string;
  ar_main_text: string;
  created_at: string;
  updated_at: string;
}

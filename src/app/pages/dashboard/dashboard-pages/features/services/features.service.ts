import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WEB_SITE_BASE_URL } from '../../../../../core/constants/WEB_SITE_BASE_UTL';
export interface Feature {
  id: number;
  icon_image: string;
  en_title: string;
  ar_title: string;
  en_text: string;
  ar_text: string;
  created_at: string;
  updated_at: string;
}
export interface FeatureResponse {
  row: {
    id: number;
    icon_image: string;
    en_title: string;
    ar_title: string;
    en_text: string;
    ar_text: string;
    created_at: string;
    updated_at: string;
  }
}

export interface AllFeatures {
  rows: Feature[];
}

@Injectable({
  providedIn: 'root'
})
export class FeaturesService {

  constructor(private http:HttpClient) { }


  getAllFeatures(){
    return this.http.get<AllFeatures>(`${WEB_SITE_BASE_URL}features`)
  }
  getFeatureById(id:string){
    return this.http.get<FeatureResponse>(`${WEB_SITE_BASE_URL}features/${id}`)
  }
  updateFeature(id:string,data:FormData){
    return this.http.post<Feature>(`${WEB_SITE_BASE_URL}features/${id}`,data)
  }
}

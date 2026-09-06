/**
 * @file auth.service.ts
 * @description Authentication service for handling user login operations
 *
 * This service manages authentication-related operations including:
 * - User login with credentials
 * - Communication with authentication endpoints
 * - Response handling for login operations
 *
 * @exports AuthService - Service for authentication operations
 */

import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { WEB_SITE_BASE_URL } from "../../core/constants/WEB_SITE_BASE_UTL";
import { ILogInResponse } from "../interfaces/ILoninResponse";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  constructor(private http: HttpClient) {}
  login(userData: {}) {
    return this.http.post<ILogInResponse>(`${WEB_SITE_BASE_URL}signin`, userData);
  }
}

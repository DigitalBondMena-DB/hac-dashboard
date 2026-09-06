/**
 * @file app.config.ts
 * @description Main application configuration file for Angular application
 *
 * This file configures core Angular application features including:
 * - Router configuration with scroll behavior
 * - Server-side rendering (SSR) hydration
 * - Angular animations
 * - Toast notifications
 * - HTTP client with interceptors
 * - Date range picker
 * - Social sharing buttons
 * - Image configuration
 *
 * @exports appConfig - Main application configuration object
 */

import { ApplicationConfig, importProvidersFrom } from "@angular/core";
import {
  InMemoryScrollingFeature,
  InMemoryScrollingOptions,
  provideRouter,
  withInMemoryScrolling,
  withViewTransitions,
} from "@angular/router";

import { IMAGE_CONFIG } from "@angular/common";
import { provideHttpClient, withFetch, withInterceptors } from "@angular/common/http";
import { provideClientHydration } from "@angular/platform-browser";
import { provideAnimations } from "@angular/platform-browser/animations";
import { provideShareButtonsOptions, SharerMethods, withConfig } from "ngx-sharebuttons";
import { shareIcons } from "ngx-sharebuttons/icons";
import { provideToastr } from "ngx-toastr";
import { routes } from "./app.routes";
// import { networkInterceptor } from "./core/interceptors/is-stable.interceptor";
import { loadingSpinnerInterceptor } from "./core/interceptors/loading-spinner.interceptor";
import { networkInterceptor } from "./core/interceptors/is-stable.interceptor";

/**
 * @description Configuration for in-memory scrolling behavior
 * @property scrollPositionRestoration - Restores scroll position to "top" when navigating
 * @property anchorScrolling - Enables anchor scrolling for fragment navigation
 */
const scrollConfig: InMemoryScrollingOptions = {
  scrollPositionRestoration: "top",
  anchorScrolling: "enabled",
};

/**
 * @description Feature configuration for in-memory scrolling using the defined scroll config
 */
const inMemoryScrollingFeature: InMemoryScrollingFeature = withInMemoryScrolling(scrollConfig);

/**
 * @description Main application configuration object that provides all necessary services and features
 * @exports appConfig
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Router configuration with in-memory scrolling and view transitions
    provideRouter(routes, inMemoryScrollingFeature, withViewTransitions()),

    // Enables Server-Side Rendering (SSR) hydration
    provideClientHydration(),

    // Enables Angular animations
    provideAnimations(),

    // Toast notification configuration
    provideToastr({
      positionClass: "toast-top-left",  // Shows toasts in the top-left corner
      timeOut: 2000,                    // Toasts disappear after 2 seconds
      preventDuplicates: true           // Prevents duplicate toast messages
    }),

    // HTTP Client configuration with interceptors
    provideHttpClient(
      withInterceptors([
        loadingSpinnerInterceptor,      // Handles loading spinner state
        // networkInterceptor,             // Handles network state
      ]),
      withFetch()                       // Enables fetch for lazy loading
    ),

    // Date range picker configuration

    // Social sharing buttons configuration
    provideShareButtonsOptions(
      shareIcons(),
      withConfig({
        debug: true,
        sharerMethod: SharerMethods.Anchor,
      })
    ),

    // Image configuration to disable warnings
    {
      provide: IMAGE_CONFIG,
      useValue: {
        disableImageSizeWarning: true,      // Disables image size warnings
        disableImageLazyLoadWarning: true,  // Disables lazy loading warnings
      },
    },
  ],
};

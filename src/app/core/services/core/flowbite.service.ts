/**
 * @file flowbite.service.ts
 * @description Service for managing Flowbite UI library integration
 *
 * This service handles:
 * - Dynamic loading of Flowbite library
 * - Platform-specific initialization
 * - Callback handling after library load
 *
 * Features:
 * - Lazy loading of Flowbite
 * - Browser platform detection
 * - Safe server-side rendering support
 *
 * @exports FlowbiteService - Service for Flowbite integration
 */

import { isPlatformBrowser } from "@angular/common";
import { Inject, Injectable, PLATFORM_ID } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class FlowbiteService {
  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  loadFlowbite(callback: (flowbite: any) => void) {
    if (isPlatformBrowser(this.platformId)) {
      import("flowbite").then((flowbite) => {
        callback(flowbite);
      });
    }
  }
}

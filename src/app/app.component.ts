/**
 * @file app.component.ts
 * @description Root component of the Angular application
 *
 * This component serves as the application shell and handles:
 * - Meta tags management for SEO
 * - Loading spinner initialization
 * - Flowbite integration
 * - Platform-specific behavior (browser/server)
 *
 * Key features:
 * - Dynamic meta tag updates based on route data
 * - Loading spinner management
 * - Window load event handling
 * - Browser platform detection
 *
 * @exports AppComponent - Root component class
 */

import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, HostListener, inject, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { timer } from 'rxjs';
import { FlowbiteService } from './core/services/core/flowbite.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxSpinnerModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  providers: [],
})
export class AppComponent {
  ngxSpinnerService = inject(NgxSpinnerService);
  Title = inject(Title);
  Meta = inject(Meta);
  router = inject(Router);
  platformId = inject(PLATFORM_ID);
  flowbiteService = inject(FlowbiteService);
  _HttpClient = inject(HttpClient);

  constructor() {
    this.HandleMetaTags();
  }
  isBrowser: boolean = false;
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.flowbiteService.loadFlowbite((flowbite) => {
        initFlowbite();
      });
    }

    this.ngxSpinnerService.show('mainLoader');
    if (typeof window !== 'undefined') {
      this.isBrowser = true;
    }
  }
  @HostListener('window:load')
  onWindowLoad() {
    timer(3000).subscribe(() => this.ngxSpinnerService.hide('mainLoader'));
  }
  HandleMetaTags(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Get the current route snapshot from root to the last child route
        let route = this.router.routerState.snapshot.root;

        // Traverse through the route tree to the deepest child
        while (route.firstChild) {
          route = route.firstChild;
        }

        // Get the title and description from the final route datatest-marwan
        const title = route.data['title'] || 'HAC ';
        const description = route.data['description'] || 'HAC Dashboard';
      }
    });
  }
}

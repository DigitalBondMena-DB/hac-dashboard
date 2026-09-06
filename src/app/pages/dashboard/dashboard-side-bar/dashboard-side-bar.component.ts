import { isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DashboardLayoutService } from '../../../core/services/core/dashboard-layout.service';
import { DashboardMenuItemsComponent } from '../dashboard-menu-items/dashboard-menu-items.component';

@Component({
  selector: 'app-dashboard-side-bar',
  standalone: true,
  imports: [ConfirmDialogModule, DashboardMenuItemsComponent],
  templateUrl: './dashboard-side-bar.component.html',
  styleUrl: './dashboard-side-bar.component.scss',
  providers: [ConfirmationService],
})
export class DashboardSideBarComponent {
  model: any[] = [];
  isAdmin = false;

  constructor(
    public layoutService: DashboardLayoutService,
    public el: ElementRef,
    @Inject(PLATFORM_ID) private _PLATFORM_ID: Object,
    private _Router: Router,
    private _ConfirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      if (JSON.parse(localStorage.getItem('user')!).role === 'super-admin')
        this.isAdmin = true;
    }
    this.initSideBar();
  }

  initSideBar(): void {
    // if (this.isAdmin) {
    this.model = [
      {
        label: 'Home',
        items: [
          {
            label: 'Dashboard',
            icon: 'pi pi-fw pi-home',
            routerLink: ['/dashboard/home-statistics'],
          },
        ],
      },
      {
        label: 'Menu',
        items: [
          {
            label: 'Categories',
            icon: 'pi pi-fw pi-tags',
            routerLink: ['/dashboard/new-categories'],
            routerLinkActiveOptions: { paths: 'subset', queryParams: 'exact', matrixParams: 'ignored', fragment: 'ignored' },
          },
          {
            label: 'Sub Categories',
            icon: 'pi pi-fw pi-sitemap',
            routerLink: ['/dashboard/menu/sub-categories'],
            routerLinkActiveOptions: { paths: 'subset', queryParams: 'exact', matrixParams: 'ignored', fragment: 'ignored' },
          },
          {
            label: 'Products',
            icon: 'pi pi-fw pi-shopping-bag',
            routerLink: ['/dashboard/menu/products'],
            routerLinkActiveOptions: { paths: 'subset', queryParams: 'exact', matrixParams: 'ignored', fragment: 'ignored' },
          },
          {
            label: 'Features',
            icon: 'pi pi-fw pi-star',
            routerLink: ['/dashboard/features/all-features'],
          },
          {
            label: 'Offers',
            icon: 'pi pi-fw pi-percentage',
            routerLink: ['/dashboard/offers'],
          },
          {
            label: 'Locations',
            icon: 'pi pi-fw pi-map-marker',
            routerLink: ['/dashboard/locations'],
          },
          {
            label: 'Promo Codes',
            icon: 'pi pi-fw pi-ticket',
            routerLink: ['/dashboard/promo-codes'],
          },
          {
            label: '% Buy One Get One',
            routerLink: ['/dashboard/by-one-get-one'],
          },
          {
            label: 'Sliders',
            icon: 'pi pi-fw pi-images',
            routerLink: ['/dashboard/sliders'],
          },
        ],
      },
      {
        label: 'Special Orders',
        items: [
          {
            label: 'Categories',
            icon: 'pi pi-fw pi-tags',
            routerLink: ['/dashboard/new-categories'],
            queryParams: { special: 'true' },
            routerLinkActiveOptions: { paths: 'subset', queryParams: 'subset', matrixParams: 'ignored', fragment: 'ignored' },
          },
          {
            label: 'Sub Categories',
            icon: 'pi pi-fw pi-sitemap',
            routerLink: ['/dashboard/menu/sub-categories'],
            queryParams: { special: 'true' },
            routerLinkActiveOptions: { paths: 'subset', queryParams: 'subset', matrixParams: 'ignored', fragment: 'ignored' },
          },
          {
            label: 'Products',
            icon: 'pi pi-fw pi-shopping-bag',
            routerLink: ['/dashboard/menu/products'],
            queryParams: { special: 'true' },
            routerLinkActiveOptions: { paths: 'subset', queryParams: 'subset', matrixParams: 'ignored', fragment: 'ignored' },
          },
          {
            label: 'Special Requests',
            icon: 'pi pi-fw pi-envelope',
            routerLink: ['/dashboard/special-requests'],
          },
        ],
      },
      {
        label: 'Blogs',
        items: [
          {
            label: 'Manage Blogs',
            icon: 'pi pi-fw pi-book',
            routerLink: ['/dashboard/blogs/blogs-index'],
          },
          {
            label: 'Add New Blogs',
            icon: 'pi pi-fw pi-file-edit',
            routerLink: ['/dashboard/blogs/add-blog'],
          },
        ],
      },
      {
        label: 'Orders',
        items: [
          {
            label: 'Order Management',
            icon: 'pi pi-fw pi-shopping-cart',
            routerLink: ['/dashboard/orders/orders-index'],
          },
          {
            label: 'Order History',
            icon: 'pi pi-fw pi-history',
            routerLink: ['/dashboard/orders/orders-history'],
          },
        ],
      },
      {
        label: 'Tamara Orders',
        items: [
          {
            label: 'Tamara Order Management',
            icon: 'pi pi-fw pi-shopping-cart',
            routerLink: ['/dashboard/orders/tamara-orders'],
          },
          {
            label: 'Tamara Order History',
            icon: 'pi pi-fw pi-history',
            routerLink: ['/dashboard/orders/tamara-history'],
          },
        ],
      },
      {
        label: 'Users',
        items: [
          {
            label: 'Manage Users',
            icon: 'pi pi-fw pi-user-edit',
            routerLink: ['/dashboard/users/users-index'],
          },
          {
            label: 'Manage Commercial Users',
            icon: 'pi pi-fw pi-briefcase',
            routerLink: ['/dashboard/users/buisness-users'],
          },
        ],
      },
      {
        label: 'Pages',
        items: [
          {
            label: 'About Us',
            icon: 'pi pi-fw pi-info-circle',
            routerLink: ['/dashboard/pages/about-us'],
          },
          {
            label: 'FeedBack',
            icon: 'pi pi-fw pi-comments',
            routerLink: ['/dashboard/feedbacks'],
          },
          {
            label: 'Breaks',
            icon: 'pi pi-fw pi-clock',
            routerLink: ['/dashboard/breaks'],
          },
          {
            label: 'Counters',
            icon: 'pi pi-fw pi-calculator',
            routerLink: ['/dashboard/counters'],
          },

          {
            label: 'FAQs',
            icon: 'pi pi-fw pi-question-circle',
            routerLink: ['/dashboard/faqs'],
          },
          {
            label: 'Social Links',
            icon: 'pi pi-fw pi-share-alt',
            routerLink: ['/dashboard/social-links'],
          },
        ],
      },
      {
        label: 'Settings',
        items: [
          // {
          //   label: 'Dashboard Settings',
          //   icon: 'pi pi-fw pi-cog',
          // },
          {
            label: 'Logout',
            icon: 'pi pi-fw pi-sign-out',
            command: () => this.logout(),
          },
        ],
      },
    ];
  }

  logout(): void {
    this._ConfirmationService.confirm({
      message: 'Are you sure you want to log out?',
      header: 'Logout Confirmation',
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: 'No',
      acceptLabel: 'Yes',
      closeOnEscape: true,
      acceptButtonStyleClass: 'p-button-danger mx-2',
      accept: () => {
        localStorage.removeItem('user');
        this._Router.navigate(['/login']);
      },
      reject: () => {},
    });
  }
}

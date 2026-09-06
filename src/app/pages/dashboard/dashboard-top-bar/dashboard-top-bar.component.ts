import { CommonModule, isPlatformBrowser } from "@angular/common";
import { Component, ElementRef, inject, Input, PLATFORM_ID, ViewChild } from "@angular/core";
import { RouterLink } from "@angular/router";
import { MenuItem } from "primeng/api";
import { BadgeModule } from "primeng/badge";
import { ButtonModule } from "primeng/button";
import { InputSwitchModule } from "primeng/inputswitch";
import { InputTextModule } from "primeng/inputtext";
import { RadioButtonModule } from "primeng/radiobutton";
import { RippleModule } from "primeng/ripple";
import { SidebarModule } from "primeng/sidebar";
import { interval, Subscription } from "rxjs";
import { NewOrders } from "../../../core/Interfaces/g-orders/ICurrentOrdered";
import { DashboardLayoutService } from "../../../core/services/core/dashboard-layout.service";
import { OrdersService } from "../../../core/services/g-orders/orders.service";
import { DialogModule } from "primeng/dialog";

@Component({
  selector: "app-dashboard-top-bar",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    SidebarModule,
    InputTextModule,
    BadgeModule,
    RadioButtonModule,
    InputSwitchModule,
    RippleModule,
    BadgeModule,
    ButtonModule,
    DialogModule,
  ],
  templateUrl: "./dashboard-top-bar.component.html",
  styleUrl: "./dashboard-top-bar.component.scss",
})
export class DashboardTopBarComponent {
  @Input() isShow: boolean = true;

  notifications: NewOrders[] = [];

  showNotifications: boolean = false;

  items!: MenuItem[];

  private ordersService = inject(OrdersService);

  private notificationSubscription: Subscription | undefined;

  @ViewChild("menubutton") menuButton!: ElementRef;

  @ViewChild("topbarmenubutton") topbarMenuButton!: ElementRef;

  @ViewChild("topbarmenu") menu!: ElementRef;

  layoutService = inject(DashboardLayoutService);

  _PLATFORM_ID = inject(PLATFORM_ID);

  previousOrders: NewOrders[] = []; // Track previous orders
  lastSeenOrderCount: number = 0; // The last count user has seen
  unseenOrdersCount: number = 0; // Number of new orders not seen yet
  showAlert: boolean = false; // Show the alert dialog
  audio!: HTMLAudioElement; // Notification sound

  ngOnInit(): void {
    // this.fetchNotifications();
    this.updateTitle();
    // Poll API every 30 seconds
    this.notificationSubscription = interval(5000).subscribe(() => {
      // this.fetchNotifications();
    });

    // Initialize the alert sound
    this.audio = new Audio("assets/sounds/notification.mp3"); // Ensure this file exists
    this.audio.loop = true; // Keep playing until stopped
  }
  fetchNotifications() {
    this.ordersService.getCurrentOrders().subscribe((response) => {
      if (!response?.orders) return;

      const currentOrderCount = response.orders.length;
      this.ordersService.currentOrdersCount.set(response.orders.length);
      this.updateTitle();
      // Check if the order count increased beyond the last seen count
      if (currentOrderCount > this.lastSeenOrderCount) {
        this.unseenOrdersCount = currentOrderCount - this.lastSeenOrderCount;

        // Show the alert only when new orders appear beyond the last seen
        if (!this.showAlert) {
          this.showAlert = true;
          this.audio.play(); // Play notification sound
        }
      }
      this.previousOrders = [...response.orders]; // Update orders list
      this.notifications = response.orders; // Store all orders
    });
  }

  updateTitle() {
    const originalTitle = "HAC";
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      if (this.notifications.length > 0) {
        document.title = `HAC (${this.notifications.length}) New Orders`;
      } else {
        document.title = originalTitle; // Restore original title
      }
    }
  }

  ngOnDestroy() {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe(); // Prevent memory leaks
    }
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  stopNotification() {
    this.showAlert = false; // Close the alert
    this.audio.pause(); // Stop the sound
    this.audio.currentTime = 0; // Reset sound
    this.lastSeenOrderCount = this.notifications.length; // Update last seen count
    this.unseenOrdersCount = 0; // Reset unseen count
  }
}

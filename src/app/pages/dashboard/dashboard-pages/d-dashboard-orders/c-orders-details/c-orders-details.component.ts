// import { CommonModule, CurrencyPipe, PercentPipe } from "@angular/common";
// import { Component, inject } from "@angular/core";
// import { ActivatedRoute, Router } from "@angular/router";
// import { ButtonModule } from "primeng/button";
// import { CardModule } from "primeng/card";
// import { TableModule } from "primeng/table";
// import { Addressinfo, IOrderById, Orderdetail, Promo } from "../../../../../core/Interfaces/g-orders/IOrderById";
// import { IAllBranches } from "../../../../../core/Interfaces/j-branches/IAllBranches";
// import { LoadingDataBannerComponent } from "../../../../../shared/components/loading-data-banner/loading-data-banner.component";
// import { OrderData, User } from "./../../../../../core/Interfaces/g-orders/IAllOrders";
// import { DropdownModule } from "primeng/dropdown";
// import { FormsModule } from "@angular/forms";
// import { OrdersService } from "../../../../../core/services/g-orders/orders.service";
// import { NgxSpinnerService } from "ngx-spinner";
// import { MessageService } from "primeng/api";
// import { timer } from "rxjs";

// @Component({
//   selector: "app-c-orders-details",
//   standalone: true,
//   imports: [
//     DropdownModule,
//     FormsModule,
//     LoadingDataBannerComponent,
//     CommonModule,
//     CurrencyPipe,
//     TableModule,
//     PercentPipe,
//     CardModule,
//     ButtonModule,
//   ],
//   templateUrl: "./c-orders-details.component.html",
//   styleUrl: "./c-orders-details.component.scss",

//   providers: [MessageService],
// })
// export class COrdersDetailsComponent {
//   order!: IOrderById;

//   userDetails: User[] = [];
//   userAddress: Addressinfo[] = [];
//   userPromoCode: Promo[] = [];
//   userOrders: Orderdetail[] = [];
//   allBranches!: IAllBranches;
//   private activatedRoute = inject(ActivatedRoute);
//   private router = inject(Router);

//   ngOnInit(): void {
//     this.activatedRoute.paramMap.subscribe(() => {
//       this.fetchData();
//     });
//   }

//   fetchData(): void {
//     this.order = this.activatedRoute.snapshot.data["orderDetails"];
//     this.userPromoCode = [];
//     this.userDetails = [];
//     this.userAddress = [];
//     this.userDetails.push(this.order.order.user);
//     this.userAddress.push(this.order.order.addressinfo);
//     if (this.order.order.promo) {
//       this.userPromoCode.push(this.order.order.promo);
//     }
//     this.userOrders = this.order.orderdetails;
//     this.allBranches = this.activatedRoute.snapshot.data["branches"];
//   }

//   backToOrders(): void {
//     if (this.router.url.includes("history")) {
//       this.router.navigate(["/dashboard/orders/history"]);
//     } else {
//       this.router.navigate(["/dashboard/orders/"]);
//     }
//   }

//   findBranches(id: number): string | undefined {
//     return this.allBranches.branches.data.find((e) => e.id === id)?.en_branch_city;
//   }

//   getItemDescription(item: Orderdetail): string {
//     let details = [];

//     if (item.quantity) {
//       details.push(`${item.quantity}x`);
//     }

//     if (item.pieces) {
//       details.push(`${item.pieces} pcs`);
//     }

//     if (item.product_name) {
//       details.push(item.product_name);
//     }

//     return details.join(" ");
//   }

//   getTotalPrice(orderdetails: Orderdetail[]): number {
//     return orderdetails.reduce((sum, item) => sum + item.price, 0);
//   }

//   printOrderReceipt() {
//     const receiptContent = document.getElementById("receipt-section");

//     // Extract values from order object
//     const order = this.order.order; // Assuming order is available in the component
//     const subtotal = order.sub_total;
//     const totalPrice = order.total_price;
//     const serviceCharge = totalPrice - subtotal * 1.14; // Extracted from total
//     const vat = totalPrice - subtotal - serviceCharge; // Extracted from total

//     if (receiptContent) {
//       const printWindow = window.open("", "", "width=800,height=900");

//       printWindow?.document.write(`
//         <html>
//         <head>
//           <title>Order Receipt</title>
//           <style>
//             body { font-family: Arial, sans-serif; margin: 20px; padding: 0; }
//             h2 { text-align: center; }
//             table { width: 100%; border-collapse: collapse; margin-top: 10px; }
//             th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
//             th { background-color: #f4f4f4; }
//             .total { text-align: right; font-weight: bold; margin-top: 10px; }
//             @media print {
//               body { margin: 10px; }
//               .p-button-outlined { display: none; } /* Hide buttons in print */
//             }
//           </style>
//         </head>
//         <body>
//           ${receiptContent.innerHTML}
//           <table>
//             <tr>
//               <td>Subtotal:</td>
//               <td>${subtotal.toFixed(2)} EGP</td>
//             </tr>
//             <tr>
//               <td>Service Charge:</td>
//               <td>${serviceCharge.toFixed(2)} EGP</td>
//             </tr>
//             <tr>
//               <td>VAT:</td>
//               <td>${vat.toFixed(2)} EGP</td>
//             </tr>
//             <tr>
//               <td><strong>Total:</strong></td>
//               <td><strong>${totalPrice.toFixed(2)} EGP</strong></td>
//             </tr>
//           </table>
//           <p class="total">Printed on: ${new Date().toLocaleString()}</p>
//         </body>
//         </html>
//       `);

//       printWindow?.document.close();
//       printWindow?.focus();
//       printWindow?.print();
//       printWindow?.close();
//     }
//   }

//   statusSteps = ["placed", "confirmed", "on the way", "delivered", "cancelled"];
//   private ordersService = inject(OrdersService);
//   messageService = inject(MessageService);
//   private ngxSpinnerService = inject(NgxSpinnerService);
//   getStatusClass(status: string): string {
//     switch (status) {
//       case "placed":
//         return "bg-yellow-200 text-yellow-800"; // Light Yellow
//       case "confirmed":
//         return "bg-blue-200 text-blue-800"; // Light Blue
//       case "on the way":
//         return "bg-orange-200 text-orange-800"; // Light Orange
//       case "delivered":
//         return "bg-green-200 text-green-800"; // Light Green
//       case "cancelled":
//         return "bg-red-200 text-green-800"; // Light Green
//       default:
//         return ""; // Default (no styling)
//     }
//   }
//   getAvailableStatusOptions(currentStatus: string) {
//     const statusWithIcons = [
//       { label: "Placed", value: "placed", icon: "pi pi-inbox text-yellow-500" },
//       { label: "Confirmed", value: "confirmed", icon: "pi pi-check-circle text-blue-500" },
//       { label: "On The Way", value: "on the way", icon: "pi pi-truck text-orange-500" },
//       { label: "Delivered", value: "delivered", icon: "pi pi-box text-green-500" },
//       { label: "cancelled", value: "cancelled", icon: "pi pi-times text-green-500" },
//     ];

//     const currentIndex = this.statusSteps.indexOf(currentStatus);

//     // ✅ Disable previous steps
//     return statusWithIcons.map((status, index) => ({
//       ...status,
//       disabled: index < currentIndex,
//     }));
//   }

//   updateOrderStatus(order: any, isStatus: boolean) {
//     this.ngxSpinnerService.show("actionsLoader");
//     this.messageService.clear("orderStatusMessage");
//     this.ordersService.updateOrderStatus(order.id.toString(), order.status, isStatus).subscribe({
//       next: (response) => {
//         timer(200).subscribe(() => this.ngxSpinnerService.hide("actionsLoader"));
//         order = response.order;
//         this.messageService.add({
//           severity: "success",
//           summary: "Status Updated",
//           detail: `Order status changed to "${order.status}"`,
//           life: 3000,
//           key: "orderStatusMessage",
//         });
//         if (!isStatus) {
//         }
//       },
//       error: (err) => {
//         timer(200).subscribe(() => this.ngxSpinnerService.hide("actionsLoader"));
//         console.error("Error updating status", err);
//         this.messageService.add({
//           severity: "error",
//           summary: "Update Failed",
//           detail: "Could not update order status.",
//           life: 3000,
//           key: "orderStatusMessage",
//         });
//       },
//     });
//   }
// }

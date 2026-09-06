import { Component, inject } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Router, RouterLink, RouterOutlet } from "@angular/router";
import { NgxSpinnerModule, NgxSpinnerService } from "ngx-spinner";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { DropdownModule } from "primeng/dropdown";
import { InputSwitchModule } from "primeng/inputswitch";
import { Table, TableModule } from "primeng/table";
import { ToastModule } from "primeng/toast";
import { ISelectOptions } from "../../../../../core/Interfaces/core/ISelectOptions";
import { LoadingDataBannerComponent } from "../../../../../shared/components/loading-data-banner/loading-data-banner.component";
import { NoDataFoundBannerComponent } from "../../../../../shared/components/no-data-found-banner/no-data-found-banner.component";
import { PromoCodeData, PromoCodeService } from "../service/promocode.service";
import { CommonModule, DatePipe } from "@angular/common";

@Component({
  selector: "app-all-promocodes",
  standalone: true,
  imports: [
    ButtonModule,
    ReactiveFormsModule,
    TableModule,
    FormsModule,
    DropdownModule,
    ToastModule,
    InputSwitchModule,
    LoadingDataBannerComponent,
    RouterLink,
    NgxSpinnerModule,
    NoDataFoundBannerComponent,
    RouterOutlet,
    DatePipe,
  ],
  templateUrl: "./all-promocodes.component.html",
  styleUrl: "./all-promocodes.component.scss",
  providers: [MessageService],
})
export class AllPromocodesComponent {
  promocodes: PromoCodeData[] = [];
  filteredPromocodes: PromoCodeData[] = [];
  allPromocodes!: PromoCodeData[];
  private ngxSpinnerService = inject(NgxSpinnerService);
  private messageService = inject(MessageService);
  private promoCodeService = inject(PromoCodeService);
  private router = inject(Router);

  // Dropdown
  selectedStatus: string = "";
  selectedUseType: string = "";
  selectOptions: ISelectOptions[] = [];
  selectOptions2: ISelectOptions[] = [];
  totalRecords: number = 0;
  rowsPerPage = 10;
  currentPage = 1;
  isLoading: boolean = true;

  ngOnInit() {
    this.initDropDownFilter();
    this.fetchData();
  }

  initDropDownFilter(): void {
    this.selectOptions = [
      {
        label: "Active",
        value: "true",
      },
      {
        label: "Inactive",
        value: "false",
      },
    ];
    this.selectOptions2 = [
      {
        label: "Multiple",
        value: "1",
      },
      {
        label: "Single",
        value: "0",
      },
    ];
  }

  fetchData() {
    this.isLoading = true;
    this.ngxSpinnerService.show('actionsLoader');
    this.promoCodeService.getAllPromoCodes().subscribe(
      (response) => {
        this.allPromocodes = response;
        this.promocodes = response || [];
        this.filteredPromocodes = [...this.promocodes];
        this.totalRecords = this.promocodes.length;
        this.isLoading = false;
        this.ngxSpinnerService.hide('actionsLoader');
      },
      () => {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to load Promo Codes"
        });
        this.isLoading = false;
        this.ngxSpinnerService.hide('actionsLoader');
      }
    );
  }

  togglePromoCodeStatusNew(promoCode: PromoCodeData) {
    this.ngxSpinnerService.show("actionsLoader");
    this.messageService.clear();
    console.log(promoCode, "promoCode");
    const updatedStatus = promoCode.uses_count >= 1; // True if Multiple (uses_count >= 1), false if Single (uses_count = 0)
    console.log(updatedStatus, "use count");
  
    if (updatedStatus) {
      // If currently Multiple (true), disable to make it Single (uses_count = 0)
      this.promoCodeService.disablePromoCodeNew(promoCode.id.toString()).subscribe({
        next: (response) => {
          promoCode.uses_count = 0; // Set to Single
          this.messageService.add({
            severity: "success",
            summary: "Updated",
            detail: response.message,
          });
          this.ngxSpinnerService.hide("actionsLoader");
        },
        error: () => {
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "Failed to update promo code use count",
          });
          this.ngxSpinnerService.hide("actionsLoader");
        }
      });
    } else {
      // If currently Single (false), enable to make it Multiple (uses_count = 1)
      this.promoCodeService.enablePromoCodeNew(promoCode.id.toString()).subscribe({
        next: (response) => {
          promoCode.uses_count = 1; // Set to Multiple
          this.messageService.add({
            severity: "success",
            summary: "Updated",
            detail: response.message,
          });
          this.ngxSpinnerService.hide("actionsLoader");
        },
        error: () => {
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "Failed to update promo code use count",
          });
          this.ngxSpinnerService.hide("actionsLoader");
        }
      });
    }
  }

  navigateToEdit(promoCodeId: string | number) {
    this.router.navigate(['/dashboard/promo-codes/edit-promo-code', promoCodeId]);
    console.log('Navigating to:', `/dashboard/promocodes/edit-promo-code/${promoCodeId}`);
  }

  togglePromoCodeStatus(promoCode: PromoCodeData) {
    this.ngxSpinnerService.show("actionsLoader");
    this.messageService.clear();
    const updatedStatus = !promoCode.active_status;
    console.log(updatedStatus, "updatedStatus-active");

    if (updatedStatus) {
      this.promoCodeService.enablePromoCode(promoCode.id.toString()).subscribe({
        next: (response) => {
          promoCode.active_status = updatedStatus;
          this.messageService.add({
            severity: "success",
            summary: "Updated",
            detail: response.message,
          });
          this.ngxSpinnerService.hide("actionsLoader");
        },
        error: () => {
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "Failed to update promo code status",
          });
          this.ngxSpinnerService.hide("actionsLoader");
        }
      });
    } else {
      this.promoCodeService.disablePromoCode(promoCode.id.toString()).subscribe({
        next: (response) => {
          promoCode.active_status = updatedStatus;
          this.messageService.add({
            severity: "success",
            summary: "Updated",
            detail: response.message,
          });
          this.ngxSpinnerService.hide("actionsLoader");
        },
        error: () => {
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "Failed to update promo code status",
          });
          this.ngxSpinnerService.hide("actionsLoader");
        }
      });
    }
  }

  getPagination(): number[] {
    return [10, 25, 50, 100].sort((a, b) => a - b);
  }

  onGlobalFilter(dt: Table, event: any) {
    const value = event.target.value.toLowerCase();
    this.filteredPromocodes = this.promocodes.filter((promoCode) => {
      return (
        promoCode.id.toString().includes(value) ||
        promoCode.code.toLowerCase().includes(value) ||
        promoCode.value.toLowerCase().includes(value) ||
        promoCode.uses_count.toString().toLowerCase().includes(value) ||
        (promoCode.active_status ? "active" : "inactive").includes(value)
      );
    });
  }

  onFilterChange(value: string, field: 'active_status' | 'uses_count' = 'active_status'): void {
    this.filteredPromocodes = this.promocodes.filter((ele) => {
      if (field === 'active_status' && value) {
        return ele.active_status.toString() === value;
      }
      if (field === 'uses_count' && value) {
        return (ele.uses_count >= 1 ? "1" : "0") === value;
      }
      return true; // No filter applied if value is empty
    });
  }

  onSort(event: any) {
    const field = event.field;
    const order = event.order;
    this.filteredPromocodes.sort((a, b) => {
      let valueA: any;
      let valueB: any;
      if (field === "id") {
        valueA = Number(a.id);
        valueB = Number(b.id);
      } else if (field === "code") {
        valueA = a.code;
        valueB = b.code;
      } else if (field === "value") {
        valueA = Number(a.value);
        valueB = Number(b.value);
      } else if (field === "uses_count") {
        valueA = a.uses_count;
        valueB = b.uses_count;
      } else if (field === "active_status") {
        valueA = a.active_status;
        valueB = b.active_status;
      } else {
        valueA = (a as any)[field];
        valueB = (b as any)[field];
      }
      if (valueA < valueB) {
        return order === -1 ? -1 : 1;
      } else if (valueA > valueB) {
        return order === -1 ? 1 : -1;
      } else {
        return 0;
      }
    });
  }
}
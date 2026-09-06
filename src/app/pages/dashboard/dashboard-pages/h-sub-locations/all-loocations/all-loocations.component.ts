import { NgOptimizedImage } from "@angular/common";
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
import { LocationData, LocationService } from "../services/location.service";

@Component({
  selector: "app-a-all-locations",
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
    RouterOutlet
  ],
  templateUrl: "./all-loocations.component.html",
  styleUrl: "./all-loocations.component.scss",
  providers: [MessageService],
})
export class AAllLocationsComponent {
  locations: LocationData[] = [];
  filteredLocations: LocationData[] = [];
  allLocations!:LocationData[] ;
  private ngxSpinnerService = inject(NgxSpinnerService);
  private messageService = inject(MessageService);
  private locationsService = inject(LocationService);
  private router=inject(Router)
  // Dropdown
  selectedStatus: string = "";
  selectOptions: ISelectOptions[] = [];
  
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
  }

  fetchData() {
    this.isLoading = true;
    this.ngxSpinnerService.show('actionsLoader');
    this.locationsService.getAllLocations().subscribe(
      (response) => {
        this.allLocations = response;
        this.locations = response || []; // Fallback to empty array if rows is undefined
        this.filteredLocations = [...this.locations];
        this.totalRecords = this.locations.length;
        this.isLoading = false;
        this.ngxSpinnerService.hide('actionsLoader');
      },
      () => {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to load Locations"
        });
        this.isLoading = false;
        this.ngxSpinnerService.hide('actionsLoader');
      }
    );
  }
  navigateToEdit(locationId: string | number) {
    this.router.navigate(['/dashboard/locations/edit-location', locationId]);
    // For debugging
    console.log('Navigating to:', `/dashboard/locations/edit-location/${locationId}`);
  }
  toggleLocationStatus(location: LocationData) {
    this.ngxSpinnerService.show("actionsLoader");
    this.messageService.clear();
    const updatedStatus = !location.active_status;
    
    if (updatedStatus) {
      this.locationsService.enableLocation(location.id.toString()).subscribe({
        next: (response) => {
          location.active_status = updatedStatus;
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
            detail: "Failed to update location status",
          });
          this.ngxSpinnerService.hide("actionsLoader");
        }
      });
    } else {
      this.locationsService.disableLocation(location.id.toString()).subscribe({
        next: (response) => {
          location.active_status = updatedStatus;
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
            detail: "Failed to update location status",
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
    this.filteredLocations = this.locations.filter((location) => {
      return (
        location.id.toString().includes(value) ||
        location.en_name.toLowerCase().includes(value) ||
        location.ar_name.toLowerCase().includes(value) ||
        location.delivery_amount.toLowerCase().includes(value) ||
        (location.active_status ? "active" : "inactive").includes(value)
      );
    });
  }

  onFilterChange(value: string): void {
    if (value) {
      this.filteredLocations = this.locations.filter((ele) => {
        return ele.active_status.toString() === value;
      });
    } else {
      this.filteredLocations = [...this.locations];
    }
  }

  onSort(event: any) {
    const field = event.field;
    const order = event.order;
    this.filteredLocations.sort((a, b) => {
      let valueA: any;
      let valueB: any;
      if (field === "id") {
        valueA = Number(a.id);
        valueB = Number(b.id);
      } else if (field === "en_name") {
        valueA = a.en_name;
        valueB = b.en_name;
      } else if (field === "ar_name") {
        valueA = a.ar_name;
        valueB = b.ar_name;
      } else if (field === "delivery_amount") {
        valueA = Number(a.delivery_amount);
        valueB = Number(b.delivery_amount);
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
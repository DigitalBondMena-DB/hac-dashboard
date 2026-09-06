import { Component, inject } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { NgxSpinnerModule, NgxSpinnerService } from "ngx-spinner";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { DropdownModule } from "primeng/dropdown";
import { InputSwitchModule } from "primeng/inputswitch";
import { Table, TableModule } from "primeng/table";
import { ToastModule } from "primeng/toast";
import { LoadingDataBannerComponent } from "../../../../../../shared/components/loading-data-banner/loading-data-banner.component";
import { NoDataFoundBannerComponent } from "../../../../../../shared/components/no-data-found-banner/no-data-found-banner.component";
import { ISelectOptions } from "../../../../../../core/Interfaces/core/ISelectOptions";
import { ProductChoice, ProductData, ProductResponse } from "../../../../../../core/Interfaces/d-products/IGetAllProducts";
import { ProductsService } from "../../../../../../core/services/d-products/products.service";

@Component({
  selector: "app-product-choices",
  standalone: true,
  imports: [
    ButtonModule,
    ReactiveFormsModule,
    TableModule,
    FormsModule,
    DropdownModule,
    ToastModule,
    InputSwitchModule,
    RouterLink,
    NoDataFoundBannerComponent,
    LoadingDataBannerComponent,
    NgxSpinnerModule
  ],
  templateUrl: "./all-choices.component.html",
  styleUrl: "./all-choices.component.scss",
  providers: [MessageService],
})
export class ProductChoicesComponent {
  product: ProductData | null = null;
  choices: ProductChoice[] = [];
  filteredChoices: ProductChoice[] = [];
  isToggling: { [key: number]: boolean } = {}; // Track toggling state per choice
  private ngxSpinnerService = inject(NgxSpinnerService);
  private messageService = inject(MessageService);
  private productsService = inject(ProductsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
productId: string | null = this.route.snapshot.paramMap.get('id');  // Dropdown
  selectedStatus: string = "";
  selectOptions: ISelectOptions[] = [];
  private spinnerService = inject(NgxSpinnerService);
  isSpecial = false;

  totalRecords: number = 0;
  rowsPerPage = 10;
  currentPage = 1;

  ngOnInit() {
    this.initDropDownFilter();
    this.route.queryParams.subscribe(params => {
      this.isSpecial = params['special'] === 'true' || params['special'] === '1';
      this.fetchData();
    });
  }

  initDropDownFilter(): void {
    this.selectOptions = [
      { label: "Active", value: "1" },
      { label: "Inactive", value: "0" },
    ];
  }

  fetchData() {

    this.spinnerService.show("actionsLoader");
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.productsService.getProductById(productId, this.isSpecial).subscribe({
        next: (response: ProductResponse) => {
          this.product = response.row;
          this.choices = response.row.choices;
          this.filteredChoices = [...this.choices];
          this.totalRecords = this.choices.length;
    this.spinnerService.hide("actionsLoader");
        },
        error: () => {
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "Failed to load product choices",
          });
    this.spinnerService.hide("actionsLoader");
        },
      });
    } else {
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: "Product ID not found",
      });
      this.ngxSpinnerService.hide();
    }

  }

  toggleChoiceStatus(choice: ProductChoice) {
    const originalStatus = choice.active_status;
    const newStatus = originalStatus === 1 ? 0 : 1;

    // Set toggling state to disable the switch
    this.isToggling[choice.id] = true;

    this.ngxSpinnerService.show("actionsLoader");
    this.messageService.clear();

    const action = newStatus === 1
      ? this.productsService.enableChoice(choice.id.toString(), this.isSpecial)
      : this.productsService.disableChoice(choice.id.toString(), this.isSpecial);

    action.subscribe({
      next: (response) => {
        // Only update the status on success
        choice.active_status = newStatus;
        this.messageService.add({
          severity: "success",
          summary: "Updated",
          detail: `Choice ${newStatus === 1 ? "Enabled" : "Disabled"} successfully`,
        });
        this.ngxSpinnerService.hide("actionsLoader");
        this.isToggling[choice.id] = false;
      },
      error: () => {
        // Revert to original status on error
        choice.active_status = originalStatus;
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to update choice status",
        });
        this.ngxSpinnerService.hide("actionsLoader");
        this.isToggling[choice.id] = false;
      },
    });
  }

  getPagination(): number[] {
    return [10, 25, 50, 100].sort((a, b) => a - b);
  }

  onGlobalFilter(dt: Table, event: any) {
    const value = event.target.value.toLowerCase();
    this.filteredChoices = this.choices.filter((choice) => {
      return (
        choice.en_name.toLowerCase().includes(value) ||
        choice.ar_name.toLowerCase().includes(value) ||
        choice.cuurent_value.toString().includes(value)
      );
    });
  }

  onFilterChange(value: string): void {
    if (value) {
      this.filteredChoices = this.choices.filter((choice) => {
        return choice.active_status.toString() === value;
      });
    } else {
      this.filteredChoices = [...this.choices];
    }
  }

  onSort(event: any) {
    const field = event.field;
    const order = event.order;
    this.filteredChoices.sort((a, b) => {
      let valueA: any;
      let valueB: any;
      if (field === "en_name") {
        valueA = a.en_name;
        valueB = b.en_name;
      } else if (field === "ar_name") {
        valueA = a.ar_name;
        valueB = b.ar_name;
      } else if (field === "cuurent_value") {
        valueA = a.cuurent_value;
        valueB = b.cuurent_value;
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



  editChoice(id:string,choiceData:any){

    localStorage.setItem('choiceData', JSON.stringify(choiceData));
    console.log("Clicked Data Well ")
    this.productsService.setChoiceData(choiceData);
    console.log(choiceData)
    this.router.navigate(['/dashboard/menu/products/edit-choice', id], {
      queryParams: this.isSpecial ? { special: 'true' } : undefined
    });
  }
}
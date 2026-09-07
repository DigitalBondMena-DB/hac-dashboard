

import { CommonModule, NgOptimizedImage } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { DropdownModule } from "primeng/dropdown";
import { InputSwitchModule } from "primeng/inputswitch";
import { Table, TableModule } from "primeng/table";
import { ToastModule } from "primeng/toast";
import { IGetAllProducts, ProductData } from "../../../../../../core/Interfaces/d-products/IGetAllProducts";
import { LoadingDataBannerComponent } from "../../../../../../shared/components/loading-data-banner/loading-data-banner.component";
import { NoDataFoundBannerComponent } from "../../../../../../shared/components/no-data-found-banner/no-data-found-banner.component";
import { ISelectOptions } from "../../../../../../core/Interfaces/core/ISelectOptions";
import { CategoriesService } from "../../../../../../core/services/h-category/categories.service";
import { IAllCategory } from "../../../../../../core/Interfaces/h-category/IAllCategory";
import { ProductsService } from './../../../../../../core/services/d-products/products.service';

@Component({
  selector: "app-a-all-products",
  standalone: true,
  imports: [
    ButtonModule,
    DialogModule,
    ReactiveFormsModule,
    TableModule,
    FormsModule,
    DropdownModule,
    ToastModule,
    InputSwitchModule,
    LoadingDataBannerComponent,
    CommonModule,
    RouterLink,
    NgOptimizedImage,
    NoDataFoundBannerComponent,
  ],
  templateUrl: "./a-all-products.component.html",
  styleUrl: "./a-all-products.component.scss",
  providers: [MessageService],
})
export class AAllProductsComponent {
  products: ProductData[] = [];
  allCategories!: IAllCategory;
  filteredProducts: ProductData[] = [];
  categoryData!: {
    value: number;
    label: string;
  }[];
  commercialStatusData!: {
    value: string;
    label: string;
  }[];
  allProducts!: IGetAllProducts;
  private ngxSpinnerService = inject(NgxSpinnerService);
  private messageService = inject(MessageService);
  private productsService = inject(ProductsService);
  private categoriesService = inject(CategoriesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isSpecial = false;
  isLoading = true;

  // Dropdown
  selectedStatus: string | null = null;
  selectedCategory: number | null = null;
  selectedCommercialStatus: string | null = null;
  selectedPromoCodeStatus: string | null = null;
  selectOptions: ISelectOptions[] = [];
  selectOptions2: ISelectOptions[] = [];

  totalRecords: number = 0;
  rowsPerPage = 10;
  currentPage = 1;

  marimages: string[] = [];

  ngOnInit() {
    this.initDropDownFilter();
    this.initCommercialStatusFilter();
    this.route.queryParams.subscribe(params => {
      this.isSpecial = params['special'] === 'true' || params['special'] === '1';
      this.initCategories();
      this.fetchData();
    });
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
        label: "Active",
        value: "1",
      },
      {
        label: "Inactive",
        value: "0",
      },
    ];
  }

  initCommercialStatusFilter(): void {
    this.selectOptions2 = [
      {
        label: "User",
        value: "false",
      },
      {
        label: "Business",
        value: "true",
      },
    ];
  }

  initCategories(): void {
    this.categoriesService.getAllCategories(1, 100, this.isSpecial).subscribe((response) => {
      this.allCategories = response;
      this.categoryData = this.allCategories.data.map((category) => ({
        value: category.id,
        label: category.en_name,
      }));
    });
  }
  // test
  fetchData() {
    this.isLoading = true;
    this.ngxSpinnerService.show();
    this.productsService.getAllProducts(this.isSpecial).subscribe(
      (response) => {
        this.allProducts = response;
        this.products = response?.rows || [];
        this.marimages = [];
        this.products.forEach((product) => {
          product.images?.forEach((image) => (this.marimages.push("https://dev.mesoshop.digitalbondmena.com/" + image.image)));
        });
        this.filteredProducts = [...this.products];
        this.totalRecords = this.products.length;
        this.ngxSpinnerService.hide();
        this.isLoading = false;
      },
      () => {
        this.products = [];
        this.filteredProducts = [];
        this.totalRecords = 0;
        this.messageService.add({ severity: "error", summary: "Error", detail: "Failed to load Products" });
        this.ngxSpinnerService.hide();
        this.isLoading = false;
      }
    );
  }

  applyFilters(): void {
    let filtered = [...this.products];

    // Apply category filter
    if (this.selectedCategory) {
      filtered = filtered.filter((product) => product.category && product.category.id === this.selectedCategory);
    }

    // Apply status filter
    if (this.selectedStatus !== null && this.selectedStatus !== '') {
      filtered = filtered.filter((ele) => ele.active_status.toString() === this.selectedStatus);
    }

    // Apply commercial status filter
    if (this.selectedCommercialStatus !== null && this.selectedCommercialStatus !== '') {
      filtered = filtered.filter((ele) => String(ele.commercial_status) === this.selectedCommercialStatus);
    }

    // Apply promo code status filter
    if (this.selectedPromoCodeStatus !== null && this.selectedPromoCodeStatus !== '') {
      filtered = filtered.filter((ele) => String(ele.promo_code_status) === this.selectedPromoCodeStatus);
    }

    this.filteredProducts = filtered;
    this.totalRecords = filtered.length;
  }

  onGlobalFilter(dt: Table, event: any) {
    const value = event.target.value.toLowerCase();
    let filtered = [...this.products];

    // Apply category filter first
    if (this.selectedCategory) {
      filtered = filtered.filter((product) => product.category && product.category.id === this.selectedCategory);
    }

    // Apply status filter
    if (this.selectedStatus !== null && this.selectedStatus !== '') {
      filtered = filtered.filter((ele) => ele.active_status.toString() === this.selectedStatus);
    }

    // Apply commercial status filter
    if (this.selectedCommercialStatus !== null && this.selectedCommercialStatus !== '') {
      filtered = filtered.filter((ele) => String(ele.commercial_status) === this.selectedCommercialStatus);
    }

    // Apply global search on the filtered dataset
    if (value) {
      filtered = filtered.filter((product) => {
        return (
          product.id.toString().includes(value) ||
          product.en_name.toLowerCase().includes(value) ||
          product.ar_name.toLowerCase().includes(value) ||
          (product.category && product.category.en_name.toLowerCase().includes(value)) ||
          (product.category && product.category.ar_name.toLowerCase().includes(value)) ||
          (product.active_status ? "active" : "inactive").includes(value) ||
          (product.commercial_status ? "business" : "user").includes(value) ||
          (product.price && product.price.toString().includes(value)) ||
          (product.promo_code_status && product.promo_code_status >= 1 ? "active" : "inactive").includes(value)
        );
      });
    }

    this.filteredProducts = filtered;
    this.totalRecords = filtered.length;
  }

  onFilterChange(value: string | null): void {
    this.selectedStatus = value;
    this.applyFilters();
  }

  onFilterCategoryChange(categoryId: number | null): void {
    this.selectedCategory = categoryId;
    this.applyFilters();
  }

  onFilterCommercialChange(value: string | null): void {
    this.selectedCommercialStatus = value;
    this.applyFilters();
  }

  onFilterPromoCodeChange(value: string | null): void {
    this.selectedPromoCodeStatus = value;
    this.applyFilters();
  }

  toggleProductStatus(product: ProductData) {
    this.ngxSpinnerService.show("actionsLoader");
    this.messageService.clear();
    const updatedStatus = !product.active_status;

    const update$ = updatedStatus
      ? this.productsService.enableProduct(product.id.toString(), this.isSpecial)
      : this.productsService.disableProduct(product.id.toString(), this.isSpecial);

    update$.subscribe({
      next: () => {
        product.active_status = updatedStatus;
        this.applyFilters();
        this.messageService.add({
          severity: "success",
          summary: "Updated",
          detail: `Product ${updatedStatus ? "Enabled" : "Disabled"} successfully`,
        });
        this.ngxSpinnerService.hide("actionsLoader");
      },
      error: () => {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to update product status",
        });
        this.ngxSpinnerService.hide("actionsLoader");
      }
    });
  }

  getPagination(): number[] {
    return [10, 25, 50, 100].sort((a, b) => a - b);
  }

  onSort(event: any) {
    const field = event.field;
    const order = event.order;
    this.filteredProducts.sort((a, b) => {
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
      } else if (field === "active_status") {
        valueA = a.active_status;
        valueB = b.active_status;
      } else if (field === "commercial_status") {
        valueA = a.commercial_status;
        valueB = b.commercial_status;
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

  addChoices(id: string) {
    this.router.navigate([`/dashboard/menu/products/products-choice/${id}`]);
  }
}
import { Component, inject, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { DropdownModule } from "primeng/dropdown";
import { InputSwitchModule } from "primeng/inputswitch";
import { Table, TableModule } from "primeng/table";
import { ToastModule } from "primeng/toast";
import { timer } from "rxjs";
import { SubCategoryService } from "../../../../../../core/services/q-sub-categories/sub-category.service";
import { CategoriesService } from "../../../../../../core/services/h-category/categories.service";
import { LoadingDataBannerComponent } from "../../../../../../shared/components/loading-data-banner/loading-data-banner.component";
import { NoDataFoundBannerComponent } from "../../../../../../shared/components/no-data-found-banner/no-data-found-banner.component";

export interface IAllCategory {
  status: boolean;
  data: categoryData[];
}

export interface ISelectOptions {
  label: string;
  value: string;
}

export interface categoryData {
  id: number;
  en_name: string;
  ar_name: string;
  en_slug: string;
  ar_slug: string;
  active_status: number;
  order_view: number;
  created_at: string;
  updated_at: string;
}

export interface IGetAllSubCategories {
  status: boolean;
  data: subcategoriesData[];
}

export interface subcategoriesData {
  id: number;
  category_id: number;
  en_name: string;
  ar_name: string;
  en_slug: string;
  ar_slug: string;
  active_status: number;
  order_view: number;
  created_at: string;
  updated_at: string;
  category: Category;
}

export interface Category {
  id: number;
  en_name: string;
  ar_name: string;
  en_slug: string;
  ar_slug: string;
  active_status: number;
  order_view: number;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-a-all-sub-categories',
  standalone: true,
  imports: [
    ButtonModule,
    TableModule,
    FormsModule,
    ToastModule,
    InputSwitchModule,
    LoadingDataBannerComponent,
    RouterLink,
    NoDataFoundBannerComponent,
    DropdownModule,
  ],
  templateUrl: './a-all-sub-categories.component.html',
  styleUrl: './a-all-sub-categories.component.scss',
  providers: [MessageService],
})
export class AAllSubCategoriesComponent {
 // Original data from API
 subCategories: subcategoriesData[] = [];
  
 // Filtered data to display in table
 filteredCategories: subcategoriesData[] = [];
 
 loading = true;
 categories: {
   value: string;
   label: string;
 }[] = [];

 private ngxSpinnerService = inject(NgxSpinnerService);
 private activatedRoute = inject(ActivatedRoute);
 private messageService = inject(MessageService);
 private subCategoryService = inject(SubCategoryService);
 private categoriesService = inject(CategoriesService);

 isSpecial = false;

 // Pagination properties
 totalRecords: number = 0;
 rowsPerPage = 10;
 
 // Sorting state
 sortField: string | null = null;
 sortOrder: number = 1;
 
 // Dropdown filters
 selectedStatus: string | null = null;
 selectedCategory: string | null = null;
 selectOptions: ISelectOptions[] = [];
 
 @ViewChild('dt') dt!: Table;

 ngOnInit() {
   this.initDropDownFilter();
   this.activatedRoute.queryParams.subscribe(params => {
     this.isSpecial = params['special'] === 'true' || params['special'] === '1';
     this.initAllCategories();
     this.fetchData();
   });
 }

 initAllCategories() {
   if (this.activatedRoute.snapshot.data['categories']) {
     this.categories = (
       this.activatedRoute.snapshot.data['categories'] as IAllCategory
     ).data.map((category: any) => ({
       value: category.id.toString(),
       label: category.en_name,
     }));
   } else {
     this.categoriesService.getAllCategories(1, 100, this.isSpecial).subscribe(res => {
       if (res && res.data) {
         this.categories = res.data.map((category: any) => ({
           value: category.id.toString(),
           label: category.en_name,
         }));
       }
     });
   }
 }

 initDropDownFilter(): void {
   this.selectOptions = [
     {
       label: 'Active',
       value: '1',
     },
     {
       label: 'Inactive',
       value: '0',
     },
   ];
 }

 fetchData() {
   this.loading = true;
   this.subCategoryService.getAllSubCategories(this.isSpecial).subscribe({
     next: (response) => {
       const list = response?.data ? [...response.data] : [];
       this.subCategories = list.reverse();
       this.applyFilters();
       this.loading = false;
     },
     error: () => {
       this.subCategories = [];
       this.filteredCategories = [];
       this.totalRecords = 0;
       this.messageService.add({
         severity: 'error',
         summary: 'Error',
         detail: 'Failed to load Sub Category',
       });
       this.loading = false;
     }
   });
 }

 applyFilters(): void {
   let filtered = [...this.subCategories];

   // Apply category filter
   if (this.selectedCategory !== null && this.selectedCategory !== '') {
     filtered = filtered.filter((item) =>
       item.category.id.toString() === this.selectedCategory
     );
   }

   // Apply status filter
   if (this.selectedStatus !== null && this.selectedStatus !== '') {
     filtered = filtered.filter((item) =>
       item.active_status.toString() === this.selectedStatus
     );
   }

   // Apply sorting
   if (this.sortField) {
     filtered.sort((a, b) => this.compareValues(a, b, this.sortField!, this.sortOrder));
   }

   this.filteredCategories = filtered;
   this.totalRecords = filtered.length;
   
   // Reset pagination to first page when filters change
  //  this.resetPagination();
 }

 // Helper method to reset pagination
 private resetPagination(): void {
   if (this.dt) {
     // Use setTimeout to ensure the table is updated
     setTimeout(() => {
       this.dt.first = 0;
     });
   }
 }

 compareValues(a: subcategoriesData, b: subcategoriesData, field: string, order: number): number {
   let valueA: any;
   let valueB: any;

   if (field === 'id') {
     valueA = Number(a.id);
     valueB = Number(b.id);
   } else if (field === 'en_name') {
     valueA = a.en_name;
     valueB = b.en_name;
   } else if (field === 'active_status') {
     valueA = a.active_status;
     valueB = b.active_status;
   } else if (field === 'category.en_name') {
     valueA = a.category.en_name;
     valueB = b.category.en_name;
   } else {
     valueA = (a as any)[field];
     valueB = (b as any)[field];
   }

   if (valueA === null || valueA === undefined) return order * -1;
   if (valueB === null || valueB === undefined) return order * 1;

   if (valueA < valueB) {
     return order * -1;
   } else if (valueA > valueB) {
     return order * 1;
   } else {
     return 0;
   }
 }

 onFilterChange(value: string | null, filterType: 'status' | 'category'): void {
   if (filterType === 'status') {
     this.selectedStatus = value;
   } else {
     this.selectedCategory = value;
   }
   this.applyFilters();
 }

 onGlobalFilter(dt: Table, event: any) {
   const value = event.target.value.toLowerCase();
   let filtered = [...this.subCategories];

   // Apply dropdown filters first
   if (this.selectedCategory !== null && this.selectedCategory !== '') {
     filtered = filtered.filter((item) =>
       item.category.id.toString() === this.selectedCategory
     );
   }

   if (this.selectedStatus !== null && this.selectedStatus !== '') {
     filtered = filtered.filter((item) =>
       item.active_status.toString() === this.selectedStatus
     );
   }

   // Apply global search
   if (value) {
     filtered = filtered.filter((subCategory) => {
       return (
         subCategory.id.toString().includes(value) ||
         subCategory.en_name.toLowerCase().includes(value) ||
         subCategory.ar_name.toLowerCase().includes(value) ||
         subCategory.category.en_name.toLowerCase().includes(value) ||
         (subCategory.active_status ? 'active' : 'inactive').includes(value) ||
         subCategory.created_at.toLowerCase().includes(value) ||
         subCategory.updated_at.toLowerCase().includes(value)
       );
     });
   }

   // Apply sorting
   if (this.sortField) {
     filtered.sort((a, b) => this.compareValues(a, b, this.sortField!, this.sortOrder));
   }

   this.filteredCategories = filtered;
   this.totalRecords = filtered.length;
   
   // Reset pagination
  //  this.resetPagination();
 }

 onSort(event: any) {
   this.sortField = event.field;
   this.sortOrder = event.order;
   this.applyFilters();
 }

 // Remove the onPageChange method as PrimeNG handles this internally

 toggleSubCategoryStatus(subCategory: subcategoriesData) {
   this.ngxSpinnerService.show('actionsLoader');
   this.messageService.clear();

   const updatedStatus = subCategory.active_status ? 0 : 1;
   const update$ = updatedStatus === 1
     ? this.subCategoryService.enableSubCategory(subCategory.id.toString(), this.isSpecial)
     : this.subCategoryService.destroySubCategory(subCategory.id.toString(), this.isSpecial);

   update$.subscribe({
     next: () => {
       subCategory.active_status = updatedStatus;
       this.applyFilters(); // Refresh the display
       this.messageService.add({
         severity: 'success',
         summary: 'Updated',
         detail: `Sub Category ${updatedStatus ? 'Enabled' : 'Disabled'} successfully`,
       });
       timer(200).subscribe(() =>
         this.ngxSpinnerService.hide('actionsLoader')
       );
     },
     error: () => {
       this.messageService.add({
         severity: 'error',
         summary: 'Error',
         detail: 'Failed to update sub category status',
       });
       this.ngxSpinnerService.hide('actionsLoader');
     }
   });
 }

 getPagination(): number[] {
   return [10, 25, 50, 100].sort((a, b) => a - b);
 }

 runSpinner() {
   this.ngxSpinnerService.show('actionsLoader');
 }
}
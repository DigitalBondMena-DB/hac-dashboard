import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { TagModule } from "primeng/tag";
import { categoryData } from "../../../../../../core/Interfaces/h-category/IAllCategory";
import { IGetSubCategoryById } from "../../../../../../core/Interfaces/q-sub-categories/IGetSubCategoryById";

@Component({
  selector: "app-b-sub-categories-details",
  standalone: true,
  imports: [TagModule, CommonModule, CardModule, ButtonModule, RouterLink],
  templateUrl: "./b-sub-categories-details.component.html",
  styleUrl: "./b-sub-categories-details.component.scss",
})
export class BSubCategoriesDetailsComponent {
  private ActivatedRoute = inject(ActivatedRoute);

  allCategories:categoryData[] = [];

  subCategoryData!: IGetSubCategoryById;
  isSpecial = false;

  ngOnInit(): void {
    this.isSpecial = this.ActivatedRoute.snapshot.queryParams['special'] === 'true' || this.ActivatedRoute.snapshot.queryParams['special'] === '1';
    this.subCategoryData = this.ActivatedRoute.snapshot.data['subCategory'];
    this.allCategories = this.ActivatedRoute.snapshot.data['categories'].data;
  }

  getCategoryNameById(categoryId:number) {
  return  this.allCategories.find((category) => {
    return  category.id == categoryId
    })?.en_name || '';
  }
}

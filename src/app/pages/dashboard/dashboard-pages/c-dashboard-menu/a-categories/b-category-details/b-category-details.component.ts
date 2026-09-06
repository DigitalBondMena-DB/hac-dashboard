import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { TagModule } from "primeng/tag";
import { IGetSubCategoryById } from "./../../../../../../core/Interfaces/q-sub-categories/IGetSubCategoryById";

@Component({
  selector: "app-b-category-details",
  standalone: true,
  imports: [TagModule, CommonModule, CardModule, ButtonModule, RouterLink],
  templateUrl: "./b-category-details.component.html",
  styleUrl: "./b-category-details.component.scss",
})
export class BCategoryDetailsComponent {
  private ActivatedRoute = inject(ActivatedRoute);

  SubCategory!: IGetSubCategoryById;

  ngOnInit(): void {
    this.SubCategory = this.ActivatedRoute.snapshot.data["subCategory"] as IGetSubCategoryById;
  }
}

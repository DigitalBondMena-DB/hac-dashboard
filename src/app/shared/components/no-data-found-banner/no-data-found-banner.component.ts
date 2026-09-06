/**
 * @file no-data-found-banner.component.ts
 * @description Reusable component for displaying no data found state
 *
 * This component provides:
 * - Consistent empty state visualization
 * - Reusable across different parts of the application
 * - Clean and simple interface
 *
 * Features:
 * - Standalone component
 * - Zero dependencies
 * - Consistent styling
 * - Easy integration
 *
 * @exports NoDataFoundBannerComponent - Component for displaying no data found state
 */

import { Component } from '@angular/core';

@Component({
  selector: 'app-no-data-found-banner',
  standalone: true,
  imports: [],
  templateUrl: './no-data-found-banner.component.html',
  styleUrl: './no-data-found-banner.component.scss'
})
export class NoDataFoundBannerComponent {

}

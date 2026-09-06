import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { LoadingDataBannerComponent } from '../../../../../../shared/components/loading-data-banner/loading-data-banner.component';
import { BreaksCountersService, Break, SingleBreakResponse } from '../../service/countersandbreaks.service';

@Component({
  selector: 'app-view-break',
  standalone: true,
  imports: [
    ButtonModule,
    ToastModule,
    NgxSpinnerModule,
    RouterLink,
    LoadingDataBannerComponent,
    CommonModule
  ],
  templateUrl: './view-breaks.component.html',
  styleUrl: './view-breaks.component.scss',
  providers: [MessageService]
})
export class ViewBreaksComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private breaksService = inject(BreaksCountersService);
  private messageService = inject(MessageService);
  private ngxSpinnerService = inject(NgxSpinnerService);

  breakId: string = '';
  break: Break | null = null;
  isLoading: boolean = true;

  ngOnInit() {
    this.breakId = this.route.snapshot.paramMap.get('id') || '';
    if (this.breakId) {
      this.fetchBreak();
    } else {
      this.isLoading = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
 detail: 'Invalid break ID'
      });
    }
  }

  fetchBreak() {
    this.ngxSpinnerService.show('actionsLoader');
    this.breaksService.getBreakById(Number(this.breakId)).subscribe({
      next: (response: SingleBreakResponse) => {
        this.break = response.row;
        this.isLoading = false;
        this.ngxSpinnerService.hide('actionsLoader');
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load break data'
        });
        this.isLoading = false;
        this.ngxSpinnerService.hide('actionsLoader');
      }
    });
  }

  navigateToEdit() {
    this.router.navigate(['/dashboard/breaks/edit-break', this.breakId]);
  }

  navigateBack() {
    this.router.navigate(['/dashboard/breaks']);
  }
}
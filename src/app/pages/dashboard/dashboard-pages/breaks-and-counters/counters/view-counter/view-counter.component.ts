import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { LoadingDataBannerComponent } from '../../../../../../shared/components/loading-data-banner/loading-data-banner.component';
import { BreaksCountersService, Counter, SingleCounterResponse } from '../../service/countersandbreaks.service';

@Component({
  selector: 'app-view-counter',
  standalone: true,
  imports: [
    ButtonModule,
    ToastModule,
    NgxSpinnerModule,
    RouterLink,
    LoadingDataBannerComponent,
    CommonModule
  ],
  templateUrl: './view-counter.component.html',
  styleUrl: './view-counter.component.scss',
  providers: [MessageService]
})
export class ViewCounterComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private countersService = inject(BreaksCountersService);
  private messageService = inject(MessageService);
  private ngxSpinnerService = inject(NgxSpinnerService);

  counterId: string = '';
  counter: Counter | null = null;
  isLoading: boolean = true;

  ngOnInit() {
    this.counterId = this.route.snapshot.paramMap.get('id') || '';
    if (this.counterId) {
      this.fetchCounter();
    } else {
      this.isLoading = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid counter ID'
      });
    }
  }

  fetchCounter() {
    this.ngxSpinnerService.show('actionsLoader');
    this.countersService.getCounterById(Number(this.counterId)).subscribe({
      next: (response: SingleCounterResponse) => {
        this.counter = response.row;
        this.isLoading = false;
        this.ngxSpinnerService.hide('actionsLoader');
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load counter data'
        });
        this.isLoading = false;
        this.ngxSpinnerService.hide('actionsLoader');
      }
    });
  }

  navigateToEdit() {
    this.router.navigate(['/dashboard/counters/edit-counter', this.counterId]);
  }

  navigateBack() {
    this.router.navigate(['/dashboard/counters']);
  }
}
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { LoadingDataBannerComponent } from '../../../../../../shared/components/loading-data-banner/loading-data-banner.component';
import { SafeHtmlPipe } from '../../../../../../core/pipes/safe-html.pipe';
import { Faq, FaqsService, SingleFaqResponse } from '../../services/faq.service';

@Component({
  selector: 'app-view-faq',
  standalone: true,
  imports: [
    ButtonModule,
    ToastModule,
    NgxSpinnerModule,
    RouterLink,
    LoadingDataBannerComponent,
    CommonModule,
    SafeHtmlPipe
  ],
  templateUrl: './view-faqs.component.html',
  styleUrl: './view-faqs.component.scss',
  providers: [MessageService, SafeHtmlPipe]
})
export class ViewFaqComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private faqsService = inject(FaqsService);
  private messageService = inject(MessageService);
  private ngxSpinnerService = inject(NgxSpinnerService);

  faqId: string = '';
  faq: Faq | null = null;
  isLoading: boolean = true;

  ngOnInit() {
    this.faqId = this.route.snapshot.paramMap.get('id') || '';
    if (this.faqId) {
      this.fetchFaq();
    } else {
      this.isLoading = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid FAQ ID'
      });
    }
  }

  fetchFaq() {
    this.ngxSpinnerService.show('actionsLoader');
    this.faqsService.getFaqById(this.faqId).subscribe({
      next: (response: SingleFaqResponse) => {
        this.faq = response.row;
        this.isLoading = false;
        this.ngxSpinnerService.hide('actionsLoader');
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load FAQ data'
        });
        this.isLoading = false;
        this.ngxSpinnerService.hide('actionsLoader');
      }
    });
  }

  navigateToEdit() {
    this.router.navigate(['/dashboard/faqs/edit-faq', this.faqId]);
  }

  navigateBack() {
    this.router.navigate(['/dashboard/faqs']);
  }
}
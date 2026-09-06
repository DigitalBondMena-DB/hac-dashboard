import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { LoadingDataBannerComponent } from '../../../../../../shared/components/loading-data-banner/loading-data-banner.component';
import { ContactFormsService, ContactForm, SingleContactFormResponse } from '../../service/feedback.service';

@Component({
  selector: 'app-view-contact-form',
  standalone: true,
  imports: [
    ButtonModule,
    ToastModule,
    NgxSpinnerModule,
    RouterLink,
    LoadingDataBannerComponent,
    CommonModule
  ],
  templateUrl: './view-feed-back.component.html',
  styleUrl: './view-feed-back.component.scss',
  providers: [MessageService]
})
export class ViewContactFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private contactFormsService = inject(ContactFormsService);
  private messageService = inject(MessageService);
  private ngxSpinnerService = inject(NgxSpinnerService);

  formId: string = '';
  contactForm: ContactForm | null = null;
  isLoading: boolean = true;

  ngOnInit() {
    this.formId = this.route.snapshot.paramMap.get('id') || '';
    if (this.formId) {
      this.fetchContactForm();
    } else {
      this.isLoading = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid form ID'
      });
    }
  }

  fetchContactForm() {
    this.ngxSpinnerService.show('actionsLoader');
    this.contactFormsService.getContactFormById(Number(this.formId)).subscribe({
      next: (response: SingleContactFormResponse) => {
        this.contactForm = response.row;
        this.isLoading = false;
        this.ngxSpinnerService.hide('actionsLoader');
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load contact form data'
        });
        this.isLoading = false;
        this.ngxSpinnerService.hide('actionsLoader');
      }
    });
  }

  navigateBack() {
    this.router.navigate(['/dashboard/feedbacks']);
  }
}
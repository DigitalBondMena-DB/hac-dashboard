import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ApiResponse, Contact, ContactService, UpdateResponse } from '../services/contact.service';
import { LoadingDataBannerComponent } from "../../../../../shared/components/loading-data-banner/loading-data-banner.component";
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';
import { Message } from 'primeng/api';

@Component({
  selector: 'app-social-links',
  standalone: true,
  imports: [
    LoadingDataBannerComponent,
    CommonModule,
    ReactiveFormsModule,
    ToastModule,
    NgxSpinnerModule,
    ButtonModule,
    InputTextModule,
    MessagesModule
  ],
  templateUrl: './social-links.component.html',
  styleUrl: './social-links.component.scss',
  providers: [MessageService]
})
export class SocialLinksComponent {
  private fb = inject(FormBuilder);
  private contactService = inject(ContactService);
  private ngxSpinnerService = inject(NgxSpinnerService);
  private messageService = inject(MessageService);
  
  contactForm: FormGroup | null = null;
  originalData: Contact | null = null;
  isLoading = false;
  messages: Message[] = [];
  
  ngOnInit() {
    this.loadContactInfo();
  }
  
  private loadContactInfo() {
    this.isLoading = true;
    this.ngxSpinnerService.show('contactSpinner');
    this.contactService.getContactInfo().subscribe({
      next: (response: ApiResponse) => {
        this.originalData = response.rows;
        this.initializeForm(response.rows);
        this.ngxSpinnerService.hide('contactSpinner');
        this.isLoading = false;
      },
      error: () => {
        this.ngxSpinnerService.hide('contactSpinner');
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Something went wrong'
        });
        this.messages = [
          { severity: 'error', summary: 'Error', detail: 'Something went wrong' }
        ];
      }
    });
  }
  
  private initializeForm(data: Contact) {
    this.contactForm = this.fb.group({
      en_address: [data.en_address, Validators.required],
      ar_address: [data.ar_address, Validators.required],
      phone: [data.phone, Validators.required],
      email: [data.email, [Validators.required, Validators.email]],
      facebook: [data.facebook],
      twitter: [data.twitter],
      instagram: [data.instagram],
      linkedin: [data.linkedin]
    });
  }
  
  onSubmit() {
    if (this.contactForm?.valid && this.contactForm?.dirty) {
      this.isLoading = true;
      this.ngxSpinnerService.show('contactSpinner');
      const formData = this.contactForm.value;
      
      this.contactService.updateContactInfo(formData).subscribe({
        next: (response: UpdateResponse) => {
          this.ngxSpinnerService.hide('contactSpinner');
          this.isLoading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: response.success
          });
          this.messages = [
            { severity: 'success', summary: 'Success', detail: response.success }
          ];
          this.originalData = response.contact;
          this.contactForm?.markAsPristine();
        },
        error: () => {
          this.ngxSpinnerService.hide('contactSpinner');
          this.isLoading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Something went wrong'
          });
          this.messages = [
            { severity: 'error', summary: 'Error', detail: 'Something went wrong' }
          ];
        }
      });
    }
  }
}

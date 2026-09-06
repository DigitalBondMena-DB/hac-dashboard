import { NgxJoditComponent } from 'ngx-jodit';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { InputSwitchModule } from 'primeng/inputswitch';
import { CommonModule } from '@angular/common';
import { FaqsService, SingleFaqResponse } from '../../services/faq.service';

@Component({
  selector: 'app-add-faq',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    NgxSpinnerModule,
    RouterLink,
    CommonModule,
    InputSwitchModule,
    NgxJoditComponent
  ],
  templateUrl: './add-faqs.component.html',
  styleUrl: './add-faqs.component.scss',
  providers: [MessageService]
})
export class AddFaqComponent implements OnInit {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private faqsService = inject(FaqsService);
  private messageService = inject(MessageService);
  private ngxSpinnerService = inject(NgxSpinnerService);
  private route = inject(ActivatedRoute);

  faqForm!: FormGroup;
  isSubmitting: boolean = false;
  isEditMode: boolean = false;
  faqId: string | null = null;

  constructor() {}

  ngOnInit() {
    this.ngxSpinnerService.show('actionsLoader');
    this.initializeForm();
    this.checkMode();
       this.ngxSpinnerService.hide('actionsLoader');

  }

  initializeForm() {
    this.faqForm = this.fb.group({
      en_title: ['', Validators.required],
      ar_title: ['', Validators.required],
      en_text: ['', Validators.required],
      ar_text: ['', Validators.required],
      active_status: [1, Validators.required]
    });
    this.faqForm.markAsPristine();
  }

  checkMode() {
    this.route.url.subscribe(segments => {
      this.isEditMode = segments.some(segment => segment.path.includes('edit'));
      if (this.isEditMode) {
        this.faqId = this.route.snapshot.paramMap.get('id');
        if (this.faqId) {
          this.loadFaqData(this.faqId);
        }
      }
    });
  }

  loadFaqData(id: string) {
    this.ngxSpinnerService.show('actionsLoader');
    this.faqsService.getFaqById(id).subscribe({
      next: (response: SingleFaqResponse) => {
        const faq = response.row;
        this.faqForm.patchValue({
          en_title: faq.en_title,
          ar_title: faq.ar_title,
          en_text: faq.en_text,
          ar_text: faq.ar_text,
          active_status: faq.active_status
        });
        this.ngxSpinnerService.hide('actionsLoader');
      },
      error: (error: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Failed to load FAQ data'
        });
        this.ngxSpinnerService.hide('actionsLoader');
      }
    });
  }

  onActiveStatusChange(event: any) {
    this.faqForm.patchValue({ active_status: event.checked ? 1 : 0 });
  }

  onSubmit() {
    if (this.faqForm.invalid) {
      this.faqForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.ngxSpinnerService.show('actionsLoader');

    const formData = new FormData();
    const faqData = this.faqForm.value as { [key: string]: string | number };


    // Append FAQ data
    Object.keys(faqData).forEach(key => {
      const value = faqData[key];
      if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });
console.log(formData);
    const apiCall = this.isEditMode && this.faqId
      ? this.faqsService.updateFaq(this.faqId, formData)
      : this.faqsService.createFaq(formData);

    apiCall.subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: response.success || `FAQ ${this.isEditMode ? 'updated' : 'created'} successfully`
        });
        this.faqForm.reset();
        this.faqForm.markAsPristine();
        this.isSubmitting = false;
        this.ngxSpinnerService.hide('actionsLoader');
        this.router.navigate(['/dashboard/faqs']);
        // setTimeout(() => {
        // }, 1000);
      },
      error: (error: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || `Failed to ${this.isEditMode ? 'update' : 'create'} FAQ`
        });
        this.isSubmitting = false;
        this.ngxSpinnerService.hide('actionsLoader');
      }
    });
  }
}
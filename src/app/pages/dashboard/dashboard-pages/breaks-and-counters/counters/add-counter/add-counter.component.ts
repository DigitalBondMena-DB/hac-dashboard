import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { BreaksCountersService, SingleCounterResponse } from '../../service/countersandbreaks.service';

@Component({
  selector: 'app-add-counter',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    NgxSpinnerModule,
    RouterLink,
    CommonModule
  ],
  templateUrl: './add-counter.component.html',
  styleUrl: './add-counter.component.scss',
  providers: [MessageService]
})
export class AddCounterComponent implements OnInit {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private countersService = inject(BreaksCountersService);
  private messageService = inject(MessageService);
  private ngxSpinnerService = inject(NgxSpinnerService);
  private route = inject(ActivatedRoute);

  counterForm!: FormGroup;
  isSubmitting: boolean = false;
  isEditMode: boolean = false;
  counterId: string | null = null;

  ngOnInit() {
        this.ngxSpinnerService.show('actionsLoader');

    this.initializeForm();
    this.checkMode();
                // this.ngxSpinnerService.hide('actionsLoader');

  }

  initializeForm() {
    this.counterForm = this.fb.group({
      en_name: ['', Validators.required],
      ar_name: ['', Validators.required],
      counter_value: ['', Validators.required]
    });
    this.counterForm.markAsPristine();
  }

  checkMode() {
    this.route.url.subscribe(segments => {
      this.isEditMode = segments.some(segment => segment.path.includes('edit'));
      if (this.isEditMode) {
        this.counterId = this.route.snapshot.paramMap.get('id');
        if (this.counterId) {
          this.loadCounterData(this.counterId);
        }
      }
    });
  }

  loadCounterData(id: string) {
    this.ngxSpinnerService.show('actionsLoader');
    this.countersService.getCounterById(Number(id)).subscribe({
      next: (response: SingleCounterResponse) => {
        const counter = response.row;
        this.counterForm.patchValue({
          en_name: counter.en_name,
          ar_name: counter.ar_name,
          counter_value: counter.counter_value
        });
        this.ngxSpinnerService.hide('actionsLoader');
      },
      error: (error: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Failed to load counter data'
        });
        this.ngxSpinnerService.hide('actionsLoader');
      }
    });
  }

  onSubmit() {
    if (this.counterForm.invalid) {
      this.counterForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.ngxSpinnerService.show('actionsLoader');

    const formData = this.counterForm.value;
    const apiCall = this.isEditMode && this.counterId
      ? this.countersService.updateCounter(Number(this.counterId), formData)
      : this.countersService.updateCounter(0, formData); // Assuming 0 for create

    apiCall.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Counter ${this.isEditMode ? 'updated' : 'created'} successfully`
        });
        this.counterForm.reset();
        this.counterForm.markAsPristine();
        this.isSubmitting = false;
        this.ngxSpinnerService.hide('actionsLoader');
        this.router.navigate(['/dashboard/counters']);
        // setTimeout(() => {
        // }, 1000);
      },
      error: (error: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || `Failed to ${this.isEditMode ? 'update' : 'create'} counter`
        });
        this.isSubmitting = false;
        this.ngxSpinnerService.hide('actionsLoader');
      }
    });
  }
}
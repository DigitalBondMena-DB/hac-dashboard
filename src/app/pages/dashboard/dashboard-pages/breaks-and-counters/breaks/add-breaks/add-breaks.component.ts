import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { BreaksCountersService, SingleBreakResponse } from '../../service/countersandbreaks.service';

@Component({
  selector: 'app-edit-break',
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
  templateUrl: './add-breaks.component.html',
  styleUrl: './add-breaks.component.scss',
  providers: [MessageService]
})
export class AddBreaksComponent implements OnInit {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private breaksService = inject(BreaksCountersService);
  private messageService = inject(MessageService);
  private ngxSpinnerService = inject(NgxSpinnerService);
  private route = inject(ActivatedRoute);

  breakForm!: FormGroup;
  isSubmitting: boolean = false;
  isEditMode: boolean = false;
  breakId: string | null = null;

  ngOnInit() {
        this.ngxSpinnerService.show('actionsLoader');

    this.initializeForm();
    this.checkMode();
                // this.ngxSpinnerService.hide('actionsLoader');

  }

  initializeForm() {
    this.breakForm = this.fb.group({
      en_name: ['', Validators.required],
      ar_name: ['', Validators.required],
      order_by: ['', Validators.required]
    });
    this.breakForm.markAsPristine();
  }

  checkMode() {
    this.route.url.subscribe(segments => {
      this.isEditMode = segments.some(segment => segment.path.includes('edit'));
      if (this.isEditMode) {
        this.breakId = this.route.snapshot.paramMap.get('id');
        if (this.breakId) {
          this.loadBreakData(this.breakId);
        }
      }
    });
  }

  loadBreakData(id: string) {
    this.ngxSpinnerService.show('actionsLoader');
    this.breaksService.getBreakById(Number(id)).subscribe({
      next: (response: SingleBreakResponse) => {
        const brk = response.row;
        this.breakForm.patchValue({
          en_name: brk.en_name,
          ar_name: brk.ar_name,
          order_by: brk.order_by
        });
        this.ngxSpinnerService.hide('actionsLoader');
      },
      error: (error: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Failed to load break data'
        });
        this.ngxSpinnerService.hide('actionsLoader');
      }
    });
  }

  onSubmit() {
    if (this.breakForm.invalid) {
      this.breakForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.ngxSpinnerService.show('actionsLoader');

    const formData = this.breakForm.value;
    const apiCall = this.isEditMode && this.breakId
      ? this.breaksService.updateBreak(Number(this.breakId), formData)
      : this.breaksService.updateBreak(0, formData); // Assuming 0 for create

    apiCall.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Break ${this.isEditMode ? 'updated' : 'created'} successfully`
        });
        this.breakForm.reset();
        this.breakForm.markAsPristine();
        this.isSubmitting = false;
        this.ngxSpinnerService.hide('actionsLoader');
        this.router.navigate(['/dashboard/breaks']);
        // setTimeout(() => {
        // }, 1000);
      },
      error: (error: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || `Failed to ${this.isEditMode ? 'update' : 'create'} break`
        });
        this.isSubmitting = false;
        this.ngxSpinnerService.hide('actionsLoader');
      }
    });
  }
}
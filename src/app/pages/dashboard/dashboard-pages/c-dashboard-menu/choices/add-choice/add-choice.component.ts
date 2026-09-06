import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ProductsService } from '../../../../../../core/services/d-products/products.service';
import { CommonModule } from '@angular/common';

interface AddChoicesResponse {
  success: string;
}

@Component({
  selector: 'app-add-choices',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputSwitchModule,
    ToastModule,
    CommonModule,
    NgxSpinnerModule
  ],
  templateUrl: './add-choice.component.html',
  styleUrl: './add-choice.component.scss',
  providers: [MessageService],
})
export class AddChoiceComponent implements OnInit {
  choicesForm: FormGroup;
  isSubmitting = false;
  productId: string | null = null;
  isSpecial = false;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private ngxSpinnerService = inject(NgxSpinnerService);
  private messageService = inject(MessageService);
  private productsService = inject(ProductsService);

  constructor() {
    this.choicesForm = this.fb.group({
      choices: this.fb.array([this.createChoiceGroup()]),
    });
  }

  ngOnInit() {
    this.productId = this.route.snapshot.paramMap.get('id');
    this.isSpecial = this.route.snapshot.queryParams['special'] === 'true' || this.route.snapshot.queryParams['special'] === '1';
    if (!this.productId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Product ID not found in URL',
      });
    }
  }

  get choicesArray(): FormArray {
    return this.choicesForm.get('choices') as FormArray;
  }

  createChoiceGroup(): FormGroup {
    return this.fb.group({
      en_name: ['', Validators.required],
      ar_name: ['', Validators.required],
      current_value: ['', [
        Validators.required,
        Validators.pattern('^[0-9]*\\.?[0-9]+$'),
        Validators.min(0.01)
      ]],
      active_status: [true],
    });
  }

  addChoice() {
    this.choicesArray.push(this.createChoiceGroup());
  }

  removeChoice(index: number) {
    this.choicesArray.removeAt(index);
  }

  restrictInput(event: KeyboardEvent) {
    const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', 'Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'];
    const input = event.target as HTMLInputElement;
    
    // Prevent multiple decimals
    if (event.key === '.' && input.value.includes('.')) {
      event.preventDefault();
      return;
    }

    // Allow only numbers, one decimal point, and navigation keys
    if (!allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  onSubmit() {
    if (this.choicesForm.invalid || !this.productId) {
      this.choicesForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.ngxSpinnerService.show("actionsLoader");

    const formData = new FormData();
    this.choicesArray.controls.forEach((choice, index) => {
      formData.append(`choices[${index}][en_name]`, choice.get('en_name')?.value);
      formData.append(`choices[${index}][ar_name]`, choice.get('ar_name')?.value);
      formData.append(`choices[${index}][cuurent_value]`, choice.get('current_value')?.value);
      formData.append(`choices[${index}][active_status]`, choice.get('active_status')?.value ? '1' : '0');
    });

    this.productsService
      .addChoices(this.productId, formData, this.isSpecial)
      .subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail:"Choices added Successfully"
          });
          this.isSubmitting = false;
          this.ngxSpinnerService.hide("actionsLoader");
          this.router.navigate([`/dashboard/menu/products/products-choice/${this.productId}`], {
            queryParams: this.isSpecial ? { special: 'true' } : undefined
          });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to add choices',
          });
          this.isSubmitting = false;
          this.ngxSpinnerService.hide("actionsLoader");
        },
      });
  }
}
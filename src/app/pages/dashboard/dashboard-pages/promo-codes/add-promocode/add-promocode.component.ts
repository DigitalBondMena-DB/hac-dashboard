import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, ValidationErrors, AbstractControl } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MultiSelectModule } from 'primeng/multiselect';
import { PromoCodeData, PromoCodeService } from '../service/promocode.service';
import { ProductsService } from '../../../../../core/services/d-products/products.service';

// Custom validator to restrict past dates
function restrictPastDates(control: AbstractControl): ValidationErrors | null {
  const selectedDate = new Date(control.value);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day
  if (selectedDate < today) {
    return { pastDate: true };
  }
  return null;
}

@Component({
  selector: 'app-add-promocode',
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
    MultiSelectModule
  ],
  templateUrl: './add-promocode.component.html',
  styleUrl: './add-promocode.component.scss',
  providers: [MessageService]
})
export class AddPromocodeComponent implements OnInit {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private promoCodeService = inject(PromoCodeService);
  private messageService = inject(MessageService);
  private ngxSpinnerService = inject(NgxSpinnerService);
  private route = inject(ActivatedRoute);
  private productsService = inject(ProductsService);

  promocodeForm: FormGroup;
  isSubmitting: boolean = false;
  minDate: string = new Date().toISOString().split('T')[0];
  products: { id: number, name: string }[] = [];
  selectedProducts: { id: number, name: string }[] = [];

  constructor() {
    this.promocodeForm = this.fb.group({
      code: ['', Validators.required],
      value: ['', [
        Validators.required,
        Validators.min(0),
        Validators.max(100),
        Validators.pattern(/^\d+(\.\d{1,2})?$/)
      ]],
      active_status: [true],
      uses_count: [true],
      first_order_status: [{ value: false, disabled: true }],
      expired_date: ['', [Validators.required, restrictPastDates]],
      product_ids: [[]]
    });

    // Enable/disable first_order_status based on uses_count
    this.promocodeForm.get('uses_count')?.valueChanges.subscribe((usesCount: boolean) => {
      const firstOrderControl = this.promocodeForm.get('first_order_status');
      if (usesCount) {
        firstOrderControl?.setValue(false);
        firstOrderControl?.disable();
      } else {
        firstOrderControl?.enable();
      }
    });
  }

  ngOnInit() {
    this.initializeForm();
    this.route.data.subscribe(data => {
      this.products = data['products'];
    });
  }

  initializeForm() {
    this.promocodeForm = this.fb.group({
      code: ['', Validators.required],
      value: ['', [
        Validators.required,
        Validators.min(0),
        Validators.max(100),
        Validators.pattern(/^\d+(\.\d{1,2})?$/)
      ]],
      active_status: [true],
      uses_count: [true],
      first_order_status: [{ value: false, disabled: true }],
      expired_date: ['', [Validators.required, restrictPastDates]],
      product_ids: [[]]
    });

    // Enable/disable first_order_status based on uses_count
    this.promocodeForm.get('uses_count')?.valueChanges.subscribe((usesCount: boolean) => {
      const firstOrderControl = this.promocodeForm.get('first_order_status');
      if (usesCount) {
        firstOrderControl?.setValue(false);
        firstOrderControl?.disable();
      } else {
        firstOrderControl?.enable();
      }
    });

    this.promocodeForm.markAsPristine();
  }

  restrictInput(event: KeyboardEvent) {
    const allowedKeys = [
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.',
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'
    ];

    const input = event.target as HTMLInputElement;
    const currentValue = input.value;
    const newValue = currentValue + event.key;

    if (!allowedKeys.includes(event.key)) {
      event.preventDefault();
    }

    if (event.key === '.' && currentValue.includes('.')) {
      event.preventDefault();
    }

    if (!isNaN(Number(newValue)) && Number(newValue) > 100) {
      event.preventDefault();
    }
  }

  onSubmit() {
    if (this.promocodeForm.invalid) {
      this.promocodeForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.ngxSpinnerService.show('actionsLoader');
    const formData = new FormData();
    const formValue = this.promocodeForm.value;

    formData.append('code', formValue.code);
    formData.append('value', formValue.value);
    formData.append('active_status', formValue.active_status ? '1' : '0');
    formData.append('uses_count', formValue.uses_count ? '1' : '0');
    formData.append('first_order_status', formValue.first_order_status ? '1' : '0');
    formData.append('expired_date', formValue.expired_date);
    if (formValue.product_ids.length > 0) {
      formValue.product_ids.forEach((id: number, index: number) => {
        formData.append(`product_ids[${index}]`, id.toString());
      });
    } else {
      formData.append('product_ids[0]', '');
    }
console.log(formData)
    this.promoCodeService.createPromoCode(formData).subscribe({
      next: (response: PromoCodeData) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Promo code created successfully'
        });

        this.promocodeForm.reset();
        this.promocodeForm.markAsPristine();
        this.isSubmitting = false;
        this.ngxSpinnerService.hide('actionsLoader');

        setTimeout(() => {
          this.router.navigate(['/dashboard/promo-codes']);
        }, 1000);
      },
      error: (error) => {
        const errorMessage = error.error?.errors?.code?.[0] || error.error?.message || 'Failed to create promo code';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage
        });
        this.isSubmitting = false;
        this.ngxSpinnerService.hide('actionsLoader');
      }
    });
  }
}
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, ValidationErrors, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { LoadingDataBannerComponent } from '../../../../../shared/components/loading-data-banner/loading-data-banner.component';
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
  selector: 'app-edit-promocode',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    NgxSpinnerModule,
    RouterLink,
    LoadingDataBannerComponent,
    CommonModule,
    InputSwitchModule,
    MultiSelectModule
  ],
  templateUrl: './edit-promocode.component.html',
  styleUrl: './edit-promocode.component.scss',
  providers: [MessageService]
})
export class EditPromocodeComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private promoCodeService = inject(PromoCodeService);
  private messageService = inject(MessageService);
  private ngxSpinnerService = inject(NgxSpinnerService);
  private productsService = inject(ProductsService);

  promocodeForm: FormGroup;
  isLoading: boolean = true;
  isSubmitting: boolean = false;
  promocodeId: string = '';
  originalData: PromoCodeData | null = null;
  minDate: string = new Date().toISOString().split('T')[0];
  products: { id: number, name: string }[] = [];

  constructor() {
    this.promocodeForm = this.fb.group({
      mockingbird: ['', Validators.required],
      value: ['', [Validators.required, Validators.min(0), Validators.max(100), Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      active_status: [false],
      uses_count: [false],
      first_order_status: [{ value: false, disabled: true }],
      expired_date: ['', [Validators.required]],
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
    this.promocodeId = this.route.snapshot.paramMap.get('id') || '';
    if (this.promocodeId) {
      this.route.data.subscribe(data => {
        this.products = data['products'];
        this.fetchPromocode();
      });
    } else {
      this.isLoading = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid promo code ID'
      });
    }
  }

  fetchPromocode() {
    this.ngxSpinnerService.show('actionsLoader');
    this.promoCodeService.getPromoCodeById(this.promocodeId).subscribe({
      next: (promocode: PromoCodeData) => {
        this.originalData = promocode;
        this.initializeForm(promocode);
        this.isLoading = false;
        this.ngxSpinnerService.hide('actionsLoader');
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load promo code data'
        });
        this.isLoading = false;
        this.ngxSpinnerService.hide('actionsLoader');
      }
    });
  }

  initializeForm(data: PromoCodeData) {
    // Extract product IDs from the promo code's product_i_ds array
    const productIds = data.product_i_ds?.map(item => item.product_id) || [];
    
    // Filter to only include products that exist in your products list
    const validProductIds = productIds.filter(id => 
      this.products.some(p => p.id === id)
    );

    this.promocodeForm = this.fb.group({
      code: [data.code, Validators.required],
      value: [data.value, [
        Validators.required,
        Validators.min(0),
        Validators.max(100),
        Validators.pattern(/^\d+(\.\d{1,2})?$/)
      ]],
      active_status: [data.active_status || false],
      uses_count: [data.uses_count >= 1],
      first_order_status: [{ value: data.first_order_status === 1, disabled: data.uses_count >= 1 }],
      expired_date: [data.expired_date, [Validators.required, restrictPastDates]],
      product_ids: [validProductIds]  
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

    // Check if expired_date is in the past and mark as touched to show error
    const expiredDateControl = this.promocodeForm.get('expired_date');
    if (expiredDateControl?.value) {
      const validationErrors = restrictPastDates(expiredDateControl);
      if (validationErrors?.['pastDate']) {
        expiredDateControl.markAsTouched();
        
      }
    }

    this.promocodeForm.get('expired_date')?.setValidators([Validators.required, restrictPastDates]);
    this.promocodeForm.get('expired_date')?.updateValueAndValidity();
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

    if (!this.promocodeForm.dirty) {
      this.messageService.add({
        severity: 'info',
        summary: 'Info',
        detail: 'No changes to save'
      });
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

    this.promoCodeService.updatePromoCode(this.promocodeId, formData).subscribe({
      next: (response) => {
        const newStatus = formValue.active_status;
        if (newStatus !== this.originalData?.active_status) {
          if (newStatus) {
            this.promoCodeService.enablePromoCode(this.promocodeId).subscribe();
          } else {
            this.promoCodeService.disablePromoCode(this.promocodeId).subscribe();
          }
        }

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Promo code updated successfully'
        });

        if (this.originalData) {
          this.originalData = {
            ...this.originalData,
            ...formValue,
            first_order_status: formValue.first_order_status ? 1 : 0,
            product_i_ds: formValue.product_ids.map((id: number) => ({
              id: 0, // Placeholder, as ID may be assigned by backend
              promo_code_id: this.originalData!.id,
              product_id: id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }))
          };
        }
        this.promocodeForm.markAsPristine();

        this.isSubmitting = false;
        this.ngxSpinnerService.hide('actionsLoader');

        setTimeout(() => {
          this.router.navigate(['/dashboard/promo-codes']);
        }, 1000);
      },
      error: (error) => {
        const errorMessage = error.error?.errors?.code?.[0] || error.error?.message || 'Failed to update promo code';
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
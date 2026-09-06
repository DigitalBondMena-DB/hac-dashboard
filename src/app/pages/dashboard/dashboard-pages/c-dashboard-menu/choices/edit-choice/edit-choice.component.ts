import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { ProductChoice } from '../../../../../../core/Interfaces/d-products/IGetAllProducts';
import { ProductsService } from '../../../../../../core/services/d-products/products.service';

interface UpdateChoiceResponse {
  success: string;
}

@Component({
  selector: 'app-edit-choice',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputSwitchModule,
    ToastModule,
    CommonModule,
    DropdownModule,
    NgxSpinnerModule
  ],
  templateUrl: './edit-choice.component.html',
  styleUrl: './edit-choice.component.scss',
  providers: [MessageService],
})
export class EditChoiceComponent implements OnInit {
  choiceForm: FormGroup;
  choiceData: ProductChoice | null = null;
  isLoading = true;
  isSubmitting = false;
  choiceId: string | null = null;
  isSpecial = false;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private ngxSpinnerService = inject(NgxSpinnerService);
  private messageService = inject(MessageService);
  private productsService = inject(ProductsService);

  constructor() {
    this.choiceForm = this.fb.group({
      en_name: ['', Validators.required],
      ar_name: ['', Validators.required],
      current_value: ['', [
        Validators.required,
        Validators.pattern('^[0-9]+$'), // Only digits allowed
        Validators.min(1) // Minimum value of 1
      ]],
      active_status: [true],
    });
  }

  ngOnInit() {
    this.ngxSpinnerService.show("actionsLoader");
    this.choiceId = this.route.snapshot.paramMap.get('id');
    this.isSpecial = this.route.snapshot.queryParams['special'] === 'true' || this.route.snapshot.queryParams['special'] === '1';
    
    if (!this.choiceId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Choice ID not found',
      });
      this.router.navigate(['/dashboard/menu/products'], {
        queryParams: this.isSpecial ? { special: 'true' } : undefined
      });
      return;
    }
    
    this.loadChoiceFromLocalStorage();
    this.ngxSpinnerService.hide("actionsLoader");
  }

  // Restrict input to numbers only
  restrictInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Remove any non-digit characters
    value = value.replace(/[^0-9]/g, '');

    // Update the input value
    input.value = value;

    // Update the form control value
    this.choiceForm.get('current_value')?.setValue(value, { emitEvent: false });
  }

  loadChoiceFromLocalStorage() {
    try {
      const storedData = localStorage.getItem('choiceData');
      
      if (!storedData) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No choice data found in local storage',
        });
        this.isLoading = false;
        return;
      }
      
      this.choiceData = JSON.parse(storedData) as ProductChoice;
      
      if (this.choiceData && this.choiceData.id.toString() === this.choiceId) {
        this.choiceForm.patchValue({
          en_name: this.choiceData.en_name,
          ar_name: this.choiceData.ar_name,
          current_value: this.choiceData.cuurent_value, // Note: Fix typo in interface if needed
          active_status: this.choiceData.active_status === 1,
        });
        this.isLoading = false;
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Choice data in local storage does not match the requested ID',
        });
        this.isLoading = false;
      }
    } catch (error) {
      console.error('Error parsing choice data from local storage:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load choice data from local storage',
      });
      this.isLoading = false;
    }
  }

  onSubmit() {
    if (this.choiceForm.invalid) {
      this.choiceForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.ngxSpinnerService.show("actionsLoader");

    const formData = new FormData();
    formData.append('en_name', this.choiceForm.get('en_name')?.value);
    formData.append('ar_name', this.choiceForm.get('ar_name')?.value);
    formData.append('cuurent_value', this.choiceForm.get('current_value')?.value);
    formData.append('active_status', this.choiceForm.get('active_status')?.value ? '1' : '0');

    if (this.choiceData) {
      const updatedChoice: ProductChoice = {
        ...this.choiceData,
        en_name: this.choiceForm.get('en_name')?.value,
        ar_name: this.choiceForm.get('ar_name')?.value,
        cuurent_value: this.choiceForm.get('current_value')?.value, // Note: Fix typo in interface if needed
        active_status: this.choiceForm.get('active_status')?.value ? 1 : 0,
      };
      
      localStorage.setItem('choiceData', JSON.stringify(updatedChoice));
    }

    this.productsService.updateChoice(this.choiceId!, formData, this.isSpecial).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Choice edited successfully',
        });
        this.isSubmitting = false;
        this.ngxSpinnerService.hide("actionsLoader");
        
        if (this.choiceData) {
          this.router.navigate([`/dashboard/menu/products/products-choice/${this.choiceData.product_id}`], {
            queryParams: this.isSpecial ? { special: 'true' } : undefined
          });
        } else {
          this.router.navigate(['/dashboard/menu/products'], {
            queryParams: this.isSpecial ? { special: 'true' } : undefined
          });
        }
      },
      error: (err) => {
        console.error('Error updating choice:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update choice',
        });
        this.isSubmitting = false;
        this.ngxSpinnerService.hide("actionsLoader");
      },
    });
  }
}
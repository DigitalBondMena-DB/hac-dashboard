import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { ByOneGetOneService } from './res/by-one-get-one.service';
@Component({
  selector: 'app-by-one-get-one',
  standalone: true,
  imports: [
    InputNumberModule,
    ButtonModule,
    FormsModule,
    CommonModule,
    ToastModule,
  ],
  templateUrl: './by-one-get-one.component.html',
  styleUrl: './by-one-get-one.component.scss',
  providers: [MessageService],
})
export class ByOneGetOneComponent {
  private byOneGetOneService = inject(ByOneGetOneService);
  private messageService = inject(MessageService);
  discount: number = 0;

  ngOnInit() {
    this.byOneGetOneService.getAllByOneGetOne().subscribe((res) => {
      this.discount = res.discount;
    });
  }

  setByOneGetOne() {
    this.byOneGetOneService.setByOneGetOne(this.discount).subscribe((res) => {
      this.discount = res.discount;
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Discount set successfully',
      });
    });
  }
}

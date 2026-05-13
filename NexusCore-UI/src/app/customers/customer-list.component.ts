import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { catchError, of, take, timeout } from 'rxjs';

import { Customer, CustomerService } from './customer.service';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, CardModule, InputTextModule, TagModule],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.scss',
})
export class CustomerListComponent implements OnInit {
  @ViewChild('dt') dt?: Table;

  customers: Customer[] = [];
  loading = true;
  globalFilterValue = '';

  readonly globalFilterFields: (keyof Customer)[] = [
    'customerNumber',
    'firstName',
    'lastName',
    'email',
    'address',
    'city',
    'state',
    'zipcode',
  ];

  constructor(
    private readonly customersApi: CustomerService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.customersApi
      .getAllCustomers()
      .pipe(
        timeout({ first: 5000 }),
        take(1),
        catchError(() => of([] as Customer[])),
      )
      .subscribe((data) => this.applyData(data ?? []));
  }

  private applyData(data: Customer[]): void {
    // Avoid NG0100 (ExpressionChangedAfterItHasBeenCheckedError) if the observable
    // emits synchronously (e.g. cached/intercepted responses).
    queueMicrotask(() => {
      this.customers = data;
      this.loading = false;
      this.cdr.markForCheck();
      console.log('Fetched customers:', this.customers);
    });
  }

  onGlobalFilter(value: string): void {
    this.globalFilterValue = value;
    this.dt?.filterGlobal(value, 'contains');
  }
}


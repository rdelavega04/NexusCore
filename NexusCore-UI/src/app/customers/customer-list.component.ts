import { ChangeDetectorRef, Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TableLazyLoadEvent } from 'primeng/table';
import { catchError, debounceTime, distinctUntilChanged, EMPTY, finalize, of, Subject, switchMap, take, takeUntil } from 'rxjs';

import {
  Customer,
  CustomerService,
  CustomerSortField,
  PaginatedCustomerResult,
  SortDirection,
} from './customer.service';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    CardModule,
    InputTextModule,
    TagModule,
    DialogModule,
    ButtonModule,
  ],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.scss',
})
export class CustomerListComponent implements OnInit, OnDestroy {
  @ViewChild('dt') dt?: Table;

  customers: Customer[] = [];
  loading = false;
  isSearchMode = false;

  pageSize = 40;
  totalRecords = 0;
  sortField: CustomerSortField | undefined;
  sortOrder = 1;

  private readonly searchStream$ = new Subject<string>();
  private readonly destroy$ = new Subject<void>();
  globalFilterValue = '';

  addDialogVisible = false;
  saving = false;
  submitError: string | null = null;

  readonly addForm = {
    name: '',
    email: '',
    city: '',
    state: '',
    zip: '',
  };

  constructor(
    private readonly customersApi: CustomerService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.initializeSearchPipeline();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(event: TableLazyLoadEvent): void {
    if (this.isSearchMode) return;

    const skip = event.first ?? 0;
    const rows = event.rows ?? this.pageSize;

    if (event.sortField !== undefined) {
      this.sortField = event.sortField as CustomerSortField;
      this.sortOrder = event.sortOrder ?? 1;
    }

    this.loading = true;
    this.pageSize = rows;

    this.customersApi
      .getCustomersPage(skip, rows, this.sortField, this.toSortDirection(this.sortOrder))
      .pipe(
        catchError(() => of({ items: [], totalRecords: 0 })),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe(res => {
        this.customers = res.items;
        this.totalRecords = res.totalRecords;
      });
  }

  private initializeSearchPipeline(): void {
    this.searchStream$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(searchTerm => {
        const cleanTerm = searchTerm.trim();
        this.loading = true;

        if (!cleanTerm) {
          this.isSearchMode = false;
          return this.customersApi.getCustomersPage(
            0,
            this.pageSize,
            this.sortField,
            this.toSortDirection(this.sortOrder),
          );
        }

        this.isSearchMode = true;
        return this.customersApi.searchCustomersByLastName(cleanTerm).pipe(
          catchError(() => of([])),
        );
      }),
      takeUntil(this.destroy$),
    ).subscribe(res => {
      this.loading = false;

      if (res && 'items' in res) {
        const paginated = res as PaginatedCustomerResult;
        this.customers = paginated.items;
        this.totalRecords = paginated.totalRecords;
        if (this.dt) {
          this.dt.first = 0;
        }
      } else {
        this.customers = res as Customer[];
        this.totalRecords = this.customers.length;
      }

      this.cdr.markForCheck();
    });
  }

  onGlobalFilter(value: string): void {
    this.globalFilterValue = value;
    this.searchStream$.next(value);
  }

  openAddDialog(): void {
    this.submitError = null;
    this.addForm.name = '';
    this.addForm.email = '';
    this.addForm.city = '';
    this.addForm.state = '';
    this.addForm.zip = '';
    this.addDialogVisible = true;
  }

  submitAdd(): void {
    const name = this.addForm.name.trim();
    if (!name) {
      this.submitError = 'Name is required.';
      return;
    }

    const state = this.addForm.state.trim().toUpperCase();
    if (state.length > 0 && state.length !== 2) {
      this.submitError = 'State must be a 2-letter abbreviation.';
      return;
    }

    this.saving = true;
    this.submitError = null;

    this.customersApi
      .createCustomer({
        name,
        email: this.addForm.email || null,
        city: this.addForm.city || null,
        state: state || null,
        zip: this.addForm.zip || null,
      })
      .pipe(
        take(1),
        finalize(() => {
          this.saving = false;
          this.cdr.markForCheck();
        }),
        catchError((err: unknown) => {
          this.submitError = this.extractErrorMessage(err);
          return EMPTY;
        }),
      )
      .subscribe(() => {
        this.addDialogVisible = false;
        this.globalFilterValue = '';
        this.isSearchMode = false;
        if (this.dt) {
          this.dt.first = 0;
        }
        this.loadData({ first: 0, rows: this.pageSize, sortField: this.sortField, sortOrder: this.sortOrder });
      });
  }

  private toSortDirection(sortOrder: number): SortDirection {
    return sortOrder === -1 ? 'desc' : 'asc';
  }

  private extractErrorMessage(err: unknown): string {
    if (err && typeof err === 'object' && 'error' in err) {
      const body = (err as { error?: unknown }).error;
      if (typeof body === 'string' && body.trim()) {
        return body;
      }
      if (body && typeof body === 'object') {
        const detail = (body as { detail?: unknown; title?: unknown }).detail;
        const title = (body as { title?: unknown }).title;
        if (typeof detail === 'string' && detail.trim()) {
          return detail;
        }
        if (typeof title === 'string' && title.trim()) {
          return title;
        }
      }
    }
    return 'Unable to save customer.';
  }
}

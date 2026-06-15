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

import { Customer, CustomerService, PaginatedCustomerResult } from './customer.service';

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
  
  private lastSeenIdHistory: number[] = [0]; 
  private currentFirst = 0;

  // Search Streams
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

  // Driven completely by standard user page navigation clicks
  loadData(event: TableLazyLoadEvent): void {
    if (this.isSearchMode) return;

    const targetFirst = event.first ?? 0;
    const targetRows = event.rows ?? this.pageSize;
    
    this.loading = true;
    this.pageSize = targetRows;

    let targetLastSeenId = 0;

    if (targetFirst > this.currentFirst) {
      targetLastSeenId = this.customers.length > 0 ? this.customers[this.customers.length - 1].id : 0;
      if (!this.lastSeenIdHistory.includes(targetLastSeenId)) {
        this.lastSeenIdHistory.push(targetLastSeenId);
      }
    } else if (targetFirst < this.currentFirst) {
      const pageIndex = targetFirst / targetRows;
      targetLastSeenId = this.lastSeenIdHistory[pageIndex] ?? 0;
    } else {
      targetLastSeenId = 0;
      this.lastSeenIdHistory = [0];
    }

    this.currentFirst = targetFirst;

    this.customersApi.getCustomersPage(targetLastSeenId, targetRows)
      .pipe(
        catchError(() => of({ items: [], totalRecords: 0 })),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe(res => {
        // Extract the explicit array chunk property from the backend envelope wrapper
        this.customers = res.items;
        
        // Feed the live database count cleanly into the view layout context
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

        // Context: Clear search mode -> Go back to the metadata pagination object
        if (!cleanTerm) {
          this.isSearchMode = false;
          this.currentFirst = 0;
          this.lastSeenIdHistory = [0];
          return this.customersApi.getCustomersPage(0, this.pageSize);
        }

        // Context: Active search mode -> Keep the raw customer array stream
        this.isSearchMode = true;
        return this.customersApi.searchCustomersByLastName(cleanTerm).pipe(
          catchError(() => of([]))
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe(res => {
      this.loading = false;
      
      // Type Guard Check: Handle PaginatedCustomerResult vs raw Customer[]
      if (res && 'items' in res) {
        this.customers = res.items;
        this.totalRecords = res.totalRecords;
      } else {
        // We are processing a flat customer list returned from the indexed search match
        this.customers = res as Customer[];
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

    const state = this.addForm.state.trim();
    if (state.length > 2) {
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
        this.currentFirst = 0;
        this.lastSeenIdHistory = [0];
        if (this.dt) this.dt.first = 0; 
      });
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
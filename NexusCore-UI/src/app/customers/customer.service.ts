import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Customer {
  id: number;
  customerNumber: string;
  firstName: string;
  lastName: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipcode?: string | null;
  email?: string | null;
}

export interface CreateCustomerPayload {
  name: string;
  email?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
}

export type CustomerSortField =
  | 'customerNumber'
  | 'name'
  | 'email'
  | 'city'
  | 'state'
  | 'zip';

export type SortDirection = 'asc' | 'desc';

export interface PaginatedCustomerResult {
  items: Customer[];
  totalRecords: number;
}

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly baseUrl = '/api/customers';

  constructor(private readonly http: HttpClient) { }

  // Paginated fetch with optional server-side sort
  getCustomersPage(
    skip: number,
    pageSize: number,
    sortBy?: CustomerSortField | null,
    sortDirection: SortDirection = 'asc',
  ): Observable<PaginatedCustomerResult> {
    let params = new HttpParams()
      .set('skip', skip)
      .set('pageSize', pageSize)
      .set('sortDirection', sortDirection);

    if (sortBy) {
      params = params.set('sortBy', sortBy);
    }

    return this.http.get<PaginatedCustomerResult>(this.baseUrl, { params });
  }

  // Index-Optimized Server-Side Name Search
  searchCustomersByLastName(lastName: string): Observable<Customer[]> {
    const params = new HttpParams().set('lastName', lastName);
    return this.http.get<Customer[]>(`${this.baseUrl}/search`, { params });
  }

  createCustomer(payload: CreateCustomerPayload): Observable<Customer> {
    const body = {
      name: payload.name.trim(),
      email: payload.email?.trim() || null,
      city: payload.city?.trim() || null,
      state: payload.state?.trim() || null,
      zip: payload.zip?.trim() || null,
    };
    return this.http.post<Customer>(this.baseUrl, body);
  }
}
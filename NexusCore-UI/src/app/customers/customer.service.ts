import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

@Injectable({ providedIn: 'root' })
export class CustomerService {
  constructor(private readonly http: HttpClient) {}

  getAllCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`/api/customers`);
  }
}


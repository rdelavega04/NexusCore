import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import Lara from '@primeng/themes/lara';
import { HomeComponent } from './home/home.component';
import { CustomerListComponent } from './customers/customer-list.component';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideAnimations(),
    provideRouter([
      { path: '', pathMatch: 'full', component: HomeComponent },
      { path: 'customers', component: CustomerListComponent },
      { path: '**', redirectTo: '' },
    ]),
    providePrimeNG({
      theme: {
        preset: Lara
      }
    })
  ]
};

import { Routes } from '@angular/router';
import { AddressListComponent } from './components/address-list/address-list.component';
import { AddressFormComponent } from './components/address-form/address-form.component';

export const routes: Routes = [
  { path: '', component: AddressListComponent },
  { path: 'add', component: AddressFormComponent },
  { path: 'edit/:id', component: AddressFormComponent },
  { path: '**', redirectTo: '' },
];

import { Routes } from '@angular/router';
import { AddressListComponent } from './components/address-list/address-list.component';
import { AddressFormComponent } from './components/address-form/address-form.component';
import { DictionarySearchComponent } from './components/dictionary-search/dictionary-search.component'; // Pfad ggf. anpassen

export const routes: Routes = [
  { path: '', component: AddressListComponent },
  { path: 'add', component: AddressFormComponent },
  { path: 'edit/:id', component: AddressFormComponent },
  { path: 'search', component: DictionarySearchComponent }, // Neue Route für das Lexikon
  { path: '**', redirectTo: '' },
];

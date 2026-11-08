import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AddressListComponent } from './components/address-list/address-list.component';
import { AddressFormComponent } from './components/address-form/address-form.component';
import { DictionarySearchComponent } from './components/dictionary-search/dictionary-search.component';
import { ThesaurusSearchComponent } from './components/thesaurus-search/thesaurus-search.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent }, // Das neue Dashboard als Hauptseite
  { path: 'addresses', component: AddressListComponent }, // Adressbuch-Verzeichnis ausgelagert
  { path: 'add', component: AddressFormComponent },
  { path: 'edit/:id', component: AddressFormComponent },
  { path: 'search', component: DictionarySearchComponent },
  { path: 'thesaurus', component: ThesaurusSearchComponent }, // Neue Thesaurus-Route
  { path: '**', redirectTo: '' },
];

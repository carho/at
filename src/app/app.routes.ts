import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AddressListComponent } from './components/address-list/address-list.component';
import { AddressFormComponent } from './components/address-form/address-form.component';
import { DictionarySearchComponent } from './components/dictionary-search/dictionary-search.component';
import { ThesaurusSearchComponent } from './components/thesaurus-search/thesaurus-search.component';
import { WikipediaSearchComponent } from './components/wikipedia-search/wikipedia-search.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'addresses', component: AddressListComponent },
  { path: 'add', component: AddressFormComponent },
  { path: 'edit/:id', component: AddressFormComponent },
  { path: 'search', component: DictionarySearchComponent },
  { path: 'thesaurus', component: ThesaurusSearchComponent },
  { path: 'wikipedia', component: WikipediaSearchComponent }, // Neue Wikipedia-Route
  { path: '**', redirectTo: '' },
];

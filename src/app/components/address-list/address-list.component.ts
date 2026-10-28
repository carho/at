import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AddressService } from '../../services/address.service';

@Component({
  selector: 'app-address-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './address-list.component.html',
})
export class AddressListComponent {
  addressService = inject(AddressService);


}

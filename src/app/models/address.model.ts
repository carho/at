export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  category: 'Personal' | 'Work' | 'Other';
}
export interface AddressResponse {
  data: Address[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type NewAddress = Omit<Address, 'id'>;

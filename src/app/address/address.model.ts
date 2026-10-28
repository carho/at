export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  zipCode: string;
}

export type AddressFormState = Omit<Address, 'id'>;

export const createEmptyForm = (): AddressFormState => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  street: '',
  city: '',
  zipCode: '',
});

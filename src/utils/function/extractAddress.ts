/* eslint-disable prettier/prettier */
import { Address } from "src/entity";

// Function to extract address data from the Address object
export function extractAddressData(address: Address): any {
    return {
        name: `${address.firstName} ${address.lastName}`,
        email: address.email,
        phoneNumber: address.phoneNumber,
        street: address.address.street,
        city: address.address.city,
        state: address.address.state,
        country: address.address.country,
        zipCode: address.address.zipCode,
        apartment: address.address.apartment,
        block: address.address.block,
        longitude: address.address.longitude,
        latitude: address.address.latitude
    };
}

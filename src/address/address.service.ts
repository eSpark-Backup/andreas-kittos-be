/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Address } from 'src/entity/address.entity';
import { Repository } from 'typeorm';
import { AddressDto } from './dto/add-address.dto';
import { Users } from 'src/entity';
import { CONSTANT_RESPONSE } from 'src/utils/constant/return.constant';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,

    @InjectRepository(Users)
    private userRepository: Repository<Users>,
  ) {}

  async create(userId: string, addressDto: AddressDto) {
    const address = new Address();
    address.type = addressDto.type;
    address.firstName = addressDto.firstName;
    address.lastName = addressDto.lastName;
    address.phoneNumber = addressDto.phoneNumber;
    address.email = addressDto.email;
    address.address = {
      street: addressDto.street,
      city: addressDto.city,
      state: addressDto.state,
      country: addressDto.country,
      zipCode: addressDto.zipCode,
      apartment: addressDto.apartment,
      block: addressDto.block,
      longitude: addressDto.longitude,
      latitude: addressDto.latitude,
    };
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    const findAllAddress = await this.addressRepository
      .createQueryBuilder('address')
      .where('address.user = :user', { user: user.id })
      .getMany();
    if (findAllAddress) {
      let matchedAddressId = null;
      for (const checkaddress of findAllAddress) {
        if (
          checkaddress.address.state === address.address.state &&
          checkaddress.address.country === address.address.country &&
          checkaddress.address.zipCode === address.address.zipCode &&
          checkaddress.address.apartment === address.address.apartment &&
          checkaddress.address.block === address.address.block
        ) {
          matchedAddressId = checkaddress.id;
          break;
        }
      }
      if (matchedAddressId) {
        address.id = matchedAddressId;
        address.isDefault = true;

        const ADDRESS = await this.addressRepository.save(address);
        const allAddresses = await this.addressRepository
          .createQueryBuilder('address')
          .select([
            'address.id AS address_id',
            'address.type AS address_type',
            'user.id AS user_id',
          ])
          .where('address.user = :user', { user: user.id })
          .innerJoin('address.user', 'user')
          .getRawMany();

        for (const addr of allAddresses) {
          if (
            addr.address_type === ADDRESS.type &&
            addr.address_id !== matchedAddressId &&
            addr.user_id === user.id
          ) {
            await this.addressRepository
              .createQueryBuilder('address')
              .update(Address)
              .set({ isDefault: false })
              .where('id = :id', { id: addr.address_id })
              .execute();
          }
        }
        return {
          data: null,
          message: CONSTANT_RESPONSE.UPDATED_SUCCESSFULLY,
        };
      }
    }

    address.user = user;
    const ADDRESS = await this.addressRepository.save(address);

    const allAddresses = await this.addressRepository
      .createQueryBuilder('address')
      .select([
        'address.id AS address_id',
        'address.type AS address_type',
        'user.id AS user_id',
      ])
      .innerJoin('address.user', 'user')
      .getRawMany();

    for (const addr of allAddresses) {
      if (
        addr.address_type === ADDRESS.type &&
        addr.address_id !== ADDRESS.id &&
        addr.user_id === ADDRESS.user.id
      ) {
        await this.addressRepository
          .createQueryBuilder('address')
          .update(Address)
          .set({ isDefault: false })
          .where('id = :id', { id: addr.address_id })
          .execute();
      }
    }

    return {
      data: null,
      message: CONSTANT_RESPONSE.CREATED_SUCCESSFULLY,
    };
  }

  async findAll(userId: string, type: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    if (type) {
      const addresses = await this.addressRepository
        .createQueryBuilder('address')
        .where('address.user = :user', { user: user.id })
        .andWhere('address.type = :type', { type })
        .getMany();

      return {
        data: addresses,
        message: CONSTANT_RESPONSE.GET_ALL,
      };
    } else {
      const addresses = await this.addressRepository
        .createQueryBuilder('address')
        .where('address.user = :user', { user: user.id })
        .getMany();
      if (!addresses) {
        throw new Error('Address not found');
      }
      return {
        data: addresses,
        message: CONSTANT_RESPONSE.GET_ALL,
      };
    }
  }

  async remove(id: string) {
    parseInt(id);
    const address = await this.addressRepository.findOne({ where: { id } });
    if (!address) {
      throw new Error('Address not found');
    }
    await this.addressRepository.remove(address);
    return {
      message: CONSTANT_RESPONSE.DELETED_SUCCESSFULLY,
    };
  }
}

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

    address.user = user;
    const ADDRESS = this.addressRepository.save(address);

    return {
      data: ADDRESS,
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

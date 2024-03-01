import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { AddressController } from './address.controller';
import { Address } from 'src/entity/address.entity';
import { AddressService } from './address.service';
import { Users } from 'src/entity';

@Module({
  imports: [TypeOrmModule.forFeature([Address, Users])],
  controllers: [AddressController],
  providers: [AddressService, JwtService],
})
export class AddressModule {}

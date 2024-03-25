import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favourite, Users } from '../entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { BackblazeService } from 'src/backblaze/backblaze.service';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';
import { Order } from 'src/entity/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users, Favourite,Order]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.TOKEN_KEY || 'andreaskittos',
      signOptions: {
        expiresIn: process.env.TOKEN_EXPIRY || '1d',
      },
    }),
    MulterModule.register({
      storage: multer.memoryStorage(),
    }),
  ],
  controllers: [UserController],
  providers: [UserService, JwtStrategy, BackblazeService],
})
export class UserModule {}

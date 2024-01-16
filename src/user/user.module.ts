import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../entity/user.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Users]),
  JwtModule.register({
    secret: process.env.TOKEN_KEY || 'andreaskittos',
    signOptions: {
      expiresIn: process.env.TOKEN_EXPIRY || '1d',
    },
  }),
  ],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule { }

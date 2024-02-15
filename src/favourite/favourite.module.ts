/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { FavouriteController } from './favourite.controller';
import { FavouriteService } from './favourite.service';
import { Favourite } from 'src/entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

@Module({
    imports: [TypeOrmModule.forFeature([Favourite])],
    controllers: [FavouriteController],
    providers: [FavouriteService, JwtService,
    ],
})
export class FavouriteModule { }

/* eslint-disable prettier/prettier */
// static.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Static } from 'src/entity/static.entity';
import { StaticController } from './static.controller';
import { StaticService } from './static.service';
import { JwtService } from '@nestjs/jwt';

@Module({
    imports: [TypeOrmModule.forFeature([Static])],
    controllers: [StaticController],
    providers: [StaticService,JwtService],
})
export class StaticModule {}

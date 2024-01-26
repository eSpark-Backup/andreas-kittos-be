import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from '../typeorm.config';
import { UserModule } from './user/user.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from './utils/global-exception-handler/global-exception.filter';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SuccessResponseInterceptor } from './utils/interceptor/success-response.interceptor';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), UserModule, CategoryModule, ProductModule],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SuccessResponseInterceptor,
    },
  ],
})
export class AppModule { }
/* eslint-disable prettier/prettier */
import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'admin',
  database: 'andreaskittos',
  entities: [__dirname + '/src/entity/*.entity.{js,ts}'],
  migrations: [__dirname + '/src/migrations/*.{js,ts}'],
  synchronize: true
};
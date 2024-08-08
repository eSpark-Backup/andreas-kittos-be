/* eslint-disable prettier/prettier */
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';

config();

const port: number = parseInt(<string>process.env.DB_PORT);
export const typeOrmConfig: TypeOrmModuleOptions = {
  host: process.env.MYSQL_HOST,
  type: 'mariadb',
  host: process.env.DB_HOST,
  port: port,
  username: 'root',
  entities: [__dirname + '/src/entity/*.entity.{js,ts}'],
  migrations: [__dirname + '/src/migrations/*.{js,ts}'],
  synchronize: true,
  logging: false,
};

/* eslint-disable prettier/prettier */
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';

config();

const port: number = parseInt(<string>process.env.MYSQL_PORT);
export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mariadb',
  host: process.env.DB_HOST,
  port: port,
  username: 'root',
  database: 'andreaskittos',
  entities: [__dirname + '/src/entity/*.entity.{js,ts}'],
  migrations: [__dirname + '/src/migrations/*.{js,ts}'],
  synchronize: true,
  logging: false,
};

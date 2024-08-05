/* eslint-disable prettier/prettier */
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';

config();
console.log(process.env);
const port: number = parseInt(<string>process.env.MYSQL_DB_PORT);
export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.MYSQL_DB_HOST,
  port: port,
  username: process.env.MYSQL_DB_USERNAME,
  password: process.env.MYSQL_DB_PASS,
  database: process.env.MYSQL_DATABASE,
  entities: [__dirname + '/src/entity/*.entity.{js,ts}'],
  migrations: [__dirname + '/src/migrations/*.{js,ts}'],
  synchronize: true,
  logging: false,
};

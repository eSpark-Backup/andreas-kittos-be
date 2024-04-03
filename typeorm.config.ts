import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { config } from 'dotenv';

config();

const port: number = parseInt(<string>process.env.DB_PORT) ;
export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST ,
  port: port ,
  username: process.env.DB_USERNAME ,
  password: process.env.DB_PASS,
  database: 'andreaskittos',
  entities: [__dirname + '/src/entity/*.entity.{js,ts}'],
  migrations: [__dirname + '/src/migrations/*.{js,ts}'],
  synchronize: true,
  logging: false
};
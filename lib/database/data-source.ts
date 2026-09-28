import "reflect-metadata";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities: [
    `${process.cwd()}/lib/database/entities/**/*.{ts,js}`,
  ],
  migrations: [
    `${process.cwd()}/migrations/*.{ts,js}`,
  ],
  synchronize: false,
  logging: false,
});
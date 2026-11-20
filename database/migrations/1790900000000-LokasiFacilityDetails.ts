import { MigrationInterface, QueryRunner } from "typeorm";

export class LokasiFacilityDetails1790900000000 implements MigrationInterface {
  name = "LokasiFacilityDetails1790900000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "lokasi_layanans" ADD "detail_fasilitas" jsonb`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "lokasi_layanans" DROP COLUMN "detail_fasilitas"`);
  }
}

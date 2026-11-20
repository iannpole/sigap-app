import { MigrationInterface, QueryRunner } from "typeorm";

export class LokasiDescription1790800000000 implements MigrationInterface {
  name = "LokasiDescription1790800000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "lokasi_layanans" ADD "deskripsi" character varying(500)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "lokasi_layanans" DROP COLUMN "deskripsi"`);
  }
}

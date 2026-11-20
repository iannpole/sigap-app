import { MigrationInterface, QueryRunner } from "typeorm";

export class BerandaGambar1790900000000 implements MigrationInterface {
  name = "BerandaGambar1790900000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "beranda_gambar" (
      "id" SERIAL NOT NULL,
      "label" character varying(80) NOT NULL DEFAULT '',
      "gambar" bytea,
      "gambar_mime" character varying(40),
      "urutan" integer NOT NULL DEFAULT 0,
      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      CONSTRAINT "PK_beranda_gambar_id" PRIMARY KEY ("id")
    )`);
    await queryRunner.query(`ALTER TABLE "beranda_gambar" ENABLE ROW LEVEL SECURITY;`);

    await queryRunner.query(`ALTER TABLE "beranda_section" DROP COLUMN IF EXISTS "gambar"`);
    await queryRunner.query(`ALTER TABLE "beranda_section" DROP COLUMN IF EXISTS "gambar_mime"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "beranda_section" ADD COLUMN "gambar" bytea`);
    await queryRunner.query(`ALTER TABLE "beranda_section" ADD COLUMN "gambar_mime" character varying(40)`);
    await queryRunner.query(`DROP TABLE "beranda_gambar"`);
  }
}

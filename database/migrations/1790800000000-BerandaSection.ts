import { MigrationInterface, QueryRunner } from "typeorm";

export class BerandaSection1790800000000 implements MigrationInterface {
  name = "BerandaSection1790800000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "beranda_section" (
      "id" SERIAL NOT NULL,
      "eyebrow" character varying(40) NOT NULL DEFAULT '',
      "judul" character varying(120) NOT NULL DEFAULT '',
      "deskripsi" character varying(400) NOT NULL DEFAULT '',
      "gambar" bytea,
      "gambar_mime" character varying(40),
      "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      CONSTRAINT "PK_beranda_section_id" PRIMARY KEY ("id")
    )`);
    await queryRunner.query(`ALTER TABLE "beranda_section" ENABLE ROW LEVEL SECURITY;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "beranda_section"`);
  }
}

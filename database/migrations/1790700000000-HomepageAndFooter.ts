import { MigrationInterface, QueryRunner } from "typeorm";

export class HomepageAndFooter1790700000000 implements MigrationInterface {
  name = "HomepageAndFooter1790700000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "homepage_feature" (
      "id" SERIAL NOT NULL,
      "judul" character varying(80) NOT NULL,
      "deskripsi" character varying(160) NOT NULL,
      "ikon_key" character varying(40) NOT NULL,
      "tautan" character varying(2048),
      "urutan" integer NOT NULL DEFAULT 0,
      "aktif" boolean NOT NULL DEFAULT true,
      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      CONSTRAINT "PK_homepage_feature_id" PRIMARY KEY ("id")
    )`);

    await queryRunner.query(`CREATE TABLE "site_footer" (
      "id" SERIAL NOT NULL,
      "nama" character varying(80) NOT NULL,
      "tagline" character varying(200) NOT NULL,
      "email" character varying(120),
      "hak_cipta" character varying(200) NOT NULL,
      "alamat" character varying(300),
      "tampilkan_alamat" boolean NOT NULL DEFAULT false,
      CONSTRAINT "PK_site_footer_id" PRIMARY KEY ("id")
    )`);

    await queryRunner.query(`CREATE TABLE "footer_link" (
      "id" SERIAL NOT NULL,
      "footer_id" integer NOT NULL,
      "label" character varying(60) NOT NULL,
      "url" character varying(2048) NOT NULL,
      "urutan" integer NOT NULL DEFAULT 0,
      CONSTRAINT "PK_footer_link_id" PRIMARY KEY ("id"),
      CONSTRAINT "FK_footer_link_footer" FOREIGN KEY ("footer_id") REFERENCES "site_footer"("id") ON DELETE CASCADE
    )`);
    await queryRunner.query(`CREATE INDEX "IDX_footer_link_footer_id" ON "footer_link" ("footer_id")`);

    await queryRunner.query(`CREATE TABLE "social_link" (
      "id" SERIAL NOT NULL,
      "footer_id" integer NOT NULL,
      "platform" character varying(40) NOT NULL,
      "url" character varying(2048) NOT NULL,
      "urutan" integer NOT NULL DEFAULT 0,
      CONSTRAINT "PK_social_link_id" PRIMARY KEY ("id"),
      CONSTRAINT "FK_social_link_footer" FOREIGN KEY ("footer_id") REFERENCES "site_footer"("id") ON DELETE CASCADE
    )`);
    await queryRunner.query(`CREATE INDEX "IDX_social_link_footer_id" ON "social_link" ("footer_id")`);

    await queryRunner.query(`ALTER TABLE "homepage_feature" ENABLE ROW LEVEL SECURITY;`);
    await queryRunner.query(`ALTER TABLE "site_footer" ENABLE ROW LEVEL SECURITY;`);
    await queryRunner.query(`ALTER TABLE "footer_link" ENABLE ROW LEVEL SECURITY;`);
    await queryRunner.query(`ALTER TABLE "social_link" ENABLE ROW LEVEL SECURITY;`);

    await queryRunner.query(`INSERT INTO "homepage_feature" ("judul", "deskripsi", "ikon_key", "tautan", "urutan", "aktif") VALUES
      ('Peta Layanan', 'Lihat fasilitas kesehatan, keamanan, dan olahraga dalam satu peta.', 'peta', NULL, 1, true),
      ('Kategori', 'Saring layanan berdasarkan kategori dan sub kategori.', 'kategori', NULL, 2, true),
      ('Terdekat dari Saya', 'Temukan layanan terdekat dari titik acuan Anda.', 'lokasi', NULL, 3, true),
      ('Mode 3D Brick', 'Jelajahi diorama kota Bogor dalam tampilan brick 3D.', '3d', NULL, 4, true)`);

    await queryRunner.query(`INSERT INTO "site_footer" ("nama", "tagline", "email", "hak_cipta", "alamat", "tampilkan_alamat") VALUES
      ('SIGAP Bogor', 'Kesehatan, keamanan, dan olahraga dalam satu peta.', NULL, '© 2026 SIGAP Bogor', NULL, false)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "social_link"`);
    await queryRunner.query(`DROP TABLE "footer_link"`);
    await queryRunner.query(`DROP TABLE "site_footer"`);
    await queryRunner.query(`DROP TABLE "homepage_feature"`);
  }
}

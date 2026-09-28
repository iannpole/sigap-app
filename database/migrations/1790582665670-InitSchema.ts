import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1790582665670 implements MigrationInterface {
    name = 'InitSchema1790582665670'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "admins" ("id" SERIAL NOT NULL, "username" character varying(50) NOT NULL, "password_hash" character varying(255) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_4ba6d0c734d53f8e1b2e24b6c56" UNIQUE ("username"), CONSTRAINT "PK_e3b38270c97a854c48d2e80874e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "lokasi_layanans" ("id" SERIAL NOT NULL, "sub_kategori_id" integer NOT NULL, "nama" character varying(150) NOT NULL, "alamat" text, "wilayah" character varying(30) NOT NULL, "koordinat" geometry(Point,4326) NOT NULL, "no_kontak" character varying(30), "jam_operasional" character varying(100), "foto_url" character varying(255), "created_by" integer, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "CHK_a9d40323d4ad70c207898df120" CHECK ("wilayah" IN ('Kota Bogor', 'Kabupaten Bogor')), CONSTRAINT "PK_7ab321d165d667c73775776ae9c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3b26e65ca655c4a155abde505b" ON "lokasi_layanans"  ("sub_kategori_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_99fdecb6f801426e8d4e422561" ON "lokasi_layanans"  ("wilayah") `);
        await queryRunner.query(`CREATE INDEX "IDX_c3b87be3d685e20442bca4f4c1" ON "lokasi_layanans" USING gist ("koordinat") `);
        await queryRunner.query(`CREATE TABLE "sub_kategori" ("id" SERIAL NOT NULL, "kategori_id" integer NOT NULL, "nama_sub_kategori" character varying(50) NOT NULL, CONSTRAINT "UQ_617dc789e34880e784166eaa712" UNIQUE ("kategori_id", "nama_sub_kategori"), CONSTRAINT "PK_c9f5482b6a6c16635f25ff61afe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_94c8fc1d189844282b282ec294" ON "sub_kategori"  ("kategori_id") `);
        await queryRunner.query(`CREATE TABLE "kategori" ("id" SERIAL NOT NULL, "nama_kategori" character varying(50) NOT NULL, CONSTRAINT "UQ_448ff6c1a624dcdf3e8d6e9f4f9" UNIQUE ("nama_kategori"), CONSTRAINT "PK_06a98d8feabd77edd2f8cb69090" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "lokasi_layanans" ADD CONSTRAINT "FK_3b26e65ca655c4a155abde505bd" FOREIGN KEY ("sub_kategori_id") REFERENCES "sub_kategori"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lokasi_layanans" ADD CONSTRAINT "FK_709e31604a4a9a6b1b7182d5d9e" FOREIGN KEY ("created_by") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sub_kategori" ADD CONSTRAINT "FK_94c8fc1d189844282b282ec2948" FOREIGN KEY ("kategori_id") REFERENCES "kategori"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sub_kategori" DROP CONSTRAINT "FK_94c8fc1d189844282b282ec2948"`);
        await queryRunner.query(`ALTER TABLE "lokasi_layanans" DROP CONSTRAINT "FK_709e31604a4a9a6b1b7182d5d9e"`);
        await queryRunner.query(`ALTER TABLE "lokasi_layanans" DROP CONSTRAINT "FK_3b26e65ca655c4a155abde505bd"`);
        await queryRunner.query(`DROP TABLE "kategori"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_94c8fc1d189844282b282ec294"`);
        await queryRunner.query(`DROP TABLE "sub_kategori"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c3b87be3d685e20442bca4f4c1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_99fdecb6f801426e8d4e422561"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3b26e65ca655c4a155abde505b"`);
        await queryRunner.query(`DROP TABLE "lokasi_layanans"`);
        await queryRunner.query(`DROP TABLE "admins"`);
    }

}

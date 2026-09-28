import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateLokasiLayananIndexesAndGeography1790586591517 implements MigrationInterface {
    name = 'UpdateLokasiLayananIndexesAndGeography1790586591517'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_c3b87be3d685e20442bca4f4c1"`);
        await queryRunner.query(`ALTER TABLE "lokasi_layanans" ALTER COLUMN "koordinat" TYPE geography(Point, 4326) USING "koordinat"::geography`);
        await queryRunner.query(`CREATE INDEX "IDX_c3b87be3d685e20442bca4f4c1" ON "lokasi_layanans" USING gist ("koordinat")`);
        await queryRunner.query(`CREATE INDEX "IDX_709e31604a4a9a6b1b7182d5d9" ON "lokasi_layanans" ("created_by")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_709e31604a4a9a6b1b7182d5d9"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_c3b87be3d685e20442bca4f4c1"`);
        await queryRunner.query(`ALTER TABLE "lokasi_layanans" ALTER COLUMN "koordinat" TYPE geometry(Point, 4326) USING "koordinat"::geometry`);
        await queryRunner.query(`CREATE INDEX "IDX_c3b87be3d685e20442bca4f4c1" ON "lokasi_layanans" USING gist ("koordinat")`);
    }

}

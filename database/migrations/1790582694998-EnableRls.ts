import { MigrationInterface, QueryRunner } from "typeorm";

export class EnableRls1790582694998 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "kategori" ENABLE ROW LEVEL SECURITY;`);
    await queryRunner.query(`ALTER TABLE "sub_kategori" ENABLE ROW LEVEL SECURITY;`);
    await queryRunner.query(`ALTER TABLE "lokasi_layanans" ENABLE ROW LEVEL SECURITY;`);
    await queryRunner.query(`ALTER TABLE "admins" ENABLE ROW LEVEL SECURITY;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "kategori" DISABLE ROW LEVEL SECURITY;`);
    await queryRunner.query(`ALTER TABLE "sub_kategori" DISABLE ROW LEVEL SECURITY;`);
    await queryRunner.query(`ALTER TABLE "lokasi_layanans" DISABLE ROW LEVEL SECURITY;`);
    await queryRunner.query(`ALTER TABLE "admins" DISABLE ROW LEVEL SECURITY;`);
  }

}

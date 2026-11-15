import { MigrationInterface, QueryRunner } from "typeorm";

export class RateLimits1790600000000 implements MigrationInterface {
  name = "RateLimits1790600000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "rate_limits" ("key" character varying(255) NOT NULL, "count" integer NOT NULL DEFAULT 0, "reset_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_rate_limits_key" PRIMARY KEY ("key"))`);
    await queryRunner.query(`CREATE INDEX "IDX_rate_limits_reset_at" ON "rate_limits" ("reset_at")`);
    await queryRunner.query(`ALTER TABLE "rate_limits" ENABLE ROW LEVEL SECURITY;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_rate_limits_reset_at"`);
    await queryRunner.query(`DROP TABLE "rate_limits"`);
  }
}

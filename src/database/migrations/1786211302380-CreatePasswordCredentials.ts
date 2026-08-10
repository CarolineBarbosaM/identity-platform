import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePasswordCredentials1786211302380 implements MigrationInterface {
  name = 'CreatePasswordCredentials1786211302380';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "password_credentials" ("id" uuid NOT NULL, "user_id" uuid NOT NULL, "password_hash" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_c7302926c19b0b92389e3d3b27a" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "password_credentials"`);
  }
}

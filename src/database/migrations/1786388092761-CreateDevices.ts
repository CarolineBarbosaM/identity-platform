import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDevices1786388092761 implements MigrationInterface {
  name = 'CreateDevices1786388092761';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "devices" ("id" uuid NOT NULL, "user_id" uuid NOT NULL, "name" text NOT NULL, "user_agent" text NOT NULL, "ip_address" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "last_seen_at" TIMESTAMP WITH TIME ZONE NOT NULL, "revoked_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_b1514758245c12daf43486dd1f0" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "devices"`);
  }
}

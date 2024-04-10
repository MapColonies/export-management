import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1712756096377 implements MigrationInterface {
    name = 'Migration1712756096377'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "export_manager"."TaskGeometries" ("id" SERIAL NOT NULL, "geom" geometry NOT NULL, "metadata" jsonb, "task_id" integer, CONSTRAINT "PK_eb6223ba8dbe07a8bf90ff009c5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "export_manager"."Webhooks_events_enum" AS ENUM('TASK_STARTED', 'TASK_UPDATED', 'TASK_COMPLETED', 'TASK_FAILED', 'TASK_ABORTED', 'TASK_EXPIRED', 'TASK_PAUSED', 'TASK_ARCHIVED')`);
        await queryRunner.query(`CREATE TABLE "export_manager"."Webhooks" ("id" SERIAL NOT NULL, "url" character varying NOT NULL, "events" "export_manager"."Webhooks_events_enum" array NOT NULL, "task_id" integer, CONSTRAINT "PK_ef540eaf209b4e5cb871ea34910" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "export_manager"."Tasks_status_enum" AS ENUM('IN_PROGRESS', 'COMPLETED', 'ABORTED', 'PAUSED', 'FAILED', 'PENDING', 'EXPIRED')`);
        await queryRunner.query(`CREATE TABLE "export_manager"."Tasks" ("id" SERIAL NOT NULL, "job_id" uuid NOT NULL, "catalog_record_id" uuid NOT NULL, "artifact_crs" character varying NOT NULL, "domain" character varying NOT NULL, "customer_name" character varying, "status" "export_manager"."Tasks_status_enum" NOT NULL DEFAULT 'PENDING', "description" character varying(2000), "estimated_data_size" integer DEFAULT '0', "estimated_time" integer DEFAULT '0', "keywords" jsonb, "error_reason" character varying, "progress" smallint DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "expired_at" TIMESTAMP WITH TIME ZONE, "finished_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_f38c2a61ff630a16afca4dac442" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "export_manager"."Artifacts" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "type" character varying NOT NULL, "url" character varying NOT NULL, "size" numeric NOT NULL DEFAULT '0', "sha256" character varying, CONSTRAINT "PK_d604307d270a069ad6d3352c311" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "export_manager"."AftifactToTask" ("task_id" integer NOT NULL, "artifact_id" integer NOT NULL, CONSTRAINT "PK_67d5355ab53aa083b0b7efafb4e" PRIMARY KEY ("task_id", "artifact_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_2dba5d0ccbf6989343c1f07ef9" ON "export_manager"."AftifactToTask" ("task_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_bca343fd24d0d6a15670551be5" ON "export_manager"."AftifactToTask" ("artifact_id") `);
        await queryRunner.query(`ALTER TABLE "export_manager"."TaskGeometries" ADD CONSTRAINT "FK_6c4523d22571ba1c260f328706a" FOREIGN KEY ("task_id") REFERENCES "export_manager"."Tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "export_manager"."Webhooks" ADD CONSTRAINT "FK_dd60a129dc6472cc0a86af98060" FOREIGN KEY ("task_id") REFERENCES "export_manager"."Tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "export_manager"."AftifactToTask" ADD CONSTRAINT "FK_2dba5d0ccbf6989343c1f07ef97" FOREIGN KEY ("task_id") REFERENCES "export_manager"."Tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "export_manager"."AftifactToTask" ADD CONSTRAINT "FK_bca343fd24d0d6a15670551be50" FOREIGN KEY ("artifact_id") REFERENCES "export_manager"."Artifacts"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "export_manager"."AftifactToTask" DROP CONSTRAINT "FK_bca343fd24d0d6a15670551be50"`);
        await queryRunner.query(`ALTER TABLE "export_manager"."AftifactToTask" DROP CONSTRAINT "FK_2dba5d0ccbf6989343c1f07ef97"`);
        await queryRunner.query(`ALTER TABLE "export_manager"."Webhooks" DROP CONSTRAINT "FK_dd60a129dc6472cc0a86af98060"`);
        await queryRunner.query(`ALTER TABLE "export_manager"."TaskGeometries" DROP CONSTRAINT "FK_6c4523d22571ba1c260f328706a"`);
        await queryRunner.query(`DROP INDEX "export_manager"."IDX_bca343fd24d0d6a15670551be5"`);
        await queryRunner.query(`DROP INDEX "export_manager"."IDX_2dba5d0ccbf6989343c1f07ef9"`);
        await queryRunner.query(`DROP TABLE "export_manager"."AftifactToTask"`);
        await queryRunner.query(`DROP TABLE "export_manager"."Artifacts"`);
        await queryRunner.query(`DROP TABLE "export_manager"."Tasks"`);
        await queryRunner.query(`DROP TYPE "export_manager"."Tasks_status_enum"`);
        await queryRunner.query(`DROP TABLE "export_manager"."Webhooks"`);
        await queryRunner.query(`DROP TYPE "export_manager"."Webhooks_events_enum"`);
        await queryRunner.query(`DROP TABLE "export_manager"."TaskGeometries"`);
    }

}

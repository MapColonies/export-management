import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1712665966894 implements MigrationInterface {
    name = 'Migration1712665966894'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "export_manager"."TaskGeometries" ("id" SERIAL NOT NULL, "geom" geometry NOT NULL, "metadata" jsonb, "task_id" integer, CONSTRAINT "PK_eb6223ba8dbe07a8bf90ff009c5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "export_manager"."Webhooks_events_enum" AS ENUM('TASK_STARTED', 'TASK_UPDATED', 'TASK_COMPLETED', 'TASK_FAILED', 'TASK_ABORTED', 'TASK_EXPIRED', 'TASK_PAUSED', 'TASK_ARCHIVED')`);
        await queryRunner.query(`CREATE TABLE "export_manager"."Webhooks" ("id" SERIAL NOT NULL, "url" character varying NOT NULL, "events" "export_manager"."Webhooks_events_enum" array NOT NULL, "task_id" integer, CONSTRAINT "PK_ef540eaf209b4e5cb871ea34910" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "export_manager"."Tasks_status_enum" AS ENUM('IN_PROGRESS', 'COMPLETED', 'ABORTED', 'PAUSED', 'FAILED', 'PENDING', 'EXPIRED')`);
        await queryRunner.query(`CREATE TABLE "export_manager"."Tasks" ("id" SERIAL NOT NULL, "job_id" uuid NOT NULL, "catalog_record_id" uuid NOT NULL, "customer_name" character varying, "artifact_crs" character varying NOT NULL, "domain" character varying NOT NULL, "status" "export_manager"."Tasks_status_enum" NOT NULL DEFAULT 'PENDING', "description" character varying(2000), "estimated_data_size" integer DEFAULT '0', "estimated_time" integer DEFAULT '0', "keywords" jsonb, "errorReason" character varying, "progress" smallint DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "expired_at" TIMESTAMP WITH TIME ZONE, "finished_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_f38c2a61ff630a16afca4dac442" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "export_manager"."Artifacts" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "type" character varying NOT NULL, "url" character varying NOT NULL, "size" numeric NOT NULL DEFAULT '0', "sha256" character varying, "task_id" integer, CONSTRAINT "PK_d604307d270a069ad6d3352c311" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "export_manager"."Customers" ("id" SERIAL NOT NULL, "customerName" character varying NOT NULL, CONSTRAINT "PK_c3220bb99cfda194990bc2975be" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "export_manager"."TaskGeometries" ADD CONSTRAINT "FK_6c4523d22571ba1c260f328706a" FOREIGN KEY ("task_id") REFERENCES "export_manager"."Tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "export_manager"."Webhooks" ADD CONSTRAINT "FK_dd60a129dc6472cc0a86af98060" FOREIGN KEY ("task_id") REFERENCES "export_manager"."Tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "export_manager"."Artifacts" ADD CONSTRAINT "FK_7e15c0853fa69122b734ffd4042" FOREIGN KEY ("task_id") REFERENCES "export_manager"."Tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "export_manager"."Artifacts" DROP CONSTRAINT "FK_7e15c0853fa69122b734ffd4042"`);
        await queryRunner.query(`ALTER TABLE "export_manager"."Webhooks" DROP CONSTRAINT "FK_dd60a129dc6472cc0a86af98060"`);
        await queryRunner.query(`ALTER TABLE "export_manager"."TaskGeometries" DROP CONSTRAINT "FK_6c4523d22571ba1c260f328706a"`);
        await queryRunner.query(`DROP TABLE "export_manager"."Customers"`);
        await queryRunner.query(`DROP TABLE "export_manager"."Artifacts"`);
        await queryRunner.query(`DROP TABLE "export_manager"."Tasks"`);
        await queryRunner.query(`DROP TYPE "export_manager"."Tasks_status_enum"`);
        await queryRunner.query(`DROP TABLE "export_manager"."Webhooks"`);
        await queryRunner.query(`DROP TYPE "export_manager"."Webhooks_events_enum"`);
        await queryRunner.query(`DROP TABLE "export_manager"."TaskGeometries"`);
    }

}

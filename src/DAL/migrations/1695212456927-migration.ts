import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1695212456927 implements MigrationInterface {
    name = 'Migration1695212456927'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "export_manager"."artifact_type" ("id" SERIAL NOT NULL, "type" character varying NOT NULL, CONSTRAINT "PK_ae163e73ca0196fdb444350a29f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "export_manager"."task_geometry" ("id" SERIAL NOT NULL, "geom" geometry, "metadata" jsonb, CONSTRAINT "PK_272fcc66b7ee91809977624b51a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "export_manager"."webhook_events_enum" AS ENUM('TASK_STARTED', 'TASK_UPDATED', 'TASK_COMPLETED', 'TASK_FAILED', 'TASK_ABORTED', 'TASK_EXPIRED', 'TASK_PAUSED', 'TASK_ARCHIVED')`);
        await queryRunner.query(`CREATE TABLE "export_manager"."webhook" ("id" SERIAL NOT NULL, "url" character varying NOT NULL, "events" "export_manager"."webhook_events_enum" array NOT NULL, CONSTRAINT "PK_e6765510c2d078db49632b59020" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "export_manager"."task_status_enum" AS ENUM('IN_PROGRESS', 'COMPLETED', 'ABORTED', 'PAUSED', 'FAILED', 'PENDING', 'EXPIRED')`);
        await queryRunner.query(`CREATE TABLE "export_manager"."task" ("id" SERIAL NOT NULL, "job_id" uuid NOT NULL, "catalog_record_id" uuid NOT NULL, "customer_name" character varying NOT NULL, "artifact_crs" character varying NOT NULL, "domain" character varying NOT NULL, "status" "export_manager"."task_status_enum" NOT NULL DEFAULT 'PENDING', "description" character varying(2000), "estimated_data_size" numeric DEFAULT '0', "estimated_time" numeric DEFAULT '0', "keywords" jsonb, "reason" character varying, "percentage" smallint DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "expired_at" TIMESTAMP WITH TIME ZONE, "finished_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_fb213f79ee45060ba925ecd576e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "export_manager"."artifact" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "url" character varying NOT NULL, "size" numeric NOT NULL DEFAULT '0', "artifact_type_id" integer NOT NULL, CONSTRAINT "PK_1f238d1d4ef8f85d0c0b8616fa3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "export_manager"."task_geometry_to_task" ("task_id" integer NOT NULL, "task_geometry_id" integer NOT NULL, CONSTRAINT "PK_b5ee2f17de2c7cc478598e71c5e" PRIMARY KEY ("task_id", "task_geometry_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e8bd5ecc0a8c06dbe970e62adb" ON "export_manager"."task_geometry_to_task" ("task_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_89b5f9165540da6b87aebd385f" ON "export_manager"."task_geometry_to_task" ("task_geometry_id") `);
        await queryRunner.query(`CREATE TABLE "export_manager"."aftifact_to_task" ("task_id" integer NOT NULL, "artifact_id" integer NOT NULL, CONSTRAINT "PK_d05c2b8f1c1e99ab04ef0decfc8" PRIMARY KEY ("task_id", "artifact_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1c177bb0c24b5baebc3802d743" ON "export_manager"."aftifact_to_task" ("task_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_6273570e11d08248138b31aa87" ON "export_manager"."aftifact_to_task" ("artifact_id") `);
        await queryRunner.query(`CREATE TABLE "export_manager"."webhook_to_task" ("task_id" integer NOT NULL, "webhook_id" integer NOT NULL, CONSTRAINT "PK_4e57116cd2dbd739cdd2b608040" PRIMARY KEY ("task_id", "webhook_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_bca01caf646fa91378674022d0" ON "export_manager"."webhook_to_task" ("task_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_77da8001ed884572b05b2d5f9e" ON "export_manager"."webhook_to_task" ("webhook_id") `);
        await queryRunner.query(`ALTER TABLE "export_manager"."artifact" ADD CONSTRAINT "FK_658d9f7207bdb6acb5236e9b16d" FOREIGN KEY ("artifact_type_id") REFERENCES "export_manager"."artifact_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "export_manager"."task_geometry_to_task" ADD CONSTRAINT "FK_e8bd5ecc0a8c06dbe970e62adba" FOREIGN KEY ("task_id") REFERENCES "export_manager"."task"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "export_manager"."task_geometry_to_task" ADD CONSTRAINT "FK_89b5f9165540da6b87aebd385fe" FOREIGN KEY ("task_geometry_id") REFERENCES "export_manager"."task_geometry"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "export_manager"."aftifact_to_task" ADD CONSTRAINT "FK_1c177bb0c24b5baebc3802d7434" FOREIGN KEY ("task_id") REFERENCES "export_manager"."task"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "export_manager"."aftifact_to_task" ADD CONSTRAINT "FK_6273570e11d08248138b31aa877" FOREIGN KEY ("artifact_id") REFERENCES "export_manager"."artifact"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "export_manager"."webhook_to_task" ADD CONSTRAINT "FK_bca01caf646fa91378674022d0e" FOREIGN KEY ("task_id") REFERENCES "export_manager"."task"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "export_manager"."webhook_to_task" ADD CONSTRAINT "FK_77da8001ed884572b05b2d5f9ef" FOREIGN KEY ("webhook_id") REFERENCES "export_manager"."webhook"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "export_manager"."webhook_to_task" DROP CONSTRAINT "FK_77da8001ed884572b05b2d5f9ef"`);
        await queryRunner.query(`ALTER TABLE "export_manager"."webhook_to_task" DROP CONSTRAINT "FK_bca01caf646fa91378674022d0e"`);
        await queryRunner.query(`ALTER TABLE "export_manager"."aftifact_to_task" DROP CONSTRAINT "FK_6273570e11d08248138b31aa877"`);
        await queryRunner.query(`ALTER TABLE "export_manager"."aftifact_to_task" DROP CONSTRAINT "FK_1c177bb0c24b5baebc3802d7434"`);
        await queryRunner.query(`ALTER TABLE "export_manager"."task_geometry_to_task" DROP CONSTRAINT "FK_89b5f9165540da6b87aebd385fe"`);
        await queryRunner.query(`ALTER TABLE "export_manager"."task_geometry_to_task" DROP CONSTRAINT "FK_e8bd5ecc0a8c06dbe970e62adba"`);
        await queryRunner.query(`ALTER TABLE "export_manager"."artifact" DROP CONSTRAINT "FK_658d9f7207bdb6acb5236e9b16d"`);
        await queryRunner.query(`DROP INDEX "export_manager"."IDX_77da8001ed884572b05b2d5f9e"`);
        await queryRunner.query(`DROP INDEX "export_manager"."IDX_bca01caf646fa91378674022d0"`);
        await queryRunner.query(`DROP TABLE "export_manager"."webhook_to_task"`);
        await queryRunner.query(`DROP INDEX "export_manager"."IDX_6273570e11d08248138b31aa87"`);
        await queryRunner.query(`DROP INDEX "export_manager"."IDX_1c177bb0c24b5baebc3802d743"`);
        await queryRunner.query(`DROP TABLE "export_manager"."aftifact_to_task"`);
        await queryRunner.query(`DROP INDEX "export_manager"."IDX_89b5f9165540da6b87aebd385f"`);
        await queryRunner.query(`DROP INDEX "export_manager"."IDX_e8bd5ecc0a8c06dbe970e62adb"`);
        await queryRunner.query(`DROP TABLE "export_manager"."task_geometry_to_task"`);
        await queryRunner.query(`DROP TABLE "export_manager"."artifact"`);
        await queryRunner.query(`DROP TABLE "export_manager"."task"`);
        await queryRunner.query(`DROP TYPE "export_manager"."task_status_enum"`);
        await queryRunner.query(`DROP TABLE "export_manager"."webhook"`);
        await queryRunner.query(`DROP TYPE "export_manager"."webhook_events_enum"`);
        await queryRunner.query(`DROP TABLE "export_manager"."task_geometry"`);
        await queryRunner.query(`DROP TABLE "export_manager"."artifact_type"`);
    }

}
